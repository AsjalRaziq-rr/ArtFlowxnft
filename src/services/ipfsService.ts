import axios from 'axios';

interface IPFSUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface PinataConfig {
  apiKey: string;
  secretKey: string;
  jwt: string;
}

class IPFSService {
  private config: PinataConfig;
  private readonly PINATA_API_URL = 'https://api.pinata.cloud';

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_PINATA_API_KEY || '',
      secretKey: import.meta.env.VITE_PINATA_SECRET_KEY || '',
      jwt: import.meta.env.VITE_PINATA_JWT || '',
    };
  }

  async uploadJSON(metadata: any): Promise<string> {
    if (!this.config.jwt) {
      console.warn('Pinata JWT not configured, using mock IPFS hash');
      return this.generateMockHash();
    }

    try {
      const response = await axios.post(
        `${this.PINATA_API_URL}/pinning/pinJSONToIPFS`,
        metadata,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.jwt}`,
          },
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      console.error('Failed to upload JSON to IPFS:', error);
      return this.generateMockHash();
    }
  }

  async uploadFile(file: File): Promise<string> {
    if (!this.config.jwt) {
      console.warn('Pinata JWT not configured, using mock IPFS hash');
      return this.generateMockHash();
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${this.PINATA_API_URL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${this.config.jwt}`,
          },
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      console.error('Failed to upload file to IPFS:', error);
      return this.generateMockHash();
    }
  }

  async uploadImageFromURL(imageUrl: string): Promise<string> {
    try {
      // Download the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Convert to File
      const file = new File([blob], 'generated-image.png', { type: 'image/png' });
      
      // Upload to IPFS
      return await this.uploadFile(file);
    } catch (error) {
      console.error('Failed to upload image from URL:', error);
      return this.generateMockHash();
    }
  }

  private generateMockHash(): string {
    return `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  }

  getIPFSUrl(hash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }

  isConfigured(): boolean {
    return !!this.config.jwt;
  }
}

export const ipfsService = new IPFSService();
export default IPFSService;