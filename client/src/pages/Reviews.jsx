import { useState, useEffect } from 'react';
import ReviewCard from '../components/ReviewCard';
import axios from 'axios';

function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState('0.0');
    const [barbers, setBarbers] = useState([]);
    
    // Стани для фільтрів
    const [selectedBarber, setSelectedBarber] = useState('all');
    const [selectedRating, setSelectedRating] = useState('all');

    // Поля форми "Залишити відгук"
    const [phone, setPhone] = useState('');
    const [formBarber, setFormBarber] = useState('');
    const [rating, setRating] = useState('5');
    const [comment, setComment] = useState('');
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Завантаження даних
    useEffect(() => {
        axios.get('http://localhost:5000/api/reviews')
        .then(res => setReviews(res.data))
        .catch(err => console.error("Помилка відгуків:", err));

        axios.get('http://localhost:5000/api/reviews/average')
        .then(res => {
            if (res.data.avg_rating) setAvgRating(res.data.avg_rating);
        })
        .catch(err => console.error("Помилка середнього рейтингу:", err));

        axios.get('http://localhost:5000/api/barbers')
        .then(res => setBarbers(res.data))
        .catch(err => console.error("Помилка барберів:", err));
    }, []);

    // Логіка надсилання форми
    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        axios.post('http://localhost:5000/api/reviews', {
        phone,
        barber_id: formBarber,
        rating,
        comment
        })
        .then(() => {
        setFormSuccess('Відгук успішно додано!');
        setPhone('');
        setComment('');
        setFormBarber('');
        return axios.get('http://localhost:5000/api/reviews');
        })
        .then(res => {
        setReviews(res.data);
        // Оновлюємо середню оцінку після додавання
        return axios.get('http://localhost:5000/api/reviews/average');
        })
        .then(res => {
        if (res.data.avg_rating) setAvgRating(res.data.avg_rating);
        })
        .catch(err => {
        console.error("Помилка додавання відгуку:", err);
        setFormError(err.response?.data?.message || 'Не вдалося додати відгук. Перевірте номер телефону.');
        });
    };

    // Фільтрація та сортування відгуків
    const filteredReviews = reviews.filter(rev => {
    // Фільтр за барбером (порівнюємо повне ім'я або ID)
        if (selectedBarber !== 'all') {
        const barberFullName = `${rev.barber_name} ${rev.barber_last_name || ''}`.trim();
        // Шукаємо відповідність за ID або за повним ім'ям майстра з випадаючого списку
        const selectedBarberObj = barbers.find(b => String(b.barber_id) === String(selectedBarber));
        const selectedFullName = selectedBarberObj ? `${selectedBarberObj.first_name} ${selectedBarberObj.last_name || ''}`.trim() : '';

        if (String(rev.barber_id) !== String(selectedBarber) && barberFullName !== selectedFullName) {
            return false;
        }
        }
        
        // Фільтр за оцінкою
        if (selectedRating !== 'all' && selectedRating !== 'high' && selectedRating !== 'low') {
        if (Number(rev.rating) !== Number(selectedRating)) {
            return false;
        }
        }
        return true;
    }).sort((a, b) => {
        if (selectedRating === 'high') {
        return b.rating - a.rating;
        }
        if (selectedRating === 'low') {
        return a.rating - b.rating;
        }
        return 0;
    });

    return (
        <div className="min-h-screen bg-barber-main text-barber-light py-12 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                
                {/* Шапка та середня оцінка */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="font-oswald text-4xl md:text-5xl font-bold uppercase tracking-wider mb-2">
                            Відгуки клієнтів
                        </h1>
                        <p className="text-barber-gray text-sm mt-4">
                            Думка наших клієнтів — найкраща оцінка нашої роботи.
                        </p>
                    </div>

                    <div className="bg-[#1a1714] border border-barber-muted p-4 rounded-lg text-center min-w-40">
                        <p className="text-xs text-barber-gray uppercase tracking-widest mb-1">Середня оцінка</p>
                        <p className="font-oswald text-3xl font-bold text-barber-gold">
                            {avgRating} <span className="text-barber-light text-xl">/ 5</span>
                        </p>
                    </div>
                </div>

                {/* Фільтри */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div>
                        <label className="block text-xs text-barber-gray uppercase mb-1">Барбер</label>
                        <select 
                            value={selectedBarber}
                            onChange={(e) => setSelectedBarber(e.target.value)}
                            className="w-full bg-[#1a1714] border border-barber-muted text-barber-light p-3 rounded-lg focus:outline-none focus:border-barber-gold cursor-pointer"
                        >
                            <option value="all">Усі барбери</option>
                            {barbers.map(b => (
                                <option key={b.barber_id} value={b.barber_id}>{b.first_name} {b.last_name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-barber-gray uppercase mb-1">Оцінка</label>
                        <select 
                            value={selectedRating}
                            onChange={(e) => setSelectedRating(e.target.value)}
                            className="w-full bg-[#1a1714] border border-barber-muted text-barber-light p-3 rounded-lg focus:outline-none focus:border-barber-gold cursor-pointer"
                        >
                            <option value="all">Усі оцінки</option>
                            <option value="5">5 зірок</option>
                            <option value="4">4 зірки</option>
                            <option value="3">3 зірки</option>
                            <option value="2">2 зірки</option>
                            <option value="1">1 зірка</option>
                            <option value="high">Спочатку високі оцінки</option>
                            <option value="low">Спочатку низькі оцінки</option>
                        </select>
                    </div>
                </div>

                {/* Список відгуків */}
                <div className="mb-16">
                    {filteredReviews.length > 0 ? (
                        filteredReviews.map((rev) => (
                        <ReviewCard 
                            key={rev.review_id}
                            comment={rev.comment}
                            rating={rev.rating}
                            createdAt={rev.created_at}
                            clientName={rev.client_name}
                            barberName={`${rev.barber_name} ${rev.barber_last_name || ''}`}
                        />
                        ))
                    ) : (
                        <p className="text-barber-gray">Не знайдено жодного відгуку за такими критеріями.</p>
                    )}
                </div>

                {/* Форма "Залишити відгук" */}
                <div className="bg-[#1a1714] border border-barber-muted p-8 rounded-lg">
                    <h2 className="font-oswald text-2xl font-bold uppercase tracking-wide mb-6">
                        Залишити відгук
                    </h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs text-barber-gray uppercase mb-2">Телефон, вказаний при записі</label>
                                <input 
                                    type="text" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+380..." 
                                    className="w-full bg-barber-main border border-barber-muted text-barber-light p-3 rounded-lg focus:outline-none focus:border-barber-gold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-barber-gray uppercase mb-2">Барбер</label>
                                <select 
                                    value={formBarber}
                                    onChange={(e) => setFormBarber(e.target.value)}
                                    className="w-full bg-barber-main border border-barber-muted text-barber-light p-3 rounded-lg focus:outline-none focus:border-barber-gold"
                                >
                                    <option value="">[Оберіть барбера]</option>
                                    {barbers.map(b => (
                                        <option key={b.barber_id} value={b.barber_id}>{b.first_name} {b.last_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-barber-gray uppercase mb-2">Оцінка</label>
                            <select 
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                className="w-full bg-barber-main border border-barber-muted text-barber-light p-3 rounded-lg focus:outline-none focus:border-barber-gold"
                            >
                                <option value="5">5</option>
                                <option value="4">4</option>
                                <option value="3">3</option>
                                <option value="2">2</option>
                                <option value="1">1</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-barber-gray uppercase mb-2">Ваш відгук</label>
                            <textarea 
                                rows="4"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Напишіть свої враження..."
                                className="w-full bg-barber-main border border-barber-muted text-barber-light p-3 rounded-lg focus:outline-none focus:border-barber-gold"
                            ></textarea>
                        </div>

                        {formError && (
                            <p className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                {formError}
                            </p>
                        )}
                        {formSuccess && (
                            <p className="text-green-500 text-sm text-center bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                {formSuccess}
                            </p>
                        )}

                        <button 
                            type="submit"
                            className="bg-barber-gold text-barber-main font-bold uppercase tracking-wider py-3 rounded-lg hover:opacity-70 transition cursor-pointer"
                        >
                            Надіслати відгук
                        </button>

                        <p className="text-xs text-barber-gray/70 text-center">
                            Сайт перевіряє за номером телефону, що у клієнта був завершений запис, і прив’язує відгук до нього.
                        </p>
                    </form>
                </div>

            </div>
        </div>
    );
}

export default Reviews;