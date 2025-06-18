import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gamepad2, 
  Upload, 
  Play, 
  Star, 
  Download, 
  Users, 
  Clock,
  Trophy,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

interface Game {
  id: string;
  title: string;
  developer: string;
  description: string;
  thumbnail: string;
  category: string;
  rating: number;
  downloads: number;
  players: number;
  lastUpdated: string;
  fileSize: string;
  gameUrl: string;
  isPlayable: boolean;
}

const Games = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [gameData, setGameData] = useState({
    title: '',
    description: '',
    category: 'action',
    thumbnail: null as File | null,
  });

  const categories = [
    'all', 'action', 'puzzle', 'strategy', 'arcade', 'adventure', 'simulation', 'racing'
  ];

  const mockGames: Game[] = [
    {
      id: '1',
      title: 'Crypto Warriors',
      developer: 'BlockchainGames',
      description: 'Epic battle royale game with NFT characters and blockchain rewards.',
      thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: 'action',
      rating: 4.8,
      downloads: 15420,
      players: 2341,
      lastUpdated: '2024-01-15',
      fileSize: '125 MB',
      gameUrl: '/games/crypto-warriors',
      isPlayable: true,
    },
    {
      id: '2',
      title: 'NFT Puzzle Quest',
      developer: 'PuzzleMaster',
      description: 'Solve puzzles to unlock rare NFTs and build your collection.',
      thumbnail: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: 'puzzle',
      rating: 4.6,
      downloads: 8932,
      players: 1205,
      lastUpdated: '2024-01-10',
      fileSize: '89 MB',
      gameUrl: '/games/nft-puzzle-quest',
      isPlayable: true,
    },
    {
      id: '3',
      title: 'Metaverse Builder',
      developer: 'VirtualWorlds',
      description: 'Create and monetize your own virtual worlds with NFT assets.',
      thumbnail: 'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: 'simulation',
      rating: 4.9,
      downloads: 23156,
      players: 5678,
      lastUpdated: '2024-01-20',
      fileSize: '256 MB',
      gameUrl: '/games/metaverse-builder',
      isPlayable: true,
    },
    {
      id: '4',
      title: 'AI Racing League',
      developer: 'SpeedDemon',
      description: 'Race AI-generated tracks and compete for cryptocurrency prizes.',
      thumbnail: 'https://images.pexels.com/photos/1637859/pexels-photo-1637859.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: 'racing',
      rating: 4.7,
      downloads: 12045,
      players: 1876,
      lastUpdated: '2024-01-18',
      fileSize: '178 MB',
      gameUrl: '/games/ai-racing-league',
      isPlayable: true,
    },
  ];

  const filteredGames = mockGames.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.developer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    onDrop: (acceptedFiles) => {
      setUploadedFiles(acceptedFiles);
      toast.success(`${acceptedFiles.length} file(s) uploaded successfully!`);
    },
  });

  const handleGameUpload = async () => {
    if (!gameData.title || !gameData.description || uploadedFiles.length === 0) {
      toast.error('Please fill in all required fields and upload a game file.');
      return;
    }

    toast.loading('Uploading game...', { id: 'upload' });
    
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast.success('Game uploaded successfully! It will be reviewed before going live.', { id: 'upload' });
    
    // Reset form
    setGameData({
      title: '',
      description: '',
      category: 'action',
      thumbnail: null,
    });
    setUploadedFiles([]);
  };

  const playGame = (game: Game) => {
    toast.success(`Launching ${game.title}...`);
    // In a real implementation, this would open the game in a new window or iframe
    window.open(game.gameUrl, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <motion.div
            className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Gamepad2 className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            GameFi Hub
          </h1>
        </div>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Discover, play, and upload blockchain games. Earn NFTs and cryptocurrency while gaming!
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="flex justify-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex space-x-1 bg-white/5 backdrop-blur-sm p-1 rounded-xl border border-white/10">
          <motion.button
            onClick={() => setActiveTab('browse')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'browse'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Gamepad2 className="h-5 w-5" />
            <span>Browse Games</span>
          </motion.button>
          
          <motion.button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload className="h-5 w-5" />
            <span>Upload Game</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Browse Games Tab */}
      {activeTab === 'browse' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-slate-800">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                {/* Game Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={game.thumbnail}
                    alt={game.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <motion.button
                      onClick={() => playGame(game)}
                      className="p-3 bg-emerald-500 rounded-full text-white hover:bg-emerald-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Play className="h-6 w-6" />
                    </motion.button>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-emerald-500/80 text-emerald-100 text-xs font-medium rounded-full backdrop-blur-sm">
                      {game.category.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Game Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white truncate">{game.title}</h3>
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{game.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-3">by {game.developer}</p>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{game.description}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span>{game.downloads.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{game.players.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{game.fileSize}</span>
                    </div>
                  </div>
                  
                  {/* Play Button */}
                  <motion.button
                    onClick={() => playGame(game)}
                    className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Play Now
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Upload Game Tab */}
      {activeTab === 'upload' && (
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Upload Your Game</h2>
            
            <div className="space-y-6">
              {/* Game Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Game Title *
                  </label>
                  <input
                    type="text"
                    value={gameData.title}
                    onChange={(e) => setGameData({ ...gameData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter game title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={gameData.category}
                    onChange={(e) => setGameData({ ...gameData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.slice(1).map(category => (
                      <option key={category} value={category} className="bg-slate-800">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={gameData.description}
                  onChange={(e) => setGameData({ ...gameData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Describe your game..."
                />
              </div>
              
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Game Files (ZIP) *
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-white/20 hover:border-emerald-500/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  {uploadedFiles.length > 0 ? (
                    <div>
                      <p className="text-emerald-400 font-medium">
                        {uploadedFiles.length} file(s) uploaded
                      </p>
                      <p className="text-gray-400 text-sm">
                        {uploadedFiles.map(f => f.name).join(', ')}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white mb-2">
                        {isDragActive ? 'Drop files here' : 'Drag & drop game files here'}
                      </p>
                      <p className="text-gray-400 text-sm">or click to browse</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Upload Button */}
              <motion.button
                onClick={handleGameUpload}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Upload Game
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Games;