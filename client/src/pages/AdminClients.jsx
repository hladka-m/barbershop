import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminClients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:5000/api/admin/clients')
            .then(res => {
                setClients(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Помилка при завантаженні клієнтів:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="p-10 bg-barber-main min-h-screen text-barber-light">
            <div className="max-w-7xl mx-auto">
                
                {/* Шапка сторінки */}
                <div className="flex justify-between items-center mb-10">
                    <h1 className="font-oswald text-4xl font-bold uppercase tracking-wider">Клієнти</h1>
                </div>

                {/* Таблиця клієнтів */}
                <div className="bg-[#1a1714] border border-barber-muted rounded-lg p-6">

                    {loading ? (
                        <p className="text-barber-gray py-6 text-center">Завантаження клієнтів...</p>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-barber-muted text-barber-gray text-sm font-oswald uppercase">
                                    <th className="pb-4">ID</th>
                                    <th className="pb-4">Ім'я та Прізвище</th>
                                    <th className="pb-4">Телефон</th>
                                    <th className="pb-4">Email</th>
                                    <th className="pb-4 text-center">Всього візитів</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-barber-muted/30 text-sm">
                                {clients.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-6 text-center text-barber-gray italic">Клієнтів не знайдено.</td>
                                    </tr>
                                ) : (
                                    clients.map(client => (
                                        <tr key={client.client_id} className="hover:bg-barber-muted/10 transition">
                                            <td className="py-4 font-mono text-barber-gray">#{client.client_id}</td>
                                            <td className="py-4 font-medium">{client.first_name} {client.last_name}</td>
                                            <td className="py-4 font-mono text-barber-gray">{client.phone}</td>
                                            <td className="py-4 text-barber-gray">{client.email || '—'}</td>
                                            <td className="py-4 text-center">
                                                <span className="px-3 py-1 rounded border border-barber-gold/40 text-barber-gold text-xs font-bold uppercase">
                                                    {client.total_visits}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </div>
    );
}

export default AdminClients;