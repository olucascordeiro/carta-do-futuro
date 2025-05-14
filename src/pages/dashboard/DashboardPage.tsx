// src/pages/dashboard/DashboardPage.tsx
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useLetters } from '../../contexts/LetterContext';
import { useAuth } from '../../contexts/AuthContext'; // Importar para checar plano expirado
import LetterCard from '../../components/letters/LetterCard';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card'; // Importar Card para o aviso
import { PenSquare, SortDesc, SortAsc, Search, Inbox, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ViewLetterModal from '../../components/letters/ViewLetterModal';
import { Letter } from '../../types';

const DashboardPage: React.FC = () => {
  const { letters, isLoading, error: letterError, deleteLetter } = useLetters();
  const { authState } = useAuth(); // Pegar authState para dados do usuário
  
  const [sortDescState, setSortDescState] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetterForView, setSelectedLetterForView] = useState<Letter | null>(null);

  const toggleSort = () => setSortDescState(!sortDescState);

  const filteredLetters = letters.filter(letter => {
    const searchTermLower = searchTerm.toLowerCase();
    const titleMatch = letter.title?.toLowerCase().includes(searchTermLower);
    const bodyMatch = letter.body?.toLowerCase().includes(searchTermLower); 
    return titleMatch || bodyMatch;
  });

  const sortedLetters = [...filteredLetters].sort((a, b) => {
    const dateA = new Date(a.deliveryDate).getTime();
    const dateB = new Date(b.deliveryDate).getTime();
    return sortDescState ? dateB - dateA : dateA - dateB;
  });

  const scheduledLetters = sortedLetters.filter(letter => letter.status === 'scheduled');
  const deliveredLetters = sortedLetters.filter(letter => letter.status === 'delivered');
  const failedLetters = sortedLetters.filter(letter => letter.status === 'failed');

  const handleDeleteLetter = async (letterId: string) => {
    if (window.confirm('Tem certeza que deseja apagar esta carta? Esta ação não pode ser desfeita.')) {
      try {
        await deleteLetter(letterId);
        // alert('Carta apagada com sucesso!'); // Opcional: feedback pode ser mais sutil
      } catch (e: any) {
        console.error('Erro ao tentar apagar a carta:', e);
        alert(`Falha ao apagar a carta: ${e.message}`); 
      }
    }
  };

  const handleViewLetter = (letter: Letter) => {
    setSelectedLetterForView(letter);
  };

  const handleCloseModal = () => {
    setSelectedLetterForView(null);
  };

  // Lógica para verificar se o plano básico está expirado
  const user = authState.user;
  const hoje = new Date();
  hoje.setHours(0,0,0,0);
  const isBasicPlanExpired = user && user.planType === 'basic' && user.accessExpiresAt && new Date(user.accessExpiresAt) < hoje;

  return (
    <DashboardLayout>
      {isBasicPlanExpired && user && user.accessExpiresAt && ( // Aviso de plano expirado
        <Card className="mb-6 bg-yellow-600/30 border-yellow-700 text-yellow-200">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
            <div>
              <p className="font-semibold">Seu Plano Básico expirou em {new Date(user.accessExpiresAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>
              <p className="text-sm">Você não pode mais criar novas cartas. Para continuar, por favor, renove seu plano ou faça um upgrade.</p>
              <Link to="/dashboard/plano" className="mt-2 inline-block">
                <Button size="sm" variant="outline" className="bg-yellow-500/30 hover:bg-yellow-600/50 border-yellow-500 text-yellow-100">
                  Ver Opções de Plano
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif mb-2">Minhas Cartas</h1>
          <p className="text-text-secondary">
            Gerencie suas cartas agendadas e entregues.
          </p>
        </div>
        
        {/* Desabilitar botão se plano básico expirou ou se não tem plano */}
        <Link to="/dashboard/new" className={ (isBasicPlanExpired || user?.planType === 'none') ? "pointer-events-none" : ""}>
          <Button disabled={isBasicPlanExpired || user?.planType === 'none'}>
            <PenSquare className="mr-2" size={18} />
            Escrever Nova Carta
          </Button>
        </Link>
      </div>
      
      {/* ... (Busca e Ordenação como antes) ... */}
       <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Buscar em suas cartas..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={toggleSort} className="flex items-center">
          {sortDescState ? ( <><SortDesc size={18} className="mr-2" /> Mais Novas Primeiro</>
          ) : ( <><SortAsc size={18} className="mr-2" /> Mais Antigas Primeiro</>
          )}
        </Button>
      </div>
      
      {letterError && (
  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-400">
    Erro ao carregar cartas: {letterError}
  </div>
)}

      {isLoading ? (
         <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Cartas Agendadas */}
          <div className="mb-10">
            {/* ... (título da seção) ... */}
            <h2 className="text-xl font-serif mb-4 flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              Cartas Agendadas
            </h2>
            {scheduledLetters.length > 0 ? ( /* ... (map de scheduledLetters) ... */ 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scheduledLetters.map(letter => (
                  <LetterCard 
                    key={letter.id} 
                    letter={letter}
                    onDelete={() => handleDeleteLetter(letter.id)}
                  />
                ))}
              </div>
            ) : ( /* ... empty state ... */ 
                 <div className="bg-background-light rounded-lg p-8 text-center">
                <Inbox className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma carta agendada</h3>
                <p className="text-text-secondary mb-6">
                  Você não tem nenhuma carta programada para entrega futura.
                </p>
                {!(isBasicPlanExpired || user?.planType === 'none') &&
                    <Link to="/dashboard/new">
                        <Button>Escrever Sua Primeira Carta</Button>
                    </Link>
                }
              </div>
            )}
          </div>
          
          {/* Cartas Entregues */}
          <div className="mb-10">
            {/* ... (título da seção) ... */}
            <h2 className="text-xl font-serif mb-4 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Cartas Entregues
            </h2>
            {deliveredLetters.length > 0 ? ( /* ... (map de deliveredLetters) ... */ 
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deliveredLetters.map(letter => (
                  <LetterCard 
                    key={letter.id} 
                    letter={letter}
                    onDelete={() => handleDeleteLetter(letter.id)} 
                    onView={handleViewLetter}
                  />
                ))}
              </div>
            ) : ( /* ... empty state ... */
                 <div className="bg-background-light rounded-lg p-6 text-center">
                <p className="text-text-secondary">
                  Suas cartas entregues aparecerão aqui.
                </p>
              </div>
            )}
          </div>

          {/* Cartas com Falha no Envio */}
          {failedLetters.length > 0 && ( /* ... (seção de cartas com falha) ... */ 
             <div className="mb-10">
               <h2 className="text-xl font-serif mb-4 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Cartas com Falha no Envio
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {failedLetters.map(letter => (
                  <LetterCard 
                    key={letter.id} 
                    letter={letter}
                    onDelete={() => handleDeleteLetter(letter.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {selectedLetterForView && (
        <ViewLetterModal 
          letter={selectedLetterForView} 
          onClose={handleCloseModal} 
        />
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;