/*
  # Initial Schema for ArtFlow NFT Platform

  1. New Tables
    - `profiles` - User profiles with wallet addresses
    - `nfts` - NFT metadata and ownership
    - `posts` - Social media posts (text and NFT posts)
    - `likes` - User likes on posts and NFTs
    - `comments` - Comments on posts and NFTs
    - `follows` - User follow relationships
    - `games` - Uploaded games by developers
    - `collections` - NFT collections

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure data access based on user ownership
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address text UNIQUE NOT NULL,
  username text UNIQUE,
  bio text,
  avatar_url text,
  banner_url text,
  verified boolean DEFAULT false,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  twitter_handle text,
  discord_handle text,
  website_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  image_url text,
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- NFTs table
CREATE TABLE IF NOT EXISTS nfts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES collections(id) ON DELETE SET NULL,
  token_id text,
  contract_address text,
  price decimal(20,8),
  is_for_sale boolean DEFAULT false,
  metadata jsonb,
  nft_type text CHECK (nft_type IN ('image', 'music', 'text')) DEFAULT 'image',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text,
  post_type text CHECK (post_type IN ('text', 'nft')) NOT NULL,
  nft_id uuid REFERENCES nfts(id) ON DELETE CASCADE,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  nft_id uuid REFERENCES nfts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT likes_target_check CHECK (
    (post_id IS NOT NULL AND nft_id IS NULL) OR 
    (post_id IS NULL AND nft_id IS NOT NULL)
  )
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  nft_id uuid REFERENCES nfts(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT comments_target_check CHECK (
    (post_id IS NOT NULL AND nft_id IS NULL) OR 
    (post_id IS NULL AND nft_id IS NOT NULL)
  )
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  developer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  thumbnail_url text,
  game_file_url text,
  category text,
  rating decimal(3,2) DEFAULT 0,
  downloads_count integer DEFAULT 0,
  players_count integer DEFAULT 0,
  file_size text,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (wallet_address = auth.jwt() ->> 'wallet_address');

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = auth.jwt() ->> 'wallet_address');

-- Collections policies
CREATE POLICY "Collections are viewable by everyone"
  ON collections FOR SELECT
  USING (true);

CREATE POLICY "Users can create collections"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (creator_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

CREATE POLICY "Users can update own collections"
  ON collections FOR UPDATE
  TO authenticated
  USING (creator_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

-- NFTs policies
CREATE POLICY "NFTs are viewable by everyone"
  ON nfts FOR SELECT
  USING (true);

CREATE POLICY "Users can create NFTs"
  ON nfts FOR INSERT
  TO authenticated
  WITH CHECK (creator_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

CREATE POLICY "Owners can update their NFTs"
  ON nfts FOR UPDATE
  TO authenticated
  USING (owner_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

-- Posts policies
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (author_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (author_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own likes"
  ON likes FOR ALL
  TO authenticated
  USING (user_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ))
  WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (user_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (user_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

-- Follows policies
CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own follows"
  ON follows FOR ALL
  TO authenticated
  USING (follower_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ))
  WITH CHECK (follower_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

-- Games policies
CREATE POLICY "Approved games are viewable by everyone"
  ON games FOR SELECT
  USING (is_approved = true OR developer_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

CREATE POLICY "Users can upload games"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (developer_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

CREATE POLICY "Developers can update own games"
  ON games FOR UPDATE
  TO authenticated
  USING (developer_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

-- Functions to update counters
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    END IF;
    IF NEW.nft_id IS NOT NULL THEN
      UPDATE nfts SET likes_count = likes_count + 1 WHERE id = NEW.nft_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    IF OLD.nft_id IS NOT NULL THEN
      UPDATE nfts SET likes_count = likes_count - 1 WHERE id = OLD.nft_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    END IF;
    IF NEW.nft_id IS NOT NULL THEN
      UPDATE nfts SET comments_count = comments_count + 1 WHERE id = NEW.nft_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
    IF OLD.nft_id IS NOT NULL THEN
      UPDATE nfts SET comments_count = comments_count - 1 WHERE id = OLD.nft_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER likes_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();

CREATE TRIGGER comments_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comments_count();

CREATE TRIGGER followers_count_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_followers_count();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_nfts_creator_id ON nfts(creator_id);
CREATE INDEX IF NOT EXISTS idx_nfts_owner_id ON nfts(owner_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_nft_id ON likes(nft_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);