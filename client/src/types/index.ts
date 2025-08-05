// API Response Types (matching backend)
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

export interface CodeFile {
  path: string;
  type: "file";
  language: string | null;
  size: number;
  sha: string;
  download_url?: string;
}

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

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}

// Frontend-specific types
export interface SelectedFile extends CodeFile {
  selected: boolean;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  file?: CodeFile;
  expanded?: boolean;
}

export interface LoadingState {
  repos: boolean;
  files: boolean;
}

export interface AppState {
  repos: GitHubRepo[];
  selectedRepo: GitHubRepo | null;
  files: CodeFile[];
  selectedFiles: Set<string>; // Using file paths as keys
  loading: LoadingState;
  error: string | null;
}
