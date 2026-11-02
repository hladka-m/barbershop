import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function Admin() {
    const [stats, setStats] = useState({ todayCount: 0, futureCount: 0, monthRevenue: 0 });
    const [appointments, setAppointments] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [services, setServices] = useState([]);

    // Фільтри
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedBarber, setSelectedBarber] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // Модальне вікно РЕДАГУВАННЯ існуючого запису
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [newPaymentStatus, setNewPaymentStatus] = useState('');

    // Модальне вікно СТВОРЕННЯ нового запису (як на сторінці користувача)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedServices, setSelectedServices] = useState([]);
    const [newApptBarber, setNewApptBarber] = useState('');
    const [newApptDate, setNewApptDate] = useState('');
    const [newApptTime, setNewApptTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [clientForm, setClientForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        comment: ''
    });

    // Завантаження даних таблиці та статистики
    const fetchData = useCallback(() => {
        axios.get('http://localhost:5000/api/booking/barbers')
            .then(res => setBarbers(res.data))
            .catch(err => console.error("Помилка барберів:", err));

        axios.get('http://localhost:5000/api/booking/services')
            .then(res => setServices(res.data))
            .catch(err => console.error("Помилка послуг:", err));

        let url = 'http://localhost:5000/api/admin/appointments?';
        if (selectedDate) url += `date=${selectedDate}&`;
        if (selectedBarber) url += `barberId=${selectedBarber}&`;
        if (selectedStatus) url += `status=${selectedStatus}&`;

        axios.get(url)
            .then(res => {
                setStats(res.data.stats);
                setAppointments(res.data.appointments);
            })
            .catch(err => console.error("Помилка завантаження записів:", err));
    }, [selectedDate, selectedBarber, selectedStatus]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Завантаження вільних слотів для нового запису при виборі майстра та дати
    useEffect(() => {
        if (newApptBarber && newApptDate) {
            axios.get(`http://localhost:5000/api/booking/available-slots?barberId=${newApptBarber}&date=${newApptDate}`)
                .then(res => setAvailableSlots(res.data))
                .catch(err => console.error("Помилка завантаження часу:", err));
        }
    }, [newApptBarber, newApptDate]);

    // Чекбокси послуг для нового запису
    const handleServiceToggle = (service) => {
        if (selectedServices.some(s => s.service_id === service.service_id)) {
            setSelectedServices(selectedServices.filter(s => s.service_id !== service.service_id));
        } else {
            setSelectedServices([...selectedServices, service]);
        }
    };

    const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);

    // Відкриття модального вікна редагування
    const handleOpenEditModal = (app) => {
        setEditingAppointment(app);
        setNewStatus(app.status);
        setNewPaymentStatus(app.payment_status);
        setIsEditModalOpen(true);
    };

    // Збереження змін існуючого запису
    const handleSaveEditChanges = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/admin/appointments/${editingAppointment.appointment_id}`, {
                status: newStatus,
                paymentStatus: newPaymentStatus
            });
            setIsEditModalOpen(false);
            fetchData();
        } catch (err) {
            console.error("Помилка збереження:", err);
            alert("Не вдалося оновити запис");
        }
    };

    // Створення нового запису через адмінку
    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        if (selectedServices.length === 0 || !newApptBarber || !newApptDate || !newApptTime || !clientForm.firstName || !clientForm.phone) {
            alert("Будь ласка, заповніть усі обов'язкові поля та оберіть послугу!");
            return;
        }

        try {
            const appointmentDate = `${newApptDate} ${newApptTime}:00`;
            const payload = {
                firstName: clientForm.firstName,
                lastName: clientForm.lastName,
                phone: clientForm.phone,
                email: clientForm.email,
                barberId: Number(newApptBarber),
                appointmentDate,
                serviceIds: selectedServices.map(s => s.service_id),
                comment: clientForm.comment
            };

            await axios.post('http://localhost:5000/api/appointments', payload);
            alert("Запис успішно створено!");
            setIsAddModalOpen(false);
            // Очищуємо форму
            setSelectedServices([]);
            setNewApptBarber('');
            setNewApptDate('');
            setNewApptTime('');
            setClientForm({ firstName: '', lastName: '', phone: '', email: '', comment: '' });
            fetchData();
        } catch (err) {
            console.error("Помилка створення запису:", err);
            alert("Сталася помилка при створенні запису.");
        }
    };

    return (
        <div className="p-10 bg-barber-main min-h-screen text-barber-light relative">
            <div className="max-w-7xl mx-auto">
                
                {/* Шапка сторінки */}
                <div className="flex justify-between items-center mb-10">
                    <h1 className="font-oswald text-4xl font-bold uppercase tracking-wider">Записи</h1>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-barber-gold text-barber-main font-bold px-6 py-3 rounded-lg hover:opacity-80 transition cursor-pointer font-oswald uppercase"
                    >
                        Додати запис
                    </button>
                </div>

                {/* 3 картки статистики */}
                <div className="grid grid-cols-3 gap-6 mb-10">
                    <div className="bg-[#1a1714] border border-barber-muted p-6 rounded-lg">
                        <p className="text-barber-gray text-sm mb-2">Записів на сьогодні</p>
                        <p className="font-oswald text-4xl font-bold text-barber-gold">{stats.todayCount}</p>
                    </div>
                    <div className="bg-[#1a1714] border border-barber-muted p-6 rounded-lg">
                        <p className="text-barber-gray text-sm mb-2">Майбутніх записів</p>
                        <p className="font-oswald text-4xl font-bold text-barber-gold">{stats.futureCount}</p>
                    </div>
                    <div className="bg-[#1a1714] border border-barber-muted p-6 rounded-lg">
                        <p className="text-barber-gray text-sm mb-2">Виручка за місяць</p>
                        <p className="font-oswald text-4xl font-bold text-barber-gold">{stats.monthRevenue} ₴</p>
                    </div>
                </div>

                {/* Фільтри зверху */}
                <div className="flex gap-6 mb-8 bg-[#1a1714] border border-barber-muted p-6 rounded-lg">
                    <div className="w-1/3">
                        <label className="block text-sm text-barber-gray mb-2 uppercase">Дата</label>
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none cursor-pointer"
                        />
                    </div>
                    <div className="w-1/3">
                        <label className="block text-sm text-barber-gray mb-2 uppercase">Барбер</label>
                        <select 
                            value={selectedBarber}
                            onChange={(e) => setSelectedBarber(e.target.value)}
                            className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none"
                        >
                            <option value="">Усі</option>
                            {barbers.map(b => (
                                <option key={b.barber_id} value={b.barber_id}>{b.first_name} {b.last_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-1/3">
                        <label className="block text-sm text-barber-gray mb-2 uppercase">Статус</label>
                        <select 
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none"
                        >
                            <option value="">Усі</option>
                            <option value="Заплановано">Заплановано</option>
                            <option value="Виконано">Виконано</option>
                            <option value="Скасовано">Скасовано</option>
                        </select>
                    </div>
                </div>

                {/* Головна таблиця записів */}
                <div className="bg-[#1a1714] border border-barber-muted rounded-lg p-6">

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-barber-muted text-barber-gray text-sm font-oswald uppercase">
                                <th className="pb-4">Дата і час</th>
                                <th className="pb-4">Клієнт</th>
                                <th className="pb-4">Телефон</th>
                                <th className="pb-4">Барбер</th>
                                <th className="pb-4">Статус</th>
                                <th className="pb-4">Оплата</th>
                                <th className="pb-4 text-right">Дії</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-barber-muted/30 text-sm">
                            {appointments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-6 text-center text-barber-gray italic">Записів не знайдено.</td>
                                </tr>
                            ) : (
                                appointments.map(app => (
                                    <tr key={app.appointment_id} className="hover:bg-barber-muted/10 transition">
                                        <td className="py-4 font-mono">{new Date(app.appointment_date).toLocaleString()}</td>
                                        <td className="py-4 font-medium">{app.client_name}</td>
                                        <td className="py-4 font-mono text-barber-gray">{app.client_phone}</td>
                                        <td className="py-4">{app.barber_name}</td>
                                        <td className="py-4">
                                            <span className="px-3 py-1 rounded border border-barber-gold/40 text-barber-gold text-xs font-bold uppercase">
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className="px-3 py-1 rounded border border-barber-muted text-barber-light text-xs font-bold uppercase">
                                                {app.payment_status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button 
                                                onClick={() => handleOpenEditModal(app)}
                                                className="bg-barber-gold text-barber-main font-bold hover:opacity-80 px-4 py-2 rounded text-xs uppercase transition cursor-pointer font-oswald"
                                            >
                                                Змінити
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* МОДАЛЬНЕ ВІКНО: РЕДАГУВАННЯ ЗАПИСУ */}
            {isEditModalOpen && editingAppointment && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#1a1714] border border-barber-muted p-8 rounded-lg w-full max-w-md shadow-2xl">
                        <h2 className="font-oswald text-2xl font-bold uppercase mb-6 text-barber-gold">
                            Редагувати запис #{editingAppointment.appointment_id}
                        </h2>
                        
                        <form onSubmit={handleSaveEditChanges} className="space-y-6">
                            <div>
                                <p className="text-sm text-barber-gray mb-1">Клієнт:</p>
                                <p className="font-medium text-lg">{editingAppointment.client_name} ({editingAppointment.client_phone})</p>
                            </div>

                            <div>
                                <label className="block text-sm text-barber-gray mb-2 uppercase">Статус запису</label>
                                <select 
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none"
                                >
                                    <option value="Заплановано">Заплановано</option>
                                    <option value="Виконано">Виконано</option>
                                    <option value="Скасовано">Скасовано</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-barber-gray mb-2 uppercase">Статус оплати</label>
                                <select 
                                    value={newPaymentStatus}
                                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none"
                                >
                                    <option value="не оплачено">Не оплачено</option>
                                    <option value="оплачено">Оплачено</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-barber-muted">
                                <button 
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="border border-barber-muted px-5 py-2.5 rounded text-sm font-bold uppercase hover:bg-barber-muted/20 transition cursor-pointer"
                                >
                                    Скасувати
                                </button>
                                <button 
                                    type="submit"
                                    className="bg-barber-gold text-barber-main font-bold px-6 py-2.5 rounded text-sm uppercase hover:opacity-80 transition cursor-pointer font-oswald"
                                >
                                    Зберегти
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* МОДАЛЬНЕ ВІКНО: ДОДАТИ ЗАПИС (ПОВНИЙ ФУНКЦІОНАЛ) */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto py-10">
                    <div className="bg-[#1a1714] border border-barber-muted p-8 rounded-lg w-full max-w-2xl shadow-2xl my-auto">
                        <h2 className="font-oswald text-3xl font-bold uppercase mb-6 text-barber-gold">
                            Створити новий запис
                        </h2>
                        
                        <form onSubmit={handleCreateAppointment} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
                            
                            {/* Вибір послуг */}
                            <div>
                                <label className="block text-sm text-barber-gray mb-2 uppercase font-bold">1. Оберіть послугу(-и)</label>
                                <div className="space-y-2">
                                    {services.map(service => {
                                        const isChecked = selectedServices.some(s => s.service_id === service.service_id);
                                        return (
                                            <div 
                                                key={service.service_id} 
                                                onClick={() => handleServiceToggle(service)}
                                                className={`flex items-center justify-between p-3 rounded border cursor-pointer transition ${isChecked ? 'border-barber-gold bg-barber-muted/20' : 'border-barber-muted'}`}
                                            >
                                                <span className="font-medium">{service.name}</span>
                                                <span className="text-barber-gold font-bold">{service.price} ₴</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-barber-gold mt-2">Обрано на суму: {totalPrice} ₴</p>
                            </div>

                            {/* Вибір барбера */}
                            <div>
                                <label className="block text-sm text-barber-gray mb-2 uppercase font-bold">2. Оберіть барбера</label>
                                <select 
                                    value={newApptBarber}
                                    onChange={(e) => setNewApptBarber(e.target.value)}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none"
                                >
                                    <option value="">Оберіть майстра</option>
                                    {barbers.map(barber => (
                                        <option key={barber.barber_id} value={barber.barber_id}>
                                            {barber.first_name} {barber.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Дата і час */}
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm text-barber-gray mb-2 uppercase font-bold">3. Дата</label>
                                    <input 
                                        type="date" 
                                        value={newApptDate}
                                        onChange={(e) => setNewApptDate(e.target.value)}
                                        className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-barber-gray mb-2 uppercase font-bold">4. Вільний час</label>
                                    {(!newApptBarber || !newApptDate) ? (
                                        <p className="text-xs text-barber-gray italic">Спочатку оберіть барбера та дату.</p>
                                    ) : availableSlots.length === 0 ? (
                                        <p className="text-xs text-barber-gray italic">Немає доступного часу.</p>
                                    ) : (
                                        <div className="grid grid-cols-4 gap-2">
                                            {availableSlots.map(slot => (
                                                <button
                                                    type="button"
                                                    key={slot.time}
                                                    disabled={slot.isBooked}
                                                    onClick={() => setNewApptTime(slot.time)}
                                                    className={`py-2 rounded border text-xs font-bold transition ${
                                                        slot.isBooked 
                                                            ? 'bg-red-950/30 border-red-900/50 text-red-400/50 cursor-not-allowed line-through' 
                                                            : newApptTime === slot.time 
                                                                ? 'bg-barber-gold text-barber-main border-barber-gold' 
                                                                : 'border-barber-muted hover:border-barber-gold'
                                                    }`}
                                                >
                                                    {slot.time}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Дані клієнта */}
                            <div className="space-y-4 pt-4 border-t border-barber-muted">
                                <p className="text-sm uppercase font-bold text-barber-gold">5. Дані клієнта</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="Ім'я *" 
                                        required
                                        value={clientForm.firstName}
                                        onChange={(e) => setClientForm({...clientForm, firstName: e.target.value})}
                                        className="bg-barber-main border border-barber-muted p-3 rounded outline-none focus:border-barber-gold text-sm"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Прізвище *" 
                                        value={clientForm.lastName}
                                        onChange={(e) => setClientForm({...clientForm, lastName: e.target.value})}
                                        className="bg-barber-main border border-barber-muted p-3 rounded outline-none focus:border-barber-gold text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input 
                                        type="tel" 
                                        placeholder="Телефон *" 
                                        required
                                        value={clientForm.phone}
                                        onChange={(e) => setClientForm({...clientForm, phone: e.target.value})}
                                        className="bg-barber-main border border-barber-muted p-3 rounded outline-none focus:border-barber-gold text-sm"
                                    />
                                    <input 
                                        type="email" 
                                        placeholder="Email" 
                                        value={clientForm.email}
                                        onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
                                        className="bg-barber-main border border-barber-muted p-3 rounded outline-none focus:border-barber-gold text-sm"
                                    />
                                </div>
                                <textarea 
                                    rows="2"
                                    placeholder="Коментар до запису"
                                    value={clientForm.comment}
                                    onChange={(e) => setClientForm({...clientForm, comment: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded outline-none focus:border-barber-gold text-sm"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-barber-muted">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="border border-barber-muted px-5 py-2.5 rounded text-sm font-bold uppercase hover:bg-barber-muted/20 transition cursor-pointer"
                                >
                                    Скасувати
                                </button>
                                <button 
                                    type="submit"
                                    className="bg-barber-gold text-barber-main font-bold px-6 py-2.5 rounded text-sm uppercase hover:opacity-80 transition cursor-pointer font-oswald"
                                >
                                    Створити запис
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;