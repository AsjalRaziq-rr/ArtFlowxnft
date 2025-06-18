import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { nebiusService } from '../services/nebiusService';

interface AIGeneratorProps {
  type: 'image' | 'music' | 'text';
  onGenerate: (content: any) => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ type, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const placeholders = {
    image: 'A majestic dragon soaring through colorful nebulae in space...',
    music: 'Uplifting electronic ambient music with nature sounds...',
    text: 'A short story about a robot discovering emotions...',
  };

  const examples = {
    image: [
      'Cyberpunk cityscape with neon lights',
      'Mystical forest with glowing mushrooms',
      'Abstract geometric patterns in vibrant colors',
      'Steampunk airship floating in clouds',
    ],
    music: [
      'Relaxing piano melody with rain sounds',
      'Epic orchestral battle theme',
      'Lo-fi hip hop with jazzy undertones',
      'Ethereal ambient soundscape',
    ],
    text: [
      'A haiku about the digital age',
      'Short story about time travel',
      'Poem about artificial intelligence',
      'Flash fiction about virtual reality',
    ],
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    
    try {
      let generatedContent;

      if (type === 'image') {
        const imageUrl = await nebiusService.generateImage(prompt);
        generatedContent = {
          url: imageUrl,
          prompt,
          timestamp: Date.now(),
        };
      } else if (type === 'music') {
        const musicData = await nebiusService.generateMusic(prompt);
        generatedContent = {
          ...musicData,
          prompt,
          timestamp: Date.now(),
        };
      } else {
        const textContent = await nebiusService.generateText(prompt);
        generatedContent = {
          content: textContent,
          prompt,
          timestamp: Date.now(),
        };
      }

      setHistory(prev => [generatedContent, ...prev.slice(0, 9)]);
      onGenerate(generatedContent);
    } catch (error) {
      console.error('Generation failed:', error);
      setError(error instanceof Error ? error.message : 'Generation failed');
    }
    
    setIsGenerating(false);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
          <Wand2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white capitalize">
            AI {type} Generator
          </h2>
          <p className="text-gray-400 text-sm">
            {nebiusService.isConfigured() ? 'Powered by Nebius AI' : 'Demo Mode - Add API key for full functionality'}
          </p>
        </div>
      </div>

      {/* API Key Warning */}
      {!nebiusService.isConfigured() && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <p className="text-yellow-400 text-sm">
              Add your Nebius API key to environment variables for real AI generation. Currently using placeholder images.
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Prompt Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Describe what you want to create
        </label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholders[type]}
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
            {prompt.length}/500
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-300 mb-3">Quick examples:</p>
        <div className="flex flex-wrap gap-2">
          {examples[type].map((example, index) => (
            <motion.button
              key={index}
              onClick={() => setPrompt(example)}
              className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300 hover:text-white hover:border-indigo-500/50 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {example}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <motion.button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Wand2 className="h-5 w-5" />
            <span>Generate {type}</span>
          </>
        )}
      </motion.button>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-300">Recent Generations</h3>
            <motion.button
              onClick={() => setHistory([])}
              className="text-xs text-gray-400 hover:text-white transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
            >
              <RefreshCw className="h-4 w-4" />
            </motion.button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {history.map((item, index) => (
              <motion.div
                key={index}
                onClick={() => onGenerate(item)}
                className="p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:border-indigo-500/50 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="text-sm text-white truncate">
                  {item.prompt || item.title || item.content?.slice(0, 50)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIGenerator;