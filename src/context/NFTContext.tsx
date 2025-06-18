import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface NFT {
  id: string;
  title: string;
  creator: string;
  price: string;
  likes: number;
  comments: number;
  image: string;
  type: 'image' | 'music' | 'text';
  isLiked: boolean;
  isForSale: boolean;
  tokenId?: string;
  contractAddress?: string;
  metadata?: any;
  createdAt: string;
}

interface NFTContextType {
  nfts: NFT[];
  cart: NFT[];
  toggleLike: (id: string) => void;
  addToCart: (nft: NFT) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  addNFT: (nft: Omit<NFT, 'id' | 'createdAt'>) => void;
  updateNFT: (id: string, updates: Partial<NFT>) => void;
  getNFTById: (id: string) => NFT | undefined;
}

const NFTContext = createContext<NFTContextType | undefined>(undefined);

export const useNFT = () => {
  const context = useContext(NFTContext);
  if (!context) {
    throw new Error('useNFT must be used within an NFTProvider');
  }
  return context;
};

// Mock NFT data with more realistic data
const mockNFTs: NFT[] = [
  {
    id: '1',
    title: 'Cosmic Dreams',
    creator: '0x742d35Cc6634C0532925a3b8D1322b3c12c5a34A',
    price: '0.5',
    likes: 142,
    comments: 23,
    image: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    type: 'image',
    isLiked: false,
    isForSale: true,
    tokenId: '1',
    contractAddress: '0x742d35Cc6634C0532925a3b8D1322b3c12c5a34A',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Digital Harmony',
    creator: '0x8ba1f109551bD432803012645Hac136c9c1495',
    price: '0.3',
    likes: 89,
    comments: 12,
    image: 'https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    type: 'music',
    isLiked: true,
    isForSale: true,
    tokenId: '2',
    contractAddress: '0x742d35Cc6634C0532925a3b8D1322b3c12c5a34A',
    createdAt: '2024-01-14T15:45:00Z',
  },
  {
    id: '3',
    title: 'Neural Networks',
    creator: '0x742d35Cc6634C0532925a3b8D1322b3c12c5a34A',
    price: '0.8',
    likes: 256,
    comments: 45,
    image: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    type: 'image',
    isLiked: false,
    isForSale: true,
    tokenId: '3',
    contractAddress: '0x742d35Cc6634C0532925a3b8D1322b3c12c5a34A',
    createdAt: '2024-01-13T09:20:00Z',
  },
  {
    id: '4',
    title: 'Quantum Poetry',
    creator: '0x8ba1f109551bD432803012645Hac136c9c1495',
    price: '0.2',
    likes: 67,
    comments: 8,
    image: 'https://images.pexels.com/photos/1097456/pexels-photo-1097456.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    type: 'text',
    isLiked: true,
    isForSale: true,
    tokenId: '4',
    contractAddress: '0x742d35Cc6634C0532925a3b8D1322b3c12c5a34A',
    createdAt: '2024-01-12T14:10:00Z',
  },
  {
    id: '5',
    title: 'Ethereal Landscapes',
    creator: '0x742d35Cc6634C0532925a3b8D1322b3c12c5a34A',
    price: '0.6',
    likes: 198,
    comments: 34,
    image: 'https://images.pexels.com/photos/1133957/pexels-photo-1133957.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    type: 'image',
    isLiked: false,
    isForSale: true,
    tokenId: '5',
    contractAddress: '0x742d35Cc6634C0532925a3b8D1322b3c12c5a34A',
    createdAt: '2024-01-11T11:30:00Z',
  },
  {
    id: '6',
    title: 'Synthwave Symphony',
    creator: '0x8ba1f109551bD432803012645Hac136c9c1495',
    price: '0.4',
    likes: 312,
    comments: 67,
    image: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    type: 'music',
    isLiked: true,
    isForSale: true,
    tokenId: '6',
    contractAddress: '0x742d35Cc6634C0532925a3b8D1322b3c12c5a34A',
    createdAt: '2024-01-10T16:45:00Z',
  },
];

export const NFTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nfts, setNfts] = useState<NFT[]>(mockNFTs);
  const [cart, setCart] = useState<NFT[]>([]);

  const toggleLike = useCallback((id: string) => {
    setNfts(prev => prev.map(nft => 
      nft.id === id 
        ? { 
            ...nft, 
            isLiked: !nft.isLiked, 
            likes: nft.isLiked ? nft.likes - 1 : nft.likes + 1 
          }
        : nft
    ));
  }, []);

  const addToCart = useCallback((nft: NFT) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === nft.id);
      if (exists) return prev;
      return [...prev, nft];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const addNFT = useCallback((nftData: Omit<NFT, 'id' | 'createdAt'>) => {
    const newNFT: NFT = {
      ...nftData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setNfts(prev => [newNFT, ...prev]);
    return newNFT;
  }, []);

  const updateNFT = useCallback((id: string, updates: Partial<NFT>) => {
    setNfts(prev => prev.map(nft => 
      nft.id === id ? { ...nft, ...updates } : nft
    ));
  }, []);

  const getNFTById = useCallback((id: string) => {
    return nfts.find(nft => nft.id === id);
  }, [nfts]);

  const value = {
    nfts,
    cart,
    toggleLike,
    addToCart,
    removeFromCart,
    clearCart,
    addNFT,
    updateNFT,
    getNFTById,
  };

  return (
    <NFTContext.Provider value={value}>
      {children}
    </NFTContext.Provider>
  );
};