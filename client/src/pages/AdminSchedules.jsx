import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function AdminSchedules() {
    const [schedules, setSchedules] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Модальне вікно додавання графіку
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        barber_id: '',
        work_date: '',
        start_time: '09:00',
        end_time: '20:00'
    });

    // Завантаження графіків та списку барберів
    const fetchData = useCallback(() => {
        axios.get('http://localhost:5000/api/admin/schedules')
            .then(res => {
                setSchedules(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Помилка завантаження графіків:", err);
                setLoading(false);
            });

        axios.get('http://localhost:5000/api/booking/barbers')
            .then(res => setBarbers(res.data))
            .catch(err => console.error("Помилка барберів:", err));
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Створення / оновлення графіку
    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/admin/schedules', formData);
            setIsModalOpen(false);
            setFormData({ barber_id: '', work_date: '', start_time: '09:00', end_time: '20:00' });
            fetchData();
        } catch (err) {
            console.error("Помилка збереження графіку:", err);
            alert("Не вдалося зберегти графік.");
        }
    };

    // Видалення графіку
    const handleDeleteSchedule = async (id) => {
        if (window.confirm("Ви впевнені, що хочете видалити цей робочий день?")) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/schedules/${id}`);
                fetchData();
            } catch (err) {
                console.error("Помилка видалення:", err);
                alert("Не вдалося видалити графік.");
            }
        }
    };

    // Групуємо графіки за датою
    const groupedSchedules = schedules.reduce((acc, item) => {
        const dateKey = item.work_date.split('T')[0];
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(item);
        return acc;
    }, {});

    // Сортуємо дати: найближчі (майбутні) зверху від сьогодні, минулі — внизу
    const todayStr = new Date().toISOString().split('T')[0];
    
    const sortedDates = Object.keys(groupedSchedules).sort((a, b) => {
        return new Date(a) - new Date(b);
    });

    const futureDates = sortedDates.filter(date => date >= todayStr);
    const pastDates = sortedDates.filter(date => date < todayStr).reverse();

    // Функція для красивого виведення дати
    const formatDayTitle = (dateString) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', options);
    };

    // Рендер однієї картки дня (з однаковою висотою h-full та іконкою відерця)
    const renderCard = (dateKey, items) => (
        <div key={dateKey} className="bg-[#1a1714] border border-barber-muted rounded-lg p-5 flex flex-col justify-between h-full shadow-lg">
            <div>
                {/* Шапка картки дня */}
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-barber-muted/40">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-barber-gold shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span className="text-barber-gold font-oswald text-sm font-bold uppercase tracking-wide">
                            {formatDayTitle(dateKey)}
                        </span>
                    </div>
                    <span className="bg-barber-muted/40 text-barber-gold text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                        {items.length} {items.length === 1 ? 'графік' : 'графіки'}
                    </span>
                </div>

                {/* Список майстрів у цей день */}
                <div className="space-y-2.5">
                    {items.map(item => (
                        <div key={item.schedule_id} className="flex justify-between items-center bg-barber-main/60 border border-barber-muted/50 p-3 rounded-md">
                            <div>
                                <p className="font-bold text-barber-light text-sm">{item.barber_name}</p>
                                <p className="font-mono text-xs text-barber-gold mt-0.5">
                                    {item.start_time.slice(0, 5)} — {item.end_time.slice(0, 5)}
                                </p>
                            </div>
                            
                            {/* Кнопка видалення з іконкою відерця */}
                            <button 
                                onClick={() => handleDeleteSchedule(item.schedule_id)}
                                title="Видалити графік"
                                className="border border-red-500/60 text-red-400 hover:bg-red-500 hover:text-white p-2 rounded transition cursor-pointer flex items-center justify-center"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-10 bg-barber-main min-h-screen text-barber-light relative">
            <div className="max-w-7xl mx-auto">
                
                {/* Шапка сторінки */}
                <div className="flex justify-between items-center mb-10">
                    <h1 className="font-oswald text-4xl font-bold uppercase tracking-wider">Графіки роботи</h1>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-barber-gold text-barber-main font-bold px-6 py-3 rounded-lg hover:opacity-80 transition cursor-pointer font-oswald uppercase"
                    >
                        Додати графік
                    </button>
                </div>

                {loading ? (
                    <p className="text-barber-gray py-6 text-center">Завантаження графіків...</p>
                ) : sortedDates.length === 0 ? (
                    <div className="bg-[#1a1714] border border-barber-muted rounded-lg p-8 text-center text-barber-gray italic">
                        Графіків роботи не знайдено.
                    </div>
                ) : (
                    <div className="space-y-8">
                        
                        {/* 1. Майбутні графіки (по 3 в ряду з рівною висотою) */}
                        {futureDates.length > 0 && (
                            <div>
                                <h2 className="font-oswald text-xl text-barber-gold uppercase tracking-wider mb-4 border-b border-barber-muted pb-2">
                                    Заплановані графіки
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                                    {futureDates.map(dateKey => renderCard(dateKey, groupedSchedules[dateKey]))}
                                </div>
                            </div>
                        )}

                        {/* 2. Минулі графіки (Архів) */}
                        {pastDates.length > 0 && (
                            <div className="pt-6">
                                <h2 className="font-oswald text-xl text-barber-gray uppercase tracking-wider mb-4 border-b border-barber-muted/50 pb-2">
                                    Минулі графіки (Архів)
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch opacity-75">
                                    {pastDates.map(dateKey => renderCard(dateKey, groupedSchedules[dateKey]))}
                                </div>
                            </div>
                        )}

                    </div>
                )}

            </div>

            {/* МОДАЛЬНЕ ВІКНО: ДОДАТИ / ЗМІНИТИ ГРАФІК */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
                    <div className="bg-[#1a1714] border border-barber-muted p-8 rounded-lg w-full max-w-md shadow-2xl">
                        <h2 className="font-oswald text-2xl font-bold uppercase mb-6 text-barber-gold">
                            Встановити робочий день
                        </h2>
                        
                        <form onSubmit={handleCreateSchedule} className="space-y-4">
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Майстер *</label>
                                <select 
                                    required
                                    value={formData.barber_id}
                                    onChange={(e) => setFormData({...formData, barber_id: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm"
                                >
                                    <option value="">Оберіть барбера</option>
                                    {barbers.map(b => (
                                        <option key={b.barber_id} value={b.barber_id}>{b.first_name} {b.last_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Дата *</label>
                                <input 
                                    type="date" 
                                    required
                                    value={formData.work_date}
                                    onChange={(e) => setFormData({...formData, work_date: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm cursor-pointer"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-barber-gray mb-1 uppercase">Початок *</label>
                                    <input 
                                        type="time" 
                                        required
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                        className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-barber-gray mb-1 uppercase">Кінець *</label>
                                    <input 
                                        type="time" 
                                        required
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                        className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-barber-muted">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="border border-barber-muted px-5 py-2.5 rounded text-sm font-bold uppercase cursor-pointer">Скасувати</button>
                                <button type="submit" className="bg-barber-gold text-barber-main font-bold px-6 py-2.5 rounded text-sm uppercase cursor-pointer font-oswald">Зберегти</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminSchedules;