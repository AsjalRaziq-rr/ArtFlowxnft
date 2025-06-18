import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Grid, Heart, ShoppingBag, TrendingUp, Copy, ExternalLink } from 'lucide-react';
import NFTCard from './NFTCard';
import { useAuth } from '../hooks/useAuth';
import { useNFTs } from '../hooks/useNFTs';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, loading: authLoading, updateProfile } = useAuth();
  const { nfts, getUserNFTs, getCreatedNFTs } = useNFTs();
  const [activeTab, setActiveTab] = useState('owned');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    twitter_handle: '',
    website_url: '',
  });

  const userOwnedNFTs = user ? getUserNFTs(user.id) : [];
  const userCreatedNFTs = user ? getCreatedNFTs(user.id) : [];

  const tabs = [
    { id: 'owned', label: 'Owned', count: userOwnedNFTs.length, icon: Grid },
    { id: 'created', label: 'Created', count: userCreatedNFTs.length, icon: User },
    { id: 'liked', label: 'Liked', count: 0, icon: Heart },
    { id: 'activity', label: 'Activity', count: null, icon: TrendingUp },
  ];

  const handleEditProfile = () => {
    if (user) {
      setEditForm({
        username: user.username || '',
        bio: user.bio || '',
        twitter_handle: user.twitter_handle || '',
        website_url: user.website_url || '',
      });
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const copyAddress = () => {
    if (user?.wallet_address) {
      navigator.clipboard.writeText(user.wallet_address);
      toast.success('Address copied to clipboard!');
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-spin">
            <User className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <User className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8">
            Connect your wallet to view your profile, NFTs, and trading history
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <motion.div
        className="relative mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-2xl overflow-hidden">
          <img
            src={user.banner_url || 'https://images.pexels.com/photos/1205301/pexels-photo-1205301.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop'}
            alt="Profile Banner"
            className="w-full h-full object-cover opacity-80"
          />
        </div>

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4 md:mb-0">
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.wallet_address}`}
                alt="Profile"
                className="w-32 h-32 rounded-2xl border-4 border-slate-900 bg-slate-900"
              />
              {user.verified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  {isEditing ? (
                    <div className="space-y-3 mb-4">
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="text-2xl font-bold bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                        placeholder="Username"
                      />
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white resize-none"
                        rows={3}
                        placeholder="Bio"
                      />
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={editForm.twitter_handle}
                          onChange={(e) => setEditForm({ ...editForm, twitter_handle: e.target.value })}
                          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                          placeholder="Twitter handle"
                        />
                        <input
                          type="url"
                          value={editForm.website_url}
                          onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                          placeholder="Website URL"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-white mb-2">{user.username || 'Anonymous User'}</h1>
                      <div className="flex items-center space-x-2 mb-3">
                        <code className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300 font-mono">
                          {user.wallet_address?.slice(0, 8)}...{user.wallet_address?.slice(-6)}
                        </code>
                        <motion.button
                          onClick={copyAddress}
                          className="p-1 text-gray-400 hover:text-white transition-colors duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Copy className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          className="p-1 text-gray-400 hover:text-white transition-colors duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </motion.button>
                      </div>
                      <p className="text-gray-300 max-w-md mb-4">{user.bio || 'No bio available'}</p>
                      
                      {/* Social Links */}
                      <div className="flex items-center space-x-3">
                        {user.twitter_handle && (
                          <a
                            href={`https://twitter.com/${user.twitter_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            Twitter
                          </a>
                        )}
                        {user.website_url && (
                          <a
                            href={user.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            Website
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex space-x-3 mt-4 md:mt-0">
                  {isEditing ? (
                    <>
                      <motion.button
                        onClick={handleSaveProfile}
                        className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Save
                      </motion.button>
                      <motion.button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        onClick={handleEditProfile}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Edit Profile
                      </motion.button>
                      <motion.button
                        className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Settings className="h-5 w-5" />
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {[
          { label: 'NFTs Owned', value: userOwnedNFTs.length.toString(), color: 'from-blue-500 to-indigo-500' },
          { label: 'NFTs Created', value: userCreatedNFTs.length.toString(), color: 'from-purple-500 to-pink-500' },
          { label: 'Followers', value: user.followers_count?.toString() || '0', color: 'from-emerald-500 to-teal-500' },
          { label: 'Following', value: user.following_count?.toString() || '0', color: 'from-orange-500 to-red-500' },
        ].map((stat, index) => (
          <div
            key={index}
            className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-center"
          >
            <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
              {stat.value}
            </p>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="flex space-x-1 bg-white/5 backdrop-blur-sm p-1 rounded-xl border border-white/10 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-white/20'
                    : 'bg-gray-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {activeTab === 'owned' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userOwnedNFTs.map((nft, index) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <NFTCard nft={nft} />
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'created' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userCreatedNFTs.map((nft, index) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <NFTCard nft={nft} />
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'liked' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Liked NFTs</h3>
            <p className="text-gray-400">NFTs you like will appear here</p>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Activity Feed</h3>
            <p className="text-gray-400">Your trading activity and interactions will appear here</p>
          </div>
        )}

        {/* Empty states */}
        {(activeTab === 'owned' && userOwnedNFTs.length === 0) && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No NFTs Owned</h3>
            <p className="text-gray-400">Start collecting NFTs to see them here</p>
          </div>
        )}

        {(activeTab === 'created' && userCreatedNFTs.length === 0) && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No NFTs Created</h3>
            <p className="text-gray-400">Create your first NFT to see it here</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;