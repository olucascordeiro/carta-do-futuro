import React, { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Mail, 
  PenSquare, 
  Archive, 
  User, 
  CreditCard, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { to: '/dashboard', icon: <Archive className="mr-2" size={18} />, label: 'My Letters' },
    { to: '/dashboard/new', icon: <PenSquare className="mr-2" size={18} />, label: 'Write New Letter' },
    { to: '/dashboard/profile', icon: <User className="mr-2" size={18} />, label: 'Profile' },
    { to: '/dashboard/subscription', icon: <CreditCard className="mr-2" size={18} />, label: 'Subscription' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background-dark">
      {/* Mobile Header */}
      <div className="md:hidden bg-background-light py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Mail className="w-5 h-5 text-primary mr-2" />
          <span className="font-serif text-lg">Carta do Futuro</span>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="text-text-primary focus:outline-none"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`w-64 bg-background-light p-6 fixed md:static inset-0 z-20 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } h-full overflow-y-auto`}
      >
        <div className="mb-8 flex items-center">
          <Mail className="w-6 h-6 text-primary mr-2" />
          <h1 className="text-xl font-serif font-semibold">Carta do Futuro</h1>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-dark'
                }`
              }
              end={item.to === '/dashboard'}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 mt-4 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-dark transition-colors"
          >
            <LogOut className="mr-2" size={18} />
            Logout
          </button>
        </nav>
      </aside>
      
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-full overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;