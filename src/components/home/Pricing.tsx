import React from 'react';
import { Link } from 'react-router-dom';
import PricingCard from '../subscription/PricingCard';
import { useAuth } from '../../contexts/AuthContext';

const Pricing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  const freeFeatures = [
    { text: 'Up to 3 scheduled letters', included: true },
    { text: 'Basic text editor', included: true },
    { text: 'Schedule up to 3 months ahead', included: true },
    { text: 'Email delivery', included: true },
    { text: 'Media attachments', included: false },
    { text: 'Premium templates', included: false },
    { text: 'Schedule up to 1 year ahead', included: false },
    { text: 'Unlimited letters', included: false },
  ];
  
  const premiumFeatures = [
    { text: 'Unlimited scheduled letters', included: true },
    { text: 'Advanced text editor', included: true },
    { text: 'Schedule up to 1 year ahead', included: true },
    { text: 'Email delivery', included: true },
    { text: 'Media attachments (photos/videos)', included: true },
    { text: 'Premium templates', included: true },
    { text: 'Priority support', included: true },
    { text: 'Export all your letters', included: true },
  ];
  
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif mb-4">Choose Your Plan</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Start with our free plan or upgrade for premium features
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            title="Free"
            price="Free"
            features={freeFeatures}
            buttonText={isAuthenticated ? 'Current Plan' : 'Get Started'}
            onClick={() => {}}
          />
          
          <PricingCard
            title="Premium"
            price="$4.99"
            features={premiumFeatures}
            isPopular={true}
            buttonText={isAuthenticated ? 'Upgrade Now' : 'Get Premium'}
            onClick={() => {}}
          />
        </div>
        
        <div className="text-center mt-12">
          <p className="text-text-secondary text-sm">
            All plans include a 7-day free trial. No credit card required for the free plan.
          </p>
          {!isAuthenticated && (
            <p className="mt-4">
              <Link to="/register" className="text-primary hover:underline">
                Create an account
              </Link>
              {' '}to get started with your first letter.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Pricing;