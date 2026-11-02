import { useNavigate } from 'react-router-dom';

function ServiceCard({ service_id, name, price, duration }) {
    const navigate = useNavigate();

    const handleSelectService = () => {
        navigate('/booking', { state: { selectedServiceId: service_id } });
    };

    return (
        <div className="bg-[#1a1714] border border-barber-muted p-6 rounded-lg flex flex-col justify-between hover:border-barber-gold transition">
        
            {/* Верхня частина: Назва послуги та ціна */}
            <div className="flex justify-between items-start gap-4 mb-4">
                <h3 className="font-oswald text-xl font-bold text-barber-light tracking-wide">
                    {name}
                </h3>
                <span className="font-oswald text-xl font-bold text-barber-gold whitespace-nowrap">
                    {price} ₴
                </span>
            </div>

            {/* Нижня частина: Тривалість та кнопка */}
            <div className="flex justify-between items-end mt-4">
                <p className="text-barber-gray text-sm">
                    Тривалість: <span className="text-barber-light font-medium">{duration}</span> хв
                </p>

                <button
                    onClick={handleSelectService}
                    className="border border-barber-gold text-barber-gold hover:bg-barber-gold hover:text-barber-main px-5 py-2 rounded text-sm font-bold transition"
                >
                    Обрати
                </button>
            </div>

        </div>
    );
}

export default ServiceCard;