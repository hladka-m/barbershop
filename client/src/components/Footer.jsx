import { MapPin, Phone, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-barber-main border-t border-barber-muted pt-12 pb-6 px-6 md:px-12 text-barber-light">
            <div className="w-full max-w-350 mx-auto flex flex-col lg:flex-row lg:justify-between items-start gap-10 text-center lg:text-left">
                
                {/* 1. Логотип з підписом (зліва) */}
                <div className="flex flex-col items-center lg:items-start mx-auto lg:mx-0">
                    <Link 
                        to="/" 
                        className="font-oswald text-3xl lg:text-4xl font-bold tracking-wider text-barber-light hover:text-barber-gray transition leading-none"
                    >
                        BARBERSHOP
                    </Link>
                    <span className="text-barber-gold text-xs tracking-widest uppercase mt-1">
                        MEN'S GROOMING
                    </span>
                </div>

                {/* Три колонки з контактами */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full lg:w-auto lg:gap-16 items-start">
                
                {/* Колонка 1: Адреса */}
                    <div className="flex flex-col items-center lg:items-start">
                        <h3 className="font-oswald font-bold tracking-wider text-barber-gold mb-3 uppercase">
                            Адреса
                        </h3>
                        <p className="flex items-start justify-center lg:justify-start gap-2 text-barber-gray text-sm">
                            <MapPin className="w-4 h-4 text-barber-gold shrink-0 mt-0.5" />
                            <span>Вул. Головна, 15,<br />м. Львів, 79000</span>
                        </p>
                    </div>

                    {/* Колонка 2: Контакти */}
                    <div className="flex flex-col items-center lg:items-start">
                        <h3 className="font-oswald font-bold tracking-wider text-barber-gold mb-3 uppercase">
                            Контакти
                        </h3>
                        <div className="flex flex-col gap-2 text-barber-gray text-sm items-center lg:items-start">
                            <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-barber-gold shrink-0" />
                                +38 (032) 123 45 67
                            </p>
                            <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-barber-gold shrink-0" />
                                +38 (098) 123 45 67
                            </p>
                        </div>
                    </div>

                    {/* Колонка 3: Графік роботи */}
                    <div className="flex flex-col items-center lg:items-start">
                        <h3 className="font-oswald font-bold tracking-wider text-barber-gold mb-3 uppercase">
                            Графік роботи
                        </h3>
                        <div className="flex flex-col gap-2 text-barber-gray text-sm items-center lg:items-start">
                            <p className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-barber-gold shrink-0" />
                                Пн–Пт: 09:00–20:00
                            </p>
                            <p className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-barber-gold shrink-0" />
                                Сб–Нд: 10:00–18:00
                            </p>
                        </div>
                    </div>

                </div>

            </div>

            {/* Нижня лінія, копирайт та SVG іконки соцмереж */}
            <div className="w-full max-w-350 mx-auto mt-10 pt-6 border-t border-barber-muted/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-barber-gray">
                
                <p>© 2026 BARBERSHOP. Усі права захищені.</p>

                {/* Соцмережі SVG */}
                <div className="flex items-center gap-4">
                {/* Instagram */}
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-barber-gold hover:opacity-85 transition" aria-label="Instagram">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                    </a>

                    {/* TikTok */}
                    <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-barber-gold hover:opacity-85 transition" aria-label="TikTok">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                    </a>

                    {/* Facebook */}
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-barber-gold hover:opacity-85 transition" aria-label="Facebook">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.5 5 15.5 5H18V0h-3.808C10.59 0 9 1.581 9 4.75V8z"/>
                        </svg>
                    </a>
                </div>

            </div>
        </footer>
    );
}

export default Footer;