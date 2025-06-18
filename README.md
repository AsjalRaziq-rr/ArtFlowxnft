# ArtFlow - AI-Powered NFT Social Platform

A modern, full-featured NFT social platform with AI content generation, built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **AI Content Generation**: Create images, music, and text using AI
- **NFT Marketplace**: Buy, sell, and trade NFTs
- **Social Feed**: Share posts and interact with the community
- **Wallet Integration**: Connect with MetaMask and other Web3 wallets
- **Dark/Light Theme**: Toggle between themes with smooth transitions
- **GameFi Hub**: Upload and play blockchain games
- **Real-time Database**: Powered by Supabase with real-time updates

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Blockchain**: Ethers.js, Web3 integration
- **AI Services**: Nebius AI for content generation
- **Storage**: IPFS via Pinata
- **Deployment**: Netlify

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd artflow-nft-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
   - Add your Supabase project URL and anon key
   - (Optional) Add AI service API keys
   - (Optional) Add IPFS/Pinata credentials

5. Start the development server:
```bash
npm run dev
```

## 🌐 Deployment to Netlify

### Option 1: Deploy from Git Repository

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Netlify
3. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

### Option 2: Manual Deploy

1. Build the project:
```bash
npm run build
```

2. Drag and drop the `dist` folder to Netlify

### Environment Variables for Netlify

Add these environment variables in your Netlify dashboard:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_NEBIUS_API_KEY=your_nebius_api_key (optional)
VITE_PINATA_JWT=your_pinata_jwt_token (optional)
```

## 🗄️ Database Setup

1. Create a new Supabase project
2. Run the migration files in `supabase/migrations/` in order
3. Set up Row Level Security (RLS) policies as defined in the migrations
4. Update your environment variables with the Supabase credentials

## 🎨 Features Overview

### AI Content Generation
- Generate images using Nebius AI
- Create text content with AI assistance
- Music generation capabilities
- Download and share generated content

### NFT Marketplace
- Browse and discover NFTs
- Buy and sell with cryptocurrency
- Advanced filtering and search
- Collection management

### Social Features
- Create posts with text or NFTs
- Like, comment, and share
- Follow other users
- Real-time feed updates

### Wallet Integration
- MetaMask support
- Multi-chain compatibility
- Secure transaction handling
- Balance tracking

### Theme System
- Dark and light themes
- Smooth transitions
- System preference detection
- Persistent theme selection

## 🔧 Configuration

### Supabase Setup
1. Create tables using the provided migration files
2. Enable Row Level Security
3. Set up authentication policies
4. Configure storage buckets for NFT images

### Blockchain Configuration
- Default network: Polygon
- Supports MetaMask and other Web3 wallets
- Smart contract integration ready

## 📱 Mobile Responsive

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 Performance

- Optimized bundle size
- Lazy loading for components
- Image optimization
- CDN-ready static assets
- Progressive Web App features

## 🔒 Security

- Row Level Security (RLS) in Supabase
- Secure environment variable handling
- XSS protection
- CSRF protection
- Content Security Policy headers

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.

---

Built with ❤️ using modern web technologies