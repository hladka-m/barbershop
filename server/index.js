const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Підключення до бази даних PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Перевірка з'єднання з базою
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Помилка підключення до бази даних:', err.stack);
    }
    console.log('Успішно підключено до бази даних PostgreSQL!');
    release();
});

// Маршрут для отримання списку послуг із бази даних
app.get('/api/services', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM services');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка сервера');
    }
});

app.get('/api/barbers', async (req, res) => {
    try {
        // 1. Отримуємо всіх барберів
        const barbersResult = await pool.query('SELECT * FROM barbers');
        const barbers = barbersResult.rows;

        // 2. Для кожного барбера витягуємо його робочий графік із таблиці work_schedules
        const barbersWithSchedules = await Promise.all(
            barbers.map(async (barber) => {
                const scheduleResult = await pool.query(
                    'SELECT work_date, start_time, end_time FROM work_schedules WHERE barber_id = $1 ORDER BY work_date ASC',
                    [barber.barber_id]
                );
                return {
                    ...barber,
                    schedules: scheduleResult.rows
                };
            })
        );

        res.json(barbersWithSchedules);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка сервера');
    }
});

app.get('/api/reviews', async (req, res) => {
    try {
        const query = `
            SELECT 
                r.review_id,
                r.appointment_id,
                a.barber_id, -- <--- ОСЬ ЦЕЙ ПОСУД ОБОВ'ЯЗКОВИЙ
                c.first_name AS client_name,
                b.first_name AS barber_name,
                b.last_name AS barber_last_name,
                r.rating,
                r.comment,
                r.created_at
            FROM client_review r
            JOIN appointments a ON r.appointment_id = a.appointment_id
            JOIN clients c ON a.client_id = c.client_id
            JOIN barbers b ON a.barber_id = b.barber_id
            ORDER BY r.created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка сервера');
    }
});
// Отримання всіх відгуків разом із даними про барберів
app.post('/api/reviews', async (req, res) => {
    const { phone, barber_id, rating, comment } = req.body;
    try {
        // 1. Шукаємо клієнта за телефоном та перевіряємо наявність завершеного запису до цього барбера
        const clientQuery = `
            SELECT c.client_id, a.appointment_id 
            FROM clients c
            JOIN appointments a ON c.client_id = a.client_id
            WHERE c.phone = $1 AND a.barber_id = $2
            LIMIT 1
        `;
        const clientResult = await pool.query(clientQuery, [phone, barber_id]);

        if (clientResult.rows.length === 0) {
            return res.status(400).json({ message: 'Не знайдено завершеного запису з цим номером телефону до обраного барбера.' });
        }

        const { client_id, appointment_id } = clientResult.rows[0];

        // 2. Додаємо відгук у таблицю client_review
        const insertQuery = `
            INSERT INTO client_review (client_id, barber_id, appointment_id, rating, comment, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *
        `;
        const newReview = await pool.query(insertQuery, [client_id, barber_id, appointment_id, rating, comment]);

        res.json(newReview.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка сервера');
    }
});

// Отримання середньої оцінки для плашки зверху
app.get('/api/reviews/average', async (req, res) => {
    try {
        const result = await pool.query('SELECT ROUND(AVG(rating)::numeric, 1) AS avg_rating FROM client_review');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка сервера');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});