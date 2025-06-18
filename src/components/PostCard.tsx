import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Verified,
  Clock,
  ShoppingCart,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post, Profile } from '../lib/supabase';
import toast from 'react-hot-toast';

interface PostCardProps {
  post: Post;
  onLike: () => void;
  currentUser?: Profile | null;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, currentUser }) => {
  const [showComments, setShowComments] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.author?.username}`,
          text: post.content || 'Check out this NFT!',
          url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300"
      whileHover={{ y: -2 }}
    >
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <Link 
            to={`/user/${post.author?.wallet_address}`}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={post.author?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${post.author?.wallet_address}`}
              alt={post.author?.username}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-white">{post.author?.username}</h3>
                {post.author?.verified && (
                  <Verified className="h-4 w-4 text-blue-400 fill-current" />
                )}
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <span>{post.author?.wallet_address?.slice(0, 8)}...{post.author?.wallet_address?.slice(-4)}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </Link>
          
          <motion.button
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MoreHorizontal className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        {post.content && (
          <p className="text-white leading-relaxed mb-4 whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {/* NFT Content */}
        {post.post_type === 'nft' && post.nft && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={post.nft.image_url}
                  alt={post.nft.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      post.nft.nft_type === 'image' ? 'bg-purple-500/20 text-purple-300' :
                      post.nft.nft_type === 'music' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-orange-500/20 text-orange-300'
                    }`}>
                      {post.nft.nft_type.toUpperCase()}
                    </span>
                    <Link 
                      to={`/nft/${post.nft.id}`}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{post.nft.title}</h4>
                  {post.nft.is_for_sale && post.nft.price && (
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-white">{post.nft.price} ETH</p>
                      <p className="text-gray-400 text-sm">≈ ${(post.nft.price * 2450).toFixed(0)} USD</p>
                    </div>
                  )}
                </div>
                
                {post.nft.is_for_sale && (
                  <div className="flex space-x-2">
                    <motion.button
                      className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Buy Now
                    </motion.button>
                    <motion.button
                      className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-6 py-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <motion.button
              onClick={onLike}
              className={`flex items-center space-x-2 ${
                post.is_liked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
              } transition-colors duration-200`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className={`h-5 w-5 ${post.is_liked ? 'fill-current' : ''}`} />
              <span className="font-medium">{post.likes_count}</span>
            </motion.button>

            <motion.button
              onClick={handleComment}
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">{post.comments_count}</span>
            </motion.button>

            <motion.button
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-400 hover:text-indigo-400 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="h-5 w-5" />
              <span className="font-medium">{post.shares_count}</span>
            </motion.button>
          </div>

          <div className="text-gray-400 text-sm">
            {post.post_type === 'nft' ? 'NFT Post' : 'Text Post'}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <motion.div
          className="px-6 py-4 border-t border-white/10 bg-white/5"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="space-y-4">
            {currentUser && (
              <div className="flex space-x-3">
                <img
                  src={currentUser.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.wallet_address}`}
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full"
                />
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
            
            {/* Mock comments */}
            <div className="space-y-3">
              <div className="flex space-x-3">
                <img
                  src="https://api.dicebear.com/7.x/identicon/svg?seed=commenter1"
                  alt="Commenter"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="bg-white/5 rounded-lg px-3 py-2">
                    <p className="text-white text-sm">Amazing work! The AI generation is getting so realistic.</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                    <span>2h ago</span>
                    <button className="hover:text-white">Like</button>
                    <button className="hover:text-white">Reply</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PostCard;