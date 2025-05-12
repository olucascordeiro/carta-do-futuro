import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useLetters } from '../../contexts/LetterContext';
import { useAuth } from '../../contexts/AuthContext';
import LetterCard from '../../components/letters/LetterCard';
import Button from '../../components/common/Button';
import { PenSquare, SortDesc, SortAsc, Search, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { letters, isLoading } = useLetters();
  const { authState } = useAuth();
  const [sortDesc, setSortDesc] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const toggleSort = () => setSortDesc(!sortDesc);
  
  // Filter and sort letters
  const filteredLetters = letters.filter(letter => 
    letter.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    letter.body.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedLetters = [...filteredLetters].sort((a, b) => {
    const dateA = new Date(a.deliveryDate).getTime();
    const dateB = new Date(b.deliveryDate).getTime();
    return sortDesc ? dateB - dateA : dateA - dateB;
  });
  
  // Group letters by status
  const scheduledLetters = sortedLetters.filter(letter => letter.status === 'scheduled');
  const deliveredLetters = sortedLetters.filter(letter => letter.status === 'delivered');
  
  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif mb-2">My Letters</h1>
          <p className="text-text-secondary">
            Manage your scheduled and delivered letters
          </p>
        </div>
        
        <Link to="/dashboard/new">
          <Button>
            <PenSquare className="mr-2" size={18} />
            Write New Letter
          </Button>
        </Link>
      </div>
      
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search your letters..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button
          variant="outline" 
          size="sm"
          onClick={toggleSort}
          className="flex items-center"
        >
          {sortDesc ? (
            <>
              <SortDesc size={18} className="mr-2" />
              Newest First
            </>
          ) : (
            <>
              <SortAsc size={18} className="mr-2" />
              Oldest First
            </>
          )}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="mb-10">
            <h2 className="text-xl font-serif mb-4 flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              Scheduled Letters
            </h2>
            
            {scheduledLetters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scheduledLetters.map(letter => (
                  <LetterCard 
                    key={letter.id} 
                    letter={letter}
                    onEdit={(id) => console.log('Edit letter:', id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-background-light rounded-lg p-8 text-center">
                <Inbox className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No scheduled letters</h3>
                <p className="text-text-secondary mb-6">
                  You don't have any letters scheduled for future delivery.
                </p>
                <Link to="/dashboard/new">
                  <Button>
                    Write Your First Letter
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-serif mb-4 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Delivered Letters
            </h2>
            
            {deliveredLetters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deliveredLetters.map(letter => (
                  <LetterCard 
                    key={letter.id} 
                    letter={letter}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-background-light rounded-lg p-6 text-center">
                <p className="text-text-secondary">
                  Your delivered letters will appear here.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;