import React from 'react';
import { PenLine, Clock, Mail, ImageIcon } from 'lucide-react';

const features = [
  {
    icon: <PenLine className="w-6 h-6 text-primary" />,
    title: 'Write Your Letter',
    description: 'Pour your heart out, share your dreams, or record your current state of mind.'
  },
  {
    icon: <Clock className="w-6 h-6 text-secondary" />,
    title: 'Schedule Delivery',
    description: 'Choose when your future self will receive this message, from days to a full year away.'
  },
  {
    icon: <Mail className="w-6 h-6 text-accent-lavender" />,
    title: 'Receive in the Future',
    description: 'Get your letter delivered to your email when the scheduled date arrives.'
  },
  {
    icon: <ImageIcon className="w-6 h-6 text-accent-gold" />,
    title: 'Include Media',
    description: 'Premium users can attach photos or videos to preserve visual memories alongside their words.'
  }
];

const Features: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-background-light">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif mb-4">How It Works</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Capturing moments for your future self is simple and meaningful
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-background-dark p-6 rounded-lg hover:shadow-glow transition-shadow duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-serif mb-2">{feature.title}</h3>
              <p className="text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;