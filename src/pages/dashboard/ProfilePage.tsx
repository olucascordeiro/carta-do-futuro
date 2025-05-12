import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Save } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    email: authState.user?.email || '',
    name: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Profile updated successfully');
    }, 1000);
  };
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">Profile Settings</h1>
        <p className="text-text-secondary">
          Manage your account information
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-serif mb-6">Personal Information</h2>
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-md text-green-400">
                {successMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <Input
                  label="Display Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  icon={<User className="w-4 h-4" />}
                />
                
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  icon={<Mail className="w-4 h-4" />}
                />
                
                <div>
                  <Button 
                    type="submit" 
                    isLoading={isLoading}
                    className="flex items-center"
                  >
                    <Save className="mr-2" size={18} />
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </Card>
          
          <Card className="mt-8">
            <h2 className="text-xl font-serif mb-6">Change Password</h2>
            
            <form>
              <div className="grid grid-cols-1 gap-6">
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                />
                
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  placeholder="Enter new password"
                />
                
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                />
                
                <div>
                  <Button type="submit">
                    Update Password
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
        
        <div>
          <Card className="bg-background-dark">
            <h2 className="text-xl font-serif mb-6">Account Summary</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-text-muted text-sm mb-1">Account Type</h3>
                <p className="font-medium">
                  {authState.user?.isSubscriber ? 'Premium' : 'Free'}
                </p>
              </div>
              
              <div>
                <h3 className="text-text-muted text-sm mb-1">Member Since</h3>
                <p className="font-medium">June 12, 2023</p>
              </div>
              
              <div>
                <h3 className="text-text-muted text-sm mb-1">Letters Written</h3>
                <p className="font-medium">3</p>
              </div>
              
              <div>
                <h3 className="text-text-muted text-sm mb-1">Letters Delivered</h3>
                <p className="font-medium">1</p>
              </div>
              
              {!authState.user?.isSubscriber && (
                <div className="pt-4 border-t border-primary/20">
                  <Button
                    variant="primary"
                    className="w-full"
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;