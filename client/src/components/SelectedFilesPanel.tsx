import React from "react";
import { CodeFile } from "../types";

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
    <div className="bg-white border border-gray-300 rounded-lg">
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
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {selectedFilesList.map((file) => (
          <div
            key={file.path}
            className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
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
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Generate Tests
          </button>
        </div>
      </div>
    </div>
  );
};
