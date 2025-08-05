import React, { useState } from "react";
import type { CodeFile, TestSummary, FileInput } from "../types";
import { apiService, handleApiError } from "../services/api";
import { TestSummaries } from "./TestSummaries";
import { Toast } from "./Toast";
import { useToast } from "../hooks/useToast";

interface SelectedFilesPanelProps {
  files: CodeFile[];
  selectedFiles: Set<string>;
  onFileToggle: (filePath: string) => void;
  onClearAll: () => void;
}

export const SelectedFilesPanel: React.FC<SelectedFilesPanelProps> = ({
  files,
  selectedFiles,
  onFileToggle,
  onClearAll,
}) => {
  const [testSummaries, setTestSummaries] = useState<TestSummary[]>([]);
  const [aiProvider, setAiProvider] = useState<string>("");
  const [generatedAt, setGeneratedAt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast, showSuccess, showError, hideToast } = useToast();

  const selectedFilesList = files.filter((file) =>
    selectedFiles.has(file.path)
  );

  const getLanguageColor = (language: string | null) => {
    if (!language) return "bg-gray-100 text-gray-800";

    const colors: { [key: string]: string } = {
      JavaScript: "bg-yellow-100 text-yellow-800",
      TypeScript: "bg-blue-100 text-blue-800",
      Python: "bg-green-100 text-green-800",
      Java: "bg-orange-100 text-orange-800",
      "C++": "bg-purple-100 text-purple-800",
      "C#": "bg-indigo-100 text-indigo-800",
      Go: "bg-cyan-100 text-cyan-800",
      Rust: "bg-red-100 text-red-800",
      PHP: "bg-violet-100 text-violet-800",
      Ruby: "bg-pink-100 text-pink-800",
      Swift: "bg-orange-100 text-orange-800",
      Kotlin: "bg-purple-100 text-purple-800",
      HTML: "bg-orange-100 text-orange-800",
      CSS: "bg-blue-100 text-blue-800",
      JSON: "bg-gray-100 text-gray-800",
      YAML: "bg-gray-100 text-gray-800",
    };

    return colors[language] || "bg-gray-100 text-gray-800";
  };

  const getTotalSize = () => {
    return selectedFilesList.reduce((total, file) => total + file.size, 0);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const generateTestSummaries = async () => {
    if (selectedFilesList.length === 0) {
      showError("No files selected for analysis");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare file inputs for the API
      const fileInputs: FileInput[] = await Promise.all(
        selectedFilesList.map(async (file) => {
          // TODO: In a real implementation, fetch actual file content from GitHub API
          // For now, use file path as placeholder since we need content for AI analysis
          const placeholderContent = `// File: ${file.path}
// Size: ${formatSize(file.size)}
// Language: ${file.language || "Unknown"}
// TODO: Replace with actual file content from ${
            file.download_url || "GitHub API"
          }`;

          return {
            filename: file.path.split("/").pop() || file.path,
            content: placeholderContent,
          };
        })
      );

      const response = await apiService.generateTestSummaries({
        files: fileInputs,
      });

      if (response.success) {
        setTestSummaries(response.summaries);
        setAiProvider(response.aiProvider || "");
        setGeneratedAt(response.generatedAt);
        setError(null);
        showSuccess(
          `Generated ${response.summaries.length} test summaries successfully!`
        );
      } else {
        const errorMsg = "Failed to generate test summaries";
        setError(errorMsg);
        showError(errorMsg);
      }
    } catch (error) {
      const errorMsg = handleApiError(error);
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const clearSummaries = () => {
    setTestSummaries([]);
    setAiProvider("");
    setGeneratedAt("");
    setError(null);
  };

  if (selectedFiles.size === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Selected Files
        </h3>
        <div className="text-center text-gray-500">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-sm">No files selected</p>
          <p className="text-xs text-gray-400 mt-1">
            Select files from the repository to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Selected Files
              </h3>
              <p className="text-sm text-gray-600">
                {selectedFiles.size} files • {formatSize(getTotalSize())}
              </p>
            </div>
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {selectedFilesList.map((file) => (
            <div
              key={file.path}
              className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-colors duration-200 group"
            >
              <div className="flex items-center flex-1 min-w-0">
                <button
                  onClick={() => onFileToggle(file.path)}
                  className="flex-shrink-0 mr-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="Remove file"
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

                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 truncate">
                      {file.path.split("/").pop()}
                    </span>
                    {file.language && (
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getLanguageColor(
                          file.language
                        )}`}
                      >
                        {file.language}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 truncate mt-1">
                    {file.path}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 ml-4 text-right">
                <div className="text-sm text-gray-500">
                  {formatSize(file.size)}
                </div>
                {file.download_url && (
                  <a
                    href={file.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800"
                    title="View on GitHub"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 px-4 py-3 border-t border-gray-300 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-900">
              <span className="font-medium">{selectedFiles.size}</span> files
              selected
              <span className="ml-2 text-blue-700">
                • {formatSize(getTotalSize())}
              </span>
            </div>
            <button
              onClick={generateTestSummaries}
              disabled={loading || selectedFiles.size === 0}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Generate Test Summaries
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
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
              <span className="text-red-800 text-sm">{error}</span>
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

        {/* Test Summaries Display */}
        {(testSummaries.length > 0 || loading) && (
          <div className="mt-4">
            <TestSummaries
              summaries={testSummaries}
              aiProvider={aiProvider}
              generatedAt={generatedAt}
              loading={loading}
              onClear={clearSummaries}
              selectedFiles={selectedFilesList.map((file) => ({
                filename: file.path.split("/").pop() || file.path,
                content: `// TODO: Fetch actual content from ${
                  file.download_url || "GitHub API"
                }`,
              }))}
            />
          </div>
        )}
      </div>
      <Toast {...toast} onClose={hideToast} />
    </>
  );
};
