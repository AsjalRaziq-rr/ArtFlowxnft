import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { blockchainService } from '../services/blockchainService';
import toast from 'react-hot-toast';

interface WalletContextType {
  isConnected: boolean;
  address: string;
  balance: string;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState<number | null>(null);

  // Check if wallet is already connected on page load
  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_accounts',
        });
        
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          await updateBalance(accounts[0]);
          await updateChainId();
          
          // Initialize blockchain service contracts for existing connection
          try {
            await blockchainService.initializeSignerAndContracts();
          } catch (error) {
            console.error('Failed to initialize blockchain service:', error);
            // Don't fail the connection check, but log the error
          }
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      }
    }
  };

  const setupEventListeners = () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);
      (window as any).ethereum.on('disconnect', handleDisconnect);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAddress(accounts[0]);
      updateBalance(accounts[0]);
    }
  };

  const handleChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16));
    window.location.reload(); // Reload to reset app state
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const updateBalance = async (walletAddress: string) => {
    try {
      const balance = await blockchainService.getBalance(walletAddress);
      setBalance(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      setBalance('0');
    }
  };

  const updateChainId = async () => {
    try {
      const chainId = await (window as any).ethereum.request({
        method: 'eth_chainId',
      });
      setChainId(parseInt(chainId, 16));
    } catch (error) {
      console.error('Failed to get chain ID:', error);
    }
  };

  const connectWallet = useCallback(async () => {
    if (!blockchainService.isWeb3Available()) {
      toast.error('Please install MetaMask or another Web3 wallet');
      return;
    }

    try {
      toast.loading('Connecting wallet...', { id: 'wallet-connect' });
      
      const accounts = await blockchainService.connectWallet();
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        await updateBalance(accounts[0]);
        await updateChainId();
        
        toast.success('Wallet connected successfully!', { id: 'wallet-connect' });
        
        // Check if we're on the correct network (Polygon Mumbai for development)
        const currentChainId = await (window as any).ethereum.request({
          method: 'eth_chainId',
        });
        
        if (parseInt(currentChainId, 16) !== 80001) { // Polygon Mumbai testnet
          toast.error('Please switch to Polygon Mumbai testnet for development', { id: 'network-error' });
        }
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      
      if (error.code === 4001) {
        toast.error('Connection rejected by user', { id: 'wallet-connect' });
      } else if (error.code === -32002) {
        toast.error('Wallet request already pending. Please check your wallet.', { id: 'wallet-connect' });
      } else {
        toast.error('Failed to connect wallet', { id: 'wallet-connect' });
      }
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAddress('');
    setBalance('0');
    setChainId(null);
    toast.success('Wallet disconnected');
  }, []);

  const switchNetwork = useCallback(async () => {
    try {
      toast.loading('Switching to Polygon Mumbai testnet...', { id: 'network-switch' });
      await blockchainService.switchToPolygonMumbai();
      toast.success('Switched to Polygon Mumbai testnet!', { id: 'network-switch' });
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast.error('Failed to switch network', { id: 'network-switch' });
    }
  }, []);

  const value = {
    isConnected,
    address,
    balance,
    chainId,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
