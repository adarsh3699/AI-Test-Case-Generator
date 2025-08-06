import React from "react";
import { CodeBracketIcon, LinkIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";

export const Footer: React.FC = () => {
	return (
		<div className="mt-12 md:mt-20 text-center px-4">
			<div className="glass rounded-2xl md:rounded-3xl shadow-professional-lg border border-gray-200 p-6 md:p-10 max-w-4xl mx-auto hover-lift">
				<div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mb-4 md:mb-6">
					<div className="flex items-center space-x-3">
						<div className="status-online"></div>
						<span className="text-base md:text-lg font-bold text-gray-800">GitHub API</span>
					</div>
					<div className="flex items-center space-x-3">
						<div className="status-online"></div>
						<span className="text-base md:text-lg font-bold text-gray-800">Gemini AI</span>
					</div>
				</div>
				<p className="text-gray-700 text-base md:text-lg font-medium mb-2">
					Ensure your backend is running on{" "}
					<a
						href={import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 hover:text-blue-800 font-bold underline decoration-2 underline-offset-4 hover-lift inline-flex items-center space-x-1"
					>
						<span>{import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}</span>
						<LinkIcon className="w-4 h-4" />
					</a>
				</p>
				<div className="mt-4 md:mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs md:text-sm text-gray-500">
					<div className="flex items-center space-x-2">
						<CodeBracketIcon className="w-4 h-4" />
						<span>React</span>
					</div>
					<span className="hidden sm:inline">•</span>
					<span>TypeScript</span>
					<span className="hidden sm:inline">•</span>
					<span>Tailwind CSS</span>
					<span className="hidden sm:inline">•</span>
					<span>Node.js</span>
					<span className="hidden sm:inline">•</span>
					<div className="flex items-center space-x-1">
						<SparklesIcon className="w-4 h-4 text-purple-500" />
						<span>AI Powered</span>
					</div>
				</div>
			</div>
		</div>
	);
};
