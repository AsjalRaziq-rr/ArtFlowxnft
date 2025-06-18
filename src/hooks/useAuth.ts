import { useState, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { useWallet } from '../context/WalletContext';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useWallet();

  useEffect(() => {
    if (isConnected && address) {
      signInWithWallet(address);
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [isConnected, address]);

  const signInWithWallet = async (walletAddress: string) => {
    try {
      setLoading(true);
      
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingUser) {
        setUser(existingUser);
      } else {
        // Create new user profile
        const newProfile = {
          wallet_address: walletAddress.toLowerCase(),
          username: `User_${walletAddress.slice(-6)}`,
          bio: 'New to ArtFlow',
          avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${walletAddress}`,
          banner_url: 'https://images.pexels.com/photos/1205301/pexels-photo-1205301.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
        };

        const { data: createdUser, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        setUser(createdUser);
        toast.success('Welcome to ArtFlow!');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUser(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
    }
  };

  return {
    user,
    loading,
    updateProfile,
  };
};