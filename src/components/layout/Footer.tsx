import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Heart, Instagram, Twitter, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-background-dark border-t border-primary/20 py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center">
              <Mail className="w-6 h-6 text-primary mr-2" />
              <h2 className="text-xl font-serif font-semibold">Carta do Futuro</h2>
            </Link>
            <p className="mt-4 text-text-secondary">
              Write letters to your future self. 
              Preserve your thoughts, dreams, and emotions 
              for a moment yet to come.
            </p>
          </div>
          
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-text-secondary hover:text-text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-text-secondary hover:text-text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-text-secondary hover:text-text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-text-secondary hover:text-text-primary transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/terms" className="text-text-secondary hover:text-text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-text-secondary hover:text-text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-text-secondary hover:text-text-primary transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Connect</h3>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                  <Facebook size={20} />
                </a>
              </div>
              <p className="text-text-secondary text-sm">
                Follow us for updates and inspiration
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-primary/10 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-text-muted text-sm">
            &copy; {new Date().getFullYear()} Carta do Futuro. All rights reserved.
          </p>
          <p className="text-text-muted text-sm mt-2 sm:mt-0 flex items-center">
            Made with <Heart size={14} className="text-primary mx-1" /> for your future self
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;