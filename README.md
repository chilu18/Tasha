# HeySalad ® Tasha: Food Waste Reduction Platform

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![Polkadot](https://img.shields.io/badge/Polkadot-Asset%20Hub-e6007a)](https://polkadot.network/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/Coverage-80%25-brightgreen)](https://vitest.dev/)

## 🥗 Project Overview

HeySalad Tasha is a revolutionary blockchain-powered dApp that combines AI voice assistance with Polkadot blockchain technology to incentivize and track food waste reduction. Users can interact with Tasha, an AI voice assistant, to log their food waste reduction efforts, earn Food Waste Tokens (FWT), and contribute to environmental sustainability.

**🎯 Polkadot Fast Grant Milestone 1 Deliverable - $5,000 USD**

This project represents a complete MVP implementation featuring voice-controlled blockchain interactions, Monzo banking integration, and comprehensive testing suite.

## 🌟 Core Features

### 🎤 Tasha Voice Assistant (Deliverable 1)
- **Natural Language Processing**: Speak naturally - "Hey Tasha, log my food waste"
- **ElevenLabs Integration**: High-quality text-to-speech responses
- **Voice Commands**: Log waste, check balance, view stats, get help
- **Real-time Feedback**: Instant voice confirmations for blockchain transactions

### 🏦 Monzo Integration (Deliverable 3)
- **Transaction Analysis**: Automatic food purchase categorization
- **Receipt Parsing**: Extract food items and estimate potential waste
- **Smart Categorization**: AI-powered food transaction identification
- **Waste Estimation**: Predictive algorithms for food waste potential

### 🔗 Polkadot Blockchain Integration
- **Asset Hub Westend**: Testnet deployment for development
- **Smart Contract**: Food Waste Token (FWT) reward system
- **Wallet Connection**: Polkadot.js extension integration
- **Transaction History**: Complete on-chain activity tracking

### 📱 Web dApp Interface (Deliverable 4)
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Real-time Dashboard**: Live stats, charts, and environmental impact
- **Voice-First UI**: Conversational interface design
- **Progressive Web App**: Offline capabilities and mobile installation

## 🏗️ Technical Architecture

### Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript 5.3
- **Blockchain**: Polkadot Asset Hub, @polkadot/api
- **Voice AI**: ElevenLabs API, Web Speech API
- **Banking**: Monzo API integration
- **Styling**: Tailwind CSS, Lucide React icons
- **Charts**: Recharts for data visualization
- **Testing**: Vitest, Testing Library, 80%+ coverage

### Project Structure
```
src/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Main application page
│   └── globals.css              # Global styles and animations
│
├── components/                   # React components
│   ├── VoiceInterface.tsx       # 🎤 Voice assistant UI
│   ├── WalletConnection.tsx     # 🔗 Polkadot wallet integration
│   ├── Dashboard.tsx            # 📊 Stats and analytics
│   ├── WasteLogger.tsx          # ➕ Waste logging form
│   └── TransactionHistory.tsx   # 📋 Transaction history
│
├── services/                     # Business logic services
│   ├── elevenLabsService.ts     # 🗣️ Voice AI integration
│   ├── monzoService.ts          # 🏦 Banking API integration
│   └── polkadotService.ts       # ⛓️ Blockchain interactions
│
├── types/                        # TypeScript definitions
│   └── index.ts                 # Core type definitions
│
└── test/                         # Comprehensive test suite
    ├── components/              # Component tests
    ├── services/                # Service tests
    ├── integration/             # Integration tests
    └── setup.ts                 # Test configuration
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **Polkadot.js Extension** ([Install here](https://polkadot.js.org/extension/))
- **API Keys** (ElevenLabs, Monzo - optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hey-Salad/Tasha.git
   cd Tasha
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   # ElevenLabs API (optional - uses mock data if not provided)
   NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key

   # Monzo API (optional - uses mock data if not provided)
   NEXT_PUBLIC_MONZO_ACCESS_TOKEN=your_monzo_access_token

   # Blockchain Configuration (pre-configured for Westend)
   NEXT_PUBLIC_WS_ENDPOINT=wss://westend-asset-hub-rpc.polkadot.io
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Wallet Connection Tutorial

1. **Install Polkadot.js Extension**
   - Visit [polkadot.js.org/extension](https://polkadot.js.org/extension/)
   - Install the browser extension
   - Create or import an account

2. **Connect to Asset Hub Westend**
   - The dApp automatically connects to Westend testnet
   - Click "Connect Wallet" in the application
   - Authorize the connection in the extension popup
   - Select your account from the list

3. **Get Testnet Tokens** (Optional)
   - Visit [Westend Faucet](https://faucet.polkadot.io/)
   - Request testnet DOT tokens for transaction fees

## 🎤 Voice Assistant Usage

### Voice Commands
Tasha understands natural language. Try these commands:

- **"Hey Tasha, log my food waste"** - Opens waste logging interface
- **"I saved 200 grams of food today"** - Logs specific amount
- **"I donated food to the food bank"** - Logs donation activity
- **"Check my balance"** - Shows current FWT token balance
- **"What are my stats?"** - Displays environmental impact
- **"Help"** - Shows available commands

### Voice Features
- **Speech Recognition**: Uses Web Speech API for voice input
- **Natural Responses**: ElevenLabs generates contextual audio responses
- **Multi-language**: Supports English with plans for expansion
- **Offline Fallback**: Text-based interface when voice unavailable

## 🏦 Monzo Integration

### Banking Features
- **Transaction Fetching**: Retrieves recent food-related purchases
- **Smart Categorization**: AI identifies food transactions
- **Receipt Analysis**: Parses receipt text to extract items
- **Waste Estimation**: Predicts potential food waste from purchases

### Supported Categories
- Groceries (Tesco, Sainsbury's, ASDA, etc.)
- Restaurants and takeaways
- Food delivery services (Deliveroo, Uber Eats)
- Local food vendors and markets

### Mock Data
For development without Monzo API access, the service provides realistic mock data including:
- Sample grocery transactions
- Food delivery orders
- Restaurant purchases
- Estimated waste calculations

## 🧪 Testing Suite (Deliverable 0c)

### Test Coverage
- **Unit Tests**: Individual component and service testing
- **Integration Tests**: Full user flow testing
- **Coverage Target**: 80%+ code coverage maintained
- **Continuous Testing**: Automated test runs on changes

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Test Categories

1. **Service Tests**
   - Monzo API integration
   - ElevenLabs voice service
   - Polkadot blockchain interactions

2. **Component Tests**
   - Voice interface functionality
   - Wallet connection flow
   - Waste logging form validation

3. **Integration Tests**
   - Complete waste logging workflow
   - Voice command processing
   - Error handling scenarios

### Testing Guide

#### Local Test Setup
1. **Install dependencies**: `npm install`
2. **Run test suite**: `npm test`
3. **View coverage**: `npm run test:coverage`
4. **Open coverage report**: `open coverage/index.html`

#### Mock Services
Tests use comprehensive mocks for:
- Web Speech API
- ElevenLabs API
- Monzo API
- Polkadot blockchain
- Browser APIs (MediaRecorder, etc.)

## 📊 Environmental Impact Tracking

### Metrics Calculated
- **Food Waste Reduced**: Measured in grams/kilograms
- **CO2 Emissions Prevented**: 2.5kg CO2 per kg of food waste
- **Token Rewards**: 10 FWT per kg of waste reduced
- **Streak Tracking**: Consecutive days of waste reduction

### Impact Visualization
- **Real-time Charts**: Weekly progress tracking
- **Comparative Analytics**: Personal vs. community impact
- **Goal Setting**: Customizable reduction targets
- **Achievement System**: Milestone rewards and badges

## 🔐 Security & Privacy

### Blockchain Security
- **Non-custodial**: Users maintain full control of their wallets
- **Transparent**: All transactions recorded on-chain
- **Immutable**: Waste reduction records cannot be altered
- **Decentralized**: No single point of failure

### Data Privacy
- **Local Storage**: Sensitive data stored locally
- **Encrypted Communication**: HTTPS/WSS for all API calls
- **Minimal Data**: Only necessary information collected
- **User Control**: Complete data ownership and portability

## 🌍 Environmental Impact

### Global Goals
HeySalad Tasha contributes to:
- **UN SDG 12**: Responsible Consumption and Production
- **UN SDG 13**: Climate Action
- **Food Waste Reduction**: 1/3 of food is wasted globally
- **Carbon Footprint**: Food waste accounts for 8% of global emissions

### Real-world Impact
- **1kg food waste prevented** = **2.5kg CO2 saved**
- **Community multiplier**: Shared achievements inspire others
- **Business integration**: B2B solutions for restaurants and retailers
- **Educational value**: Awareness through gamification

## 🚀 Long Term Roadmap

### 📍 Phase 1: Foundation (Q2-Q3 2025)
- **Platform Launch**: Complete MVP on Polkadot mainnet
- **User Acquisition**: 5,000 active users
- **Business Partnerships**: 3-5 food service pilot programs
- **Technology Refinement**: 95%+ AI verification accuracy

### 📍 Phase 2: Expansion (Q4 2025 - Q2 2026)
- **Mobile Applications**: Native iOS and Android apps
- **B2B Solutions**: Restaurant and grocery chain integrations
- **Community Features**: Challenges, leaderboards, social sharing
- **Token Utility**: Staking, governance, brand partnerships

### 📍 Phase 3: Ecosystem (Q3 2026 - Q1 2027)
- **Advanced AI**: Computer vision for automated verification
- **Supply Chain**: Traceability and supplier certification
- **Marketplace**: P2P surplus food exchange
- **Education**: Sustainability learning platform

### 📍 Phase 4: Global Scale (Q2 2027+)
- **International Expansion**: 10+ languages and regions
- **Cross-chain Integration**: Multi-blockchain support
- **Enterprise Solutions**: Corporate sustainability programs
- **Regulatory Integration**: Government certification standards

## 📄 License (Deliverable 0a)

MIT License

Copyright (c) 2024 HeySalad Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🤝 Contributing

We welcome contributions from the community! Please see our contributing guidelines:

### Development Process
1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/AmazingFeature`
3. **Write tests**: Ensure 80%+ coverage for new code
4. **Commit changes**: `git commit -m 'Add AmazingFeature'`
5. **Push to branch**: `git push origin feature/AmazingFeature`
6. **Open Pull Request**: Describe changes and link issues

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Consistent code formatting
- **Testing**: Unit and integration tests required
- **Documentation**: JSDoc comments for all functions

## 📞 Contact & Support

### Team
- **Peter** - Lead Developer
- **Email**: peter@heysalad.io
- **Project**: [GitHub Repository](https://github.com/Hey-Salad/Tasha)

### Community
- **Discord**: [Join our community](https://discord.gg/heysalad)
- **Twitter**: [@HeySaladIO](https://twitter.com/HeySaladIO)
- **Medium**: [Technical articles](https://medium.com/@heysalad)

### Support
- **Documentation**: This README and inline code comments
- **Issues**: [GitHub Issues](https://github.com/Hey-Salad/Tasha/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Hey-Salad/Tasha/discussions)

## 🙏 Acknowledgements

### Technology Partners
- **Polkadot**: Blockchain infrastructure and grants
- **ElevenLabs**: Voice AI technology
- **Monzo**: Banking API integration
- **Vercel**: Deployment and hosting

### Open Source
- **Next.js**: React framework
- **Polkadot.js**: Blockchain integration
- **Tailwind CSS**: Styling framework
- **Vitest**: Testing framework

### Community
- **Polkadot Hackathon**: Initial development support
- **Web3 Foundation**: Technical guidance
- **Sustainability Community**: Environmental impact validation
- **Open Source Contributors**: Code reviews and improvements

---

**Built with ❤️ for a sustainable future 🌱**

*HeySalad Tasha - Where voice meets blockchain for environmental impact*