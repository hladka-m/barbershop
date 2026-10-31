import { useState, useEffect } from 'react';
import BarberCard from '../components/BarberCard';
import axios from 'axios';

function Barbers() {
    const [barbersList, setBarbersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Запит до бекенду для отримання барберів та їх графіків
    useEffect(() => {
        axios.get('http://localhost:5000/api/barbers')
        .then(response => {
            setBarbersList(response.data);
            setLoading(false);
        })
        .catch(err => {
            console.error("Помилка завантаження барберів:", err);
            setError("Не вдалося завантажити список барберів з бази даних.");
            setLoading(false);
        });
    }, []);

    return (
        <div className="min-h-screen bg-barber-main text-barber-light py-12 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                
                {/* Заголовок сторінки */}
                <h1 className="font-oswald text-4xl md:text-5xl font-bold uppercase tracking-wider mb-2">
                    Наші барбери
                </h1>
                <p className="text-barber-gray text-sm md:text-base mb-10 mt-4">
                    Професійні майстри, бездоганний стиль та увага до деталей. Оберіть свого барбера та забронюйте зручний час.
                </p>

                {/* Стани завантаження або помилки */}
                {loading && <p className="text-barber-gray">Завантаження барберів з бази даних...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {/* Сітка карток барберів */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {barbersList.map((barber) => (
                            <BarberCard 
                                key={barber.barber_id}
                                id={barber.barber_id}
                                firstName={barber.first_name}
                                lastName={barber.last_name}
                                specialization={barber.specialization}
                                phone={barber.phone}
                                photo={barber.photo}
                                schedules={barber.schedules}
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}

export default Barbers;