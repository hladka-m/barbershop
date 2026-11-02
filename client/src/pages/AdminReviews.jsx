import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Завантаження відгуків
    const fetchReviews = useCallback(() => {
        axios.get('http://localhost:5000/api/admin/reviews')
            .then(res => {
                setReviews(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Помилка завантаження відгуків:", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // Видалення відгуку
    const handleDeleteReview = async (id) => {
        if (window.confirm("Ви впевнені, що хочете видалити цей відгук?")) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/reviews/${id}`);
                fetchReviews();
            } catch (err) {
                console.error("Помилка видалення відгуку:", err);
                alert("Не вдалося видалити відгук.");
            }
        }
    };

    return (
        <div className="p-10 bg-barber-main min-h-screen text-barber-light relative">
            <div className="max-w-7xl mx-auto">
                
                {/* Шапка сторінки */}
                <div className="flex justify-between items-center mb-10">
                    <h1 className="font-oswald text-4xl font-bold uppercase tracking-wider">Відгуки клієнтів</h1>
                </div>

                {/* Таблиця / Список відгуків */}
                <div className="bg-[#1a1714] border border-barber-muted rounded-lg p-6">

                    {loading ? (
                        <p className="text-barber-gray py-6 text-center">Завантаження відгуків...</p>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-barber-muted text-barber-gray text-sm font-oswald uppercase">
                                    <th className="pb-4">Клієнт</th>
                                    <th className="pb-4">Майстер</th>
                                    <th className="pb-4">Оцінка</th>
                                    <th className="pb-4">Коментар</th>
                                    <th className="pb-4">Дата</th>
                                    <th className="pb-4 text-right">Дії</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-barber-muted/30 text-sm">
                                {reviews.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-6 text-center text-barber-gray italic">Відгуків поки немає.</td>
                                    </tr>
                                ) : (
                                    reviews.map(review => (
                                        <tr key={review.review_id} className="hover:bg-barber-muted/10 transition">
                                            <td className="py-4 font-medium">{review.client_name}</td>
                                            <td className="py-4 text-barber-gold">{review.barber_name}</td>
                                            <td className="py-4 font-mono font-bold text-barber-gold">
                                                ★ {review.rating} / 5
                                            </td>
                                            <td className="py-4 text-barber-gray max-w-xs truncate" title={review.comment}>
                                                {review.comment || 'Без коментаря'}
                                            </td>
                                            <td className="py-4 font-mono text-barber-gray text-xs">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 text-right">
                                                <button 
                                                    onClick={() => handleDeleteReview(review.review_id)}
                                                    title="Видалити відгук"
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
        </div>
    );
}

export default AdminReviews;