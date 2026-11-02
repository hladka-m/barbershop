import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function AdminBarbers() {
    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Модальне вікно СТВОРЕННЯ
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({ firstName: '', lastName: '', phone: '', specialization: '' });
    const [addFile, setAddFile] = useState(null);

    // Модальне вікно РЕДАГУВАННЯ
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBarber, setEditingBarber] = useState(null);
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', specialization: '' });
    const [editFile, setEditFile] = useState(null);

    // Завантаження списку барберів
    const fetchBarbers = useCallback(() => {
        axios.get('http://localhost:5000/api/admin/barbers')
            .then(res => {
                setBarbers(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Помилка завантаження барберів:", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchBarbers();
    }, [fetchBarbers]);

    // Створення нового барбера
    const handleCreateBarber = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('firstName', addForm.firstName);
            data.append('lastName', addForm.lastName);
            data.append('phone', addForm.phone);
            data.append('specialization', addForm.specialization);
            if (addFile) data.append('photo', addFile);

            await axios.post('http://localhost:5000/api/admin/barbers', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setIsAddModalOpen(false);
            setAddForm({ firstName: '', lastName: '', phone: '', specialization: '' });
            setAddFile(null);
            fetchBarbers();
        } catch (err) {
            console.error("Помилка створення барбера:", err);
            alert("Не вдалося додати барбера.");
        }
    };

    // Відкриття модального вікна редагування
    const handleOpenEdit = (barber) => {
        setEditingBarber(barber);
        setEditForm({
            firstName: barber.first_name,
            lastName: barber.last_name,
            phone: barber.phone,
            specialization: barber.specialization || ''
        });
        setEditFile(null);
        setIsEditModalOpen(true);
    };

    // Збереження змін барбера
    const handleUpdateBarber = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('firstName', editForm.firstName);
            data.append('lastName', editForm.lastName);
            data.append('phone', editForm.phone);
            data.append('specialization', editForm.specialization);
            if (editFile) data.append('photo', editFile);

            await axios.put(`http://localhost:5000/api/admin/barbers/${editingBarber.barber_id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setIsEditModalOpen(false);
            fetchBarbers();
        } catch (err) {
            console.error("Помилка оновлення барбера:", err);
            alert("Не вдалося оновити дані барбера.");
        }
    };

    // Видалення барбера
    const handleDeleteBarber = async (id) => {
        if (window.confirm("Ви впевнені, що хочете видалити цього барбера?")) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/barbers/${id}`);
                fetchBarbers();
            } catch (err) {
                console.error("Помилка видалення:", err);
                alert("Не вдалося видалити барбера. Можливо, у нього є прив'язані записи.");
            }
        }
    };

    return (
        <div className="p-10 bg-barber-main min-h-screen text-barber-light relative">
            <div className="max-w-7xl mx-auto">
                
                {/* Шапка сторінки */}
                <div className="flex justify-between items-center mb-10">
                    <h1 className="font-oswald text-4xl font-bold uppercase tracking-wider">Барбери</h1>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-barber-gold text-barber-main font-bold px-6 py-3 rounded-lg hover:opacity-80 transition cursor-pointer font-oswald uppercase"
                    >
                        Додати барбера
                    </button>
                </div>

                {/* Таблиця барберів */}
                <div className="bg-[#1a1714] border border-barber-muted rounded-lg p-6">

                    {loading ? (
                        <p className="text-barber-gray py-6 text-center">Завантаження барберів...</p>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-barber-muted text-barber-gray text-sm font-oswald uppercase">
                                    <th className="pb-4">Фото</th>
                                    <th className="pb-4">Ім'я та Прізвище</th>
                                    <th className="pb-4">Телефон</th>
                                    <th className="pb-4">Спеціалізація</th>
                                    <th className="pb-4 text-right">Дії</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-barber-muted/30 text-sm">
                                {barbers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-6 text-center text-barber-gray italic">Барберів не знайдено.</td>
                                    </tr>
                                ) : (
                                    barbers.map(barber => (
                                        <tr key={barber.barber_id} className="hover:bg-barber-muted/10 transition">
                                            <td className="py-4">
                                                <img 
                                                    src={barber.photo || '/photos/b1.jpg'} 
                                                    alt={barber.first_name} 
                                                    className="w-10 h-10 object-cover rounded-full border border-barber-gold"
                                                />
                                            </td>
                                            <td className="py-4 font-medium">{barber.first_name} {barber.last_name}</td>
                                            <td className="py-4 font-mono text-barber-gray">{barber.phone}</td>
                                            <td className="py-4 text-barber-gray">{barber.specialization || 'Майстер'}</td>
                                            <td className="py-4 text-right space-x-2">
                                                <button 
                                                    onClick={() => handleOpenEdit(barber)}
                                                    className="bg-barber-gold text-barber-main font-bold hover:opacity-80 px-3 py-1.5 rounded text-xs uppercase transition cursor-pointer font-oswald"
                                                >
                                                    Змінити
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteBarber(barber.barber_id)}
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

            {/* МОДАЛЬНЕ ВІКНО: ДОДАТИ БАРБЕРА */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
                    <div className="bg-[#1a1714] border border-barber-muted p-8 rounded-lg w-full max-w-md shadow-2xl">
                        <h2 className="font-oswald text-2xl font-bold uppercase mb-6 text-barber-gold">
                            Додати нового барбера
                        </h2>
                        
                        <form onSubmit={handleCreateBarber} className="space-y-4">
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Ім'я *</label>
                                <input 
                                    type="text" required
                                    value={addForm.firstName}
                                    onChange={(e) => setAddForm({...addForm, firstName: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Прізвище *</label>
                                <input 
                                    type="text" required
                                    value={addForm.lastName}
                                    onChange={(e) => setAddForm({...addForm, lastName: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Телефон *</label>
                                <input 
                                    type="tel" required
                                    value={addForm.phone}
                                    onChange={(e) => setAddForm({...addForm, phone: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Спеціалізація</label>
                                <input 
                                    type="text"
                                    value={addForm.specialization}
                                    onChange={(e) => setAddForm({...addForm, specialization: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Фото майстра</label>
                                <input 
                                    type="file" accept="image/*"
                                    onChange={(e) => setAddFile(e.target.files[0])}
                                    className="w-full bg-barber-main border border-barber-muted p-2 rounded text-barber-light text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-barber-gold file:text-barber-main hover:file:opacity-80 cursor-pointer"
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

            {/* МОДАЛЬНЕ ВІКНО: РЕДАГУВАТИ БАРБЕРА */}
            {isEditModalOpen && editingBarber && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
                    <div className="bg-[#1a1714] border border-barber-muted p-8 rounded-lg w-full max-w-md shadow-2xl">
                        <h2 className="font-oswald text-2xl font-bold uppercase mb-6 text-barber-gold">
                            Редагувати барбера #{editingBarber.barber_id}
                        </h2>
                        
                        <form onSubmit={handleUpdateBarber} className="space-y-4">
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Ім'я *</label>
                                <input 
                                    type="text" required
                                    value={editForm.firstName}
                                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Прізвище *</label>
                                <input 
                                    type="text" required
                                    value={editForm.lastName}
                                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Телефон *</label>
                                <input 
                                    type="tel" required
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Спеціалізація</label>
                                <input 
                                    type="text"
                                    value={editForm.specialization}
                                    onChange={(e) => setEditForm({...editForm, specialization: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Змінити фото (необов'язково)</label>
                                <input 
                                    type="file" accept="image/*"
                                    onChange={(e) => setEditFile(e.target.files[0])}
                                    className="w-full bg-barber-main border border-barber-muted p-2 rounded text-barber-light text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-barber-gold file:text-barber-main hover:file:opacity-80 cursor-pointer"
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

export default AdminBarbers;