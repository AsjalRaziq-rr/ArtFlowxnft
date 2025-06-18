/*
  # Fix Foreign Key Constraint Names

  1. Changes
    - Add explicit foreign key constraint names to match Supabase query expectations
    - Update posts.author_id constraint name to posts_author_id_fkey
    - Update nfts.creator_id constraint name to nfts_creator_id_fkey
    - Update nfts.owner_id constraint name to nfts_owner_id_fkey
    - Update games.developer_id constraint name to games_developer_id_fkey

  2. Security
    - No changes to RLS policies
    - Maintains existing security model
*/

-- Drop existing foreign key constraints and recreate with explicit names
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE posts ADD CONSTRAINT posts_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE nfts DROP CONSTRAINT IF EXISTS nfts_creator_id_fkey;
ALTER TABLE nfts ADD CONSTRAINT nfts_creator_id_fkey 
  FOREIGN KEY (creator_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE nfts DROP CONSTRAINT IF EXISTS nfts_owner_id_fkey;
ALTER TABLE nfts ADD CONSTRAINT nfts_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE games DROP CONSTRAINT IF EXISTS games_developer_id_fkey;
ALTER TABLE games ADD CONSTRAINT games_developer_id_fkey 
  FOREIGN KEY (developer_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Also fix collection foreign key constraint
ALTER TABLE nfts DROP CONSTRAINT IF EXISTS nfts_collection_id_fkey;
ALTER TABLE nfts ADD CONSTRAINT nfts_collection_id_fkey 
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL;

ALTER TABLE collections DROP CONSTRAINT IF EXISTS collections_creator_id_fkey;
ALTER TABLE collections ADD CONSTRAINT collections_creator_id_fkey 
  FOREIGN KEY (creator_id) REFERENCES profiles(id) ON DELETE CASCADE;