import { Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function BarberCard({ id, firstName, lastName, specialization, phone, photo }) {
    const navigate = useNavigate();

    const handleSelectBarber = () => {
        navigate('/booking', { state: { selectedBarberId: id } });
    };

    return (
        <div className="bg-[#1a1714] border border-barber-muted p-6 rounded-lg flex flex-col justify-between hover:border-barber-gold transition group">
        
            <div>
                {/* Фото барбера */}
                <div className="w-full h-64 bg-barber-muted/30 rounded mb-4 overflow-hidden border border-barber-muted">
                    {photo ? (
                        <img 
                            src={photo} 
                            alt={`${firstName} ${lastName}`} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-barber-gray text-sm">[Фото барбера]</span>
                        </div>
                    )}
                </div>

                {/* Ім'я та прізвище */}
                <h3 className="font-oswald text-2xl font-bold text-barber-light tracking-wide mb-1">
                    {firstName} {lastName}
                </h3>

                {/* Спеціалізація */}
                <p className="text-barber-gray text-sm mb-2 mt-1 opacity-70">
                    {specialization}
                </p>

                {/* Телефон */}
                <p className="flex items-center gap-2 text-barber-gray text-sm mb-6">
                    <Phone className="w-4 h-4 text-barber-gold shrink-0" />
                    {phone}
                </p>
            </div>

            {/* Кнопка запису */}
            <button
                onClick={handleSelectBarber}
                className="w-full border border-barber-gold text-barber-gold hover:bg-barber-gold hover:text-barber-main py-2.5 rounded text-sm font-bold transition text-center uppercase tracking-wider"
            >
                Записатись до барбера
            </button>

        </div>
    );
}

export default BarberCard;