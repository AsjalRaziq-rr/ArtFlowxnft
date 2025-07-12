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

  // Contract addresses for Polygon Mumbai testnet (replace with your deployed contracts)
  private readonly NFT_CONTRACT_ADDRESS = '0xd2a5bC10698FD955D1Fe6cb468a17809A08fd005';
  private readonly MARKETPLACE_CONTRACT_ADDRESS = '0xe2899bddFD890e320e643044c6b95B9B0b84157A';
  private readonly IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

  // Polygon Mumbai testnet configuration
  private readonly POLYGON_MUMBAI = {
    chainId: '0x13881', // 80001 in hex
    chainName: 'Polygon Mumbai Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.ankr.com/polygon_mumbai'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  };

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        this.provider = new ethers.BrowserProvider((window as any).ethereum);
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
      throw error;
    }
  }

  async connectWallet(): Promise<string[]> {
    if (!this.provider) {
      throw new Error('No wallet provider found');
    }

    try {
      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      // Initialize signer and contracts
      await this.initializeSignerAndContracts();
      
      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (network.chainId !== 80001n) { // Mumbai testnet
        await this.switchToPolygonMumbai();
      }
      
      return accounts;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async initializeSignerAndContracts(): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      // Setup signer and contracts
      this.signer = await this.provider.getSigner();
      await this.setupContracts();
    } catch (error) {
      console.error('Failed to initialize signer and contracts:', error);
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
      // Use Pinata or another IPFS service
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error('Failed to upload to IPFS');
      }

      const { IpfsHash } = await response.json();
      return `${this.IPFS_GATEWAY}${IpfsHash}`;
    } catch (error) {
      console.error('IPFS upload failed:', error);
      // Fallback: create a data URL for demo
      const dataUrl = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
      return dataUrl;
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
    if (!this.signer || !this.nftContract) {
      throw new Error('Wallet not connected or contracts not initialized');
    }

    try {
      toast.loading('Creating metadata...', { id: 'minting' });
      
      // Create metadata
      const metadata = await this.createMetadata(options);
      
      toast.loading('Uploading to IPFS...', { id: 'minting' });
      
      // Upload metadata to IPFS
      const tokenURI = await this.uploadToIPFS(metadata);
      
      toast.loading('Minting NFT on blockchain...', { id: 'minting' });
      
      // Get the user's address
      const userAddress = await this.signer.getAddress();
      
      // Estimate gas for the transaction
      const gasEstimate = await this.nftContract.mint.estimateGas(userAddress, tokenURI);
      
      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate * 120n / 100n;
      
      // Mint the NFT
      const transaction = await this.nftContract.mint(userAddress, tokenURI, {
        gasLimit: gasLimit,
      });
      
      toast.loading('Waiting for confirmation...', { id: 'minting' });
      
      // Wait for transaction to be mined
      const receipt = await transaction.wait();
      
      if (!receipt) {
        throw new Error('Transaction failed');
      }
      
      // Extract token ID from the Transfer event
      let tokenId = '0';
      if (receipt.logs && receipt.logs.length > 0) {
        try {
          const transferEvent = receipt.logs.find((log: any) => 
            log.topics[0] === ethers.id('Transfer(address,address,uint256)')
          );
          if (transferEvent && transferEvent.topics[3]) {
            tokenId = ethers.toBigInt(transferEvent.topics[3]).toString();
          }
        } catch (error) {
          console.warn('Could not extract token ID from event:', error);
          // Fallback: get total supply to estimate token ID
          try {
            const totalSupply = await this.nftContract.totalSupply();
            tokenId = totalSupply.toString();
          } catch (e) {
            console.warn('Could not get total supply:', e);
          }
        }
      }

      toast.success('NFT minted successfully!', { id: 'minting' });

      return {
        tokenId,
        transactionHash: receipt.hash,
      };
    } catch (error: any) {
      console.error('Minting failed:', error);
      
      let errorMessage = 'Minting failed. Please try again.';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected by user.';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds for gas fees.';
      } else if (error.message?.includes('gas')) {
        errorMessage = 'Transaction failed due to gas issues. Please try again.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast.error(errorMessage, { id: 'minting' });
      throw error;
    }
  }

  async listForSale(tokenId: string, price: string): Promise<string> {
    if (!this.signer || !this.nftContract || !this.marketplaceContract) {
      throw new Error('Wallet not connected or contracts not initialized');
    }

    try {
      toast.loading('Approving NFT for marketplace...', { id: 'listing' });
      
      // First approve the marketplace to transfer the NFT
      const approveTransaction = await this.nftContract.approve(
        this.MARKETPLACE_CONTRACT_ADDRESS,
        tokenId
      );
      await approveTransaction.wait();
      
      toast.loading('Listing NFT for sale...', { id: 'listing' });
      
      // Convert price to wei
      const priceInWei = ethers.parseEther(price);
      
      // List the NFT on the marketplace
      const listTransaction = await this.marketplaceContract.listItem(
        this.NFT_CONTRACT_ADDRESS,
        tokenId,
        priceInWei
      );
      
      const receipt = await listTransaction.wait();
      
      if (!receipt) {
        throw new Error('Listing transaction failed');
      }
      
      toast.success('NFT listed for sale!', { id: 'listing' });
      return receipt.hash;
    } catch (error: any) {
      console.error('Listing failed:', error);
      
      let errorMessage = 'Failed to list NFT for sale.';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected by user.';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds for gas fees.';
      }
      
      toast.error(errorMessage, { id: 'listing' });
      throw error;
    }
  }

  async buyNFT(tokenId: string, price: string): Promise<string> {
    if (!this.signer || !this.marketplaceContract) {
      throw new Error('Wallet not connected or contracts not initialized');
    }

    try {
      toast.loading('Purchasing NFT...', { id: 'buying' });
      
      // Convert price to wei
      const priceInWei = ethers.parseEther(price);
      
      // Buy the NFT
      const transaction = await this.marketplaceContract.buyItem(
        this.NFT_CONTRACT_ADDRESS,
        tokenId,
        { value: priceInWei }
      );
      
      const receipt = await transaction.wait();
      
      if (!receipt) {
        throw new Error('Purchase transaction failed');
      }
      
      toast.success('NFT purchased successfully!', { id: 'buying' });
      return receipt.hash;
    } catch (error: any) {
      console.error('Purchase failed:', error);
      
      let errorMessage = 'Failed to purchase NFT.';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected by user.';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds to purchase NFT.';
      }
      
      toast.error(errorMessage, { id: 'buying' });
      throw error;
    }
  }

  async getNFTMetadata(tokenId: string): Promise<NFTMetadata | null> {
    if (!this.nftContract) {
      return null;
    }

    try {
      const tokenURI = await this.nftContract.tokenURI(tokenId);
      
      if (tokenURI.startsWith('data:')) {
        // Handle data URLs
        const base64Data = tokenURI.split(',')[1];
        const jsonString = atob(base64Data);
        return JSON.parse(jsonString);
      } else {
        // Handle IPFS URLs
        const response = await fetch(tokenURI);
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get NFT metadata:', error);
      return null;
    }
  }

  async getNFTOwner(tokenId: string): Promise<string> {
    if (!this.nftContract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.nftContract.ownerOf(tokenId);
    } catch (error) {
      console.error('Failed to get NFT owner:', error);
      throw error;
    }
  }

  async getUserNFTs(address: string): Promise<string[]> {
    if (!this.nftContract) {
      return [];
    }

    try {
      const balance = await this.nftContract.balanceOf(address);
      const tokenIds: string[] = [];
      
      // This is a simplified approach - in production, you'd use events or indexing
      const totalSupply = await this.nftContract.totalSupply();
      
      for (let i = 1; i <= Number(totalSupply); i++) {
        try {
          const owner = await this.nftContract.ownerOf(i);
          if (owner.toLowerCase() === address.toLowerCase()) {
            tokenIds.push(i.toString());
          }
        } catch (error) {
          // Token might not exist or be burned
          continue;
        }
      }
      
      return tokenIds;
    } catch (error) {
      console.error('Failed to get user NFTs:', error);
      return [];
    }
  }

  isWeb3Available(): boolean {
    return typeof window !== 'undefined' && !!(window as any).ethereum;
  }

  async switchToPolygonMumbai(): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.POLYGON_MUMBAI.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [this.POLYGON_MUMBAI],
          });
        } catch (addError) {
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
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
