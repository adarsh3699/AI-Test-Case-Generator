import React, { useState, useEffect } from "react";
import { GitHubRepo, CodeFile, LoadingState } from "./types";
import { apiService, handleApiError } from "./services/api";
import { RepoSelector } from "./components/RepoSelector";
import { FileList } from "./components/FileList";
import { SelectedFilesPanel } from "./components/SelectedFilesPanel";

function App() {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<LoadingState>({
    repos: false,
    files: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch files when a repository is selected
  useEffect(() => {
    if (selectedRepo) {
      fetchRepositoryFiles(selectedRepo);
    } else {
      setFiles([]);
      setSelectedFiles(new Set());
    }
  }, [selectedRepo]);

  const fetchRepositoryFiles = async (repo: GitHubRepo) => {
    setLoading((prev) => ({ ...prev, files: true }));
    setError(null);
    setFiles([]);
    setSelectedFiles(new Set());

    try {
      const [owner, repoName] = repo.full_name.split("/");
      const response = await apiService.getRepositoryFiles(owner, repoName);

      if (response.success) {
        setFiles(response.files);
      } else {
        setError("Failed to fetch repository files");
      }
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading((prev) => ({ ...prev, files: false }));
    }
  };

  const handleFileToggle = (filePath: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const handleClearAllFiles = () => {
    setSelectedFiles(new Set());
  };

  const handleRepoLoadingChange = (isLoading: boolean) => {
    setLoading((prev) => ({ ...prev, repos: isLoading }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test Case Generator
          </h1>
          <p className="text-gray-600">
            Select a GitHub repository and choose files to generate test cases
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-red-800">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Repository Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <RepoSelector
                selectedRepo={selectedRepo}
                onRepoSelect={setSelectedRepo}
                loading={loading.repos}
                onLoadingChange={handleRepoLoadingChange}
                onError={setError}
              />
            </div>
          </div>

          {/* Middle Column - File List */}
          <div className="lg:col-span-1">
            {selectedRepo ? (
              <FileList
                files={files}
                selectedFiles={selectedFiles}
                onFileToggle={handleFileToggle}
                loading={loading.files}
              />
            ) : (
              <div className="bg-white border border-gray-300 rounded-lg p-6 text-center text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 1v4m8-4v4"
                    />
                  </svg>
                </div>
                <p className="text-sm">Select a repository to view files</p>
              </div>
            )}
          </div>

          {/* Right Column - Selected Files */}
          <div className="lg:col-span-1">
            <SelectedFilesPanel
              files={files}
              selectedFiles={selectedFiles}
              onFileToggle={handleFileToggle}
              onClearAll={handleClearAllFiles}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Powered by GitHub API • Make sure your backend is running on{" "}
            <a
              href="http://localhost:4000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              localhost:4000
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
