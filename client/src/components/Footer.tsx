import React from "react";
import { CodeBracketIcon, LinkIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";

export const Footer: React.FC = () => {
  return (
    <div className="mt-20 text-center">
      <div className="glass rounded-3xl shadow-professional-lg border border-gray-200 p-10 max-w-4xl mx-auto hover-lift">
        <div className="flex items-center justify-center space-x-8 mb-6">
          <div className="flex items-center space-x-3">
            <div className="status-online"></div>
            <span className="text-lg font-bold text-gray-800">GitHub API</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="status-online"></div>
            <span className="text-lg font-bold text-gray-800">Gemini AI</span>
          </div>
        </div>
        <p className="text-gray-700 text-lg font-medium mb-2">
          Ensure your backend is running on{" "}
          <a
            href="http://localhost:4000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-bold underline decoration-2 underline-offset-4 hover-lift inline-flex items-center space-x-1"
          >
            <span>localhost:4000</span>
            <LinkIcon className="w-4 h-4" />
          </a>
        </p>
        <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <CodeBracketIcon className="w-4 h-4" />
            <span>React</span>
          </div>
          <span>•</span>
          <span>TypeScript</span>
          <span>•</span>
          <span>Tailwind CSS</span>
          <span>•</span>
          <span>Node.js</span>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <SparklesIcon className="w-4 h-4 text-purple-500" />
            <span>AI Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
};
