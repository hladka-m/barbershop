import { Link, useLocation } from 'react-router-dom';

function AdminSidebar() {
    const location = useLocation();

    const menuItems = [
        { name: 'Записи', path: '/admin' },
        { name: 'Клієнти', path: '/admin/clients' },
        { name: 'Барбери', path: '/admin/barbers' },
        { name: 'Послуги', path: '/admin/services' },
        { name: 'Графіки роботи', path: '/admin/schedules' },
        { name: 'Оплати', path: '/admin/payments' },
        { name: 'Відгуки', path: '/admin/reviews' },
    ];

    return (
        <aside className="w-64 bg-[#141210] border-r border-barber-muted min-h-screen flex flex-col justify-between py-6">
            <div>
                {/* Логотип ADMIN з відступом зліва */}
                <h1 className="font-oswald text-2xl font-bold uppercase tracking-wider text-barber-light mb-10 px-6">
                    Admin
                </h1>

                {/* Навігаційне меню без відступів контейнера */}
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`block px-6 py-3 text-sm font-medium transition ${
                                    isActive 
                                        ? 'bg-barber-muted/40 text-barber-gold font-bold border-l-4 border-barber-gold' 
                                        : 'text-barber-gray hover:text-barber-light hover:bg-barber-muted/20'
                                }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Нижня кнопка «На сайт» */}
            <div className="pt-6 border-t border-barber-muted px-6">
                <Link
                    to="/"
                    className="block py-2 text-sm font-medium text-barber-gray hover:text-barber-light transition"
                >
                    На сайт
                </Link>
            </div>
        </aside>
    );
}

export default AdminSidebar;