import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, hideFooter = false }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;