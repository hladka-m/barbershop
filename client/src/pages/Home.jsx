import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {

    const [popularServices, setPopularServices] = useState([]);
    const [randomBarbers, setRandomBarbers] = useState([]);
    const [featuredReviews, setFeaturedReviews] = useState([]);

    useEffect(() => {
        // Популярні послуги
        axios.get('http://localhost:5000/api/services/popular')
            .then(res => setPopularServices(res.data))
            .catch(err => console.error("Помилка завантаження послуг:", err));

        // Випадкові барбери
        axios.get('http://localhost:5000/api/barbers/random')
            .then(res => setRandomBarbers(res.data))
            .catch(err => console.error("Помилка завантаження барберів:", err));

        // 5-зіркові відгуки для головної
        axios.get('http://localhost:5000/api/reviews/featured')
            .then(res => setFeaturedReviews(res.data))
            .catch(err => console.error("Помилка завантаження відгуків:", err));
    }, []);

    return (
        <div className="bg-barber-main text-barber-light">
            
            {/* --- HERO СЕКЦІЯ З БАНЕРОМ --- */}
            {/* Задаємо висоту і мінус-маргін зверху, щоб секція почалася від самого верху екрана під прозорим хедером */}
            <section className="relative w-full h-[90vh] min-h-162.5 flex items-center px-6 md:px-12 overflow-hidden -mt-20 pt-20">
                
                {/* Фонове зображення на всю секцію з темним градієнтом/затемненням */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/photos/hero-bg.png" 
                        alt="Barbershop Interior" 
                        className="w-full h-full object-cover object-center"
                    />
                    {/* Темний оверлей (градієнт) для читабельності тексту */}
                    <div className="absolute inset-0 bg-linear-to-r from-barber-main via-barber-main/80 to-transparent"></div>
                </div>

                {/* Контент поверх фону */}
                <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-start justify-center">
                    
                    {/* Заголовок */}
                    <h1 className="font-oswald text-5xl md:text-7xl font-bold uppercase tracking-wider mb-4 leading-tight max-w-2xl">
                        Стрижка. <br />
                        Борода. <br />
                        Стиль.
                    </h1>

                    {/* Короткий опис / слоган */}
                    <p className="text-barber-gray text-base md:text-lg mb-8 max-w-md leading-relaxed">
                        Професійний догляд, класичні традиції та сучасний підхід до кожного клієнта.
                    </p>

                    {/* Кнопки */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link 
                            to="/booking" 
                            className="bg-barber-gold text-barber-main font-bold uppercase tracking-wider px-8 py-4 rounded-lg text-center hover:opacity-70 transition"
                        >
                            Записатись онлайн
                        </Link>

                        <Link 
                            to="/services" 
                            className="border border-barber-muted text-barber-light font-bold uppercase tracking-wider px-8 py-4 rounded-lg text-center hover:border-barber-gold hover:text-barber-gold transition"
                        >
                            Послуги та ціни
                        </Link>
                    </div>

                </div>
            </section>

            <div className="border-t border-barber-muted w-full"></div>

            {/* --- ПОПУЛЯРНІ ПОСЛУГИ --- */}
            <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                <h2 className="font-oswald text-3xl md:text-4xl font-bold uppercase tracking-wider mb-10">
                    Популярні послуги
                </h2>

                {/* Сітка послуг (4 картки) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {popularServices.map((service) => (
                        <div 
                            key={service.service_id} 
                            className="bg-[#1a1714] border border-barber-muted p-6 rounded-lg flex flex-col justify-between hover:border-barber-gold transition"
                        >
                            <div>
                                <h3 className="font-oswald text-xl font-bold uppercase tracking-wide mb-2 text-barber-light">
                                    {service.name}
                                </h3>
                                <p className="text-xs text-barber-gray uppercase tracking-widest mb-4">
                                    {service.duration_min} хв
                                </p>
                            </div>
                            <div className="font-oswald text-2xl font-bold text-barber-gold">
                                {service.price} ₴
                            </div>
                        </div>
                    ))}
                </div>
                {/* Кнопка "Усі послуги" по центру */}
                <div className="flex justify-center">
                    <Link 
                        to="/services" 
                        className="border border-barber-muted text-barber-light font-bold uppercase tracking-wider px-8 py-3 rounded-lg hover:border-barber-gold hover:text-barber-gold transition text-sm"
                    >
                        Усі послуги
                    </Link>
                </div>
            </section>

            <div className="border-t border-barber-muted w-full"></div>

            {/* --- НАШІ БАРБЕРИ --- */}
            <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                <h2 className="font-oswald text-3xl md:text-4xl font-bold uppercase tracking-wider mb-10">
                    Наші барбери
                </h2>

                {/* Сітка з 3 випадкових барберів */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {randomBarbers.map((barber) => (
                        <div 
                            key={barber.barber_id} 
                            className="bg-[#1a1714] border border-barber-muted rounded-lg overflow-hidden flex flex-col hover:border-barber-gold transition"
                        >
                            {/* Фото барбера */}
                            <div className="h-80 w-full bg-barber-muted overflow-hidden">
                                <img 
                                    src={barber.photo || "/photos/default-barber.jpg"} 
                                    alt={`${barber.first_name} ${barber.last_name}`}
                                    className="w-full h-full object-cover object-center"
                                />
                            </div>
                            {/* Інформація */}
                            <div className="p-6 flex flex-col justify-between grow">
                                <div>
                                    <h3 className="font-oswald text-2xl font-bold uppercase tracking-wide text-barber-light mb-1">
                                        {barber.first_name} {barber.last_name}
                                    </h3>
                                    <p className="text-sm text-barber-gray uppercase tracking-wider">
                                        {barber.specialization || "Майстер-барбер"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Кнопка "Усі барбери" по центру */}
                <div className="flex justify-center">
                    <Link 
                        to="/barbers" 
                        className="border border-barber-muted text-barber-light font-bold uppercase tracking-wider px-8 py-3 rounded-lg hover:border-barber-gold hover:text-barber-gold transition text-sm"
                    >
                        Усі барбери
                    </Link>
                </div>
            </section>

            <div className="border-t border-barber-muted w-full"></div>

            {/* --- ЩО КАЖУТЬ КЛІЄНТИ (5 ЗІРОК) --- */}
            <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                <h2 className="font-oswald text-3xl md:text-4xl font-bold uppercase tracking-wider mb-10">
                    Що кажуть клієнти
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {featuredReviews.map((rev) => (
                        <div 
                            key={rev.review_id} 
                            className="bg-[#1a1714] border border-barber-muted p-8 rounded-lg flex flex-col justify-between"
                        >
                            <div>
                                {/* 5 зірочок */}
                                <div className="flex gap-1 text-barber-gold mb-4 text-lg">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i}>★</span>
                                    ))}
                                </div>
                                <p className="text-barber-light italic mb-6 leading-relaxed">
                                    "{rev.comment}"
                                </p>
                            </div>
                            <div className="text-sm text-barber-gold uppercase tracking-wider font-medium">
                                {rev.client_name}
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- ЗОЛОТИСТИЙ БАНЕР "ГОТОВІ ДО НОВОГО ОБРАЗУ?" --- */}
                <div className="bg-barber-gold rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                    <h2 className="font-oswald text-3xl md:text-4xl font-bold text-barber-main uppercase tracking-wide text-center md:text-left">
                        Готові до нового образу?
                    </h2>
                    <Link 
                        to="/booking" 
                        className="bg-barber-main text-barber-light font-bold uppercase tracking-wider px-8 py-4 rounded-lg hover:bg-barber-card transition text-center whitespace-nowrap"
                    >
                        Записатись
                    </Link>
                </div>
            </section>

        </div>
    );
}

export default Home;