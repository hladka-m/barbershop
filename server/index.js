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

        // 1. ПЕРЕВІРКА ГРАФІКУ: Чи є у барбера зміна на цю конкретну дату в базі даних
        const scheduleQuery = `
            SELECT start_time, end_time 
            FROM work_schedules 
            WHERE barber_id = $1 AND work_date = $2
        `;
        const scheduleResult = await pool.query(scheduleQuery, [barberId, date]);

        // Якщо у барбера немає зміни на цей день — повертаємо порожній масив
        if (scheduleResult.rows.length === 0) {
            return res.json([]);
        }

        // Отримуємо години початку та кінця робочої зміни з бази (наприклад, "09:00:00" -> 9 та 20)
        const schedule = scheduleResult.rows[0];
        const startHour = parseInt(schedule.start_time.split(':')[0], 10);
        const endHour = parseInt(schedule.end_time.split(':')[0], 10);

        // 2. Генеруємо годинні слоти відповідно до реальної зміни барбера
        let allSlots = [];
        for (let i = startHour; i < endHour; i++) {
            let hourStr = i < 10 ? `0${i}:00` : `${i}:00`;
            allSlots.push(hourStr);
        }

        // 3. Отримуємо вже зайняті години для цього барбера на цю дату з таблиці appointments
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






// Отримання даних для сторінки «Записи» в адмінці
app.get('/api/admin/appointments', async (req, res) => {
    try {
        const { date, barberId, status } = req.query;

        // 1. Статистика (картки вгорі)
        // Записів на сьогодні (поточна дата у форматі YYYY-MM-DD)
        const todayQuery = `
            SELECT COUNT(*) AS count 
            FROM appointments 
            WHERE DATE(appointment_date) = CURRENT_DATE
        `;
        const todayResult = await pool.query(todayQuery);

        // Майбутніх записів (з уявлення future_appointments_with_clients)
        const futureQuery = `
            SELECT COUNT(*) AS count 
            FROM future_appointments_with_clients
        `;
        const futureResult = await pool.query(futureQuery);

        // Виручка за поточний місяць
        const revenueQuery = `
            SELECT COALESCE(SUM(amount), 0) AS total 
            FROM payments 
            WHERE EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        `;
        const revenueResult = await pool.query(revenueQuery);

        // 2. Список записів для таблиці з урахуванням фільтрів
        let query = `
            SELECT 
                a.appointment_id,
                a.appointment_date,
                c.first_name || ' ' || c.last_name AS client_name,
                c.phone AS client_phone,
                b.first_name || ' ' || b.last_name AS barber_name,
                a.status,
                COALESCE(p.payment_status, 'Не оплачено') AS payment_status
            FROM appointments a
            JOIN clients c ON a.client_id = c.client_id
            JOIN barbers b ON a.barber_id = b.barber_id
            LEFT JOIN payments p ON a.appointment_id = p.appointment_id
            WHERE 1=1
        `;
        
        const queryParams = [];
        let paramIndex = 1;

        if (date) {
            query += ` AND DATE(a.appointment_date) = $${paramIndex}`;
            queryParams.push(date);
            paramIndex++;
        }
        if (barberId) {
            query += ` AND a.barber_id = $${paramIndex}`;
            queryParams.push(barberId);
            paramIndex++;
        }
        if (status) {
            query += ` AND a.status = $${paramIndex}`;
            queryParams.push(status);
            paramIndex++;
        }

        query += ` ORDER BY a.appointment_date DESC`;

        const appointmentsResult = await pool.query(query, queryParams);

        // Відправляємо всі дані на фронтенд
        res.json({
            stats: {
                todayCount: todayResult.rows[0].count,
                futureCount: futureResult.rows[0].count,
                monthRevenue: revenueResult.rows[0].total
            },
            appointments: appointmentsResult.rows
        });

    } catch (err) {
        console.error("Помилка завантаження даних адмінки:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

// Оновлення статусу запису та оплати в адмінці
app.put('/api/admin/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentStatus } = req.body;

        // 1. Оновлюємо статус в таблиці appointments
        await pool.query(
            'UPDATE appointments SET status = $1 WHERE appointment_id = $2',
            [status, id]
        );

        // 2. Перевіряємо чи є запис в таблиці payments, якщо є - оновлюємо, якщо ні - створюємо
        const paymentCheck = await pool.query('SELECT * FROM payments WHERE appointment_id = $1', [id]);
        
        if (paymentCheck.rows.length > 0) {
            await pool.query(
                'UPDATE payments SET payment_status = $1 WHERE appointment_id = $2',
                [paymentStatus, id]
            );
        } else if (paymentStatus === 'оплачено' || paymentStatus === 'Оплачено') {
            // Якщо проставили оплачено, додаємо запис у payments
            const apptQuery = await pool.query('SELECT total_cost FROM appointments WHERE appointment_id = $1', [id]);
            const amount = apptQuery.rows[0]?.total_cost || 500; // дефолтна сума якщо немає
            await pool.query(
                'INSERT INTO payments (appointment_id, amount, payment_status) VALUES ($1, $2, $3)',
                [id, amount, paymentStatus]
            );
        }

        res.json({ message: 'Запис успішно оновлено!' });
    } catch (err) {
        console.error("Помилка оновлення запису:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

// Отримання списку всіх клієнтів для адмін-панелі
app.get('/api/admin/clients', async (req, res) => {
    try {
        const query = `
            SELECT 
                c.client_id,
                c.first_name,
                c.last_name,
                c.phone,
                c.email,
                COUNT(a.appointment_id) AS total_visits
            FROM clients c
            LEFT JOIN appointments a ON c.client_id = a.client_id
            GROUP BY c.client_id
            ORDER BY c.client_id ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Помилка завантаження клієнтів:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

// Отримання списку всіх барберів для адмінки
app.get('/api/admin/barbers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM barbers ORDER BY barber_id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error("Помилка завантаження барберів:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

// Додавання нового барбера
app.post('/api/admin/barbers', async (req, res) => {
    try {
        const { firstName, lastName, phone, specialization, photo } = req.body;
        
        const query = `
            INSERT INTO barbers (first_name, last_name, phone, specialization, photo)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [firstName, lastName, phone, specialization, photo || '/photos/b1.jpg'];
        const newBarber = await pool.query(query, values);

        res.json(newBarber.rows[0]);
    } catch (err) {
        console.error("Помилка додавання барбера:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

const multer = require('multer');
const path = require('path');

// Налаштування сховища для файлів
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Папка, куди зберігатимемо фото (переконайся, що шлях відповідає твоїй структурі папок)
        cb(null, '../client/public/photos/'); 
    },
    filename: (req, file, cb) => {
        // Унікальна назва файлу, щоб не було колізій
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Оновлений маршрут POST /api/admin/barbers із підтримкою файлу
app.post('/api/admin/barbers', upload.single('photo'), async (req, res) => {
    try {
        const { firstName, lastName, phone, specialization } = req.body;
        // Шлях до файлу, який запишемо в базу
        const photoPath = req.file ? `/photos/${req.file.filename}` : '/photos/b1.jpg';

        const query = `
            INSERT INTO barbers (first_name, last_name, phone, specialization, photo)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [firstName, lastName, phone, specialization, photoPath];
        const newBarber = await pool.query(query, values);

        res.json(newBarber.rows[0]);
    } catch (err) {
        console.error("Помилка додавання барбера:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

// Оновлення даних барбера (з можливістю заміни фото)
app.put('/api/admin/barbers/:id', upload.single('photo'), async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, phone, specialization } = req.body;

        // Перевіряємо, чи завантажили нове фото
        if (req.file) {
            const photoPath = `/photos/${req.file.filename}`;
            await pool.query(
                `UPDATE barbers SET first_name = $1, last_name = $2, phone = $3, specialization = $4, photo = $5 WHERE barber_id = $6`,
                [firstName, lastName, phone, specialization, photoPath, id]
            );
        } else {
            await pool.query(
                `UPDATE barbers SET first_name = $1, last_name = $2, phone = $3, specialization = $4 WHERE barber_id = $5`,
                [firstName, lastName, phone, specialization, id]
            );
        }

        res.json({ message: 'Дані барбера успішно оновлено!' });
    } catch (err) {
        console.error("Помилка оновлення барбера:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

// Видалення барбера з перевіркою майбутніх записів та збереженням історії
app.delete('/api/admin/barbers/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Перевіряємо, чи є у майстра майбутні активні записи
        const futureAppts = await pool.query(
            `SELECT COUNT(*) FROM appointments 
            WHERE barber_id = $1 
            AND appointment_date >= CURRENT_TIMESTAMP 
            AND status != 'Скасовано'`,
            [id]
        );

        if (parseInt(futureAppts.rows[0].count) > 0) {
            return res.status(400).json({ 
                message: 'Неможливо видалити барбера, оскільки у нього є заплановані майбутні записи!' 
            });
        }

        // 2. Якщо майбутніх записів немає, видаляємо барбера.
        // Завдяки ON DELETE SET NULL старі записи та їхні оплати залишаться в базі для історії!
        await pool.query('DELETE FROM barbers WHERE barber_id = $1', [id]);

        res.json({ message: 'Барбера успішно видалено, історія минулих записів збережена.' });
    } catch (err) {
        console.error("Помилка видалення барбера:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

// Отримання всіх послуг для адмінки
app.get('/api/admin/services', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM services ORDER BY service_id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error("Помилка завантаження послуг:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

// Додавання нової послуги
app.post('/api/admin/services', async (req, res) => {
    try {
        const { name, price, duration_min } = req.body;
        const query = `
            INSERT INTO services (name, price, duration_min)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const newService = await pool.query(query, [name, price, duration_min]);
        res.json(newService.rows[0]);
    } catch (err) {
        console.error("Помилка додавання послуги:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

// Оновлення послуги
app.put('/api/admin/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, duration_min } = req.body;

        await pool.query(
            `UPDATE services SET name = $1, price = $2, duration_min = $3 WHERE service_id = $4`,
            [name, price, duration_min, id]
        );

        res.json({ message: 'Послугу успішно оновлено!' });
    } catch (err) {
        console.error("Помилка оновлення послуги:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

// Видалення послуги
app.delete('/api/admin/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM services WHERE service_id = $1', [id]);
        res.json({ message: 'Послугу успішно видалено!' });
    } catch (err) {
        console.error("Помилка видалення послуги:", err.message);
        res.status(500).send("Помилка сервера (можливо, ця послуга використовується в активних записах)");
    }
});

// Отримання всіх графіків роботи з іменами барберів для адмінки
app.get('/api/admin/schedules', async (req, res) => {
    try {
        const query = `
            SELECT 
                ws.schedule_id,
                ws.barber_id,
                b.first_name || ' ' || b.last_name AS barber_name,
                ws.work_date,
                ws.start_time,
                ws.end_time
            FROM work_schedules ws
            JOIN barbers b ON ws.barber_id = b.barber_id
            ORDER BY ws.work_date DESC, ws.start_time ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Помилка завантаження графіків:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

// Додавання нового робочого дня / графіку для барбера
app.post('/api/admin/schedules', async (req, res) => {
    try {
        const { barber_id, work_date, start_time, end_time } = req.body;
        
        // Перевіряємо, чи вже існує графік на цей день для цього барбера
        const checkQuery = `
            SELECT * FROM work_schedules 
            WHERE barber_id = $1 AND work_date = $2
        `;
        const existing = await pool.query(checkQuery, [barber_id, work_date]);

        if (existing.rows.length > 0) {
            // Якщо графік вже є — оновлюємо його години
            const updateQuery = `
                UPDATE work_schedules 
                SET start_time = $1, end_time = $2 
                WHERE barber_id = $3 AND work_date = $4
                RETURNING *
            `;
            const updated = await pool.query(updateQuery, [start_time, end_time, barber_id, work_date]);
            return res.json(updated.rows[0]);
        }

        // Якщо немає — створюємо новий
        const insertQuery = `
            INSERT INTO work_schedules (barber_id, work_date, start_time, end_time)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const newSchedule = await pool.query(insertQuery, [barber_id, work_date, start_time, end_time]);
        res.json(newSchedule.rows[0]);
    } catch (err) {
        console.error("Помилка додавання графіку:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

// Видалення графіку
app.delete('/api/admin/schedules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM work_schedules WHERE schedule_id = $1', [id]);
        res.json({ message: 'Графік успішно видалено!' });
    } catch (err) {
        console.error("Помилка видалення графіку:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

// Отримання всіх оплат з інформацією про клієнтів та записи для адмінки
app.get('/api/admin/payments', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.payment_id,
                p.appointment_id,
                p.amount,
                p.payment_status,
                p.payment_date,
                c.first_name || ' ' || c.last_name AS client_name,
                c.phone AS client_phone
            FROM payments p
            JOIN appointments a ON p.appointment_id = a.appointment_id
            JOIN clients c ON a.client_id = c.client_id
            ORDER BY p.payment_date DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Помилка завантаження оплат:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

// Оновлення статусу оплати
app.put('/api/admin/payments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status, amount } = req.body;

        await pool.query(
            `UPDATE payments SET payment_status = $1, amount = $2 WHERE payment_id = $3`,
            [payment_status, amount, id]
        );

        res.json({ message: 'Статус оплати успішно оновлено!' });
    } catch (err) {
        console.error("Помилка оновлення оплати:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

// Видалення запису про оплату
app.delete('/api/admin/payments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM payments WHERE payment_id = $1', [id]);
        res.json({ message: 'Платіж успішно видалено!' });
    } catch (err) {
        console.error("Помилка видалення оплати:", err.message);
        res.status(500).send("Помилка сервера");
    }
});

app.get('/api/admin/reviews', async (req, res) => {
    try {
        const query = `
            SELECT 
                r.review_id,
                r.appointment_id,
                r.rating,
                r.comment,
                r.created_at,
                c.first_name || ' ' || c.last_name AS client_name,
                b.first_name || ' ' || b.last_name AS barber_name
            FROM client_review r
            JOIN appointments a ON r.appointment_id = a.appointment_id
            JOIN clients c ON a.client_id = c.client_id
            JOIN barbers b ON a.barber_id = b.barber_id
            ORDER BY r.review_id DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Помилка завантаження відгуків:", err.message);
        res.status(500).send("Помилка сервера: " + err.message);
    }
});

// Видалення відгуку
app.delete('/api/admin/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM client_review WHERE review_id = $1', [id]);
        res.json({ message: 'Відгук успішно видалено!' });
    } catch (err) {
        console.error("Помилка видалення відгуку:", err.message);
        res.status(500).send("Помилка сервера");
    }
});