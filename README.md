# Test Case Generator

A full-stack application for generating test cases with React frontend and Node.js backend.

## Project Structure

```
testcase-generator/
├─ client/          # React + Vite + SWC + TypeScript frontend
├─ server/          # Node.js + Express backend
└─ README.md        # This file
```

## Tech Stack

### Frontend (client/)

- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **SWC** - Fast TypeScript/JavaScript compiler
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests

### Backend (server/)

- **Node.js** - JavaScript runtime
- **Express 5** - Web framework with **TypeScript**
- **CORS** - Cross-origin resource sharing
- **GitHub API Integration** - Fetch repositories and files
- **Nodemon** - Development auto-restart
- **TypeScript** - Full type safety

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- GitHub Personal Access Token (for GitHub API integration)

### Installation

1. **Clone the repository and navigate to project directory**
2. **Install dependencies for both frontend and backend:**

```bash
# Install frontend dependencies
cd client
pnpm install

# Install backend dependencies
cd ../server
pnpm install
```

3. **Setup GitHub API Integration (Optional):**

```bash
# In the server directory, copy the example environment file
cd server
cp env.example .env

# Edit .env and add your GitHub Personal Access Token:
# GITHUB_TOKEN=ghp_your_actual_token_here
```

**To get a GitHub Personal Access Token:**

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with scopes: `repo`, `read:user`
3. Copy the token and add it to your `.env` file

### Development Scripts

#### Option 1: Run services separately

**Frontend (Port 5173):**

```bash
cd client
pnpm dev
```

**Backend (Port 4000):**

```bash
cd server
pnpm dev
```

#### Option 2: Run both services in separate terminals

**Terminal 1 - Frontend:**

```bash
cd client
pnpm dev
```

**Terminal 2 - Backend:**

```bash
cd server
pnpm dev:watch
```

This will start:

- Frontend at: http://localhost:5173
- Backend at: http://localhost:4000
- API Health Check: http://localhost:4000/api/health

### API Endpoints

#### Core Endpoints

- `GET /` - Welcome message with GitHub integration status
- `GET /api/health` - Health check endpoint with GitHub integration status
- `POST /api/generate-testcases` - Generate test cases (placeholder implementation)

#### GitHub Integration Endpoints

- `GET /api/repos` - List all repositories for authenticated user
- `GET /api/repos/:owner/:repo/files` - List all code files in a repository recursively

**Note**: GitHub endpoints require `GITHUB_TOKEN` environment variable to be configured.

### Project Features

- ⚡ **Fast Development**: Vite with SWC for instant HMR
- 🎨 **Modern Styling**: Tailwind CSS v4 with Vite plugin
- 🔒 **Type Safety**: Full TypeScript support (Frontend + Backend)
- 🌐 **API Ready**: Express server with CORS and GitHub API integration
- 📂 **GitHub Integration**: Fetch repositories and code files via REST API
- 🔄 **Auto Reload**: Nodemon for backend, Vite HMR for frontend
- 📱 **Responsive**: Ready for mobile and desktop

## Development

### Frontend Development

- Components are in `client/src/components/`
- Pages/routes in `client/src/pages/`
- Styles using Tailwind CSS utility classes
- API calls using Axios

### Backend Development

- **TypeScript** source files in `server/src/`
- Main server: `server/src/index.ts`
- GitHub API service: `server/src/githubService.ts`
- Type definitions: `server/src/types.ts`
- CORS configured for frontend origin (localhost:5173)
- JSON parsing middleware included
- Error handling middleware setup
- Environment variables via `.env` file

## Scripts Reference

### Client (Frontend)

- `pnpm dev` - Start Vite dev server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

### Server (Backend)

- `pnpm dev` - Start TypeScript server directly with ts-node
- `pnpm dev:watch` - Start with nodemon for auto-restart (TypeScript)
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm start` - Start compiled production server
- `pnpm type-check` - Run TypeScript type checking

## Next Steps

1. Implement test case generation logic in backend
2. Create React components for test case input/output
3. Add routing with React Router DOM
4. Style components with Tailwind CSS
5. Connect frontend to backend APIs
6. Add error handling and validation
7. Deploy to production

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
