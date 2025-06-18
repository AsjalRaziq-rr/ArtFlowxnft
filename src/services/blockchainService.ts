import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Smart contract ABI for NFT minting
const NFT_CONTRACT_ABI = [
  "function mint(address to, string memory tokenURI) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function approve(address to, uint256 tokenId) public",
  "function setApprovalForAll(address operator, bool approved) public",
  "function transferFrom(address from, address to, uint256 tokenId) public",
  "function balanceOf(address owner) public view returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

// Marketplace contract ABI
const MARKETPLACE_ABI = [
  "function listItem(address nftContract, uint256 tokenId, uint256 price) public",
  "function buyItem(address nftContract, uint256 tokenId) public payable",
  "function cancelListing(address nftContract, uint256 tokenId) public",
  "function getListingPrice(address nftContract, uint256 tokenId) public view returns (uint256)",
  "function isListed(address nftContract, uint256 tokenId) public view returns (bool)"
];

interface MintingOptions {
  title: string;
  description: string;
  price?: string;
  royalty?: number;
  collection?: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  external_url?: string;
  animation_url?: string;
}

class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private nftContract: ethers.Contract | null = null;
  private marketplaceContract: ethers.Contract | null = null;

  // Contract addresses (replace with your deployed contracts)
  private readonly NFT_CONTRACT_ADDRESS = '0x742d35Cc6634C0532925a3b8D1322b3c12c5a34A'; // Example address
  private readonly MARKETPLACE_CONTRACT_ADDRESS = '0x8ba1f109551bD432803012645Hac136c9c1495'; // Example address
  private readonly IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        this.provider = new ethers.BrowserProvider((window as any).ethereum);
        // Don't setup contracts immediately - wait for explicit wallet connection
      } catch (error) {
        console.error('Failed to initialize provider:', error);
      }
    }
  }

  private async setupContracts() {
    if (!this.provider || !this.signer) return;

    try {
      this.nftContract = new ethers.Contract(
        this.NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        this.signer
      );
      this.marketplaceContract = new ethers.Contract(
        this.MARKETPLACE_CONTRACT_ADDRESS,
        MARKETPLACE_ABI,
        this.signer
      );
    } catch (error) {
      console.error('Failed to setup contracts:', error);
    }
  }

  async connectWallet(): Promise<string[]> {
    if (!this.provider) {
      throw new Error('No wallet provider found');
    }

    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      // Only setup signer and contracts after successful wallet connection
      this.signer = await this.provider.getSigner();
      await this.setupContracts();
      
      return accounts;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  async uploadToIPFS(metadata: NFTMetadata): Promise<string> {
    try {
      // In production, use Pinata, IPFS, or another service
      const response = await fetch('/api/upload-to-ipfs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error('Failed to upload to IPFS');
      }

      const { ipfsHash } = await response.json();
      return `${this.IPFS_GATEWAY}${ipfsHash}`;
    } catch (error) {
      console.error('IPFS upload failed:', error);
      // Fallback: create a mock IPFS URL for demo
      const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      return `${this.IPFS_GATEWAY}${mockHash}`;
    }
  }

  async createMetadata(options: MintingOptions): Promise<NFTMetadata> {
    return {
      name: options.title,
      description: options.description,
      image: options.image,
      attributes: options.attributes || [
        {
          trait_type: 'Type',
          value: 'AI Generated',
        },
        {
          trait_type: 'Collection',
          value: options.collection || 'ArtFlow',
        },
        {
          trait_type: 'Creator',
          value: 'ArtFlow Platform',
        },
        {
          trait_type: 'Rarity',
          value: 'Unique',
        },
      ],
      external_url: `${window.location.origin}/nft/`,
    };
  }

  async mintNFT(options: MintingOptions): Promise<{ tokenId: string; transactionHash: string }> {
    // For demo purposes, simulate the minting process
    try {
      toast.loading('Creating metadata...', { id: 'minting' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.loading('Uploading to IPFS...', { id: 'minting' });
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.loading('Minting NFT on blockchain...', { id: 'minting' });
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.loading('Waiting for confirmation...', { id: 'minting' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock transaction data
      const tokenId = Math.floor(Math.random() * 10000).toString();
      const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;

      toast.success('NFT minted successfully!', { id: 'minting' });

      return {
        tokenId,
        transactionHash,
      };
    } catch (error) {
      console.error('Minting failed:', error);
      toast.error('Minting failed. Please try again.', { id: 'minting' });
      throw error;
    }
  }

  async listForSale(tokenId: string, price: string): Promise<string> {
    try {
      toast.loading('Listing NFT for sale...', { id: 'listing' });
      
      // Simulate listing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      
      toast.success('NFT listed for sale!', { id: 'listing' });
      return transactionHash;
    } catch (error) {
      console.error('Listing failed:', error);
      toast.error('Failed to list NFT for sale.', { id: 'listing' });
      throw error;
    }
  }

  async buyNFT(tokenId: string, price: string): Promise<string> {
    try {
      toast.loading('Purchasing NFT...', { id: 'buying' });
      
      // Simulate purchase process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      
      toast.success('NFT purchased successfully!', { id: 'buying' });
      return transactionHash;
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Failed to purchase NFT.', { id: 'buying' });
      throw error;
    }
  }

  async getNFTMetadata(tokenId: string): Promise<NFTMetadata | null> {
    try {
      // Simulate metadata retrieval
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        name: `NFT #${tokenId}`,
        description: 'A unique AI-generated NFT',
        image: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
        attributes: [
          { trait_type: 'Type', value: 'AI Generated' },
          { trait_type: 'Rarity', value: 'Unique' },
        ],
      };
    } catch (error) {
      console.error('Failed to get NFT metadata:', error);
      return null;
    }
  }

  async getNFTOwner(tokenId: string): Promise<string> {
    try {
      // Simulate owner retrieval
      await new Promise(resolve => setTimeout(resolve, 500));
      return '0x742d35Cc6634C0532925a3b8D1322b3c12c5a34A';
    } catch (error) {
      console.error('Failed to get NFT owner:', error);
      throw error;
    }
  }

  async getUserNFTs(address: string): Promise<string[]> {
    try {
      // Simulate user NFTs retrieval
      await new Promise(resolve => setTimeout(resolve, 500));
      return ['1', '2', '3', '4', '5'];
    } catch (error) {
      console.error('Failed to get user NFTs:', error);
      return [];
    }
  }

  isWeb3Available(): boolean {
    return typeof window !== 'undefined' && !!(window as any).ethereum;
  }

  async switchToPolygon(): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }], // Polygon Mainnet
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x89',
                chainName: 'Polygon Mainnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: ['https://polygon-rpc.com/'],
                blockExplorerUrls: ['https://polygonscan.com/'],
              },
            ],
          });
        } catch (addError) {
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  }
}

export const blockchainService = new BlockchainService();
export default BlockchainService;