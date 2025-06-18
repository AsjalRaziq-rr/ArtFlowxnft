import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Palette, Home, Plus, ShoppingBag, User, Wallet, Bell, Gamepad2, Sun, Moon } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const location = useLocation();
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', icon: Home, label: 'Feed' },
    { path: '/create', icon: Plus, label: 'Create' },
    { path: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
    { path: '/games', icon: Gamepad2, label: 'Games' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 dark:bg-black/20 light:bg-white/80 backdrop-blur-md border-b border-white/10 dark:border-white/10 light:border-gray-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Palette className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ArtFlow
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors duration-200 ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'text-gray-300 dark:text-gray-300 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-gray-100 rounded-xl transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>

            {/* Notifications */}
            <motion.button
              className="p-2 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-gray-100 rounded-xl transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="h-5 w-5" />
            </motion.button>

            {/* Wallet Connection */}
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-500/20 rounded-xl hover:bg-emerald-500/30 transition-colors duration-200">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400 font-medium text-sm">
                      {formatAddress(address)}
                    </span>
                  </div>
                </Link>
                <motion.button
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Disconnect
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={connectWallet}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Wallet className="h-5 w-5" />
                <span className="font-medium">Connect Wallet</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;