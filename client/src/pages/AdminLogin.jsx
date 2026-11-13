import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function AdminLogin({ onLogin }) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === 'admin123') {
            // Можеш змінити назад на localStorage, якщо тобі зручніше, щоб не вводити щоразу
            sessionStorage.setItem('isAdminAuth', 'true');
            onLogin();
        } else {
            setError(true);
        }
    };

    return (
        <div className="min-h-screen bg-barber-main text-barber-light flex items-center justify-center px-6">
            {/* Картка з неоморфічним ефектом та м'якими тінями */}
            <div 
                className="p-10 rounded-2xl max-w-md w-full"
                style={{
                    backgroundColor: '#1a1714',
                    boxShadow: '15px 15px 30px #0d0c0a, -15px -15px 30px #27221e, inset 2px 2px 5px rgba(255, 255, 255, 0.05)'
                }}
            >
                <h1 className="font-oswald text-3xl font-bold uppercase tracking-wider mb-2 text-center text-barber-light">
                    Панель адміністратора
                </h1>
                <p className="text-barber-gray text-sm text-center mb-8">
                    Введіть пароль для доступу до управління системою.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm text-barber-gray mb-2 uppercase tracking-wider">Пароль</label>
                        
                        {/* Контейнер для інпуту та іконки */}
                        <div className="relative">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(false);
                                }}
                                placeholder="••••••••"
                                className="w-full bg-barber-main border border-barber-muted p-4 pr-12 rounded-lg text-barber-light focus:border-barber-gold focus:outline-none transition"
                                style={{
                                    boxShadow: 'inset 4px 4px 8px #0d0c0a, inset -4px -4px 8px #27221e'
                                }}
                            />
                            
                            {/* Кнопка з іконкою ока */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-barber-gray hover:text-barber-gold transition cursor-pointer"
                            >
                                {showPassword ? (
                                    <Eye className="w-5 h-5" />
                                ) : (
                                    <EyeOff className="w-5 h-5 opacity-40 hover:opacity-100" />
                                )}
                            </button>
                        </div>

                        {error && (
                            <p className="text-red-500 text-xs mt-2 italic">Невірний пароль. Спробуйте ще раз.</p>
                        )}
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-barber-gold text-barber-main font-bold uppercase tracking-wider py-4 rounded-lg hover:opacity-90 transition cursor-pointer font-oswald text-lg shadow-lg"
                    >
                        Увійти
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;