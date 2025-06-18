import { useState, useEffect } from 'react';
import { supabase, NFT } from '../lib/supabase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useNFTs = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('nfts')
        .select(`
          *,
          creator:profiles!nfts_creator_id_fkey(*),
          owner:profiles!nfts_owner_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNfts(data || []);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      toast.error('Failed to load NFTs');
    } finally {
      setLoading(false);
    }
  };

  const createNFT = async (nftData: {
    title: string;
    description?: string;
    image_url: string;
    price?: number;
    is_for_sale?: boolean;
    nft_type?: 'image' | 'music' | 'text';
    metadata?: any;
  }) => {
    if (!user) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('nfts')
        .insert([{
          ...nftData,
          creator_id: user.id,
          owner_id: user.id,
          nft_type: nftData.nft_type || 'image',
          is_for_sale: nftData.is_for_sale || false
        }])
        .select(`
          *,
          creator:profiles!nfts_creator_id_fkey(*),
          owner:profiles!nfts_owner_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      setNfts(prev => [data, ...prev]);
      toast.success('NFT created successfully!');
      
      return data;
    } catch (error) {
      console.error('Error creating NFT:', error);
      toast.error('Failed to create NFT');
    }
  };

  const updateNFT = async (nftId: string, updates: Partial<NFT>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('nfts')
        .update(updates)
        .eq('id', nftId)
        .eq('owner_id', user.id)
        .select(`
          *,
          creator:profiles!nfts_creator_id_fkey(*),
          owner:profiles!nfts_owner_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      setNfts(prev => prev.map(nft => nft.id === nftId ? data : nft));
      toast.success('NFT updated successfully');
    } catch (error) {
      console.error('Error updating NFT:', error);
      toast.error('Failed to update NFT');
    }
  };

  const toggleNFTLike = async (nftId: string) => {
    if (!user) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('nft_id', nftId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('nft_id', nftId);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert([{
            user_id: user.id,
            nft_id: nftId
          }]);

        if (error) throw error;
      }

      // Refresh NFTs to get updated like count
      fetchNFTs();
    } catch (error) {
      console.error('Error toggling NFT like:', error);
      toast.error('Failed to update like');
    }
  };

  const getUserNFTs = (userId: string) => {
    return nfts.filter(nft => nft.owner_id === userId);
  };

  const getCreatedNFTs = (userId: string) => {
    return nfts.filter(nft => nft.creator_id === userId);
  };

  const getMarketplaceNFTs = () => {
    return nfts.filter(nft => nft.is_for_sale);
  };

  return {
    nfts,
    loading,
    fetchNFTs,
    createNFT,
    updateNFT,
    toggleNFTLike,
    getUserNFTs,
    getCreatedNFTs,
    getMarketplaceNFTs,
  };
};