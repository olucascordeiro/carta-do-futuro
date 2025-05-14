// src/components/letters/LetterCard.tsx
import React from 'react';
import { Letter } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import { Trash2, Eye, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'; // Edit removido, Eye adicionado

export interface LetterCardProps {
  letter: Letter;
  onDelete?: () => void;
  onView?: (letter: Letter) => void; // Para abrir a carta completa
  // onEdit removido pois não há edição para cartas agendadas/entregues
}

const LetterCard: React.FC<LetterCardProps> = ({ letter, onDelete, onView }) => {
  
  const getStatusStylesAndInfo = () => {
    // ... (sua lógica getStatusStylesAndInfo como antes) ...
    // Garanta que ela retorne os estilos corretos para 'scheduled', 'delivered', 'failed'
    // Exemplo para 'delivered':
    // case 'delivered':
    //   return { 
    //     cardClasses: 'bg-background-light border-green-500/30',
    //     statusText: 'Entregue',
    //     statusColor: 'text-green-400 bg-green-500/20',
    //     icon: <CheckCircle2 size={14} className="mr-1.5" />
    //   };
    // ... (etc.)
    // Vou usar a sua implementação anterior que já estava boa para isso.
    switch (letter.status) {
      case 'scheduled':
        return { 
          cardClasses: 'opacity-60 bg-gray-800 border-gray-700',
          statusText: 'Agendada',
          statusColor: 'text-yellow-400 bg-yellow-500/20',
          icon: <Clock size={14} className="mr-1.5" /> 
        };
      case 'delivered':
        return { 
          cardClasses: 'bg-background-light border-green-500/30',
          statusText: 'Entregue',
          statusColor: 'text-green-400 bg-green-500/20',
          icon: <CheckCircle2 size={14} className="mr-1.5" />
        };
      case 'failed':
        return { 
          cardClasses: 'bg-background-light border-red-500/30',
          statusText: 'Falha no Envio',
          statusColor: 'text-red-400 bg-red-500/20',
          icon: <AlertCircle size={14} className="mr-1.5" />
        };
      default:
        return { 
          cardClasses: 'bg-background-light',
          statusText: letter.status,
          statusColor: 'text-gray-400 bg-gray-500/20',
          icon: null 
        };
    }
  };

  const { cardClasses, statusText, statusColor, icon: StatusIcon } = getStatusStylesAndInfo();

  return (
    <Card className={`relative group transition-all duration-300 overflow-hidden ${cardClasses}`}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-serif truncate pr-2 flex-grow">
            {letter.status === 'scheduled' 
              ? `Carta Agendada` 
              : (letter.title || 'Carta Sem Título')}
          </h3>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center whitespace-nowrap ${statusColor}`}>
            {StatusIcon}
            {statusText}
          </span>
        </div>

        {letter.status !== 'scheduled' && ( // Mostra corpo para delivered e failed
          <p className="text-sm text-gray-300 line-clamp-3 mb-3 flex-grow min-h-[60px]">
            {letter.status === 'failed' ? 'Houve um problema ao tentar enviar esta carta.' : letter.body}
          </p>
        )}
        {letter.status === 'scheduled' && (
          <p className="text-sm text-gray-400 italic mb-3 flex-grow min-h-[60px]">
            O conteúdo desta carta é um mistério a ser revelado apenas na data de entrega. Prepare-se para a surpresa!
          </p>
        )}

        <div className="text-xs text-gray-400 mb-4 mt-auto">
          {letter.status === 'delivered' ? 'Entregue em: ' : 'Entrega Programada para: '} 
          {new Date(letter.deliveryDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </div>

        <div className="flex justify-end space-x-2 border-t border-gray-700 pt-3">
          {letter.status === 'delivered' && onView && ( // Botão Ver Carta
            <Button onClick={() => onView(letter)} variant="outline" size="sm" className="text-sm">
              <Eye size={14} className="mr-1" /> Ver Carta
            </Button>
          )}
          
          {onDelete && ( // Botão Apagar para todos os status (conforme sua decisão)
            <Button onClick={onDelete} variant="text" size="sm" className="text-red-400 hover:text-red-500 text-sm">
              <Trash2 size={14} className="mr-1" /> Apagar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default LetterCard;