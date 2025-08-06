import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GitHubService } from "./githubService";
import { AIService } from "./aiService";
import {
	RepoResponse,
	FileTreeResponse,
	ErrorResponse,
	GenerateSummaryRequest,
	GenerateSummaryResponse,
	GenerateCodeRequest,
	GenerateCodeResponse,
} from "./types";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
	cors({
		origin: process.env.CLIENT_ORIGIN_URL || "http://localhost:5173", // Vite dev server default port
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
	console.warn("⚠️  GITHUB_TOKEN not found in environment variables. GitHub endpoints will not work.");
}

// Initialize AI service
const aiService = new AIService();

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
	} catch (error: unknown) {
		console.error("Error fetching repositories:", error instanceof Error ? error.message : String(error));

		const errorResponse: ErrorResponse = {
			success: false,
			error: "Failed to fetch repositories",
			message: error instanceof Error ? error.message : String(error),
		};

		res.status(500).json(errorResponse);
	}
});

/**
 * GET /api/repos/:owner/:repo/files
 * Fetch all code files from a repository recursively
 */
app.get("/api/repos/:owner/:repo/files", requireGitHub, async (req: Request, res: Response) => {
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
	} catch (error: unknown) {
		console.error(
			`Error fetching files for ${req.params.owner}/${req.params.repo}:`,
			error instanceof Error ? error.message : String(error)
		);

		const errorResponse: ErrorResponse = {
			success: false,
			error: "Failed to fetch repository files",
			message: error instanceof Error ? error.message : String(error),
		};

		// Return 404 if repository not found, otherwise 500
		const statusCode = error instanceof Error && error.message.includes("Not Found") ? 404 : 500;
		res.status(statusCode).json(errorResponse);
	}
});

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

/**
 * POST /api/generate-summary
 * Generate AI-powered test case summaries from selected files
 */
app.post("/api/generate-summary", async (req: Request, res: Response) => {
	try {
		const requestBody: GenerateSummaryRequest = req.body;

		// Validate request body
		if (!requestBody.files || !Array.isArray(requestBody.files)) {
			const errorResponse: ErrorResponse = {
				success: false,
				error: "Invalid request format",
				message: "Request body must contain a 'files' array",
			};
			return res.status(400).json(errorResponse);
		}

		if (requestBody.files.length === 0) {
			const errorResponse: ErrorResponse = {
				success: false,
				error: "No files provided",
				message: "At least one file must be provided for analysis",
			};
			return res.status(400).json(errorResponse);
		}

		// Validate each file in the array
		for (const file of requestBody.files) {
			if (!file.filename || !file.content) {
				const errorResponse: ErrorResponse = {
					success: false,
					error: "Invalid file format",
					message: "Each file must have 'filename' and 'content' properties",
				};
				return res.status(400).json(errorResponse);
			}
		}

		console.log(`📝 Generating test summaries for ${requestBody.files.length} files...`);

		// Generate summaries using AI service
		const { summaries, aiProvider } = await aiService.generateTestSummaries(requestBody.files);

		const response: GenerateSummaryResponse = {
			success: true,
			summaries,
			total: summaries.length,
			generatedAt: new Date().toISOString(),
			aiProvider,
		};

		console.log(`✅ Generated ${summaries.length} test summaries using ${aiProvider}`);
		res.json(response);
	} catch (error: unknown) {
		console.error("Error generating test summaries:", error instanceof Error ? error.message : String(error));

		const errorResponse: ErrorResponse = {
			success: false,
			error: "Failed to generate test summaries",
			message: error instanceof Error ? error.message : String(error),
		};

		res.status(500).json(errorResponse);
	}
});

/**
 * POST /api/generate-code
 * Generate test code for a specific test summary
 */
app.post("/api/generate-code", async (req: Request, res: Response) => {
	try {
		const requestBody: GenerateCodeRequest = req.body;

		// Validate request body
		if (!requestBody.summaryId || !requestBody.summaryText || !requestBody.fileContent) {
			const errorResponse: ErrorResponse = {
				success: false,
				error: "Invalid request format",
				message: "Request body must contain 'summaryId', 'summaryText', and 'fileContent'",
			};
			return res.status(400).json(errorResponse);
		}

		console.log(`🧪 Generating test code for summary: ${requestBody.summaryId}...`);

		// Generate test code using AI service
		const { code, language, testFramework, aiProvider } = await aiService.generateTestCode(requestBody);

		const response: GenerateCodeResponse = {
			success: true,
			code,
			language,
			testFramework,
			generatedAt: new Date().toISOString(),
			aiProvider,
		};

		console.log(`✅ Generated test code using ${aiProvider} (${language}/${testFramework})`);
		res.json(response);
	} catch (error: unknown) {
		console.error("Error generating test code:", error instanceof Error ? error.message : String(error));

		const errorResponse: ErrorResponse = {
			success: false,
			error: "Failed to generate test code",
			message: error instanceof Error ? error.message : String(error),
		};

		res.status(500).json(errorResponse);
	}
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

// For local development
if (process.env.NODE_ENV !== "production") {
	app.listen(PORT, () => {
		console.log(`🚀 Test Case Generator API server running on port ${PORT}`);
		console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
		console.log(`📁 GitHub repos: http://localhost:${PORT}/api/repos`);
		console.log(`📂 Repository files: http://localhost:${PORT}/api/repos/:owner/:repo/files`);
		console.log(`🤖 AI test summaries: POST http://localhost:${PORT}/api/generate-summary`);
		console.log(`🧪 AI test code generation: POST http://localhost:${PORT}/api/generate-code`);
	});
}

// Export for Vercel
export default app;
