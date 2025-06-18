import { useState, useEffect } from 'react';
import { supabase, Game } from '../lib/supabase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          developer:profiles!games_developer_id_fkey(*)
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const uploadGame = async (gameData: {
    title: string;
    description?: string;
    thumbnail_url?: string;
    game_file_url?: string;
    category?: string;
    file_size?: string;
  }) => {
    if (!user) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('games')
        .insert([{
          ...gameData,
          developer_id: user.id,
          is_approved: false // Games need approval
        }])
        .select(`
          *,
          developer:profiles!games_developer_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      toast.success('Game uploaded successfully! It will be reviewed before going live.');
      
      return data;
    } catch (error) {
      console.error('Error uploading game:', error);
      toast.error('Failed to upload game');
    }
  };

  const incrementDownloads = async (gameId: string) => {
    try {
      const { error } = await supabase
        .from('games')
        .update({ downloads_count: supabase.sql`downloads_count + 1` })
        .eq('id', gameId);

      if (error) throw error;

      setGames(prev => prev.map(game => 
        game.id === gameId 
          ? { ...game, downloads_count: game.downloads_count + 1 }
          : game
      ));
    } catch (error) {
      console.error('Error incrementing downloads:', error);
    }
  };

  const incrementPlayers = async (gameId: string) => {
    try {
      const { error } = await supabase
        .from('games')
        .update({ players_count: supabase.sql`players_count + 1` })
        .eq('id', gameId);

      if (error) throw error;

      setGames(prev => prev.map(game => 
        game.id === gameId 
          ? { ...game, players_count: game.players_count + 1 }
          : game
      ));
    } catch (error) {
      console.error('Error incrementing players:', error);
    }
  };

  const getUserGames = (userId: string) => {
    return games.filter(game => game.developer_id === userId);
  };

  return {
    games,
    loading,
    fetchGames,
    uploadGame,
    incrementDownloads,
    incrementPlayers,
    getUserGames,
  };
};