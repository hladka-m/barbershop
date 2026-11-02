import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Модальне вікно редагування оплати
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [editForm, setEditForm] = useState({ amount: '', payment_status: '' });

    // Завантаження оплат
    const fetchPayments = useCallback(() => {
        axios.get('http://localhost:5000/api/admin/payments')
            .then(res => {
                setPayments(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Помилка завантаження оплат:", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    // Відкриття модалки редагування
    const handleOpenEdit = (payment) => {
        setEditingPayment(payment);
        setEditForm({
            amount: payment.amount,
            payment_status: payment.payment_status
        });
        setIsEditModalOpen(true);
    };

    // Збереження змін оплати
    const handleUpdatePayment = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/admin/payments/${editingPayment.payment_id}`, editForm);
            setIsEditModalOpen(false);
            fetchPayments();
        } catch (err) {
            console.error("Помилка оновлення оплати:", err);
            alert("Не вдалося оновити платіж.");
        }
    };

    // Видалення оплати
    const handleDeletePayment = async (id) => {
        if (window.confirm("Ви впевнені, що хочете видалити цей платіж?")) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/payments/${id}`);
                fetchPayments();
            } catch (err) {
                console.error("Помилка видалення:", err);
                alert("Не вдалося видалити платіж.");
            }
        }
    };

    return (
        <div className="p-10 bg-barber-main min-h-screen text-barber-light relative">
            <div className="max-w-7xl mx-auto">
                
                {/* Шапка сторінки */}
                <div className="flex justify-between items-center mb-10">
                    <h1 className="font-oswald text-4xl font-bold uppercase tracking-wider">Оплати та Фінанси</h1>
                </div>

                {/* Таблиця оплат */}
                <div className="bg-[#1a1714] border border-barber-muted rounded-lg p-6">

                    {loading ? (
                        <p className="text-barber-gray py-6 text-center">Завантаження оплат...</p>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-barber-muted text-barber-gray text-sm font-oswald uppercase">
                                    <th className="pb-4">ID транзакції</th>
                                    <th className="pb-4">Клієнт</th>
                                    <th className="pb-4">Телефон</th>
                                    <th className="pb-4">Сума</th>
                                    <th className="pb-4">Статус</th>
                                    <th className="pb-4">Дата платежу</th>
                                    <th className="pb-4 text-right">Дії</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-barber-muted/30 text-sm">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-6 text-center text-barber-gray italic">Оплат не знайдено.</td>
                                    </tr>
                                ) : (
                                    payments.map(payment => (
                                        <tr key={payment.payment_id} className="hover:bg-barber-muted/10 transition">
                                            <td className="py-4 font-mono text-barber-gray">#{payment.payment_id}</td>
                                            <td className="py-4 font-medium">{payment.client_name}</td>
                                            <td className="py-4 font-mono text-barber-gray">{payment.client_phone}</td>
                                            <td className="py-4 font-mono text-barber-gold font-bold">{payment.amount} ₴</td>
                                            <td className="py-4">
                                                <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase font-mono ${
                                                    payment.payment_status.toLowerCase() === 'оплачено' 
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/40' 
                                                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                                                }`}>
                                                    {payment.payment_status}
                                                </span>
                                            </td>
                                            <td className="py-4 font-mono text-barber-gray text-xs">
                                                {new Date(payment.payment_date).toLocaleString()}
                                            </td>
                                            <td className="py-4 text-right space-x-2">
                                                <button 
                                                    onClick={() => handleOpenEdit(payment)}
                                                    className="bg-barber-gold text-barber-main font-bold hover:opacity-80 px-4 h-9 rounded text-xs uppercase transition cursor-pointer font-oswald inline-flex items-center justify-center align-middle"
                                                >
                                                    Змінити
                                                </button>
                                                <button 
                                                    onClick={() => handleDeletePayment(payment.payment_id)}
                                                    title="Видалити платіж"
                                                    className="border border-red-500/60 text-red-400 hover:bg-red-500 hover:text-white w-9 h-9 rounded transition cursor-pointer inline-flex items-center justify-center align-middle"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                                    </svg>
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

            {/* МОДАЛЬНЕ ВІКНО: РЕДАГУВАТИ ОПЛАТУ */}
            {isEditModalOpen && editingPayment && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
                    <div className="bg-[#1a1714] border border-barber-muted p-8 rounded-lg w-full max-w-md shadow-2xl">
                        <h2 className="font-oswald text-2xl font-bold uppercase mb-6 text-barber-gold">
                            Редагувати оплату #{editingPayment.payment_id}
                        </h2>
                        
                        <form onSubmit={handleUpdatePayment} className="space-y-4">
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Сума (₴) *</label>
                                <input 
                                    type="number" required
                                    value={editForm.amount}
                                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-barber-gray mb-1 uppercase">Статус оплати *</label>
                                <select 
                                    value={editForm.payment_status}
                                    onChange={(e) => setEditForm({...editForm, payment_status: e.target.value})}
                                    className="w-full bg-barber-main border border-barber-muted p-3 rounded text-barber-light focus:border-barber-gold outline-none text-sm"
                                >
                                    <option value="Оплачено">Оплачено</option>
                                    <option value="Не оплачено">Не оплачено</option>
                                    <option value="Передплата">Передплата</option>
                                </select>
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

export default AdminPayments;