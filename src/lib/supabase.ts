import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  wallet_address: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  verified: boolean;
  followers_count: number;
  following_count: number;
  twitter_handle?: string;
  discord_handle?: string;
  website_url?: string;
  created_at: string;
  updated_at: string;
}

export interface NFT {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  creator_id: string;
  owner_id: string;
  collection_id?: string;
  token_id?: string;
  contract_address?: string;
  price?: number;
  is_for_sale: boolean;
  metadata?: any;
  nft_type: 'image' | 'music' | 'text';
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  owner?: Profile;
}

export interface Post {
  id: string;
  author_id: string;
  content?: string;
  post_type: 'text' | 'nft';
  nft_id?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  nft?: NFT;
  is_liked?: boolean;
}

export interface Like {
  id: string;
  user_id: string;
  post_id?: string;
  nft_id?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id?: string;
  nft_id?: string;
  content: string;
  created_at: string;
  user?: Profile;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Game {
  id: string;
  title: string;
  description?: string;
  developer_id: string;
  thumbnail_url?: string;
  game_file_url?: string;
  category?: string;
  rating: number;
  downloads_count: number;
  players_count: number;
  file_size?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  developer?: Profile;
}