// src/components/letters/LetterForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { useLetters } from '../../contexts/LetterContext';
import { useAuth } from '../../contexts/AuthContext';
import { Letter } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import TextArea from '../common/TextArea';
import Card from '../common/Card';
import { CalendarDays, Paperclip, AlertCircle, Send, UploadCloud } from 'lucide-react'; // AlertCircle é usado
import { Link } from 'react-router-dom';

type LetterCreatePayload = Omit<Letter, 'id' | 'userId' | 'createdAt' | 'status' | 'mediaUrl'> & {
  mediaFile?: File | null;
};

interface LetterFormProps {
  editLetterId?: string;
  onComplete?: () => void;
}

interface FormErrors {
  title?: string;
  body?: string;
  deliveryDate?: string;
  mediaFile?: string;
  general?: string;
}

const LetterForm: React.FC<LetterFormProps> = ({ editLetterId, onComplete }) => {
  const { createLetter, isLoading: lettersLoading, error: lettersError } = useLetters();
  const { authState } = useAuth();
  const { user } = authState; // user pode ser null aqui inicialmente

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    deliveryDate: '',
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  useEffect(() => {
    if (editLetterId) {
      console.warn("Funcionalidade de edição de cartas precisa ser definida e implementada.");
    }
  }, [editLetterId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setFormErrors(prev => ({...prev, general: undefined}));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setFormErrors(prev => ({...prev, mediaFile: 'Arquivo muito grande (máx 10MB).', general: undefined}));
        setMediaFile(null);
        e.target.value = '';
        return;
      }
      setMediaFile(file);
      setFormErrors(prev => ({...prev, mediaFile: undefined, general: undefined}));
    } else {
      setMediaFile(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!user) return false; // Não deve chegar aqui se as verificações abaixo estiverem ativas

    if (!formData.body.trim()) newErrors.body = 'Sua carta precisa de algum conteúdo.';
    if (!formData.deliveryDate) newErrors.deliveryDate = 'Por favor, selecione uma data de entrega.';
    
    if (mediaFile && user.planType === 'basic') { // Acesso seguro a user.planType
        newErrors.mediaFile = 'Anexar mídia não é permitido no Plano Básico.';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).filter(key => newErrors[key as keyof FormErrors]).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // A verificação de !user já foi feita antes de renderizar o formulário,
    // mas uma checagem extra aqui não faz mal, embora o TypeScript possa não gostar se user for null.
    if (!user || !validateForm()) return; 

    setIsSubmitting(true);
    setFormErrors(prev => ({...prev, general: undefined}));

    const letterPayload: LetterCreatePayload = {
      title: formData.title,
      body: formData.body,
      deliveryDate: new Date(formData.deliveryDate),
      mediaFile: mediaFile,
    };

    try {
      await createLetter(letterPayload);
      alert(editLetterId ? 'Carta atualizada com sucesso!' : 'Carta agendada com sucesso!');
      setFormData({ title: '', body: '', deliveryDate: '' });
      setMediaFile(null);
      const fileInput = document.getElementById('mediaFile-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      if (onComplete) onComplete();
    } catch (error: any) {
      console.error('Erro ao salvar carta:', error);
      setFormErrors(prev => ({...prev, general: error.message || 'Ocorreu um erro desconhecido.'}));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verificações de Plano e Acesso ANTES de renderizar o formulário principal
  if (authState.isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="ml-3 text-text-secondary">Verificando seu plano...</p>
        </div>
    );
  }

  // Se chegou aqui, isLoading é false. Agora verificamos o usuário.
  if (!user) { // user é de const { user } = authState;
    return (
      <Card className="text-center max-w-md mx-auto">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" /> {/* Ícone usado */}
        <h2 className="text-xl font-semibold mb-2">Autenticação Necessária</h2>
        <p className="text-text-secondary mb-6">
          Por favor, faça login para criar ou gerenciar suas cartas.
        </p>
        <Link to="/login">
          <Button variant="primary">Fazer Login</Button>
        </Link>
      </Card>
    );
  }

  // Se chegou aqui, user DEFINITIVAMENTE não é null.
  // Agora verificamos o plano.
  if (user.planType === 'none') {
    return (
      <Card className="text-center max-w-md mx-auto">
        <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" /> {/* Ícone usado */}
        <h2 className="text-xl font-semibold mb-2">Plano Necessário</h2>
        <p className="text-text-secondary mb-6">
          Você precisa de um plano ativo (Básico ou Completo) para criar cartas para o futuro.
        </p>
        <Link to="/dashboard/plano">
          <Button variant="primary">Ver Planos</Button>
        </Link>
      </Card>
    );
  }

  const hojeParaComparacao = new Date();
  hojeParaComparacao.setHours(0,0,0,0);
  if (user.planType === 'basic' && user.accessExpiresAt && new Date(user.accessExpiresAt) < hojeParaComparacao) {
    return (
      <Card className="text-center max-w-md mx-auto">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" /> {/* Ícone usado */}
        <h2 className="text-xl font-semibold mb-2">Acesso Expirado</h2>
        <p className="text-text-secondary mb-6">
          Seu acesso ao Plano Básico expirou em {new Date(user.accessExpiresAt).toLocaleDateString('pt-BR')}.
          Por favor, adquira um novo plano ou faça um upgrade para continuar criando cartas.
        </p>
        <Link to="/dashboard/plano">
          <Button variant="primary">Ver Opções de Plano</Button>
        </Link>
      </Card>
    );
  }

  const permiteMedia = user.planType === 'full'; // Agora user é garantidamente não-nulo aqui

  return (
    <Card className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-serif mb-6">
        {editLetterId ? 'Editar Sua Carta' : 'Escreva para Seu Futuro Eu'}
      </h2>
      
      {formErrors.general && (
         <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-400 text-sm">
          {formErrors.general}
        </div>
      )}
      {lettersError && !formErrors.general && (
         <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-400 text-sm">
          Erro no contexto: {lettersError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Título (Opcional)" name="title" placeholder="Dê um título para sua carta"
          value={formData.title} onChange={handleChange} error={formErrors.title}
        />
        <TextArea
          label="Sua Mensagem" name="body" placeholder="Querido eu do futuro..."
          value={formData.body} onChange={handleChange} error={formErrors.body} rows={10}
        />
        <div>
          <label htmlFor="deliveryDate" className="block text-text-secondary mb-2 font-medium flex items-center">
            <CalendarDays className="w-4 h-4 mr-2 text-primary" /> Data de Entrega
          </label>
          <Input
            id="deliveryDate" type="date" name="deliveryDate"
            value={formData.deliveryDate} onChange={handleChange}
            min={minDate} max={maxDateStr} error={formErrors.deliveryDate}
          />
          <p className="text-text-muted text-xs mt-1">
            Escolha quando você gostaria de receber esta carta (até um ano a partir de agora).
          </p>
        </div>
        
        <div>
          <label htmlFor="mediaFile-input" className="block text-text-secondary mb-2 font-medium flex items-center">
            <Paperclip className="w-4 h-4 mr-2 text-primary" />
            Anexar Mídia (Opcional)
          </label>
          {permiteMedia ? (
            <>
              <Input
                id="mediaFile-input"
                type="file"
                name="mediaFile" // O nome aqui é para o formulário, não necessariamente para o estado
                accept="image/*,video/*,audio/*"
                onChange={handleFileChange} // Usa o handler específico
                error={formErrors.mediaFile}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {mediaFile && <p className="text-text-muted text-xs mt-1">Arquivo selecionado: {mediaFile.name}</p>}
              <p className="text-text-muted text-xs mt-1">
                Envie um vídeo, áudio ou imagem (máx 10MB).
              </p>
            </>
          ) : (
            <div className="border border-dashed border-secondary/30 rounded-md p-6 text-center bg-background-dark/50">
                <UploadCloud size={32} className="text-text-muted mx-auto mb-2" />
                <p className="text-text-muted text-sm mb-2">
                    Anexar mídia é um recurso do Plano Completo.
                </p>
                <Link to="/dashboard/plano">
                    <Button variant="outline" size="sm">Faça Upgrade</Button>
                </Link>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
          {editLetterId && onComplete && (
            <Button type="button" variant="outline" onClick={onComplete} disabled={isSubmitting || lettersLoading}>
              Cancelar
            </Button>
          )}
          <Button 
            type="submit" 
            isLoading={isSubmitting || lettersLoading}
            className="flex items-center"
            // Condição simplificada:
            disabled={
            isSubmitting || 
            lettersLoading || 
            Boolean(user.planType === 'basic' && user.accessExpiresAt && new Date(user.accessExpiresAt) < hojeParaComparacao)
            }
          >
            <Send size={16} className="mr-2" />
            {editLetterId ? 'Salvar Alterações' : 'Agendar Carta'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default LetterForm;