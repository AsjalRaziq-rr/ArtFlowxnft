import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Image, Wand2, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNFTs } from '../hooks/useNFTs';
import AIGenerator from './AIGenerator';
import toast from 'react-hot-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (content: string, type: 'text' | 'nft', nftId?: string) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onCreatePost }) => {
  const { user } = useAuth();
  const { nfts, createNFT } = useNFTs();
  const [postType, setPostType] = useState<'text' | 'nft' | 'ai'>('text');
  const [content, setContent] = useState('');
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isPosting, setIsPosting] = useState(false);

  const userNFTs = user ? nfts.filter(nft => nft.creator_id === user.id) : [];

  const handlePost = async () => {
    if (!content.trim() && postType === 'text') {
      toast.error('Please enter some content');
      return;
    }

    if (postType === 'nft' && !selectedNFT) {
      toast.error('Please select an NFT');
      return;
    }

    if (postType === 'ai' && !generatedContent) {
      toast.error('Please generate content first');
      return;
    }

    setIsPosting(true);

    try {
      let nftId: string | undefined;

      if (postType === 'ai' && generatedContent) {
        // Create NFT from generated content
        const newNFT = await createNFT({
          title: generatedContent.prompt || 'AI Generated Art',
          description: content.trim() || 'AI generated artwork',
          image_url: generatedContent.url,
          nft_type: 'image',
          is_for_sale: false,
        });

        if (newNFT) {
          nftId = newNFT.id;
        }
      } else if (postType === 'nft' && selectedNFT) {
        nftId = selectedNFT.id;
      }

      await onCreatePost(
        content.trim(),
        postType === 'ai' ? 'nft' : postType,
        nftId
      );

      // Reset form
      setContent('');
      setSelectedNFT(null);
      setGeneratedContent(null);
      setPostType('text');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleAIGenerate = (content: any) => {
    setGeneratedContent(content);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">Create Post</h2>
            <motion.button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Post Type Selector */}
          <div className="p-6 border-b border-white/10">
            <div className="flex space-x-1 bg-white/5 p-1 rounded-xl">
              <motion.button
                onClick={() => setPostType('text')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  postType === 'text'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Type className="h-4 w-4" />
                <span>Text</span>
              </motion.button>
              
              <motion.button
                onClick={() => setPostType('nft')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  postType === 'nft'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Image className="h-4 w-4" />
                <span>Share NFT</span>
              </motion.button>
              
              <motion.button
                onClick={() => setPostType('ai')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  postType === 'ai'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Wand2 className="h-4 w-4" />
                <span>Generate AI</span>
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Text Content */}
            <div className="mb-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  postType === 'text' ? "What's on your mind?" :
                  postType === 'nft' ? "Tell us about your NFT..." :
                  "Describe what you want to generate..."
                }
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">{content.length}/500</span>
              </div>
            </div>

            {/* NFT Selection */}
            {postType === 'nft' && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Select an NFT to share</h3>
                {userNFTs.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                    {userNFTs.map((nft) => (
                      <motion.div
                        key={nft.id}
                        onClick={() => setSelectedNFT(nft)}
                        className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          selectedNFT?.id === nft.id
                            ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                            : 'border-white/10 hover:border-indigo-500/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <img
                          src={nft.image_url}
                          alt={nft.title}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="p-2 bg-white/5">
                          <p className="text-white text-sm font-medium truncate">{nft.title}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white/5 rounded-lg">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">You don't have any NFTs yet</p>
                    <p className="text-gray-500 text-sm">Create some NFTs first to share them</p>
                  </div>
                )}
              </div>
            )}

            {/* AI Generation */}
            {postType === 'ai' && (
              <div className="mb-6">
                <AIGenerator
                  type="image"
                  onGenerate={handleAIGenerate}
                />
                {generatedContent && (
                  <div className="mt-4 p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Generated Content Preview</h4>
                    <img
                      src={generatedContent.url}
                      alt="Generated"
                      className="w-full max-w-xs rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {postType === 'text' && 'Share your thoughts with the community'}
                {postType === 'nft' && 'Showcase your NFT collection'}
                {postType === 'ai' && 'Generate and share AI art'}
              </div>
              
              <div className="flex space-x-3">
                <motion.button
                  onClick={onClose}
                  className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={handlePost}
                  disabled={
                    isPosting || 
                    (!content.trim() && postType === 'text') ||
                    (postType === 'nft' && !selectedNFT) ||
                    (postType === 'ai' && !generatedContent)
                  }
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <span>Post</span>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreatePostModal;