import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import { Menu, X, Mail, User } from 'lucide-react';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="py-4 px-6 md:px-12 bg-background-dark/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <Mail className="w-6 h-6 text-primary mr-2" />
          <h1 className="text-2xl font-serif font-semibold">Carta do Futuro</h1>
        </Link>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`text-text-secondary hover:text-text-primary transition-colors ${isActive('/') ? 'text-text-primary' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className={`text-text-secondary hover:text-text-primary transition-colors ${isActive('/about') ? 'text-text-primary' : ''}`}
          >
            About
          </Link>
          <Link 
            to="/pricing" 
            className={`text-text-secondary hover:text-text-primary transition-colors ${isActive('/pricing') ? 'text-text-primary' : ''}`}
          >
            Pricing
          </Link>
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button>Dashboard</Button>
              </Link>
              <button
                onClick={() => logout()}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background-dark mt-4 p-4 rounded-md animate-fade-in">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`text-text-secondary hover:text-text-primary transition-colors ${isActive('/') ? 'text-text-primary' : ''}`}
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`text-text-secondary hover:text-text-primary transition-colors ${isActive('/about') ? 'text-text-primary' : ''}`}
              onClick={toggleMenu}
            >
              About
            </Link>
            <Link 
              to="/pricing" 
              className={`text-text-secondary hover:text-text-primary transition-colors ${isActive('/pricing') ? 'text-text-primary' : ''}`}
              onClick={toggleMenu}
            >
              Pricing
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-text-primary hover:text-primary transition-colors"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    toggleMenu();
                  }}
                  className="text-text-secondary hover:text-text-primary transition-colors text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-text-primary hover:text-primary transition-colors"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="text-text-primary hover:text-primary transition-colors"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;