// src/components/letters/ViewLetterModal.tsx
import React from 'react';
import { Letter } from '../../types'; // Ajuste o caminho se necessário
import { X, Film, Mic, Image as ImageIconLucide } from 'lucide-react'; // Ícones para tipos de mídia
import Card from '../common/Card'; // Reutilizar seu componente Card para o corpo do modal
import Button from '../common/Button'; // Para o botão de fechar

interface ViewLetterModalProps {
  letter: Letter | null;
  onClose: () => void;
}

const ViewLetterModal: React.FC<ViewLetterModalProps> = ({ letter, onClose }) => {
  if (!letter) {
    return null; // Não renderiza nada se não houver carta selecionada
  }

  // Função simples para tentar determinar o tipo de mídia pela URL (pode precisar de melhorias)
  const getMediaType = (url?: string | null): 'image' | 'video' | 'audio' | 'unknown' => {
    if (!url) return 'unknown';
    if (/\.(jpeg|jpg|gif|png|webp)$/i.test(url)) return 'image';
    if (/\.(mp4|webm|ogg)$/i.test(url)) return 'video';
    if (/\.(mp3|wav|aac)$/i.test(url)) return 'audio';
    return 'unknown';
  };

  const mediaType = getMediaType(letter.mediaUrl);

  return (
    // Overlay para escurecer o fundo
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Permite fechar clicando fora do modal
    >
      <Card 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background-light relative"
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
        hover={false} // Desabilitar hover do card base se não quiser
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
          <h2 className="text-2xl font-serif text-primary">
            {letter.title || 'Sua Carta do Futuro'}
          </h2>
          <Button onClick={onClose} variant="text" size="sm" className="text-gray-400 hover:text-white">
            <X size={24} />
          </Button>
        </div>

        {/* Exibição da Mídia */}
        {letter.mediaUrl && (
          <div className="mb-6 rounded-md overflow-hidden">
            {mediaType === 'image' && (
              <img src={letter.mediaUrl} alt="Mídia da carta" className="w-full h-auto object-contain max-h-96" />
            )}
            {mediaType === 'video' && (
              <video controls src={letter.mediaUrl} className="w-full max-h-96">
                Seu navegador não suporta o elemento de vídeo.
              </video>
            )}
            {mediaType === 'audio' && (
              <audio controls src={letter.mediaUrl} className="w-full">
                Seu navegador não suporta o elemento de áudio.
              </audio>
            )}
            {mediaType === 'unknown' && (
              <div className="p-4 bg-background-dark rounded text-center text-text-secondary">
                <p>Mídia anexada. <a href={letter.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Abrir em nova aba</a>.</p>
              </div>
            )}
          </div>
        )}

        {/* Corpo da Carta */}
        <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap">
          {/* whitespace-pre-wrap para preservar quebras de linha e espaços */}
          {letter.body}
        </div>

        <div className="mt-8 pt-4 border-t border-gray-700 text-right">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ViewLetterModal;