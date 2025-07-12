import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { blockchainService } from '../services/blockchainService';
import { ipfsService } from '../services/ipfsService';
import toast from 'react-hot-toast';

interface MintingModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: any;
  type: 'image' | 'music' | 'text';
}

const MintingModal: React.FC<MintingModalProps> = ({ isOpen, onClose, content, type }) => {
  const { isConnected } = useWallet();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    royalty: '10',
    collection: 'ai-generated',
  });
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<{ tokenId: string; transactionHash: string } | null>(null);

  const handleMint = async () => {
    // Check if wallet is connected first
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title for your NFT');
      return;
    }

    if (!blockchainService.isWeb3Available()) {
      toast.error('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsMinting(true);
    setStep(2);
    
    try {
      // Mint the NFT
      const result = await blockchainService.mintNFT({
        title: formData.title,
        description: formData.description,
        price: formData.price,
        royalty: parseInt(formData.royalty),
        collection: formData.collection,
        image: content.url,
        attributes: [
          {
            trait_type: 'Type',
            value: type.charAt(0).toUpperCase() + type.slice(1),
          },
          {
            trait_type: 'AI Generated',
            value: 'Yes',
          },
          {
            trait_type: 'Original Prompt',
            value: content.prompt || 'N/A',
          },
          {
            trait_type: 'Generated At',
            value: new Date().toISOString(),
          },
        ],
      });

      setMintResult(result);
      setStep(3);

      // If price is set, list for sale
      if (formData.price && parseFloat(formData.price) > 0) {
        toast.loading('Listing NFT for sale...', { id: 'listing' });
        await blockchainService.listForSale(result.tokenId, formData.price);
        toast.success('NFT listed for sale!', { id: 'listing' });
      }

    } catch (error) {
      console.error('Minting failed:', error);
      setStep(1);
      setIsMinting(false);
      
      // Don't show additional error toast if blockchain service already showed one
      if (!(error as any)?.code) {
        toast.error('Minting failed. Please try again.');
      }
    }
  };

  const resetModal = () => {
    setStep(1);
    setIsMinting(false);
    setMintResult(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      royalty: '10',
      collection: 'ai-generated',
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const viewOnBlockchain = () => {
    if (mintResult) {
      // Open blockchain explorer (Mumbai testnet for development)
      window.open(`https://mumbai.polygonscan.com/tx/${mintResult.transactionHash}`, '_blank');
    }
  };

  if (!isOpen || !content) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">
              {step === 1 ? 'Mint NFT' : step === 2 ? 'Minting...' : 'Success!'}
            </h2>
            <motion.button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                {/* Preview */}
                <div className="flex space-x-6">
                  <div className="flex-shrink-0">
                    {type === 'image' && (
                      <img
                        src={content.url}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    {type === 'music' && (
                      <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                    )}
                    {type === 'text' && (
                      <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm mb-2">Original Prompt:</p>
                    <p className="text-white">{content.prompt}</p>
                  </div>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      NFT Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="My AI Creation"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0.1"
                    />
                    <p className="text-xs text-gray-400 mt-1">Leave empty to mint without listing</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Describe your NFT..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Royalty (%)
                    </label>
                    <select
                      value={formData.royalty}
                      onChange={(e) => setFormData({ ...formData, royalty: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="5">5%</option>
                      <option value="10">10%</option>
                      <option value="15">15%</option>
                      <option value="20">20%</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Collection
                    </label>
                    <select
                      value={formData.collection}
                      onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ai-generated">AI Generated</option>
                      <option value="my-collection">My Collection</option>
                      <option value="create-new">Create New Collection</option>
                    </select>
                  </div>
                </div>

                {/* Blockchain Info */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                    <p className="text-blue-400 font-medium">Blockchain Information</p>
                  </div>
                  <p className="text-blue-100 text-sm">
                    Your NFT will be minted on the Polygon network. Make sure you have enough MATIC for gas fees.
                  </p>
                </div>

                {/* Mint Button */}
                <motion.button
                  onClick={handleMint}
                  disabled={!formData.title || isMinting || !isConnected}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {!isConnected ? 'Connect Wallet First' : 'Mint NFT'}
                </motion.button>
              </div>
            )}

            {step === 2 && (
              <div className="text-center py-8">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">Minting Your NFT</h3>
                <p className="text-gray-400 mb-6">
                  Please wait while we upload your content to IPFS and mint your NFT on the blockchain...
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Content uploaded to IPFS</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Minting on blockchain...</span>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-8">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">NFT Minted Successfully!</h3>
                <p className="text-gray-400 mb-6">
                  Your NFT has been successfully minted and is now available on the blockchain.
                </p>
                
                {mintResult && (
                  <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Token ID:</span>
                        <span className="text-white font-mono">{mintResult.tokenId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Transaction:</span>
                        <button
                          onClick={viewOnBlockchain}
                          className="text-indigo-400 hover:text-indigo-300 font-mono text-sm flex items-center space-x-1"
                        >
                          <span>{mintResult.transactionHash.slice(0, 10)}...</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-4 justify-center">
                  <motion.button
                    onClick={handleClose}
                    className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                  <motion.button
                    onClick={() => window.open(`/nft/${mintResult?.tokenId}`, '_blank')}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View NFT
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MintingModal;
