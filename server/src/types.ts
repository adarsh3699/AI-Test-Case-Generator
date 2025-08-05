// GitHub API Types
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  private: boolean;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubTree {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

// API Response Types
export interface RepoResponse {
  success: boolean;
  repos: GitHubRepo[];
  total: number;
}

export interface FileTreeResponse {
  success: boolean;
  files: CodeFile[];
  total: number;
  repository: {
    owner: string;
    name: string;
    full_name: string;
  };
}

export interface CodeFile {
  path: string;
  type: "file";
  language: string | null;
  size: number;
  sha: string;
  download_url?: string;
}

// Error Response Type
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}

// Test Case Summary Types
export interface FileInput {
  filename: string;
  content: string;
}

export interface TestSummary {
  summaryId: string;
  summaryText: string;
}

export interface GenerateSummaryRequest {
  files: FileInput[];
}

export interface GenerateSummaryResponse {
  success: boolean;
  summaries: TestSummary[];
  total: number;
  generatedAt: string;
  aiProvider?: string;
}

// Test Code Generation Types
export interface GenerateCodeRequest {
  summaryId: string;
  summaryText: string;
  fileContent: string;
  filename?: string;
}

export interface GenerateCodeResponse {
  success: boolean;
  code: string;
  language: string;
  testFramework: string;
  generatedAt: string;
  aiProvider?: string;
}
