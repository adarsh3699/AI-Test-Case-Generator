import React, { useState, useEffect } from "react";
import { GitHubRepo } from "../types";
import { apiService, handleApiError } from "../services/api";

interface RepoSelectorProps {
  selectedRepo: GitHubRepo | null;
  onRepoSelect: (repo: GitHubRepo | null) => void;
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
  onError: (error: string | null) => void;
}

export const RepoSelector: React.FC<RepoSelectorProps> = ({
  selectedRepo,
  onRepoSelect,
  loading,
  onLoadingChange,
  onError,
}) => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    onLoadingChange(true);
    onError(null);

    try {
      const response = await apiService.getRepositories();
      if (response.success) {
        setRepos(response.repos);
      } else {
        onError("Failed to fetch repositories");
      }
    } catch (error) {
      onError(handleApiError(error));
    } finally {
      onLoadingChange(false);
    }
  };

  const handleRepoSelect = (repo: GitHubRepo) => {
    onRepoSelect(repo);
    setDropdownOpen(false);
  };

  const handleClear = () => {
    onRepoSelect(null);
    setDropdownOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select GitHub Repository
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          disabled={loading}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                  <span className="text-gray-500">Loading repositories...</span>
                </div>
              ) : selectedRepo ? (
                <div>
                  <div className="font-medium text-gray-900 truncate">
                    {selectedRepo.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {selectedRepo.full_name}
                  </div>
                </div>
              ) : (
                <span className="text-gray-500">Choose a repository...</span>
              )}
            </div>
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {dropdownOpen && !loading && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {selectedRepo && (
              <button
                onClick={handleClear}
                className="w-full px-4 py-2 text-left text-gray-500 hover:bg-gray-100 border-b border-gray-200"
              >
                Clear selection
              </button>
            )}

            {repos.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-center">
                No repositories found
              </div>
            ) : (
              repos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => handleRepoSelect(repo)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 ${
                    selectedRepo?.id === repo.id
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : ""
                  }`}
                >
                  <div className="font-medium text-gray-900">{repo.name}</div>
                  <div className="text-sm text-gray-500">{repo.full_name}</div>
                  {repo.description && (
                    <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {repo.description}
                    </div>
                  )}
                  <div className="flex items-center mt-2 space-x-4 text-xs text-gray-400">
                    {repo.language && (
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                        {repo.language}
                      </span>
                    )}
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
