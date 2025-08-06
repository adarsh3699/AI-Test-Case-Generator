import axios from "axios";
import type {
	RepoResponse,
	FileTreeResponse,
	GenerateSummaryRequest,
	GenerateSummaryResponse,
	GenerateCodeRequest,
	GenerateCodeResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// API service functions
export const apiService = {
	/**
	 * Fetch all repositories for the authenticated user
	 */
	async getRepositories(): Promise<RepoResponse> {
		const response = await api.get<RepoResponse>("/api/repos");
		return response.data;
	},

	/**
	 * Fetch all code files from a specific repository
	 */
	async getRepositoryFiles(owner: string, repo: string): Promise<FileTreeResponse> {
		const response = await api.get<FileTreeResponse>(`/api/repos/${owner}/${repo}/files`);
		return response.data;
	},

	/**
	 * Check API health and GitHub integration status
	 */
	async checkHealth(): Promise<{
		status: string;
		service: string;
		timestamp: string;
		github_configured: boolean;
	}> {
		const response = await api.get("/api/health");
		return response.data;
	},

	/**
	 * Generate AI-powered test case summaries from selected files
	 */
	async generateTestSummaries(request: GenerateSummaryRequest): Promise<GenerateSummaryResponse> {
		const response = await api.post<GenerateSummaryResponse>("/api/generate-summary", request);
		return response.data;
	},

	/**
	 * Generate test code for a specific test summary
	 */
	async generateTestCode(request: GenerateCodeRequest): Promise<GenerateCodeResponse> {
		const response = await api.post<GenerateCodeResponse>("/api/generate-code", request);
		return response.data;
	},
};

// Error handling helper
export const handleApiError = (error: unknown): string => {
	if (error && typeof error === "object" && "response" in error) {
		const axiosError = error as {
			response?: { data?: { message?: string; error?: string } };
		};
		if (axiosError.response?.data?.message) {
			return axiosError.response.data.message;
		}
		if (axiosError.response?.data?.error) {
			return axiosError.response.data.error;
		}
	}
	if (error && typeof error === "object" && "message" in error) {
		return (error as { message: string }).message;
	}
	return "An unexpected error occurred";
};

export default apiService;
