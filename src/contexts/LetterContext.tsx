import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Letter } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface LetterContextProps {
  letters: Letter[];
  isLoading: boolean;
  error: string | null;
  createLetter: (letter: Omit<Letter, 'id' | 'userId' | 'createdAt' | 'status'>) => Promise<void>;
  deleteLetter: (id: string) => Promise<void>;
  updateLetter: (id: string, updates: Partial<Letter>) => Promise<void>;
}

const LetterContext = createContext<LetterContextProps | undefined>(undefined);

export const LetterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authState.user) {
      fetchLetters();
    } else {
      setLetters([]);
    }
  }, [authState.user]);

  const fetchLetters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .eq('user_id', authState.user?.id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedLetters = data.map(letter => ({
          id: letter.id,
          userId: letter.user_id,
          title: letter.title || '',
          body: letter.message,
          mediaUrl: letter.media_url,
          deliveryDate: new Date(letter.scheduled_date),
          status: letter.status === 'sent' ? 'delivered' : 'scheduled',
          createdAt: new Date(letter.created_at)
        }));
        
        setLetters(formattedLetters);
      }
      
      setIsLoading(false);
    } catch (error) {
      setError('Failed to load letters');
      setIsLoading(false);
    }
  };

  const createLetter = async (letterData: Omit<Letter, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('letters')
        .insert({
          user_id: authState.user?.id,
          title: letterData.title,
          message: letterData.body,
          media_url: letterData.mediaUrl,
          scheduled_date: letterData.deliveryDate.toISOString(),
          status: 'pending'
        });

      if (error) throw error;

      await fetchLetters();
      
      setIsLoading(false);
    } catch (error) {
      setError('Failed to create letter');
      setIsLoading(false);
    }
  };

  const deleteLetter = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('letters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchLetters();
      
      setIsLoading(false);
    } catch (error) {
      setError('Failed to delete letter');
      setIsLoading(false);
    }
  };

  const updateLetter = async (id: string, updates: Partial<Letter>) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('letters')
        .update({
          title: updates.title,
          message: updates.body,
          media_url: updates.mediaUrl,
          scheduled_date: updates.deliveryDate?.toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await fetchLetters();
      
      setIsLoading(false);
    } catch (error) {
      setError('Failed to update letter');
      setIsLoading(false);
    }
  };

  return (
    <LetterContext.Provider value={{ 
      letters, 
      isLoading, 
      error, 
      createLetter, 
      deleteLetter, 
      updateLetter 
    }}>
      {children}
    </LetterContext.Provider>
  );
};

export const useLetters = () => {
  const context = useContext(LetterContext);
  if (context === undefined) {
    throw new Error('useLetters must be used within a LetterProvider');
  }
  return context;
};