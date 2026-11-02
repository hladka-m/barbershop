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

app.get('/api/services/popular', async (req, res) => {
    try {
        const query = `
            SELECT 
                s.service_id, 
                s.name, 
                s.price, 
                s.duration_min, 
                COUNT(ast.appointment_id) AS booking_count
            FROM services s
            LEFT JOIN appointment_services ast ON s.service_id = ast.service_id
            GROUP BY s.service_id, s.name, s.price, s.duration_min
            ORDER BY booking_count DESC
            LIMIT 4
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Помилка в /api/services/popular:", err.message);
        res.status(500).send('Помилка сервера');
    }
});

app.get('/api/barbers/random', async (req, res) => {
    try {
        const query = `
            SELECT barber_id, first_name, last_name, specialization, photo
            FROM barbers
            ORDER BY RANDOM()
            LIMIT 3
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Помилка при отриманні барберів:", err.message);
        res.status(500).send('Помилка сервера');
    }
});

app.get('/api/reviews/featured', async (req, res) => {
    try {
        const query = `
            SELECT 
                r.review_id,
                r.rating,
                r.comment,
                c.first_name AS client_name,
                r.created_at
            FROM client_review r
            JOIN appointments a ON r.appointment_id = a.appointment_id
            JOIN clients c ON a.client_id = c.client_id
            WHERE r.rating = 5
            ORDER BY r.created_at DESC
            LIMIT 3
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Помилка при отриманні відгуків для головної:", err.message);
        res.status(500).send('Помилка сервера');
    }
});

// 1. Отримати всі послуги для вибору при записі
app.get('/api/booking/services', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM services ORDER BY service_id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка сервера');
    }
});

// 2. Отримати всіх барберів для вибору
app.get('/api/booking/barbers', async (req, res) => {
    try {
        const result = await pool.query('SELECT barber_id, first_name, last_name, specialization FROM barbers ORDER BY barber_id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка сервера');
    }
});

// 3. Збереження запису (Транзакція)
app.post('/api/appointments', async (req, res) => {
    const clientDB = await pool.connect();
    try {
        await clientDB.query('BEGIN');

        const { firstName, lastName, phone, email, barberId, appointmentDate, serviceIds, comment } = req.body;

        // Перевіряємо, чи є вже такий клієнт за телефоном, якщо ні — створюємо нового
        let clientResult = await clientDB.query(
            'SELECT client_id FROM clients WHERE phone = $1',
            [phone]
        );

        let clientId;
        if (clientResult.rows.length > 0) {
            clientId = clientResult.rows[0].client_id;
        } else {
            const newClient = await clientDB.query(
                'INSERT INTO clients (first_name, last_name, phone, email) VALUES ($1, $2, $3, $4) RETURNING client_id',
                [firstName, lastName, phone, email || null]
            );
            clientId = newClient.rows[newClient.rows.length - 1].client_id;
        }

        // Рахуємо загальну вартість обраних послуг
        const servicesQuery = await clientDB.query(
            'SELECT service_id, price FROM services WHERE service_id = ANY($1)',
            [serviceIds]
        );
        
        let totalCost = servicesQuery.rows.reduce((sum, s) => sum + parseFloat(s.price), 0);

        // Створюємо запис в таблиці appointments
        const appointmentResult = await clientDB.query(
            `INSERT INTO appointments (client_id, barber_id, appointment_date, status, total_cost, client_comment) 
            VALUES ($1, $2, $3, 'Заплановано', $4, $5) RETURNING appointment_id`,
            [clientId, barberId, appointmentDate, totalCost, comment || 'Немає побажань']
        );
        const appointmentId = appointmentResult.rows[0].appointment_id;

        // Додаємо послуги у проміжну таблицю appointment_services з фіксацією ціни на момент замовлення
        for (let service of servicesQuery.rows) {
            await clientDB.query(
                'INSERT INTO appointment_services (appointment_id, service_id, price_at_moment) VALUES ($1, $2, $3)',
                [appointmentId, service.service_id, service.price]
            );
        }

        await clientDB.query('COMMIT');
        res.json({ success: true, appointmentId });
    } catch (err) {
        await clientDB.query('ROLLBACK');
        console.error("Помилка транзакції запису:", err.message);
        res.status(500).json({ error: 'Помилка при створенні запису' });
    } finally {
        clientDB.release();
    }
});

app.get('/api/booking/available-slots', async (req, res) => {
    try {
        const { barberId, date } = req.query;
        if (!barberId || !date) {
            return res.status(400).json({ error: 'Не вказано барбера або дату' });
        }

        // Визначаємо день тижня (0 - неділя, 1 - понеділок, ..., 6 - субота)
        const targetDate = new Date(date);
        const dayOfWeek = targetDate.getDay();

        // Встановлюємо робочі години відповідно до твого графіку:
        // Пн-Пт (1-5): 09:00 - 20:00, Сб-Нд (6, 0): 10:00 - 18:00
        let startHour = 9;
        let endHour = 20;

        if (dayOfWeek === 0 || dayOfWeek === 6) {
            startHour = 10;
            endHour = 18;
        }

        // Генеруємо всі можливі годинні слоти (наприклад, щогодини або кожні 1.5 години)
        let allSlots = [];
        for (let i = startHour; i < endHour; i++) {
            let hourStr = i < 10 ? `0${i}:00` : `${i}:00`;
            allSlots.push(hourStr);
        }

        // Отримуємо вже зайняті години для цього барбера на цю дату з таблиці appointments
        const busyQuery = `
            SELECT TO_CHAR(appointment_date, 'HH24:00') AS booked_time
            FROM appointments
            WHERE barber_id = $1 
            AND DATE(appointment_date) = $2
            AND status != 'Скасовано'
        `;
        const busyResult = await pool.query(busyQuery, [barberId, date]);
        const busyTimes = busyResult.rows.map(row => row.booked_time);

        // Формуємо фінальний список: час + статус (isBooked: true/false)
        const slots = allSlots.map(time => ({
            time,
            isBooked: busyTimes.includes(time)
        }));

        res.json(slots);
    } catch (err) {
        console.error("Помилка генерації слотів:", err.message);
        res.status(500).send('Помилка сервера');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});