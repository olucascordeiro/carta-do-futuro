import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LetterForm from '../../components/letters/LetterForm';

const NewLetterPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleComplete = () => {
    navigate('/dashboard');
  };
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">Write to Your Future Self</h1>
        <p className="text-text-secondary">
          Create a letter that will be delivered to you in the future
        </p>
      </div>
      
      <LetterForm onComplete={handleComplete} />
    </DashboardLayout>
  );
};

export default NewLetterPage;