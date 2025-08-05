import React, { useState, useMemo } from "react";
import { CodeFile, FileTreeNode } from "../types";

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

    return tree;
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

  const getLanguageIcon = (language: string | null) => {
    if (!language) return "📄";

    const icons: { [key: string]: string } = {
      JavaScript: "🟡",
      TypeScript: "🔵",
      Python: "🐍",
      Java: "☕",
      "C++": "⚡",
      "C#": "💜",
      Go: "🐹",
      Rust: "🦀",
      PHP: "🐘",
      Ruby: "💎",
      Swift: "🍎",
      Kotlin: "🎯",
      HTML: "🌐",
      CSS: "🎨",
      JSON: "📋",
      YAML: "📝",
    };

    return icons[language] || "📄";
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
              className="flex items-center flex-1 text-left"
            >
              <span className="mr-2">{isExpanded ? "📂" : "📁"}</span>
              <span className="font-medium text-gray-700">{node.name}</span>
              <span className="ml-2 text-xs text-gray-400">
                ({node.children?.length || 0} items)
              </span>
            </button>
          ) : (
            <label className="flex items-center flex-1 cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => node.file && onFileToggle(node.path)}
                className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="mr-2">
                {getLanguageIcon(node.file?.language || null)}
              </span>
              <span className="text-gray-900">{node.name}</span>
              <span className="ml-2 text-xs text-gray-400">
                {node.file?.language}
              </span>
              <span className="ml-auto text-xs text-gray-400">
                {node.file?.size
                  ? `${(node.file.size / 1024).toFixed(1)}KB`
                  : ""}
              </span>
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
      <div className="border border-gray-300 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3"></div>
          <span className="text-gray-600">Loading files...</span>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="border border-gray-300 rounded-lg p-6 text-center text-gray-500">
        No code files found in this repository
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-300 rounded-t-lg">
        <h3 className="text-lg font-medium text-gray-900">Repository Files</h3>
        <p className="text-sm text-gray-600">
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
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
