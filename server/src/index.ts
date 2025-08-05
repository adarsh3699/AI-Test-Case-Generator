import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GitHubService } from "./githubService";
import { RepoResponse, FileTreeResponse, ErrorResponse } from "./types";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev server default port
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize GitHub service
let githubService: GitHubService | null = null;

if (process.env.GITHUB_TOKEN) {
  githubService = new GitHubService(process.env.GITHUB_TOKEN);
  console.log("✅ GitHub API integration enabled");
} else {
  console.warn(
    "⚠️  GITHUB_TOKEN not found in environment variables. GitHub endpoints will not work."
  );
}

// Helper function to check if GitHub is configured
const requireGitHub = (req: Request, res: Response, next: NextFunction) => {
  if (!githubService) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: "GitHub integration not configured",
      message: "GITHUB_TOKEN environment variable is required",
    };
    return res.status(503).json(errorResponse);
  }
  next();
};

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Test Case Generator API is running!",
    timestamp: new Date().toISOString(),
    github_configured: !!githubService,
  });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    service: "Test Case Generator API",
    timestamp: new Date().toISOString(),
    github_configured: !!githubService,
  });
});

// GitHub API Endpoints

/**
 * GET /api/repos
 * Fetch all repositories for the authenticated user
 */
app.get("/api/repos", requireGitHub, async (req: Request, res: Response) => {
  try {
    const repos = await githubService!.getRepositories();

    const response: RepoResponse = {
      success: true,
      repos: repos,
      total: repos.length,
    };

    res.json(response);
  } catch (error: any) {
    console.error("Error fetching repositories:", error.message);

    const errorResponse: ErrorResponse = {
      success: false,
      error: "Failed to fetch repositories",
      message: error.message,
    };

    res.status(500).json(errorResponse);
  }
});

/**
 * GET /api/repos/:owner/:repo/files
 * Fetch all code files from a repository recursively
 */
app.get(
  "/api/repos/:owner/:repo/files",
  requireGitHub,
  async (req: Request, res: Response) => {
    try {
      const { owner, repo } = req.params;

      if (!owner || !repo) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Missing required parameters",
          message: "Both owner and repo parameters are required",
        };
        return res.status(400).json(errorResponse);
      }

      const files = await githubService!.getRepositoryFiles(owner, repo);

      const response: FileTreeResponse = {
        success: true,
        files: files,
        total: files.length,
        repository: {
          owner,
          name: repo,
          full_name: `${owner}/${repo}`,
        },
      };

      res.json(response);
    } catch (error: any) {
      console.error(
        `Error fetching files for ${req.params.owner}/${req.params.repo}:`,
        error.message
      );

      const errorResponse: ErrorResponse = {
        success: false,
        error: "Failed to fetch repository files",
        message: error.message,
      };

      // Return 404 if repository not found, otherwise 500
      const statusCode = error.message.includes("Not Found") ? 404 : 500;
      res.status(statusCode).json(errorResponse);
    }
  }
);

// Test Case Generation endpoint (existing placeholder)
app.post("/api/generate-testcases", (req: Request, res: Response) => {
  const { problem, constraints, examples } = req.body;

  // Placeholder response - implement actual test case generation logic here
  res.json({
    success: true,
    message: "Test cases generated successfully",
    testCases: [
      {
        input: "Sample input 1",
        expectedOutput: "Sample output 1",
      },
      {
        input: "Sample input 2",
        expectedOutput: "Sample output 2",
      },
    ],
    metadata: {
      problem,
      constraints,
      examples,
      generatedAt: new Date().toISOString(),
    },
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  const errorResponse: ErrorResponse = {
    success: false,
    error: "Something went wrong!",
    message: err.message,
  };

  res.status(500).json(errorResponse);
});

// 404 handler - Express 5.x compatible
app.use((req: Request, res: Response) => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: "Route not found",
    message: `Path ${req.originalUrl} not found`,
  };

  res.status(404).json(errorResponse);
});

app.listen(PORT, () => {
  console.log(`🚀 Test Case Generator API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 GitHub repos: http://localhost:${PORT}/api/repos`);
  console.log(
    `📂 Repository files: http://localhost:${PORT}/api/repos/:owner/:repo/files`
  );
});
