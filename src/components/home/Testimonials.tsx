import React from 'react';
import Card from '../common/Card';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Reading my letter a year later was like receiving a gift from my past self. I'd forgotten how much I'd grown.",
    author: "Maria S.",
    stars: 5
  },
  {
    quote: "I write to myself every birthday. It's become a beautiful tradition to reflect on the year that's passed.",
    author: "Thomas K.",
    stars: 5
  },
  {
    quote: "The letter I wrote before a major life decision arrived just when I needed perspective. It was like talking to an old friend.",
    author: "Aisha J.",
    stars: 4
  },
  {
    quote: "I'm creating a time capsule of thoughts for my future self. It's therapeutic and helps me process my journey.",
    author: "Daniel M.",
    stars: 5
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-background-light">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif mb-4">Messages From Our Community</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Discover how others are using letters to connect with their future selves
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="flex flex-col h-full">
              <div className="mb-4 text-accent-gold flex">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              
              <div className="mb-6 flex-grow">
                <Quote size={24} className="text-primary opacity-40 mb-2" />
                <p className="italic text-text-secondary">"{testimonial.quote}"</p>
              </div>
              
              <div className="font-medium">{testimonial.author}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;