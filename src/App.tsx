import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Feed from './components/Feed';
import Create from './components/Create';
import Marketplace from './components/Marketplace';
import Profile from './components/Profile';
import Games from './components/Games';
import NFTDetail from './components/NFTDetail';
import UserProfile from './components/UserProfile';
import { WalletProvider } from './context/WalletContext';
import { UserProvider } from './context/UserContext';
import { NFTProvider } from './context/NFTContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <UserProvider>
          <NFTProvider>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 light:from-slate-50 light:via-purple-50 light:to-slate-50 transition-colors duration-300">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
                
                <Header />
                
                <motion.main 
                  className="relative z-10 pt-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Routes>
                    <Route path="/" element={<Feed />} />
                    <Route path="/create" element={<Create />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/nft/:id" element={<NFTDetail />} />
                    <Route path="/user/:address" element={<UserProfile />} />
                  </Routes>
                </motion.main>

                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'rgba(15, 23, 42, 0.9)',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                    },
                  }}
                />
              </div>
            </Router>
          </NFTProvider>
        </UserProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;