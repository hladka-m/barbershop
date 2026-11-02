import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Booking() {
    const navigate = useNavigate();

    // Дані з бази
    const [services, setServices] = useState([]);
    const [barbers, setBarbers] = useState([]);

    // Вибрані користувачем дані
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    
    // Форма клієнта
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        comment: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Завантаження послуг і барберів
        axios.get('http://localhost:5000/api/booking/services')
            .then(res => setServices(res.data))
            .catch(err => console.error("Помилка послуг:", err));

        axios.get('http://localhost:5000/api/booking/barbers')
            .then(res => setBarbers(res.data))
            .catch(err => console.error("Помилка барберів:", err));
    }, []);

    useEffect(() => {
        if (selectedBarber && date) {
            axios.get(`http://localhost:5000/api/booking/available-slots?barberId=${selectedBarber}&date=${date}`)
                .then(res => setAvailableSlots(res.data))
                .catch(err => console.error("Помилка завантаження часу:", err));
        }
    }, [selectedBarber, date]);

    // Обробка вибору послуг (чекбокси)
    const handleServiceToggle = (service) => {
        if (selectedServices.some(s => s.service_id === service.service_id)) {
            setSelectedServices(selectedServices.filter(s => s.service_id !== service.service_id));
        } else {
            setSelectedServices([...selectedServices, service]);
        }
    };

    // Підрахунок загальної суми та тривалості
    const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);
    const totalDuration = selectedServices.reduce((sum, s) => sum + Number(s.duration_min), 0);

    // Знайдемо повний об'єкт обраного барбера
    const currentBarber = barbers.find(b => String(b.barber_id) === String(selectedBarber));

    // Відправка форми в базу даних
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedServices.length === 0 || !selectedBarber || !date || !time || !formData.firstName || !formData.phone) {
            alert("Будь ласка, заповніть усі обов'язкові поля та оберіть послугу!");
            return;
        }

        setLoading(true);
        try {
            const appointmentDate = `${date} ${time}:00`; // Формат дати і часу для БД
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                email: formData.email,
                barberId: Number(selectedBarber),
                appointmentDate,
                serviceIds: selectedServices.map(s => s.service_id),
                comment: formData.comment
            };

            await axios.post('http://localhost:5000/api/appointments', payload);
            alert("Запис успішно створено!");
            navigate('/');
        } catch (err) {
            console.error("Помилка збереження:", err);
            alert("Сталася помилка при збереженні запису.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-barber-main text-barber-light min-h-screen pt-12 pb-20 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                
                {/* Заголовок */}
                <h1 className="font-oswald text-4xl md:text-5xl font-bold uppercase tracking-wider mb-2">
                    Запис на послугу
                </h1>
                <p className="text-barber-gray text-sm md:text-base mb-12 mt-4">
                    Професійний догляд за кілька кліків. Забронюйте свій візит нижче.
                </p>

                {/* Головна сітка та форма об'єднані в єдиний компонент */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* ЛІВА КОЛОНКА: 4 КРОКИ */}
                    <div className="lg:col-span-2 space-y-12">
                        
                        {/* КРОК 1: ОБЕРІТЬ ПОСЛУГУ */}
                        <div className="bg-[#1a1714] border border-barber-muted p-6 md:p-8 rounded-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-barber-gold text-barber-main font-bold w-8 h-8 rounded-full flex items-center justify-center font-oswald text-lg">1</span>
                                <h2 className="font-oswald text-2xl font-bold uppercase tracking-wide">Оберіть послугу</h2>
                            </div>
                            <div className="space-y-3">
                                {services.map(service => {
                                    const isChecked = selectedServices.some(s => s.service_id === service.service_id);
                                    return (
                                        <label 
                                            key={service.service_id} 
                                            className={`flex items-center justify-between p-4 rounded border cursor-pointer transition ${isChecked ? 'border-barber-gold bg-barber-muted/20' : 'border-barber-muted hover:border-gray-500'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isChecked}
                                                    onChange={() => handleServiceToggle(service)}
                                                    className="w-4 h-4 accent-barber-gold"
                                                />
                                                <span className="font-oswald text-lg font-medium">{service.name}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-barber-gray">{service.duration_min} хв</span>
                                                <span className="font-oswald text-barber-gold font-bold text-lg">{service.price} ₴</span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* КРОК 2: ОБЕРІТЬ БАРБЕРА */}
                        <div className="bg-[#1a1714] border border-barber-muted p-6 md:p-8 rounded-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-barber-gold text-barber-main font-bold w-8 h-8 rounded-full flex items-center justify-center font-oswald text-lg">2</span>
                                <h2 className="font-oswald text-2xl font-bold uppercase tracking-wide">Оберіть барбера</h2>
                            </div>
                            <select 
                                value={selectedBarber}
                                onChange={(e) => setSelectedBarber(e.target.value)}
                                className="w-full bg-barber-main border border-barber-muted p-4 rounded text-barber-light focus:border-barber-gold focus:outline-none"
                            >
                                <option value="">Оберіть майстра</option>
                                {barbers.map(barber => (
                                    <option key={barber.barber_id} value={barber.barber_id}>
                                        {barber.first_name} {barber.last_name} ({barber.specialization || 'Майстер'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* КРОК 3: ДАТА І ЧАС */}
                        <div className="bg-[#1a1714] border border-barber-muted p-6 md:p-8 rounded-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-barber-gold text-barber-main font-bold w-8 h-8 rounded-full flex items-center justify-center font-oswald text-lg">3</span>
                                <h2 className="font-oswald text-2xl font-bold uppercase tracking-wide">Дата і час</h2>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-sm text-barber-gray mb-2 uppercase tracking-wider">Дата</label>
                                <input 
                                    type="date" 
                                    value={date}
                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-barber-main border border-barber-muted p-4 rounded text-barber-light focus:border-barber-gold focus:outline-none cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-barber-gray mb-2 uppercase tracking-wider">Вільний час</label>
                                {(!selectedBarber || !date) ? (
                                    <p className="text-sm text-barber-gray italic">Будь ласка, спочатку оберіть барбера та дату.</p>
                                ) : availableSlots.length === 0 ? (
                                    <p className="text-sm text-barber-gray italic">Немає доступного часу на цю дату.</p>
                                ) : (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                        {availableSlots.map((slot) => (
                                            <button
                                                type="button"
                                                key={slot.time}
                                                disabled={slot.isBooked}
                                                onClick={() => setTime(slot.time)}
                                                className={`py-3 rounded border text-sm font-bold font-oswald transition ${
                                                    slot.isBooked 
                                                        ? 'bg-red-950/30 border-red-900/50 text-red-400/50 cursor-not-allowed line-through' 
                                                        : time === slot.time 
                                                            ? 'bg-barber-gold text-barber-main border-barber-gold' 
                                                            : 'border-barber-muted hover:border-barber-gold text-barber-light'
                                                }`}
                                            >
                                                {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* КРОК 4: ВАШІ ДАНІ */}
                        <div className="bg-[#1a1714] border border-barber-muted p-6 md:p-8 rounded-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-barber-gold text-barber-main font-bold w-8 h-8 rounded-full flex items-center justify-center font-oswald text-lg">4</span>
                                <h2 className="font-oswald text-2xl font-bold uppercase tracking-wide">Ваші дані</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm text-barber-gray mb-2 uppercase tracking-wider">Ім'я *</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        className="w-full bg-barber-main border border-barber-muted p-4 rounded text-barber-light focus:border-barber-gold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-barber-gray mb-2 uppercase tracking-wider">Прізвище</label>
                                    <input 
                                        type="text" 
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        className="w-full bg-barber-main border border-barber-muted p-4 rounded text-barber-light focus:border-barber-gold focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm text-barber-gray mb-2 uppercase tracking-wider">Телефон *</label>
                                    <input 
                                        type="tel" 
                                        required
                                        placeholder="+380..."
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full bg-barber-main border border-barber-muted p-4 rounded text-barber-light focus:border-barber-gold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-barber-gray mb-2 uppercase tracking-wider">Email (необов'язково)</label>
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-barber-main border border-barber-muted p-4 rounded text-barber-light focus:border-barber-gold focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-barber-gray mb-2 uppercase tracking-wider">Коментар до запису</label>
                                <textarea 
                                    rows="4"
                                    value={formData.comment}
                                    onChange={(e) => setFormData({...formData, comment: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-4 rounded text-barber-light focus:border-barber-gold focus:outline-none"
                                ></textarea>
                            </div>
                        </div>

                    </div>

                    {/* ПРАВА КОЛОНКА: ДИНАМІЧНИЙ ПІДСУМОК (STICKY) */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#1a1714] border border-barber-muted p-6 md:p-8 rounded-lg sticky top-28 shadow-xl">
                            <h2 className="font-oswald text-2xl font-bold uppercase tracking-wide mb-4">Ваш запис</h2>

                            <div className="space-y-4 text-sm border-b border-barber-muted pb-6 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-barber-gray">Послуги:</span>
                                    <span className="font-medium text-right">
                                        {selectedServices.length > 0 ? selectedServices.map(s => s.name).join(', ') : 'Не обрано'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-barber-gray">Барбер:</span>
                                    <span className="font-medium">
                                        {currentBarber ? `${currentBarber.first_name} ${currentBarber.last_name}` : 'Не обрано'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-barber-gray">Дата й час:</span>
                                    <span className="font-medium">{date && time ? `${date}, ${time}` : 'Не обрано'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-barber-gray">Тривалість:</span>
                                    <span className="font-medium">{totalDuration} хв</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-8">
                                <span className="font-oswald text-xl uppercase">Разом</span>
                                <span className="font-oswald text-3xl font-bold text-barber-gold">{totalPrice} ₴</span>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-barber-gold text-barber-main font-bold uppercase tracking-wider py-4 rounded-lg hover:opacity-70 transition text-center mb-6 cursor-pointer"
                            >
                                {loading ? 'Обробка...' : 'Підтвердити запис'}
                            </button>
                        </div>
                    </div>

                </form>

            </div>
        </div>
    );
}

export default Booking;