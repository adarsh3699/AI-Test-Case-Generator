import { useState, useEffect, useCallback } from "react";
import type { GitHubRepo, CodeFile, LoadingState } from "./types";
import { apiService, handleApiError } from "./services/api";
import { RepoSelector } from "./components/RepoSelector";
import { FileList } from "./components/FileList";
import { SelectedFilesPanel } from "./components/SelectedFilesPanel";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ErrorDisplay } from "./components/ErrorDisplay";
import type { ErrorType } from "./components/ErrorDisplay";
import { FolderOpenIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";

function App() {
	const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
	const [files, setFiles] = useState<CodeFile[]>([]);
	const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState<LoadingState>({
		repos: false,
		files: false,
	});
	const [error, setError] = useState<string | null>(null);

	// Utility function to determine error type based on error message
	const getErrorType = (errorMessage: string): ErrorType => {
		const message = errorMessage.toLowerCase();
		if (message.includes("network") || message.includes("connection") || message.includes("fetch")) {
			return "network";
		}
		if (
			message.includes("server") ||
			message.includes("500") ||
			message.includes("502") ||
			message.includes("503")
		) {
			return "server";
		}
		if (
			message.includes("validation") ||
			message.includes("invalid") ||
			message.includes("required") ||
			message.includes("400")
		) {
			return "validation";
		}
		return "general";
	};

	const fetchRepositoryFiles = useCallback(async (repo: GitHubRepo) => {
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
	}, []);

	// Fetch files when a repository is selected
	useEffect(() => {
		if (selectedRepo) {
			fetchRepositoryFiles(selectedRepo);
		} else {
			setFiles([]);
			setSelectedFiles(new Set());
		}
	}, [selectedRepo, fetchRepositoryFiles]);

	const handleFileToggle = useCallback((filePath: string) => {
		setSelectedFiles((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(filePath)) {
				newSet.delete(filePath);
			} else {
				newSet.add(filePath);
			}
			return newSet;
		});
	}, []);

	const handleClearAllFiles = useCallback(() => {
		setSelectedFiles(new Set());
	}, []);

	const handleRepoLoadingChange = useCallback((isLoading: boolean) => {
		setLoading((prev) => ({ ...prev, repos: isLoading }));
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
			<div className="container-professional section-spacing">
				{/* Header */}
				<Header />

				{/* Error Display */}
				{error && (
					<ErrorDisplay
						error={error}
						onClose={() => setError(null)}
						type={getErrorType(error)}
						position="toast"
						autoDismiss={true}
						autoDismissDelay={6000}
					/>
				)}

				{/* Main Content */}
				<div className="space-y-8">
					{/* First Row - Repository Selection & File List */}
					<div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
						{/* Repository Selection */}
						<div className="animate-fade-in-up">
							<RepoSelector
								selectedRepo={selectedRepo}
								onRepoSelect={setSelectedRepo}
								loading={loading.repos}
								onLoadingChange={handleRepoLoadingChange}
								onError={setError}
							/>
						</div>

						{/* File List */}
						<div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
							{selectedRepo ? (
								<div className="card hover-lift">
									<div className="card-header">
										<div className="flex items-center space-x-3">
											<div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-sm">
												<FolderOpenIcon className="w-5 h-5 text-white" />
											</div>
											<div>
												<h2 className="text-xl font-bold text-gray-900">Repository Files</h2>
												<p className="text-gray-600 text-sm">
													Browse and select files for test case generation
												</p>
											</div>
										</div>
									</div>
									<div className="card-body p-0">
										<FileList
											files={files}
											selectedFiles={selectedFiles}
											onFileToggle={handleFileToggle}
											loading={loading.files}
										/>
									</div>
								</div>
							) : (
								<div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl p-12 text-center">
									<div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center animate-subtle-float">
										<FolderOpenIcon className="w-8 h-8 text-white" />
									</div>
									<h3 className="text-xl font-semibold text-gray-800 mb-3">Ready to Browse Files</h3>
									<p className="text-gray-600 max-w-sm mx-auto">
										Select a repository above to view and analyze its files with our AI-powered
										system
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Second Row - Selected Files & AI Generation */}
					{selectedFiles.size > 0 && (
						<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-sm animate-fade-in-up">
							<div className="mb-6 text-center">
								<div className="flex items-center justify-center space-x-4 mb-4">
									<div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-sm">
										<SparklesIcon className="w-5 h-5 text-white" />
									</div>
									<h2 className="text-2xl font-bold text-gray-900">AI Test Case Generator</h2>
									<div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm">
										{selectedFiles.size} files selected
									</div>
								</div>
								<p className="text-gray-600 max-w-2xl mx-auto">
									Generate intelligent test cases and summaries using advanced AI analysis
								</p>
							</div>
							<SelectedFilesPanel
								files={files}
								selectedFiles={selectedFiles}
								onFileToggle={handleFileToggle}
								onClearAll={handleClearAllFiles}
							/>
						</div>
					)}
				</div>

				{/* Footer */}
				<Footer />
			</div>
		</div>
	);
}

export default App;
