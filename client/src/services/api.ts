import axios from "axios";
import { RepoResponse, FileTreeResponse } from "../types";

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
