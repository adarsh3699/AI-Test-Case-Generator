import React, { useState, useMemo } from "react";
import type { CodeFile, FileTreeNode } from "../types";
import {
  ChevronRightIcon,
  FolderIcon,
  DocumentIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { FolderOpenIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

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
    const paddingLeft = depth * 24 + 16;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center py-2 md:py-3 px-3 md:px-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group ${
            node.file && isSelected
              ? "bg-gradient-to-r from-blue-100 to-indigo-100 shadow-sm"
              : ""
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {node.type === "folder" ? (
            <button
              onClick={() => toggleFolder(node.path)}
              className="flex items-center flex-1 text-left hover:bg-blue-50 rounded-xl py-2 px-3 -mx-3 transition-all duration-300 hover-lift group"
            >
              <ChevronRightIcon
                className={`w-5 h-5 mr-3 text-gray-500 transition-all duration-300 group-hover:text-blue-500 ${
                  isExpanded ? "rotate-90 text-blue-500" : "rotate-0"
                }`}
              />
              {isExpanded ? (
                <FolderOpenIcon className="w-5 h-5 mr-3 text-blue-500 group-hover:text-blue-600" />
              ) : (
                <FolderIcon className="w-5 h-5 mr-3 text-blue-500 group-hover:text-blue-600" />
              )}
              <span className="font-bold text-gray-800 group-hover:text-blue-700 text-base">
                {node.name}
              </span>
              <span className="ml-3 text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-semibold group-hover:bg-blue-200">
                {node.children?.length || 0}
              </span>
            </button>
          ) : (
            <label className="flex items-center flex-1 cursor-pointer hover:bg-blue-50 rounded-xl py-2 px-3 -mx-3 transition-all duration-300 hover-lift group">
              <div className="relative mr-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => node.file && onFileToggle(node.path)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
                    isSelected
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 group-hover:border-blue-400"
                  }`}
                >
                  {isSelected && (
                    <CheckCircleIcon className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
              <DocumentIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-semibold text-gray-900 truncate group-hover:text-blue-700">
                    {node.name}
                  </span>
                  {node.file?.language && (
                    <span className="text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-full shadow-sm">
                      {node.file.language}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm text-gray-600 font-medium">
                    {node.file?.size ? formatFileSize(node.file.size) : ""}
                  </span>
                </div>
              </div>
            </label>
          )}
        </div>

        {node.type === "folder" && isExpanded && node.children && (
          <div className="animate-slide-in-up">
            {node.children.map((child) => renderFileTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl shadow-professional p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Loading Files</h3>
        <p className="text-gray-600 font-medium">
          Analyzing repository structure...
        </p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="glass rounded-2xl shadow-professional p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 gradient-warning rounded-full flex items-center justify-center">
          <ExclamationCircleIcon className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          No Code Files Found
        </h3>
        <p className="text-gray-600 font-medium max-w-sm mx-auto">
          This repository doesn't contain any recognizable code files for
          analysis
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl shadow-professional hover:shadow-professional-lg transition-all duration-300 overflow-hidden">
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {fileTree.map((node) => renderFileTreeNode(node))}
      </div>

      {selectedFiles.size > 0 && (
        <div className="glass-dark border-t border-blue-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-lg font-bold text-gray-800">
                {selectedFiles.size} files selected
              </span>
            </div>
            <button
              onClick={() =>
                selectedFiles.forEach((path) => onFileToggle(path))
              }
              className="btn-danger text-sm"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
