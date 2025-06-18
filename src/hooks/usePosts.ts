import { useState, useEffect } from 'react';
import { supabase, Post } from '../lib/supabase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (offset = 0) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(*),
          nft:nfts(*,
            creator:profiles!nfts_creator_id_fkey(*)
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (error) throw error;

      // Check if user has liked each post
      if (user && data) {
        const postIds = data.map(post => post.id);
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        const likedPostIds = new Set(likes?.map(like => like.post_id) || []);
        
        const postsWithLikes = data.map(post => ({
          ...post,
          is_liked: likedPostIds.has(post.id)
        }));

        if (offset === 0) {
          setPosts(postsWithLikes);
        } else {
          setPosts(prev => [...prev, ...postsWithLikes]);
        }
      } else {
        const postsWithLikes = data?.map(post => ({ ...post, is_liked: false })) || [];
        if (offset === 0) {
          setPosts(postsWithLikes);
        } else {
          setPosts(prev => [...prev, ...postsWithLikes]);
        }
      }

      setHasMore(data?.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(posts.length);
    }
  };

  const createPost = async (content: string, type: 'text' | 'nft', nftId?: string) => {
    if (!user) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          author_id: user.id,
          content,
          post_type: type,
          nft_id: nftId
        }])
        .select(`
          *,
          author:profiles!posts_author_id_fkey(*),
          nft:nfts(*,
            creator:profiles!nfts_creator_id_fkey(*)
          )
        `)
        .single();

      if (error) throw error;

      const newPost = { ...data, is_liked: false };
      setPosts(prev => [newPost, ...prev]);
      toast.success('Post created successfully!');
      
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_liked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;

        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, is_liked: false, likes_count: p.likes_count - 1 }
            : p
        ));
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert([{
            user_id: user.id,
            post_id: postId
          }]);

        if (error) throw error;

        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, is_liked: true, likes_count: p.likes_count + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  return {
    posts,
    loading,
    hasMore,
    fetchPosts,
    loadMore,
    createPost,
    toggleLike,
    deletePost,
  };
};