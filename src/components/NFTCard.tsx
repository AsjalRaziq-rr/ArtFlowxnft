import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, ShoppingCart, Eye, MoreHorizontal, ExternalLink } from 'lucide-react';
import { NFT } from '../lib/supabase';
import { useNFTs } from '../hooks/useNFTs';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface NFTCardProps {
  nft: NFT;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
  const { toggleNFTLike } = useNFTs();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      toggleNFTLike(nft.id);
    } else {
      toast.error('Please connect your wallet to like NFTs');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (nft.is_for_sale) {
      toast.success('Added to cart!');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}/nft/${nft.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: nft.title,
          text: `Check out this amazing NFT: ${nft.title}`,
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

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`/nft/${nft.id}`, '_blank');
  };

  return (
    <Link to={`/nft/${nft.id}`}>
      <motion.div
        className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -4 }}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={nft.image_url}
            alt={nft.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Hover Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex space-x-3">
                  <motion.button
                    onClick={handleViewDetails}
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ExternalLink className="h-5 w-5" />
                  </motion.button>
                  {nft.is_for_sale && (
                    <motion.button
                      onClick={handleAddToCart}
                      className="p-3 bg-indigo-500/80 backdrop-blur-sm rounded-full text-white hover:bg-indigo-600/80 transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              nft.nft_type === 'image' ? 'bg-purple-500/80 text-purple-100' :
              nft.nft_type === 'music' ? 'bg-emerald-500/80 text-emerald-100' :
              'bg-orange-500/80 text-orange-100'
            } backdrop-blur-sm`}>
              {nft.nft_type.toUpperCase()}
            </span>
          </div>

          {/* Menu Button */}
          <div className="absolute top-3 right-3">
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">{nft.title}</h3>
              <div className="flex items-center space-x-2">
                {nft.creator?.avatar_url && (
                  <img
                    src={nft.creator.avatar_url}
                    alt={nft.creator.username}
                    className="w-4 h-4 rounded-full"
                  />
                )}
                <Link
                  to={`/user/${nft.creator?.wallet_address}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-400 text-sm hover:text-indigo-400 transition-colors"
                >
                  by {nft.creator?.username || 'Unknown'}
                </Link>
              </div>
            </div>
            {nft.is_for_sale && nft.price && (
              <div className="text-right">
                <p className="text-lg font-bold text-white">{nft.price} ETH</p>
                <p className="text-xs text-gray-400">≈ ${(nft.price * 2450).toFixed(0)}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={handleLike}
                className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className="h-4 w-4" />
                <span className="text-sm font-medium">{nft.likes_count}</span>
              </motion.button>

              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{nft.comments_count}</span>
              </motion.button>
            </div>

            <motion.button
              onClick={handleShare}
              className="text-gray-400 hover:text-indigo-400 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default NFTCard;