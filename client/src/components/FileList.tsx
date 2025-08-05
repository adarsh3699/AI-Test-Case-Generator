import React, { useState, useMemo } from "react";
import type { CodeFile, FileTreeNode } from "../types";

interface FileListProps {
  files: CodeFile[];
  selectedFiles: Set<string>;
  onFileToggle: (filePath: string) => void;
  loading: boolean;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  selectedFiles,
  onFileToggle,
  loading,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  // Build file tree structure
  const fileTree = useMemo(() => {
    const tree: FileTreeNode[] = [];
    const pathMap = new Map<string, FileTreeNode>();

    // Sort files by path to ensure consistent ordering
    const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

    sortedFiles.forEach((file) => {
      const pathParts = file.path.split("/");
      let currentPath = "";

      pathParts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isFile = index === pathParts.length - 1;

        if (!pathMap.has(currentPath)) {
          const node: FileTreeNode = {
            name: part,
            path: currentPath,
            type: isFile ? "file" : "folder",
            children: isFile ? undefined : [],
            file: isFile ? file : undefined,
            expanded: false,
          };

          pathMap.set(currentPath, node);

          if (parentPath === "") {
            tree.push(node);
          } else {
            const parent = pathMap.get(parentPath);
            if (parent && parent.children) {
              parent.children.push(node);
            }
          }
        }
      });
    });

    // Sort function to put folders first, then files
    const sortTree = (nodes: FileTreeNode[]): FileTreeNode[] => {
      return nodes
        .sort((a, b) => {
          // Folders first, then files
          if (a.type !== b.type) {
            return a.type === "folder" ? -1 : 1;
          }
          // Within same type, sort alphabetically
          return a.name.localeCompare(b.name);
        })
        .map((node) => ({
          ...node,
          children: node.children ? sortTree(node.children) : undefined,
        }));
    };

    return sortTree(tree);
  }, [files]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  const renderFileTreeNode = (node: FileTreeNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = node.file ? selectedFiles.has(node.path) : false;
    const paddingLeft = depth * 20 + 12;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center py-2 px-3 hover:bg-gray-50 ${
            node.file && isSelected ? "bg-blue-50" : ""
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {node.type === "folder" ? (
            <button
              onClick={() => toggleFolder(node.path)}
              className="flex items-center flex-1 text-left hover:bg-gray-100 rounded-lg py-1 px-2 -mx-2 transition-colors duration-200"
            >
              <svg
                className={`w-4 h-4 mr-2 text-gray-500 transition-transform duration-200 ${
                  isExpanded ? "rotate-90" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <svg
                className="w-4 h-4 mr-2 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <span className="font-medium text-gray-700">{node.name}</span>
              <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {node.children?.length || 0}
              </span>
            </button>
          ) : (
            <label className="flex items-center flex-1 cursor-pointer hover:bg-gray-100 rounded-lg py-1 px-2 -mx-2 transition-colors duration-200">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => node.file && onFileToggle(node.path)}
                className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <svg
                className="w-4 h-4 mr-2 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {node.name}
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  {node.file?.language && (
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                      {node.file.language}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 font-medium">
                    {node.file?.size ? formatFileSize(node.file.size) : ""}
                  </span>
                </div>
              </div>
            </label>
          )}
        </div>

        {node.type === "folder" && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderFileTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="w-6 h-6 border-2 border-blue-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <span className="ml-3 text-gray-600 font-medium">
            Loading files...
          </span>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-6 text-center text-gray-500">
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
        <p className="text-sm font-medium">No code files found</p>
        <p className="text-xs text-gray-400 mt-1">
          This repository doesn't contain any recognizable code files
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-300 rounded-t-xl">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          Repository Files
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            {files.length}
          </span>
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {files.length} code files • {selectedFiles.size} selected
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {fileTree.map((node) => renderFileTreeNode(node))}
      </div>

      {selectedFiles.size > 0 && (
        <div className="bg-blue-50 px-4 py-3 border-t border-gray-300 rounded-b-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedFiles.size} files selected
            </span>
            <button
              onClick={() =>
                selectedFiles.forEach((path) => onFileToggle(path))
              }
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
