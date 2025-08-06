import React, { useState, useEffect, useCallback } from "react";
import type { GitHubRepo } from "../types";
import { apiService, handleApiError } from "../services/api";
import {
	ChevronDownIcon,
	XMarkIcon,
	StarIcon,
	CodeBracketIcon,
	ArrowPathIcon,
	LinkIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

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

	const fetchRepositories = useCallback(async () => {
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
	}, [onLoadingChange, onError]);

	useEffect(() => {
		fetchRepositories();
	}, [fetchRepositories]);

	const handleRepoSelect = (repo: GitHubRepo) => {
		onRepoSelect(repo);
		setDropdownOpen(false);
	};

	const handleClear = () => {
		onRepoSelect(null);
		setDropdownOpen(false);
	};

	return (
		<div className="w-full">
			<div className="card">
				<div className="card-header">
					<div className="flex items-center space-x-3 md:space-x-4">
						<div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm">
							<LinkIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
						</div>
						<div className="flex-1">
							<h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">GitHub Repository</h2>
							<p className="text-gray-600 text-xs md:text-sm">Connect and select a repository to analyze</p>
						</div>
					</div>
				</div>
				<div className="card-body space-y-3 md:space-y-4">
					<div className="relative w-full dropdown-container">
						<label className="block text-sm md:text-base font-semibold text-gray-800 mb-2 md:mb-3">
							Select GitHub Repository
						</label>

						<div className="relative">
							<button
								type="button"
								onClick={() => setDropdownOpen(!dropdownOpen)}
								disabled={loading}
								className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-3 text-left hover:border-blue-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300"
							>
								<div className="flex items-center justify-between">
									<div className="flex-1 min-w-0 pr-3">
										{loading ? (
											<div className="flex items-center">
												<ArrowPathIcon className="w-4 h-4 text-blue-500 animate-spin mr-3 flex-shrink-0" />
												<span className="text-gray-600 text-sm">Loading repositories...</span>
											</div>
										) : selectedRepo ? (
											<div className="flex items-center space-x-3">
												<div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-md">
													<CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
												</div>
												<div className="flex-1 min-w-0">
													<div className="font-semibold text-gray-900 truncate">
														{selectedRepo.name}
													</div>
													<div className="text-xs text-gray-600 truncate">
														{selectedRepo.full_name}
													</div>
												</div>
											</div>
										) : (
											<div className="flex items-center space-x-3">
												<div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-md">
													<CodeBracketIcon className="w-4 h-4 text-gray-500" />
												</div>
												<span className="text-gray-500 text-sm">Choose a repository...</span>
											</div>
										)}
									</div>
									<ChevronDownIcon
										className={`h-5 w-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
											dropdownOpen ? "rotate-180 text-blue-500" : ""
										}`}
									/>
								</div>
							</button>

							{dropdownOpen && !loading && (
								<div
									className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-hidden animate-fade-in"
									style={{
										boxShadow:
											"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
									}}
								>
									<div className="max-h-80 overflow-y-auto custom-scrollbar">
										{selectedRepo && (
											<button
												onClick={handleClear}
												className="w-full px-6 py-4 text-left text-red-600 hover:bg-red-50 border-b border-gray-100 font-semibold flex items-center space-x-3 transition-all duration-200 hover:shadow-sm"
											>
												<div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-lg">
													<XMarkIcon className="w-4 h-4" />
												</div>
												<span>Clear selection</span>
											</button>
										)}

										{repos.length === 0 ? (
											<div className="px-6 py-12 text-gray-500 text-center">
												<div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4">
													<CodeBracketIcon className="w-8 h-8 text-gray-400" />
												</div>
												<p className="font-semibold text-lg mb-1">No repositories found</p>
												<p className="text-sm">Check your GitHub access or try again</p>
											</div>
										) : (
											repos.map((repo, index) => (
												<button
													key={repo.id}
													onClick={() => handleRepoSelect(repo)}
													className={`w-full px-6 py-4 text-left hover:bg-blue-50 transition-all duration-200 ${
														selectedRepo?.id === repo.id
															? "bg-blue-50 border-l-4 border-blue-500 shadow-sm"
															: index !== repos.length - 1
															? "border-b border-gray-100"
															: ""
													} hover:shadow-sm`}
												>
													<div className="flex items-start space-x-4">
														<div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl mt-1 flex-shrink-0">
															<CodeBracketIcon className="w-5 h-5 text-gray-600" />
														</div>
														<div className="flex-1 min-w-0">
															<div className="font-bold text-gray-900 text-lg mb-1">
																{repo.name}
															</div>
															<div className="text-sm text-gray-600 font-medium mb-2">
																{repo.full_name}
															</div>
															{repo.description && (
																<div className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">
																	{repo.description}
																</div>
															)}
															<div className="flex items-center flex-wrap gap-3 text-sm">
																{repo.language && (
																	<div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
																		<span className="w-2 h-2 rounded-full bg-blue-500"></span>
																		<span className="font-medium">
																			{repo.language}
																		</span>
																	</div>
																)}
																<div className="flex items-center space-x-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">
																	<StarIcon className="w-4 h-4" />
																	<span className="font-semibold">
																		{repo.stargazers_count}
																	</span>
																</div>
																<div className="flex items-center space-x-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
																	<CodeBracketIcon className="w-4 h-4" />
																	<span className="font-semibold">
																		{repo.forks_count}
																	</span>
																</div>
															</div>
														</div>
													</div>
												</button>
											))
										)}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
