import { useState, useEffect } from 'react';
import ServiceCard from '../components/ServiceCard';
import axios from 'axios';

function Services() {
    const [servicesList, setServicesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:5000/api/services')
        .then(response => {
            setServicesList(response.data);
            setLoading(false);
        })
        .catch(err => {
            console.error("Помилка завантаження послуг:", err);
            setError("Не вдалося завантажити послуги з бази даних.");
            setLoading(false);
        });
    }, []);

    return (
        <div className="min-h-screen bg-barber-main text-barber-light py-12 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                
                <h1 className="font-oswald text-4xl md:text-5xl font-bold uppercase tracking-wider mb-2">
                    Послуги та ціни
                </h1>
                <p className="text-barber-gray text-sm mt-4 md:text-base mb-10">
                    Тільки якісні стрижки, професійне гоління та чоловіча атмосфера. Обери свій сервіс нижче.
                </p>

                {loading && <p className="text-barber-gray">Завантаження послуг з бази даних...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {servicesList.map((service) => (
                            <ServiceCard 
                                key={service.service_id}
                                name={service.name}
                                price={service.price}
                                duration={service.duration_min}
                            />
                        ))}
                    </div>
                )}

                <p className="text-barber-gray text-xs mt-10">
                    Кнопка «Обрати» веде на сторінку запису з уже відміченою послугою.
                </p>

            </div>
        </div>
    );
}

export default Services;