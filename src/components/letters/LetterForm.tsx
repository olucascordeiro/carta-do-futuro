import React, { useState, useEffect } from 'react';
import { useLetters } from '../../contexts/LetterContext';
import { Letter } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import TextArea from '../common/TextArea';
import Card from '../common/Card';
import { CalendarIcon, ImageIcon } from 'lucide-react';

interface LetterFormProps {
  editLetterId?: string;
  onComplete?: () => void;
}

interface FormErrors {
  title?: string;
  body?: string;
  deliveryDate?: string;
}

const LetterForm: React.FC<LetterFormProps> = ({ editLetterId, onComplete }) => {
  const { letters, createLetter, updateLetter } = useLetters();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    deliveryDate: '',
    mediaUrl: '',
  });
  
  // Set min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  
  // Set max date to 1 year from now
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];
  
  useEffect(() => {
    if (editLetterId) {
      const letterToEdit = letters.find(letter => letter.id === editLetterId);
      if (letterToEdit) {
        setFormData({
          title: letterToEdit.title || '',
          body: letterToEdit.body,
          deliveryDate: new Date(letterToEdit.deliveryDate).toISOString().split('T')[0],
          mediaUrl: letterToEdit.mediaUrl || '',
        });
      }
    }
  }, [editLetterId, letters]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.body.trim()) {
      newErrors.body = 'Your letter needs some content';
    }
    
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Please select a delivery date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (editLetterId) {
        await updateLetter(editLetterId, {
          title: formData.title,
          body: formData.body,
          deliveryDate: new Date(formData.deliveryDate),
          mediaUrl: formData.mediaUrl,
        });
      } else {
        await createLetter({
          title: formData.title,
          body: formData.body,
          deliveryDate: new Date(formData.deliveryDate),
          mediaUrl: formData.mediaUrl,
        });
      }
      
      setFormData({
        title: '',
        body: '',
        deliveryDate: '',
        mediaUrl: '',
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving letter:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-serif mb-6">
        {editLetterId ? 'Edit Your Letter' : 'Write to Your Future Self'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <Input
          label="Title (Optional)"
          name="title"
          placeholder="Give your letter a title"
          value={formData.title}
          onChange={handleChange}
        />
        
        <TextArea
          label="Your Message"
          name="body"
          placeholder="Dear future me..."
          value={formData.body}
          onChange={handleChange}
          error={errors.body}
          rows={8}
          className="mb-6"
        />
        
        <div className="mb-6">
          <label className="block text-text-secondary mb-2 font-medium flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Delivery Date
          </label>
          <Input
            type="date"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={handleChange}
            min={minDate}
            max={maxDateStr}
            error={errors.deliveryDate}
          />
          <p className="text-text-muted text-sm mt-1">
            Choose when you'd like to receive this letter (up to one year from now)
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-text-secondary mb-2 font-medium flex items-center">
            <ImageIcon className="w-4 h-4 mr-2" />
            Add Media (Premium Feature)
          </label>
          <div className="border border-dashed border-secondary/30 rounded-md p-8 text-center bg-background-dark/50">
            <p className="text-text-muted mb-2">
              Upload an image or video to include with your letter
            </p>
            <Button variant="outline" disabled>
              Upgrade to Premium
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          {editLetterId && (
            <Button 
              type="button" 
              variant="outline"
              onClick={onComplete}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            isLoading={isLoading}
          >
            {editLetterId ? 'Save Changes' : 'Schedule Delivery'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default LetterForm;