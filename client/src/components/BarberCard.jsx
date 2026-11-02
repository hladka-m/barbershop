import { Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function BarberCard({ id, firstName, lastName, specialization, phone, photo, schedules }) {
    const navigate = useNavigate();

    const handleSelectBarber = () => {
        navigate('/booking', { state: { selectedBarberId: id } });
    };
    // Функція для красивого форматування дати
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
    };

    // Функція для обрізання секунд із часу (з "09:00:00" на "09:00")
    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.split(':').slice(0, 2).join(':');
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

                {/* Найближчі робочі дні */}
                <div className="border-t border-barber-muted/40 pt-4 mb-6">
                    <p className="text-xs text-barber-gold tracking-widest uppercase mb-3">
                        Найближчі робочі дні
                    </p>
                    
                    <div className="flex flex-col gap-2">
                        {schedules && schedules.length > 0 ? (
                            schedules.map((item, index) => (
                                <div key={index} className="bg-barber-main border border-barber-muted px-3 py-2 rounded text-xs text-barber-light flex justify-between items-center">
                                    <span className="text-barber-light font-medium">{formatDate(item.work_date)}</span>
                                    <span className="text-barber-gray">{formatTime(item.start_time)} - {formatTime(item.end_time)}</span>
                                </div>
                            ))
                            ) : (
                            <p className="text-barber-gray text-xs italic">Немає запланованих змін</p>
                        )}
                    </div>
                </div>
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

export default BarberCard; // Збережи як export default BarberCard;