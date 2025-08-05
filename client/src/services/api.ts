import axios from "axios";
import {
  RepoResponse,
  FileTreeResponse,
  GenerateSummaryRequest,
  GenerateSummaryResponse,
  GenerateCodeRequest,
  GenerateCodeResponse,
} from "../types";

const API_BASE_URL = "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
  async getRepositoryFiles(
    owner: string,
    repo: string
  ): Promise<FileTreeResponse> {
    const response = await api.get<FileTreeResponse>(
      `/api/repos/${owner}/${repo}/files`
    );
    return response.data;
  },

  /**
   * Check API health and GitHub integration status
   */
  async checkHealth(): Promise<any> {
    const response = await api.get("/api/health");
    return response.data;
  },

  /**
   * Generate AI-powered test case summaries from selected files
   */
  async generateTestSummaries(
    request: GenerateSummaryRequest
  ): Promise<GenerateSummaryResponse> {
    const response = await api.post<GenerateSummaryResponse>(
      "/api/generate-summary",
      request
    );
    return response.data;
  },

  /**
   * Generate test code for a specific test summary
   */
  async generateTestCode(
    request: GenerateCodeRequest
  ): Promise<GenerateCodeResponse> {
    const response = await api.post<GenerateCodeResponse>(
      "/api/generate-code",
      request
    );
    return response.data;
  },
};

// Error handling helper
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};

export default apiService;
