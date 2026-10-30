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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});