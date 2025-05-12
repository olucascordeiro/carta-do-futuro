import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Pricing from '../components/home/Pricing';
import Testimonials from '../components/home/Testimonials';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const HomePage: React.FC = () => {
  return (
    <MainLayout>
      <Hero />
      <Features />
      
      {/* Why Write to Your Future Self */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif mb-6">Why Write to Your Future Self?</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  Self-reflection is a powerful tool for personal growth. By writing to your future self, 
                  you create a moment of introspection that captures your current state of mind, goals, 
                  and emotions.
                </p>
                <p>
                  When your letter arrives months or a year later, it serves as a mirror reflecting how 
                  far you've come, what's changed, and what's remained constant in your life.
                </p>
                <p>
                  This practice can bring clarity, motivation, and a deeper connection with yourself 
                  across time—a conversation between who you are now and who you'll become.
                </p>
              </div>
            </div>
            
            <div className="bg-background-light p-8 rounded-lg">
              <blockquote className="italic border-l-4 border-primary pl-4 py-2 mb-6">
                <p className="text-text-secondary font-serif text-lg">
                  "The best time to plant a tree was 20 years ago. The second best time is now."
                </p>
              </blockquote>
              
              <div className="space-y-4 text-text-secondary">
                <p>
                  Your future self will thank you for the words of wisdom, encouragement, 
                  and memories you preserve today.
                </p>
                <p>
                  Start your first letter now, and begin a meaningful conversation with the person 
                  you're becoming.
                </p>
              </div>
              
              <Link to="/register" className="mt-6 inline-block">
                <Button>Write Your First Letter</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Testimonials />
      <Pricing />
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/10">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl font-serif mb-6">Begin Your Journey of Self-Reflection</h2>
          <p className="text-text-secondary mb-8 text-lg">
            Start writing to your future self today and create a meaningful connection across time.
          </p>
          <Link to="/register">
            <Button size="lg">Create Your Account</Button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;