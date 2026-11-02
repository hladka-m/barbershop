import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    const isHome = location.pathname === '/';

    // Слухач прокрутки сторінки
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLinkClick = () => {
        setIsOpen(false);
    };

    return (
        <header className={`
            sticky top-0 w-full z-50 px-6 md:px-8 h-20 flex items-center transition-all duration-300
            ${isHome && !isScrolled 
                ? 'absolute top-0 left-0 bg-transparent border-transparent' 
                : (!isScrolled ? 'bg-barber-main border-b border-barber-muted' : 'bg-barber-main/70 backdrop-blur-md border-transparent shadow-lg')}
        `}>
            <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
                
                {/* Логотип */}
                <Link 
                    to="/" 
                    className="font-oswald text-3xl font-bold tracking-wider text-barber-light hover:text-barber-gray transition"
                >
                    BARBERSHOP
                </Link>

                {/* Десктопне меню */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link 
                        to="/" 
                        className={`transition pb-1 ${location.pathname === '/' ? 'text-barber-gold border-b-2 border-barber-gold' : 'text-barber-light hover:text-barber-gold'}`}
                    >
                        Головна
                    </Link>
                    <Link 
                        to="/services" 
                        className={`transition pb-1 ${location.pathname === '/services' ? 'text-barber-gold border-b-2 border-barber-gold' : 'text-barber-light hover:text-barber-gold'}`}
                    >
                        Послуги
                    </Link>
                    <Link 
                        to="/barbers" 
                        className={`transition pb-1 ${location.pathname === '/barbers' ? 'text-barber-gold border-b-2 border-barber-gold' : 'text-barber-light hover:text-barber-gold'}`}
                    >
                        Барбери
                    </Link>
                    <Link 
                        to="/reviews" 
                        className={`transition pb-1 ${location.pathname === '/reviews' ? 'text-barber-gold border-b-2 border-barber-gold' : 'text-barber-light hover:text-barber-gold'}`}
                    >
                        Відгуки
                    </Link>
                    <Link 
                        to="/booking" 
                        className="bg-barber-gold text-barber-main px-5 py-2.5 rounded font-bold hover:opacity-90 transition"
                    >
                        Записатись
                    </Link>
                </nav>

                {/* Кнопка-бургер / Хрестик */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden text-barber-gold focus:outline-none p-2 flex items-center justify-center w-10 h-10"
                    aria-label="Меню"
                >
                    {isOpen ? (
                        <span className="text-2xl font-bold">✕</span>
                    ) : (
                        <div className="space-y-1.5 w-7">
                            <div className="h-0.5 bg-barber-gold w-full"></div>
                            <div className="h-0.5 bg-barber-gold w-full"></div>
                            <div className="h-0.5 bg-barber-gold w-full"></div>
                        </div>
                    )}
                </button>

            </div>

            {/* Випадаюче мобільне меню */}
            <div className={`md:hidden absolute left-0 right-0 top-full bg-barber-main border-b border-barber-muted shadow-xl transition-all duration-300 overflow-hidden ${
                isOpen ? 'max-h-96 opacity-100 py-6' : 'max-h-0 opacity-0 py-0'
            }`}>
                <nav className="flex flex-col items-center gap-4 text-base font-medium">
                    <Link 
                        to="/" 
                        onClick={handleLinkClick}
                        className={`transition ${location.pathname === '/' ? 'text-barber-gold font-bold' : 'text-barber-light'}`}
                    >
                        Головна
                    </Link>
                    <Link 
                        to="/services" 
                        onClick={handleLinkClick}
                        className={`transition ${location.pathname === '/services' ? 'text-barber-gold font-bold' : 'text-barber-light'}`}
                    >
                        Послуги
                    </Link>
                    <Link 
                        to="/barbers" 
                        onClick={handleLinkClick}
                        className={`transition ${location.pathname === '/barbers' ? 'text-barber-gold font-bold' : 'text-barber-light'}`}
                    >
                        Барбери
                    </Link>
                    <Link 
                        to="/reviews" 
                        onClick={handleLinkClick}
                        className={`transition ${location.pathname === '/reviews' ? 'text-barber-gold font-bold' : 'text-barber-light'}`}
                    >
                        Відгуки
                    </Link>
                    <Link 
                        to="/booking" 
                        onClick={handleLinkClick}
                        className="bg-barber-gold text-barber-main py-2.5 px-8 rounded font-bold mt-2"
                    >
                        Записатись
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;