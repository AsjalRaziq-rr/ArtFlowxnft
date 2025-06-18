import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface UserProfile {
  id: string;
  address: string;
  username: string;
  bio: string;
  avatar: string;
  banner: string;
  verified: boolean;
  followers: number;
  following: number;
  joinedDate: string;
  socialLinks: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
}

interface UserContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  updateProfile: (updates: Partial<UserProfile>) => void;
  getUserByAddress: (address: string) => UserProfile | null;
  followUser: (address: string) => void;
  unfollowUser: (address: string) => void;
  isFollowing: (address: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Mock users data
const mockUsers: UserProfile[] = [
  {
    id: uuidv4(),
    address: '0x742d35Cc6634C0532925a3b8D1322b3c12c5a34A',
    username: 'AI_Creator_Pro',
    bio: 'Digital artist exploring the intersection of AI and creativity. Passionate about generating unique NFTs that push the boundaries of art.',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    banner: 'https://images.pexels.com/photos/1205301/pexels-photo-1205301.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
    verified: true,
    followers: 1247,
    following: 89,
    joinedDate: '2024-01-15',
    socialLinks: {
      twitter: 'https://twitter.com/ai_creator_pro',
      discord: 'AI_Creator_Pro#1234',
      website: 'https://aicreator.pro',
    },
  },
  {
    id: uuidv4(),
    address: '0x8ba1f109551bD432803012645Hac136c9c1495',
    username: 'TechArtist',
    bio: 'Blockchain developer and digital artist. Creating the future of decentralized art.',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    banner: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
    verified: false,
    followers: 892,
    following: 156,
    joinedDate: '2024-02-20',
    socialLinks: {
      twitter: 'https://twitter.com/techartist',
      website: 'https://techartist.dev',
    },
  },
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [followingList, setFollowingList] = useState<string[]>([]);

  // Initialize current user when wallet connects
  useEffect(() => {
    const initializeUser = () => {
      // This would typically be called when wallet connects
      // For demo, we'll use the first mock user
      const user = users[0];
      if (user) {
        setCurrentUser(user);
      }
    };

    initializeUser();
  }, [users]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    
    setUsers(prev => prev.map(user => 
      user.id === currentUser.id ? updatedUser : user
    ));
  }, [currentUser]);

  const getUserByAddress = useCallback((address: string) => {
    return users.find(user => user.address.toLowerCase() === address.toLowerCase()) || null;
  }, [users]);

  const followUser = useCallback((address: string) => {
    if (!followingList.includes(address)) {
      setFollowingList(prev => [...prev, address]);
      
      // Update follower count
      setUsers(prev => prev.map(user => 
        user.address.toLowerCase() === address.toLowerCase()
          ? { ...user, followers: user.followers + 1 }
          : user
      ));
    }
  }, [followingList]);

  const unfollowUser = useCallback((address: string) => {
    setFollowingList(prev => prev.filter(addr => addr !== address));
    
    // Update follower count
    setUsers(prev => prev.map(user => 
      user.address.toLowerCase() === address.toLowerCase()
        ? { ...user, followers: Math.max(0, user.followers - 1) }
        : user
    ));
  }, []);

  const isFollowing = useCallback((address: string) => {
    return followingList.includes(address);
  }, [followingList]);

  const value = {
    currentUser,
    users,
    updateProfile,
    getUserByAddress,
    followUser,
    unfollowUser,
    isFollowing,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};