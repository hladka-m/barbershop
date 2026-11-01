import { Star } from 'lucide-react';

function ReviewCard({ comment, rating, createdAt, clientName, barberName }) {
    
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="bg-[#1a1714] border border-barber-muted p-6 rounded-lg flex flex-col justify-between hover:border-barber-gold transition mb-4">
        <div>
            <div className="flex justify-between items-center mb-2">
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < rating ? 'text-barber-gold fill-barber-gold' : 'text-barber-muted'}`} 
                />
                ))}
            </div>
            <span className="text-xs text-barber-gray/70">{formatDate(createdAt)}</span>
            </div>

            <p className="text-barber-light text-base mb-3 leading-relaxed">
            « {comment} »
            </p>

            <div className="text-xs text-barber-gold">
            <span>{clientName} про барбера {barberName}</span>
            </div>
        </div>
        </div>
    );
}

export default ReviewCard;