// src/contexts/LetterContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Ajuste o tipo Omit para incluir mediaFile e remover mediaUrl do payload inicial
import { Letter } from '../types'; 
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

// Este é o tipo de dados que o formulário enviará para createLetter
type LetterCreatePayload = Omit<Letter, 'id' | 'userId' | 'createdAt' | 'status' | 'mediaUrl'> & {
  mediaFile?: File | null; // Arquivo de mídia opcional
};

interface LetterContextProps {
  letters: Letter[];
  isLoading: boolean;
  error: string | null;
  fetchLetters: () => Promise<void>;
  createLetter: (letterData: LetterCreatePayload) => Promise<void>; // Tipo atualizado aqui
  deleteLetter: (id: string) => Promise<void>;
}

const LetterContext = createContext<LetterContextProps | undefined>(undefined);

export const LetterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const BUCKET_NAME = 'cartas-media'; // Defina o nome do seu bucket aqui

  const fetchLetters = async () => {
    if (!authState.user) {
      setLetters([]);
      return;
    }
    // ... (lógica do fetchLetters como na sua última versão, que estava boa)
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('letters')
        .select('*')
        .eq('user_id', authState.user.id)
        .order('scheduled_date', { ascending: false });

      if (fetchError) throw fetchError;

      if (data) {
        const formattedLetters: Letter[] = data.map(dbLetter => ({
          id: dbLetter.id,
          userId: dbLetter.user_id,
          title: dbLetter.title || '',
          body: dbLetter.body, 
          mediaUrl: dbLetter.media_url || null,
          deliveryDate: new Date(dbLetter.scheduled_date),
          status: dbLetter.status === 'sent' 
                    ? 'delivered' 
                    : dbLetter.status === 'pending' 
                    ? 'scheduled' 
                    : 'failed',
          createdAt: new Date(dbLetter.created_at),
        }));
        setLetters(formattedLetters);
      } else {
        setLetters([]);
      }
    } catch (e: any) {
      console.error('[LetterContext] Erro ao buscar cartas:', e.message);
      setError(e.message || 'Falha ao carregar cartas.');
      setLetters([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authState.user) {
      fetchLetters();
    } else {
      setLetters([]);
    }
  }, [authState.user]);

  const createLetter = async (letterData: LetterCreatePayload) => {
    if (!authState.user) {
      const authError = "Usuário não autenticado.";
      setError(authError);
      throw new Error(authError);
    }

    const { planType, accessExpiresAt, id: userId } = authState.user; // Pegar o userId aqui
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 

    if (planType === 'none') {
      const planError = "Você precisa de um plano ativo para criar cartas.";
      setError(planError);
      throw new Error(planError);
    }

    if (planType === 'basic' && accessExpiresAt && new Date(accessExpiresAt) < hoje) {
      const expiryError = "Seu acesso ao Plano Básico expirou.";
      setError(expiryError);
      throw new Error(expiryError);
    }

    let uploadedMediaUrl: string | null = null;

    if (letterData.mediaFile) {
      if (planType === 'basic') {
        const mediaError = "O Plano Básico não permite anexar mídia.";
        setError(mediaError);
        throw new Error(mediaError); 
      }
      if (planType === 'full') {
        setIsLoading(true); // Indica loading para o upload
        setError(null);
        try {
          const file = letterData.mediaFile;
          const fileExt = file.name.split('.').pop();
          const fileName = `${userId}_${Date.now()}.${fileExt}`; // Nome de arquivo único
          const filePath = `public/${fileName}`; // Supabase Storage cria pastas 'public' se não existir dentro do bucket

          console.log(`[LetterContext] Fazendo upload para: ${BUCKET_NAME}/${filePath}`);
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
              cacheControl: '3600', // Cache de 1 hora
              upsert: false // Não sobrescrever se já existir (improvável com nome único)
            });

          if (uploadError) {
            console.error('[LetterContext] Erro no upload da mídia:', uploadError);
            throw new Error(`Falha no upload da mídia: ${uploadError.message}`);
          }
          
          if (uploadData) {
             // Obter a URL pública do arquivo após o upload
            const { data: publicUrlData } = supabase.storage
              .from(BUCKET_NAME)
              .getPublicUrl(uploadData.path); // uploadData.path é o filePath
            
            uploadedMediaUrl = publicUrlData.publicUrl;
            console.log('[LetterContext] Mídia enviada, URL pública:', uploadedMediaUrl);
          }
        } catch (uploadCatchError: any) {
          setIsLoading(false); // Garante que o loading pare em caso de erro no upload
          console.error('[LetterContext] Exceção durante upload:', uploadCatchError);
          setError(uploadCatchError.message || 'Erro desconhecido durante o upload da mídia.');
          throw uploadCatchError;
        }
        // setIsLoading(false) será chamado no finally do insert da carta
      }
    }
    
    try {
      setIsLoading(true); // Loading para inserir a carta no DB
      setError(null);
      
      const { error: insertError } = await supabase
        .from('letters')
        .insert({
          user_id: userId,
          title: letterData.title || null, 
          body: letterData.body,        
          media_url: uploadedMediaUrl, // URL do Supabase Storage ou null
          scheduled_date: letterData.deliveryDate.toISOString(), 
          status: 'pending' 
        });

      if (insertError) throw insertError;

      await fetchLetters(); 
    } catch (e: any) {
      console.error('[LetterContext] Erro ao criar carta no DB:', e.message);
      setError(e.message || 'Falha ao salvar dados da carta.');
      // Se houve upload bem-sucedido mas o insert no DB falhou, idealmente deletaríamos o arquivo do storage aqui.
      // Esta é uma lógica de compensação mais avançada.
      if (uploadedMediaUrl) {
        console.warn("[LetterContext] O insert da carta no DB falhou após upload da mídia. A mídia NÃO foi deletada do storage automaticamente.");
      }
      throw e; 
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLetter = async (id: string) => {
    // ... (lógica do deleteLetter como na sua última versão, que estava boa) ...
    // Lembre-se de usar BUCKET_NAME na lógica de deleção do storage
    if (!authState.user) {
      setError("Usuário não autenticado.");
      throw new Error("Usuário não autenticado.");
    }

    const letterToDelete = letters.find(l => l.id === id);
    let mediaPathToDelete: string | null = null;

    if (letterToDelete && letterToDelete.mediaUrl) {
      try {
        const url = new URL(letterToDelete.mediaUrl);
        // O path no Supabase Storage geralmente é tudo após o nome do bucket e a pasta 'public' (se usada)
        // Ex: Se URL é https://<proj>.supabase.co/storage/v1/object/public/cartas-media/public/user_id_timestamp.jpg
        // O path para .remove() seria ['public/user_id_timestamp.jpg']
        const pathSegments = url.pathname.split('/');
        const bucketIndex = pathSegments.indexOf(BUCKET_NAME);
        if (bucketIndex !== -1 && bucketIndex + 1 < pathSegments.length) {
            mediaPathToDelete = pathSegments.slice(bucketIndex + 1).join('/');
        }
      } catch (e) {
        console.error("[LetterContext] Erro ao parsear mediaUrl para deleção:", e);
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      const { error: deleteError } = await supabase
        .from('letters')
        .delete()
        .eq('id', id)
        .eq('user_id', authState.user.id); 

      if (deleteError) throw deleteError;
      
      // Se a deleção do registro no DB foi bem-sucedida, tente deletar a mídia do storage
      if (mediaPathToDelete) {
        console.log(`[LetterContext] Tentando deletar mídia do storage: ${BUCKET_NAME}/${mediaPathToDelete}`);
        const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([mediaPathToDelete]);
        if (storageError) {
          console.error("[LetterContext] Erro ao deletar mídia do storage (mas registro da carta foi deletado):", storageError.message);
          // Não relançar o erro aqui, pois a carta no DB já foi deletada. Apenas logar.
        } else {
          console.log("[LetterContext] Mídia deletada do storage com sucesso.");
        }
      }
      await fetchLetters();

    } catch (e: any) {
      console.error('[LetterContext] Erro ao deletar carta:', e.message);
      setError(e.message || 'Falha ao deletar carta.');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <LetterContext.Provider value={{ 
      letters, 
      isLoading, 
      error, 
      fetchLetters,
      createLetter, 
      deleteLetter,
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