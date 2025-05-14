// src/components/subscription/PricingCard.tsx
import React from 'react';
import Card from '../common/Card'; // Ajuste o caminho se necessário
import Button from '../common/Button'; // Ajuste o caminho se necessário
import { Check } from 'lucide-react';

interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingCardProps { // Garanta que a interface seja exportada se usada em outro lugar
  title: string;
  price: string;
  features: PricingFeature[];
  isPopular?: boolean;
  buttonText: string;
  onClick?: () => void;
  disabled?: boolean; // <<< ADICIONE OU CONFIRME ESTA LINHA
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  features,
  isPopular = false,
  buttonText,
  onClick,
  disabled, // <<< DESESTRUTURE A PROP AQUI
}) => {
  return (
    <Card 
      className={`relative transition-all duration-300 ${
        isPopular ? 'border-2 border-primary' : 'border border-background-light' // Use sua classe de borda padrão
      }`}
      hover={true} // Mantenha ou ajuste conforme seu design
      glow={isPopular}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-medium rounded-bl-lg rounded-tr-md"> {/* Ajustei rounded-tr-lg para rounded-tr-md para consistência */}
          Popular
        </div>
      )}

      <div className="text-center mb-6 pt-4"> {/* Adicionado pt-4 se 'Popular' estiver sobrepondo */}
        <h3 className="text-xl font-serif mb-4">{title}</h3>
        <div className="mb-4">
          <span className="text-3xl font-bold">{price}</span>
          {/* Removido o "/month" pois são pagamentos únicos */}
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <div className={`mt-0.5 mr-2 ${feature.included ? 'text-primary' : 'text-text-muted'}`}>
              {feature.included ? (
                <Check size={18} />
              ) : (
                <span className="block w-[18px] h-[18px] text-center">-</span> // Ou outro ícone para "não incluído"
              )}
            </div>
            <span className={feature.included ? 'text-text-secondary' : 'text-text-muted line-through'}> {/* Adicionado line-through para não incluído */}
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <Button 
        onClick={onClick}
        variant={isPopular ? 'primary' : 'outline'}
        className="w-full"
        disabled={disabled} // <<< USE A PROP disabled AQUI
      >
        {buttonText}
      </Button>
    </Card>
  );
};

export default PricingCard;