import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function AdminServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Модальне вікно СТВОРЕННЯ
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({ name: '', price: '', duration_min: '' });

    // Модальне вікно РЕДАГУВАННЯ
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', price: '', duration_min: '' });

    // Завантаження послуг
    const fetchServices = useCallback(() => {
        axios.get('http://localhost:5000/api/admin/services')
            .then(res => {
                setServices(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Помилка завантаження послуг:", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    // Створення послуги
    const handleCreateService = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/admin/services', addForm);
            setIsAddModalOpen(false);
            setAddForm({ name: '', price: '', duration_min: '' });
            fetchServices();
        } catch (err) {
            console.error("Помилка створення послуги:", err);
            alert("Не вдалося додати послугу.");
        }
    };

    // Відкриття модалки редагування
    const handleOpenEdit = (service) => {
        setEditingService(service);
        setEditForm({
            name: service.name,
            price: service.price,
            duration_min: service.duration_min || ''
        });
        setIsEditModalOpen(true);
    };

    // Збереження змін послуги
    const handleUpdateService = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/admin/services/${editingService.service_id}`, editForm);
            setIsEditModalOpen(false);
            fetchServices();
        } catch (err) {
            console.error("Помилка оновлення послуги:", err);
            alert("Не вдалося оновити послугу.");
        }
    };

    // Видалення послуги
    const handleDeleteService = async (id) => {
        if (window.confirm("Ви впевнені, що хочете видалити цю послугу?")) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/services/${id}`);
                fetchServices();
            } catch (err) {
                console.error("Помилка видалення:", err);
                alert("Не вдалося видалити послугу. Можливо, вона прив'язана до існуючих замовлень.");
            }
        }
    };

    return (
        <div className="p-10 bg-barber-main min-h-screen text-barber-light relative">
            <div className="max-w-7xl mx-auto">
                
                {/* Шапка сторінки */}
                <div className="flex justify-between items-center mb-10">
                    <h1 className="font-oswald text-4xl font-bold uppercase tracking-wider">Послуги</h1>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-barber-gold text-barber-main font-bold px-6 py-3 rounded-lg hover:opacity-80 transition cursor-pointer font-oswald uppercase"
                    >
                        Додати послугу
                    </button>
                </div>

                {/* Таблиця послуг */}
                <div className="bg-[#1a1714] border border-barber-muted rounded-lg p-6">

                    {loading ? (
                        <p className="text-barber-gray py-6 text-center">Завантаження послуг...</p>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-barber-muted text-barber-gray text-sm font-oswald uppercase">
                                    <th className="pb-4">ID</th>
                                    <th className="pb-4">Назва послуги</th>
                                    <th className="pb-4">Вартість</th>
                                    <th className="pb-4">Тривалість (хв)</th>
                                    <th className="pb-4 text-right">Дії</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-barber-muted/30 text-sm">
                                {services.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-6 text-center text-barber-gray italic">Послуг не знайдено.</td>
                                    </tr>
                                ) : (
                                    services.map(service => (
                                        <tr key={service.service_id} className="hover:bg-barber-muted/10 transition">
                                            <td className="py-4 font-mono text-barber-gray">#{service.service_id}</td>
                                            <td className="py-4 font-medium">{service.name}</td>
                                            <td className="py-4 font-mono text-barber-gold font-bold">{service.price} ₴</td>
                                            <td className="py-4 font-mono text-barber-gray">{service.duration_min} хв</td>
                                            <td className="py-4 text-right space-x-2">
                                                <button 
                                                    onClick={() => handleOpenEdit(service)}
                                                    className="bg-barber-gold text-barber-main font-bold hover:opacity-80 px-3 py-1.5 rounded text-xs uppercase transition cursor-pointer font-oswald"
                                                >
                                                    Змінити
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteService(service.service_id)}
                                                    className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded text-xs uppercase transition cursor-pointer font-oswald"
                                                >
                                                    Видалити
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>

            {/* МОДАЛЬНЕ ВІКНО: ДОДАТИ ПОСЛУГУ */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
                    <div className="bg-[#1a1714] border border-barber-muted p-8 rounded-lg w-full max-w-md shadow-2xl">
                        <h2 className="font-oswald text-2xl font-bold uppercase mb-6 text-barber-gold">
                            Додати нову послугу
                        </h2>
                        
                        <form onSubmit={handleCreateService} className="space-y-4">
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Назва послуги *</label>
                                <input 
                                    type="text" required
                                    placeholder="Наприклад: Чоловіча стрижка"
                                    value={addForm.name}
                                    onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Вартість (₴) *</label>
                                <input 
                                    type="number" required
                                    placeholder="500"
                                    value={addForm.price}
                                    onChange={(e) => setAddForm({...addForm, price: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Тривалість (хв) *</label>
                                <input 
                                    type="number" required
                                    placeholder="45"
                                    value={addForm.duration_min}
                                    onChange={(e) => setAddForm({...addForm, duration_min: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm font-mono"
                                />
                            </div>
                            <div className="flex justify-end gap-4 pt-4 border-t border-barber-muted">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="border border-barber-muted px-5 py-2.5 rounded text-sm font-bold uppercase cursor-pointer">Скасувати</button>
                                <button type="submit" className="bg-barber-gold text-barber-main font-bold px-6 py-2.5 rounded text-sm uppercase cursor-pointer font-oswald">Зберегти</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* МОДАЛЬНЕ ВІКНО: РЕДАГУВАТИ ПОСЛУГУ */}
            {isEditModalOpen && editingService && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
                    <div className="bg-[#1a1714] border border-barber-muted p-8 rounded-lg w-full max-w-md shadow-2xl">
                        <h2 className="font-oswald text-2xl font-bold uppercase mb-6 text-barber-gold">
                            Редагувати послугу #{editingService.service_id}
                        </h2>
                        
                        <form onSubmit={handleUpdateService} className="space-y-4">
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Назва послуги *</label>
                                <input 
                                    type="text" required
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Вартість (₴) *</label>
                                <input 
                                    type="number" required
                                    value={editForm.price}
                                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Тривалість (хв) *</label>
                                <input 
                                    type="number" required
                                    value={editForm.duration_min}
                                    onChange={(e) => setEditForm({...editForm, duration_min: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm font-mono"
                                />
                            </div>
                            <div className="flex justify-end gap-4 pt-4 border-t border-barber-muted">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="border border-barber-muted px-5 py-2.5 rounded text-sm font-bold uppercase cursor-pointer">Скасувати</button>
                                <button type="submit" className="bg-barber-gold text-barber-main font-bold px-6 py-2.5 rounded text-sm uppercase cursor-pointer font-oswald">Зберегти зміни</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminServices;