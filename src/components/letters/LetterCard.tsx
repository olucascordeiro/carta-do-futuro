import React from 'react';
import { Letter } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { Calendar, ImageIcon, Trash2, Edit, Clock } from 'lucide-react';
import { useLetters } from '../../contexts/LetterContext';

interface LetterCardProps {
  letter: Letter;
  onEdit?: (id: string) => void;
}

const LetterCard: React.FC<LetterCardProps> = ({ letter, onEdit }) => {
  const { deleteLetter } = useLetters();
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getDaysRemaining = (deliveryDate: Date) => {
    const today = new Date();
    const delivery = new Date(deliveryDate);
    const diffTime = delivery.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysRemaining = getDaysRemaining(letter.deliveryDate);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-yellow-500';
      case 'delivered':
        return 'text-green-500';
      case 'expired':
        return 'text-red-500';
      default:
        return 'text-text-secondary';
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this letter?')) {
      await deleteLetter(letter.id);
    }
  };
  
  return (
    <Card 
      className="relative group transition-all duration-300 overflow-hidden"
      hover={true}
      glow={letter.status === 'scheduled'}
    >
      <div className="flex justify-between mb-4">
        <h3 className="text-xl font-serif truncate">
          {letter.title || 'Untitled Letter'}
        </h3>
        <div className={`flex items-center ${getStatusColor(letter.status)}`}>
          <span className="text-sm capitalize">{letter.status}</span>
        </div>
      </div>
      
      <div className="mb-4 text-text-secondary line-clamp-3 text-sm h-16">
        {letter.body}
      </div>
      
      <div className="flex items-center text-text-muted text-sm mb-4">
        <Calendar size={14} className="mr-1" />
        <span>Delivery: {formatDate(letter.deliveryDate)}</span>
        
        {letter.mediaUrl && (
          <span className="ml-3 flex items-center">
            <ImageIcon size={14} className="mr-1" />
            Media attached
          </span>
        )}
      </div>
      
      {letter.status === 'scheduled' && (
        <div className="mb-4 flex items-center">
          <Clock size={14} className="mr-1 text-primary" />
          <span className="text-sm">
            {daysRemaining > 0 
              ? `${daysRemaining} days remaining` 
              : 'Delivery is today!'}
          </span>
        </div>
      )}
      
      <div className="flex justify-between mt-4">
        {letter.status === 'scheduled' && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit && onEdit(letter.id)}
            >
              <Edit size={14} className="mr-1" /> Edit
            </Button>
            <Button 
              variant="text" 
              size="sm"
              onClick={handleDelete}
              className="text-red-400 hover:text-red-500"
            >
              <Trash2 size={14} className="mr-1" /> Delete
            </Button>
          </>
        )}
        
        {letter.status === 'delivered' && (
          <div className="flex space-x-2">
            <Button size="sm">View Letter</Button>
          </div>
        )}
      </div>
      
      {/* Floating indicator for status */}
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
        letter.status === 'scheduled' ? 'bg-yellow-500' :
        letter.status === 'delivered' ? 'bg-green-500' : 
        'bg-red-500'
      }`}></div>
    </Card>
  );
};

export default LetterCard;