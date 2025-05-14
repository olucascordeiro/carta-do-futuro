// src/components/subscription/PricingCard.tsx
import React from 'react';
import Card from '../common/Card'; // Ajuste o caminho se necessário
import Button from '../common/Button'; // Ajuste o caminho se necessário
import { Check, X as IconX } from 'lucide-react'; // Usar um ícone para features não incluídas

// Exportando o tipo para que outros componentes possam usá-lo
export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingCardProps {
  title: string;
  price: string; // Ex: "R$ 23,00" (já formatado como pagamento único)
  features: PricingFeature[];
  isPopular?: boolean;
  buttonText: string;
  onClick?: () => void;
  disabled?: boolean; // Prop para desabilitar o botão
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  features,
  isPopular = false,
  buttonText,
  onClick,
  disabled, // Desestruturar a prop disabled
}) => {
  return (
    <Card 
      className={`relative transition-all duration-300 flex flex-col ${ // Adicionado flex flex-col
        isPopular ? 'border-2 border-primary shadow-lg' : 'border border-gray-700' // Ajuste de borda padrão
      }`}
      hover={!isPopular} // Talvez não aplicar hover se já for popular e tiver sombra maior
      glow={isPopular}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-semibold rounded-bl-lg rounded-tr-md tracking-wider">
          MAIS POPULAR
        </div>
      )}
      
      <div className="text-center p-6 pt-8"> {/* Aumentado padding superior se 'Popular' estiver ativo */}
        <h3 className="text-2xl font-serif mb-2 text-text-primary">{title}</h3>
        <div className="mb-6">
          <span className="text-4xl font-bold text-primary">{price}</span>
          {/* Removido o sufixo "/month", pois são pagamentos únicos */}
          <p className="text-xs text-text-muted mt-1">Pagamento único</p>
        </div>
      </div>
      
      <ul className="space-y-3 px-6 pb-8 flex-grow"> {/* Adicionado flex-grow para empurrar o botão para baixo */}
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
              feature.included ? 'bg-primary/20 text-primary' : 'bg-gray-600 text-gray-400'
            }`}>
              {feature.included ? (
                <Check size={12} strokeWidth={3} />
              ) : (
                <IconX size={12} strokeWidth={3} /> // Usando um ícone X para features não incluídas
              )}
            </div>
            <span className={`${
              feature.included ? 'text-text-secondary' : 'text-text-muted line-through'
            }`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
      
      <div className="px-6 pb-6 mt-auto"> {/* mt-auto para garantir que o botão fique no final */}
        <Button 
          onClick={onClick}
          variant={isPopular ? 'primary' : 'outline'}
          className="w-full py-3 text-base" // Aumentado um pouco o botão
          disabled={disabled} // Usando a prop disabled
          isLoading={disabled} // Se quiser que o botão mostre loading quando desabilitado por processamento
        >
          {buttonText}
        </Button>
      </div>
    </Card>
  );
};

export default PricingCard;