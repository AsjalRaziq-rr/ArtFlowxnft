import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, Clock, ShoppingCart, Eye, Grid, List } from 'lucide-react';
import NFTCard from './NFTCard';
import { useNFTs } from '../hooks/useNFTs';

const Marketplace = () => {
  const { nfts, loading } = useNFTs();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('latest');

  const marketplaceNFTs = nfts.filter(nft => nft.is_for_sale);

  const filteredNFTs = marketplaceNFTs.filter(nft => {
    const matchesSearch = 
      nft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.creator?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const price = nft.price || 0;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    return matchesSearch && matchesPrice;
  });

  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'popular':
        return b.likes_count - a.likes_count;
      case 'latest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
          NFT Marketplace
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Discover, buy, and sell unique digital assets from creators around the world
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {[
          { label: 'Total Volume', value: '12,456 ETH', change: '+12.5%', color: 'from-emerald-500 to-teal-500' },
          { label: 'Floor Price', value: '0.08 ETH', change: '+5.2%', color: 'from-blue-500 to-indigo-500' },
          { label: 'Listed NFTs', value: marketplaceNFTs.length.toString(), change: '+3.1%', color: 'from-purple-500 to-pink-500' },
          { label: 'Active Users', value: '2,156', change: '+8.7%', color: 'from-orange-500 to-red-500' },
        ].map((stat, index) => (
          <div
            key={index}
            className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"
          >
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className={`text-sm bg-gradient-to-r ${stat.color} bg-clip-text text-transparent font-medium`}>
              {stat.change}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search NFTs, creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-300">Price Range:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseFloat(e.target.value), priceRange[1]])}
                  className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                  className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-gray-400 text-sm">ETH</span>
              </div>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="latest">Latest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>

            {/* View Mode */}
            <div className="flex bg-white/5 rounded-lg p-1">
              <motion.button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Grid className="h-5 w-5" />
              </motion.button>
              <motion.button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <List className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* NFT Grid/List */}
      <motion.div
        className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="text-gray-400">Loading NFTs...</div>
          </div>
        ) : (
          sortedNFTs.map((nft, index) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <NFTCard nft={nft} />
            </motion.div>
          ))
        )}
      </motion.div>

      {!loading && sortedNFTs.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-gray-400 text-lg">No NFTs found matching your criteria.</p>
        </motion.div>
      )}
    </div>
  );
};

export default Marketplace;