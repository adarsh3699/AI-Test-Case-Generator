import axios, { AxiosInstance, AxiosResponse } from "axios";
import { GitHubRepo, GitHubTree, CodeFile } from "./types";

export class GitHubService {
  private api: AxiosInstance;

  constructor(token: string) {
    this.api = axios.create({
      baseURL: "https://api.github.com",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "TestCaseGenerator/1.0.0",
      },
    });
  }

  /**
   * Fetch all repositories for the authenticated user
   */
  async getRepositories(): Promise<GitHubRepo[]> {
    try {
      const response: AxiosResponse<GitHubRepo[]> = await this.api.get(
        "/user/repos",
        {
          params: {
            per_page: 100,
            sort: "updated",
            type: "all",
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      // Handle axios error response
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        const responseMessage = axiosError.response?.data?.message;
        if (responseMessage) {
          throw new Error(`Failed to fetch repositories: ${responseMessage}`);
        }
      }

      throw new Error(`Failed to fetch repositories: ${errorMessage}`);
    }
  }

  /**
   * Get the file tree for a repository recursively
   */
  async getRepositoryFiles(owner: string, repo: string): Promise<CodeFile[]> {
    try {
      // First get the default branch
      const repoResponse = await this.api.get(`/repos/${owner}/${repo}`);
      const defaultBranch = repoResponse.data.default_branch || "main";

      // Get the tree recursively
      const treeResponse: AxiosResponse<GitHubTree> = await this.api.get(
        `/repos/${owner}/${repo}/git/trees/${defaultBranch}`,
        {
          params: { recursive: 1 },
        }
      );

      // Filter for code files only
      const codeFiles: CodeFile[] = treeResponse.data.tree
        .filter((item: { type: string; path: string }) => {
          if (item.type !== "blob") return false;
          return this.isCodeFile(item.path);
        })
        .map((item: { path: string; size?: number; sha: string }) => ({
          path: item.path,
          type: "file" as const,
          language: this.detectLanguage(item.path),
          size: item.size || 0,
          sha: item.sha,
          download_url: `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${item.path}`,
        }));

      return codeFiles;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      // Handle axios error response
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        const responseMessage = axiosError.response?.data?.message;
        if (responseMessage) {
          throw new Error(
            `Failed to fetch repository files: ${responseMessage}`
          );
        }
      }

      throw new Error(`Failed to fetch repository files: ${errorMessage}`);
    }
  }

  /**
   * Check if a file is a code file based on extension
   */
  private isCodeFile(path: string): boolean {
    const codeExtensions = [
      // JavaScript/TypeScript
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".mjs",
      ".cjs",
      // Python
      ".py",
      ".pyw",
      ".pyi",
      // Java
      ".java",
      ".class",
      ".jar",
      // C/C++
      ".c",
      ".cpp",
      ".cc",
      ".cxx",
      ".h",
      ".hpp",
      ".hh",
      ".hxx",
      // C#
      ".cs",
      ".csx",
      // Go
      ".go",
      // Rust
      ".rs",
      // PHP
      ".php",
      ".phtml",
      // Ruby
      ".rb",
      ".rbw",
      // Swift
      ".swift",
      // Kotlin
      ".kt",
      ".kts",
      // Scala
      ".scala",
      ".sc",
      // R
      ".r",
      ".R",
      // MATLAB
      ".m",
      // Shell
      ".sh",
      ".bash",
      ".zsh",
      ".fish",
      // SQL
      ".sql",
      // HTML/CSS
      ".html",
      ".htm",
      ".css",
      ".scss",
      ".sass",
      ".less",
      // Configuration files that might contain code
      ".json",
      ".xml",
      ".yaml",
      ".yml",
      ".toml",
      // Other
      ".vue",
      ".svelte",
      ".dart",
      ".elm",
      ".clj",
      ".cljs",
      ".hs",
      ".ml",
      ".fs",
    ];

    const extension = path.toLowerCase().substring(path.lastIndexOf("."));
    return codeExtensions.includes(extension);
  }

  /**
   * Detect programming language from file extension
   */
  private detectLanguage(path: string): string | null {
    const extension = path.toLowerCase().substring(path.lastIndexOf("."));

    const languageMap: { [key: string]: string } = {
      ".js": "JavaScript",
      ".jsx": "JavaScript",
      ".ts": "TypeScript",
      ".tsx": "TypeScript",
      ".mjs": "JavaScript",
      ".cjs": "JavaScript",
      ".py": "Python",
      ".pyw": "Python",
      ".pyi": "Python",
      ".java": "Java",
      ".c": "C",
      ".cpp": "C++",
      ".cc": "C++",
      ".cxx": "C++",
      ".cs": "C#",
      ".go": "Go",
      ".rs": "Rust",
      ".php": "PHP",
      ".rb": "Ruby",
      ".swift": "Swift",
      ".kt": "Kotlin",
      ".scala": "Scala",
      ".r": "R",
      ".sh": "Shell",
      ".bash": "Shell",
      ".sql": "SQL",
      ".html": "HTML",
      ".htm": "HTML",
      ".css": "CSS",
      ".scss": "SCSS",
      ".sass": "Sass",
      ".vue": "Vue",
      ".dart": "Dart",
      ".json": "JSON",
      ".xml": "XML",
      ".yaml": "YAML",
      ".yml": "YAML",
    };

    return languageMap[extension] || null;
  }
}
