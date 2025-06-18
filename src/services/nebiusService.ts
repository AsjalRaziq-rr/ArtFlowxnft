// Nebius AI Service for generating NFT content
interface NebiusConfig {
  apiKey: string;
  baseURL: string;
}

interface GenerationRequest {
  prompt: string;
  model: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  negative_prompt?: string;
  seed?: number;
  response_format?: 'url' | 'b64_json';
  response_extension?: 'png' | 'jpg' | 'webp';
}

interface GenerationResponse {
  data: Array<{
    url?: string;
    b64_json?: string;
  }>;
}

class NebiusService {
  private config: NebiusConfig;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_NEBIUS_API_KEY || '',
      baseURL: 'https://api.studio.nebius.com/v1/',
    };
  }

  async generateImage(prompt: string, options: Partial<GenerationRequest> = {}): Promise<string> {
    // For development/demo, return a placeholder if no API key
    if (!this.config.apiKey) {
      console.warn('Nebius API key not configured, using placeholder image');
      // Return a placeholder image URL
      const seed = Math.floor(Math.random() * 1000);
      return `https://picsum.photos/seed/${seed}/1024/1024`;
    }

    const systemStylePrefix = "create nft styled: ";
    const styledPrompt = `${systemStylePrefix}${prompt}`;

    const request: GenerationRequest = {
      model: 'black-forest-labs/flux-dev',
      prompt: styledPrompt,
      width: options.width || 1024,
      height: options.height || 1024,
      num_inference_steps: options.num_inference_steps || 4,
      negative_prompt: options.negative_prompt || '',
      seed: options.seed || -1,
      response_format: 'url',
      response_extension: 'png',
      ...options,
    };

    try {
      const response = await fetch(`${this.config.baseURL}images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Nebius API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: GenerationResponse = await response.json();
      
      if (data.data && data.data.length > 0) {
        const result = data.data[0];
        if (result.url) {
          return result.url;
        } else if (result.b64_json) {
          return `data:image/png;base64,${result.b64_json}`;
        }
      }

      throw new Error('No image data received from Nebius API');
    } catch (error) {
      console.error('Error generating image with Nebius:', error);
      // Fallback to placeholder on error
      const seed = Math.floor(Math.random() * 1000);
      return `https://picsum.photos/seed/${seed}/1024/1024`;
    }
  }

  async generateMusic(prompt: string): Promise<{ title: string; duration: string; url: string }> {
    // Note: This is a placeholder as Nebius might not have music generation
    // In a real implementation, you would use a music generation API
    
    // For demo purposes, return mock data
    return {
      title: `AI Generated: ${prompt.slice(0, 30)}...`,
      duration: '3:24',
      url: 'mock-audio-url',
    };
  }

  async generateText(prompt: string): Promise<string> {
    // Note: This would use a text generation model
    // For demo purposes, return mock data
    
    return `This is AI-generated content based on: "${prompt}". Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`;
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }
}

export const nebiusService = new NebiusService();
export default NebiusService;