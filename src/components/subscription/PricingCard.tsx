import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Check } from 'lucide-react';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  features: PricingFeature[];
  isPopular?: boolean;
  buttonText: string;
  onClick?: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  features,
  isPopular = false,
  buttonText,
  onClick,
}) => {
  return (
    <Card 
      className={`relative transition-all duration-300 ${
        isPopular ? 'border-2 border-primary' : 'border border-background-light'
      }`}
      hover={true}
      glow={isPopular}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
          Popular
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-xl font-serif mb-4">{title}</h3>
        <div className="mb-4">
          <span className="text-3xl font-bold">{price}</span>
          {price !== 'Free' && <span className="text-text-muted">/month</span>}
        </div>
      </div>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <div className={`mt-0.5 mr-2 ${feature.included ? 'text-primary' : 'text-text-muted'}`}>
              {feature.included ? (
                <Check size={18} />
              ) : (
                <span className="block w-[18px] h-[18px] text-center">-</span>
              )}
            </div>
            <span className={feature.included ? 'text-text-secondary' : 'text-text-muted'}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
      
      <Button 
        onClick={onClick}
        variant={isPopular ? 'primary' : 'outline'}
        className="w-full"
      >
        {buttonText}
      </Button>
    </Card>
  );
};

export default PricingCard;