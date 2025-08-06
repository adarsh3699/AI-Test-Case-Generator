import React, { useState } from "react";
import type { CodeFile, TestSummary, FileInput } from "../types";
import { apiService, handleApiError } from "../services/api";
import { TestSummaries } from "./TestSummaries";
import { Toast } from "./Toast";
import { useToast } from "../hooks/useToast";
import {
  XMarkIcon,
  DocumentIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

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

  // Component is only rendered when files are selected
  return (
    <>
      <div className="glass rounded-3xl shadow-professional-xl hover:shadow-professional-xl transition-all duration-300 overflow-hidden border border-white/20">
        <div className="card-header bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 gradient-primary rounded-2xl">
                <DocumentIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  Selected Files
                  <span className="ml-4 px-4 py-2 gradient-success text-white text-sm font-bold rounded-2xl shadow-lg">
                    {selectedFiles.size}
                  </span>
                </h3>
                <p className="text-gray-600 font-medium mt-1">
                  Total size: {formatSize(getTotalSize())}
                </p>
              </div>
            </div>
            <button
              onClick={onClearAll}
              className="btn-danger flex items-center space-x-2"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          {selectedFilesList.map((file, index) => (
            <div
              key={file.path}
              className={`flex items-center justify-between p-6 border-b border-gray-100 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
              }`}
            >
              <div className="flex items-center flex-1 min-w-0 space-x-4">
                <button
                  onClick={() => onFileToggle(file.path)}
                  className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-xl transition-all duration-300 hover-lift"
                  title="Remove file"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>

                <DocumentIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-900 truncate text-lg">
                      {file.path.split("/").pop()}
                    </span>
                    {file.language && (
                      <span
                        className={`px-3 py-1 text-sm font-bold rounded-full shadow-sm ${getLanguageColor(
                          file.language
                        )}`}
                      >
                        {file.language}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 truncate mt-1 font-medium">
                    {file.path}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 flex-shrink-0 ml-6">
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-700">
                    {formatSize(file.size)}
                  </div>
                  {file.download_url && (
                    <a
                      href={file.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium hover-lift"
                      title="View on GitHub"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>View</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-dark border-t border-blue-200 px-8 py-8">
          <div className="text-center">
            <div className="mb-6">
              <h4 className="text-xl font-bold text-gray-800 mb-3">
                Ready to Generate AI Test Cases
              </h4>
              <p className="text-lg text-gray-700 font-medium mb-4">
                Transform your selected files into comprehensive test suites
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="status-online"></div>
                  <span className="font-bold text-gray-700">
                    {selectedFiles.size} files
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="status-online"></div>
                  <span className="font-bold text-gray-700">
                    {formatSize(getTotalSize())}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={generateTestSummaries}
              disabled={loading || selectedFiles.size === 0}
              className="btn-primary text-xl px-12 py-6 shadow-professional-xl hover:shadow-professional-xl animate-pulse-glow disabled:animate-none flex items-center space-x-3 mx-auto"
            >
              {loading ? (
                <>
                  <BoltIcon className="w-6 h-6 animate-spin" />
                  <span>Generating AI Test Summaries...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6" />
                  <span>Generate AI Test Summaries</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 glass border-l-4 border-red-500 rounded-2xl p-6 animate-slide-in-up">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-4" />
              <div className="flex-1">
                <h4 className="font-bold text-red-800 mb-1">Error Occurred</h4>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-xl transition-all duration-300 hover-lift"
              >
                <XMarkIcon className="w-5 h-5" />
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
