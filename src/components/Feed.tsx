import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Type, Image, Loader2 } from 'lucide-react';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';

const Feed = () => {
  const { user } = useAuth();
  const { posts, loading, hasMore, loadMore, createPost, toggleLike } = usePosts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 &&
        !loading &&
        hasMore
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, loadMore]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.nft?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterBy === 'all' || 
      (filterBy === 'text' && post.post_type === 'text') ||
      (filterBy === 'nft' && post.post_type === 'nft');
    
    return matchesSearch && matchesFilter;
  });

  const handleCreatePost = async (content: string, type: 'text' | 'nft', nftId?: string) => {
    const newPost = await createPost(content, type, nftId);
    if (newPost) {
      setShowCreateModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          ArtFlow Feed
        </h1>
        <p className="text-lg text-gray-300">
          Discover, share, and connect with the NFT community
        </p>
      </motion.div>

      {/* Create Post Section */}
      {user && (
        <motion.div
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center space-x-4">
            <img
              src={user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.wallet_address}`}
              alt="Your avatar"
              className="w-12 h-12 rounded-full"
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 text-left px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-indigo-500/50 transition-all duration-200"
            >
              What's on your mind?
            </button>
            <div className="flex space-x-2">
              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Type className="h-5 w-5" />
              </motion.button>
              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <motion.div
        className="flex flex-col md:flex-row gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search posts, creators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Posts</option>
            <option value="text">Text Posts</option>
            <option value="nft">NFT Posts</option>
          </select>
        </div>
      </motion.div>

      {/* Posts Feed */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="flex items-center space-x-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading posts...</span>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <PostCard 
                  post={post} 
                  onLike={() => toggleLike(post.id)}
                  currentUser={user}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Loading indicator for infinite scroll */}
        {loading && posts.length > 0 && (
          <motion.div
            className="flex justify-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center space-x-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading more posts...</span>
            </div>
          </motion.div>
        )}

        {/* No more posts message */}
        {!loading && !hasMore && posts.length > 0 && (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-400">You've reached the end of the feed!</p>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && filteredPosts.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
            <p className="text-gray-400 mb-6">
              {user ? 'Be the first to share something amazing!' : 'Connect your wallet to see posts and join the community.'}
            </p>
            {user && (
              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Create First Post
              </motion.button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreatePost={handleCreatePost}
      />
    </div>
  );
};

export default Feed;