import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ShoppingCart, 
  Eye, 
  Clock,
  User,
  ExternalLink,
  Flag,
  MoreHorizontal
} from 'lucide-react';
import { useNFT } from '../context/NFTContext';
import { useUser } from '../context/UserContext';
import { useWallet } from '../context/WalletContext';
import { blockchainService } from '../services/blockchainService';
import toast from 'react-hot-toast';

const NFTDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { nfts, toggleLike, addToCart } = useNFT();
  const { getUserByAddress } = useUser();
  const { isConnected, address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const nft = nfts.find(n => n.id === id);
  const creator = nft ? getUserByAddress(nft.creator) : null;

  if (!nft) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">NFT Not Found</h1>
          <p className="text-gray-400">The NFT you're looking for doesn't exist.</p>
          <Link 
            to="/" 
            className="inline-block mt-4 px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  const handlePurchase = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      await blockchainService.buyNFT(nft.id, nft.price);
      toast.success('NFT purchased successfully!');
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(nft);
    toast.success('Added to cart!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: nft.title,
          text: `Check out this amazing NFT: ${nft.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* NFT Image */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="aspect-square bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <img
              src={nft.image}
              alt={nft.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Properties */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Properties</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-gray-400 text-sm">Type</p>
                <p className="text-white font-medium capitalize">{nft.type}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-gray-400 text-sm">Rarity</p>
                <p className="text-white font-medium">Unique</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-gray-400 text-sm">Collection</p>
                <p className="text-white font-medium">ArtFlow</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-gray-400 text-sm">Chain</p>
                <p className="text-white font-medium">Polygon</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* NFT Details */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                nft.type === 'image' ? 'bg-purple-500/20 text-purple-300' :
                nft.type === 'music' ? 'bg-emerald-500/20 text-emerald-300' :
                'bg-orange-500/20 text-orange-300'
              }`}>
                {nft.type.toUpperCase()}
              </span>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-2">{nft.title}</h1>
            
            {/* Creator Info */}
            <div className="flex items-center space-x-3 mb-6">
              <img
                src={creator?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'}
                alt={creator?.username || nft.creator}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="text-gray-400 text-sm">Created by</p>
                <Link 
                  to={`/user/${nft.creator}`}
                  className="text-white font-medium hover:text-indigo-400 transition-colors"
                >
                  {creator?.username || nft.creator}
                </Link>
              </div>
            </div>
          </div>

          {/* Price and Actions */}
          {nft.isForSale && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Current Price</p>
                  <p className="text-3xl font-bold text-white">{nft.price} ETH</p>
                  <p className="text-gray-400 text-sm">≈ $2,450 USD</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Ends in</p>
                  <p className="text-white font-medium">2d 14h 32m</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <motion.button
                  onClick={handlePurchase}
                  disabled={isLoading || !isConnected}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? 'Processing...' : 'Buy Now'}
                </motion.button>
                
                <motion.button
                  onClick={handleAddToCart}
                  className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCart className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          )}

          {/* Engagement */}
          <div className="flex items-center justify-between py-4 border-y border-white/10">
            <div className="flex items-center space-x-6">
              <motion.button
                onClick={() => toggleLike(nft.id)}
                className={`flex items-center space-x-2 ${
                  nft.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                } transition-colors duration-200`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className={`h-5 w-5 ${nft.isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">{nft.likes}</span>
              </motion.button>

              <motion.button
                className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">{nft.comments}</span>
              </motion.button>

              <motion.button
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-400 hover:text-indigo-400 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="h-5 w-5" />
                <span className="font-medium">Share</span>
              </motion.button>
            </div>

            <div className="flex items-center space-x-4 text-gray-400 text-sm">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>1.2k views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>2 hours ago</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
            <div className="text-gray-300 leading-relaxed">
              <p className={showFullDescription ? '' : 'line-clamp-3'}>
                This unique AI-generated artwork represents the convergence of artificial intelligence and human creativity. 
                Created using advanced neural networks and carefully crafted prompts, this piece explores themes of digital 
                consciousness and the future of art. Each element has been meticulously generated to create a harmonious 
                composition that challenges traditional notions of artistic creation.
              </p>
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 transition-colors"
              >
                {showFullDescription ? 'Show less' : 'Show more'}
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Contract Address</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-mono text-sm">0x742d...5a34A</span>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Token ID</span>
                <span className="text-white font-mono">{nft.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Token Standard</span>
                <span className="text-white">ERC-721</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Blockchain</span>
                <span className="text-white">Polygon</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Creator Royalty</span>
                <span className="text-white">10%</span>
              </div>
            </div>
          </div>

          {/* Report */}
          <button className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors text-sm">
            <Flag className="h-4 w-4" />
            <span>Report this NFT</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default NFTDetail;