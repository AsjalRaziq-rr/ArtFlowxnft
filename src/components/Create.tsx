import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Image, Music, FileText, Sparkles, Upload, Settings, Download, Share2, MessageSquare } from 'lucide-react';
import AIGenerator from './AIGenerator';
import MintingModal from './MintingModal';
import { usePosts } from '../hooks/usePosts';
import { useNFTs } from '../hooks/useNFTs';
import toast from 'react-hot-toast';

const Create = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'music' | 'text'>('image');
  const [showMintModal, setShowMintModal] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const { createPost } = usePosts();
  const { createNFT } = useNFTs();

  const tabs = [
    { id: 'image', label: 'AI Images', icon: Image, color: 'from-purple-500 to-pink-500' },
    { id: 'music', label: 'AI Music', icon: Music, color: 'from-emerald-500 to-teal-500' },
    { id: 'text', label: 'AI Text', icon: FileText, color: 'from-orange-500 to-red-500' },
  ];

  const handleGenerate = (content: any) => {
    setGeneratedContent(content);
  };

  const handleMint = () => {
    if (generatedContent) {
      setShowMintModal(true);
    }
  };

  const handleDownload = async () => {
    if (!generatedContent) {
      toast.error('No content to download');
      return;
    }

    try {
      if (activeTab === 'image' && generatedContent.url) {
        // Create a temporary link to download the image
        const response = await fetch(generatedContent.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `artflow-${activeTab}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL
        window.URL.revokeObjectURL(url);
        toast.success('Image downloaded successfully!');
        
      } else if (activeTab === 'text' && generatedContent.content) {
        // Download text as a file
        const blob = new Blob([generatedContent.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `artflow-text-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        toast.success('Text downloaded successfully!');
        
      } else if (activeTab === 'music') {
        // For music, we'll create a JSON file with the metadata since we don't have actual audio
        const musicData = {
          title: generatedContent.title || 'AI Generated Music',
          prompt: generatedContent.prompt,
          duration: generatedContent.duration || '3:24',
          generated_at: new Date().toISOString(),
          type: 'AI Generated Music'
        };
        
        const blob = new Blob([JSON.stringify(musicData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `artflow-music-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        toast.success('Music metadata downloaded successfully!');
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. Please try again.');
    }
  };

  const handleShare = async () => {
    if (!generatedContent) {
      toast.error('No content to share');
      return;
    }

    const shareData = {
      title: `Check out my AI-generated ${activeTab}!`,
      text: `I just created this amazing ${activeTab} using ArtFlow's AI generator: "${generatedContent.prompt}"`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Content shared successfully!');
      } else {
        // Fallback: copy to clipboard
        const textToShare = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(textToShare);
        toast.success('Content copied to clipboard!');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        // Fallback: copy to clipboard
        try {
          const textToShare = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
          await navigator.clipboard.writeText(textToShare);
          toast.success('Content copied to clipboard!');
        } catch (clipboardError) {
          console.error('Share and clipboard failed:', error, clipboardError);
          toast.error('Sharing failed. Please try again.');
        }
      }
    }
  };

  const handleCreatePost = async () => {
    if (!generatedContent) return;

    try {
      // First create NFT from generated content
      const newNFT = await createNFT({
        title: generatedContent.prompt || 'AI Generated Art',
        description: postContent.trim() || 'AI generated artwork',
        image_url: generatedContent.url,
        nft_type: activeTab,
        is_for_sale: false,
      });

      if (newNFT) {
        // Then create post with the NFT
        await createPost(postContent.trim(), 'nft', newNFT.id);
        setShowPostModal(false);
        setPostContent('');
        toast.success('Post created successfully!');
      }
    } catch (error) {
      toast.error('Failed to create post');
    }
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
            className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Wand2 className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Create with AI
          </h1>
        </div>
        <p className="text-xl text-gray-300 dark:text-gray-300 light:text-gray-600 max-w-2xl mx-auto">
          Use artificial intelligence to generate unique digital art, music, and text for your NFT collection
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="flex justify-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex space-x-1 bg-white/5 dark:bg-white/5 light:bg-gray-100 backdrop-blur-sm p-1 rounded-xl border border-white/10 dark:border-white/10 light:border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r ' + tab.color + ' text-white'
                    : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Generator */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AIGenerator
            type={activeTab}
            onGenerate={handleGenerate}
          />
        </motion.div>

        {/* Side Panel */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Preview */}
          <div className="bg-white/5 dark:bg-white/5 light:bg-white backdrop-blur-sm border border-white/10 dark:border-white/10 light:border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-4 flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <span>Preview</span>
            </h3>
            
            {generatedContent ? (
              <div className="space-y-4">
                {activeTab === 'image' && (
                  <div className="relative group">
                    <img
                      src={generatedContent.url}
                      alt="Generated"
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                      <p className="text-white text-sm text-center px-4">
                        {generatedContent.prompt}
                      </p>
                    </div>
                  </div>
                )}
                {activeTab === 'music' && (
                  <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg">
                    <Music className="h-12 w-12 text-emerald-400 mx-auto mb-2" />
                    <p className="text-center text-emerald-400 font-medium">{generatedContent.title}</p>
                    <p className="text-center text-emerald-300 text-sm mt-1">{generatedContent.duration || '3:24'}</p>
                  </div>
                )}
                {activeTab === 'text' && (
                  <div className="p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg max-h-48 overflow-y-auto">
                    <p className="text-orange-100 dark:text-orange-100 light:text-orange-800 text-sm leading-relaxed">
                      {generatedContent.content}
                    </p>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    onClick={handleDownload}
                    disabled={!generatedContent}
                    className="flex items-center justify-center space-x-2 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Download</span>
                  </motion.button>

                  <motion.button
                    onClick={handleShare}
                    disabled={!generatedContent}
                    className="flex items-center justify-center space-x-2 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm">Share</span>
                  </motion.button>

                  <motion.button
                    onClick={() => setShowPostModal(true)}
                    disabled={!generatedContent}
                    className="flex items-center justify-center space-x-2 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">Post</span>
                  </motion.button>

                  <motion.button
                    onClick={handleMint}
                    disabled={!generatedContent}
                    className="flex items-center justify-center space-x-2 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm">Mint NFT</span>
                  </motion.button>
                </div>

                {/* Content Info */}
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Original Prompt:</p>
                  <p className="text-sm text-white dark:text-white light:text-gray-900">
                    {generatedContent.prompt}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Generated: {new Date(generatedContent.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">Generate content to see preview</p>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-white/5 dark:bg-white/5 light:bg-white backdrop-blur-sm border border-white/10 dark:border-white/10 light:border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-4 flex items-center space-x-2">
              <Settings className="h-5 w-5 text-indigo-400" />
              <span>Settings</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                  Quality
                </label>
                <select className="w-full px-3 py-2 bg-white/5 dark:bg-white/5 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="standard">Standard</option>
                  <option value="high">High Quality</option>
                  <option value="ultra">Ultra HD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                  Style
                </label>
                <select className="w-full px-3 py-2 bg-white/5 dark:bg-white/5 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="realistic">Realistic</option>
                  <option value="artistic">Artistic</option>
                  <option value="abstract">Abstract</option>
                  <option value="surreal">Surreal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                  Dimensions
                </label>
                <select className="w-full px-3 py-2 bg-white/5 dark:bg-white/5 light:bg-white border border-white/10 dark:border-white/10 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="1024x1024">1024x1024 (Square)</option>
                  <option value="1024x1536">1024x1536 (Portrait)</option>
                  <option value="1536x1024">1536x1024 (Landscape)</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPostModal(false)} />
          <motion.div
            className="relative w-full max-w-md bg-slate-900/95 dark:bg-slate-900/95 light:bg-white backdrop-blur-sm border border-white/10 dark:border-white/10 light:border-gray-200 rounded-2xl p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h3 className="text-xl font-bold text-white dark:text-white light:text-gray-900 mb-4">Create Post</h3>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Share your thoughts about this creation..."
              rows={4}
              className="w-full px-3 py-2 bg-white/5 dark:bg-white/5 light:bg-gray-50 border border-white/10 dark:border-white/10 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 placeholder-gray-400 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <div className="flex space-x-3 mt-4">
              <motion.button
                onClick={() => setShowPostModal(false)}
                className="flex-1 py-2 bg-white/10 dark:bg-white/10 light:bg-gray-200 text-white dark:text-white light:text-gray-700 rounded-lg hover:bg-white/20 dark:hover:bg-white/20 light:hover:bg-gray-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleCreatePost}
                className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Post
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Minting Modal */}
      <MintingModal
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        content={generatedContent}
        type={activeTab}
      />
    </div>
  );
};

export default Create;