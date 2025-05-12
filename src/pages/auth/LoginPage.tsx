import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Mail, Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, authState } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...formErrors };
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    }
    
    setFormErrors(newErrors);
    return valid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  return (
    <MainLayout hideFooter>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-serif font-bold">Welcome Back</h2>
            <p className="mt-2 text-text-secondary">
              Sign in to continue your journey of self-reflection
            </p>
          </div>
          
          <Card glow>
            {authState.error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-400">
                {authState.error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-text-secondary mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={formErrors.email}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-text-secondary mb-2 flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={formErrors.password}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    name="remember_me"
                    type="checkbox"
                    className="h-4 w-4 border-gray-300 rounded"
                  />
                  <label htmlFor="remember_me" className="ml-2 block text-sm text-text-secondary">
                    Remember me
                  </label>
                </div>
                
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:text-primary-light">
                    Forgot your password?
                  </a>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                isLoading={authState.isLoading}
              >
                Sign In
              </Button>
              
              <div className="text-center text-text-secondary mt-4">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:text-primary-light">
                  Sign up
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;