# DigiPay Frontend

Modern React frontend for DigiPay payment API platform.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Features

- 🎨 Modern landing page with animations
- 🔐 Authentication (Login/Register)
- 📊 Real-time dashboard
- 💳 Transaction management
- 🔑 API key generation
- 💰 Settlement requests
- 🔌 Live updates via Socket.IO

## Tech Stack

- React 18
- Vite
- TailwindCSS
- React Router
- Axios
- Socket.IO Client
- Lucide Icons
- Recharts

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/          # Page components
├── services/       # API and Socket services
├── hooks/          # Custom React hooks
├── context/        # React context providers
└── utils/          # Utility functions
```

## Development

The app runs on `http://localhost:3000` and proxies API requests to `http://localhost:5000`.
