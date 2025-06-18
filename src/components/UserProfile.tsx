import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Twitter, 
  MessageCircle,
  UserPlus,
  UserMinus,
  Share2,
  MoreHorizontal,
  Grid,
  Heart,
  TrendingUp
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNFT } from '../context/NFTContext';
import NFTCard from './NFTCard';
import { formatDistanceToNow } from 'date-fns';

const UserProfile = () => {
  const { address } = useParams<{ address: string }>();
  const { getUserByAddress, followUser, unfollowUser, isFollowing } = useUser();
  const { nfts } = useNFT();
  const [activeTab, setActiveTab] = useState('created');

  const user = address ? getUserByAddress(address) : null;
  const userNFTs = nfts.filter(nft => nft.creator === address);
  const likedNFTs = nfts.filter(nft => nft.isLiked);
  const following = isFollowing(address || '');

  const tabs = [
    { id: 'created', label: 'Created', count: userNFTs.length, icon: Grid },
    { id: 'collected', label: 'Collected', count: 8, icon: Heart },
    { id: 'activity', label: 'Activity', count: null, icon: TrendingUp },
  ];

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">User Not Found</h1>
          <p className="text-gray-400">The user profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const handleFollow = () => {
    if (following) {
      unfollowUser(user.address);
    } else {
      followUser(user.address);
    }
  };

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
            src={user.banner}
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
                src={user.avatar}
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
                  <h1 className="text-3xl font-bold text-white mb-2">{user.username}</h1>
                  <div className="flex items-center space-x-4 mb-3 text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        Joined {formatDistanceToNow(new Date(user.joinedDate), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{user.followers} followers</span>
                    </div>
                  </div>
                  <p className="text-gray-300 max-w-md mb-4">{user.bio}</p>
                  
                  {/* Social Links */}
                  <div className="flex items-center space-x-3">
                    {user.socialLinks.twitter && (
                      <a
                        href={user.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {user.socialLinks.website && (
                      <a
                        href={user.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <LinkIcon className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 mt-4 md:mt-0">
                  <motion.button
                    onClick={handleFollow}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                      following
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {following ? <UserMinus className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                    <span>{following ? 'Unfollow' : 'Follow'}</span>
                  </motion.button>
                  
                  <motion.button
                    className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </motion.button>
                  
                  <motion.button
                    className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share2 className="h-5 w-5" />
                  </motion.button>
                  
                  <motion.button
                    className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </motion.button>
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
          { label: 'NFTs Created', value: userNFTs.length.toString(), color: 'from-blue-500 to-indigo-500' },
          { label: 'NFTs Owned', value: '24', color: 'from-purple-500 to-pink-500' },
          { label: 'Total Volume', value: '5.2 ETH', color: 'from-emerald-500 to-teal-500' },
          { label: 'Followers', value: user.followers.toString(), color: 'from-orange-500 to-red-500' },
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
        {activeTab === 'created' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userNFTs.map((nft, index) => (
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

        {activeTab === 'collected' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Collected NFTs</h3>
            <p className="text-gray-400">This user hasn't collected any NFTs yet</p>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Activity Feed</h3>
            <p className="text-gray-400">User activity will appear here</p>
          </div>
        )}

        {(activeTab === 'created' && userNFTs.length === 0) && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No NFTs Created</h3>
            <p className="text-gray-400">This user hasn't created any NFTs yet</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UserProfile;