import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { Mail, Clock, Calendar } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden py-20 md:py-32 bg-background-dark">
      {/* Decorative Elements */}
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-lavender/10 rounded-full blur-[120px]"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0">
            <div className="animate-slide-up [animation-delay:0ms]">
              <h1 className="text-3xl md:text-5xl font-serif leading-tight mb-6">
                Write a message to your{' '}
                <span className="text-primary">future self</span>
              </h1>
            </div>
            
            <div className="animate-slide-up [animation-delay:200ms]">
              <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                Capture your thoughts, dreams, and reflections today. 
                Schedule them to arrive in your inbox when your future self needs them most.
              </p>
            </div>
            
            <div className="animate-slide-up [animation-delay:400ms] flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Write Your Letter
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 relative">
            <div className="relative h-[400px] w-full">
              {/* Animated Letters */}
              <div className="absolute top-[10%] left-[10%] transform -rotate-6 animate-float [animation-delay:0ms]">
                <div className="bg-background-light p-5 rounded-lg shadow-md max-w-[200px]">
                  <Mail className="text-primary mb-2" size={24} />
                  <p className="text-sm font-serif">Dear Future Me, Remember to take more risks and worry less...</p>
                  <div className="flex items-center mt-3 text-text-muted text-xs">
                    <Calendar size={12} className="mr-1" />
                    <span>Delivery: Dec 31, 2025</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-[40%] right-[5%] transform rotate-3 animate-float [animation-delay:2000ms]">
                <div className="bg-background-light p-5 rounded-lg shadow-md max-w-[220px]">
                  <Mail className="text-secondary mb-2" size={24} />
                  <p className="text-sm font-serif">I hope you've found the courage to pursue your passion for photography...</p>
                  <div className="flex items-center mt-3 text-text-muted text-xs">
                    <Clock size={12} className="mr-1" />
                    <span>183 days remaining</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-[5%] left-[20%] transform rotate-1 animate-float [animation-delay:4000ms]">
                <div className="bg-background-light p-5 rounded-lg shadow-md max-w-[180px]">
                  <Mail className="text-accent-gold mb-2" size={24} />
                  <p className="text-sm font-serif">Don't forget how much joy you found in the small moments...</p>
                  <div className="flex items-center mt-3 text-text-muted text-xs">
                    <Calendar size={12} className="mr-1" />
                    <span>Delivery: Aug 15, 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;