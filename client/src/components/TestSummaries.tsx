import React, { useState } from "react";
import type { TestSummary, GenerateCodeRequest } from "../types";
import { apiService, handleApiError } from "../services/api";
import { Toast } from "./Toast";
import { useToast } from "../hooks/useToast";
import {
	LightBulbIcon,
	DocumentDuplicateIcon,
	CodeBracketIcon,
	XMarkIcon,
	ExclamationTriangleIcon,
	ArrowPathIcon,
	CloudArrowDownIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

interface TestSummariesProps {
	summaries: TestSummary[];
	aiProvider?: string;
	generatedAt?: string;
	loading: boolean;
	onClear: () => void;
	// File content for code generation
	selectedFiles?: Array<{
		filename: string;
		content: string;
	}>;
}

// Internal state for generated code
interface GeneratedCode {
	summaryId: string;
	code: string;
	language: string;
	testFramework: string;
	aiProvider: string;
	generatedAt: string;
}

export const TestSummaries: React.FC<TestSummariesProps> = ({
	summaries,
	aiProvider,
	generatedAt,
	loading,
	onClear,
	selectedFiles = [],
}) => {
	const [generatedCodes, setGeneratedCodes] = useState<Map<string, GeneratedCode>>(new Map());
	const [loadingCode, setLoadingCode] = useState<Set<string>>(new Set());
	const [codeErrors, setCodeErrors] = useState<Map<string, string>>(new Map());
	const { toast, showSuccess, showError, hideToast } = useToast();

	const generateTestCode = async (summary: TestSummary) => {
		// Add summary to loading state
		setLoadingCode((prev) => new Set(prev.add(summary.summaryId)));
		setCodeErrors((prev) => {
			const newErrors = new Map(prev);
			newErrors.delete(summary.summaryId);
			return newErrors;
		});

		try {
			// Check if we have file content available
			if (selectedFiles.length === 0) {
				throw new Error("No file content available for code generation");
			}

			const fileContent = selectedFiles[0].content;
			const filename = selectedFiles[0].filename;

			const request: GenerateCodeRequest = {
				summaryId: summary.summaryId,
				summaryText: summary.summaryText,
				fileContent,
				filename,
			};

			const response = await apiService.generateTestCode(request);

			if (response.success) {
				const newCode: GeneratedCode = {
					summaryId: summary.summaryId,
					code: response.code,
					language: response.language,
					testFramework: response.testFramework,
					aiProvider: response.aiProvider || "Unknown",
					generatedAt: response.generatedAt,
				};

				setGeneratedCodes((prev) => new Map(prev.set(summary.summaryId, newCode)));
				showSuccess(`Test code generated successfully for "${summary.summaryText.slice(0, 50)}..."`);
			} else {
				throw new Error("Failed to generate test code");
			}
		} catch (error) {
			const errorMessage = handleApiError(error);
			setCodeErrors((prev) => new Map(prev.set(summary.summaryId, errorMessage)));
			showError(`Failed to generate test code: ${errorMessage}`);
		} finally {
			setLoadingCode((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete(summary.summaryId);
				return newLoading;
			});
		}
	};

	const copyCode = async (code: string) => {
		try {
			await navigator.clipboard.writeText(code);
			showSuccess("Test code copied to clipboard! 🎉");
		} catch (error) {
			console.error("Failed to copy code:", error);
			showError("Failed to copy code to clipboard");
		}
	};

	const copySummary = async (summary: string) => {
		try {
			await navigator.clipboard.writeText(summary);
			showSuccess("Test summary copied to clipboard! ✨");
		} catch (error) {
			console.error("Failed to copy summary:", error);
			showError("Failed to copy summary to clipboard");
		}
	};

	const clearGeneratedCode = (summaryId: string) => {
		setGeneratedCodes((prev) => {
			const newCodes = new Map(prev);
			newCodes.delete(summaryId);
			return newCodes;
		});
		setCodeErrors((prev) => {
			const newErrors = new Map(prev);
			newErrors.delete(summaryId);
			return newErrors;
		});
	};
	if (loading) {
		return (
			<div className="glass rounded-3xl shadow-professional-lg p-6 md:p-10 text-center">
				<div className="flex items-center justify-center mb-4 md:mb-6">
					<ArrowPathIcon className="w-8 h-8 md:w-10 md:h-10 text-blue-500 animate-spin" />
				</div>
				<h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">Generating Test Summaries</h3>
				<p className="text-base md:text-lg text-gray-600 font-medium">
					Our AI is analyzing your files to create comprehensive test suggestions
				</p>
				<div className="mt-6 flex items-center justify-center space-x-4">
					<div className="status-loading"></div>
					<span className="text-gray-600 font-medium">This may take a few moments</span>
				</div>
			</div>
		);
	}

	if (summaries.length === 0) {
		return (
			<div className="glass rounded-3xl shadow-professional-lg p-6 md:p-10 text-center">
				<div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 md:mb-8 gradient-info rounded-full flex items-center justify-center animate-float">
					<LightBulbIcon className="w-10 h-10 md:w-12 md:h-12 text-white" />
				</div>
				<h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">No Test Summaries Yet</h3>
				<p className="text-base md:text-lg text-gray-600 font-medium max-w-md mx-auto">
					Select files and click "Generate Test Summaries" to see AI-powered test suggestions
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="glass rounded-3xl shadow-professional-xl overflow-hidden border border-white/20 animate-slide-in-up">
				<div className="card-header bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
						<div className="flex items-center space-x-3 md:space-x-4">
							<div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 gradient-secondary rounded-xl md:rounded-2xl">
								<SparklesIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
							</div>
							<div>
								<h3 className="text-lg md:text-2xl font-bold text-gray-900">
									AI Test Summaries
								</h3>
								<div className="flex flex-col sm:flex-row sm:items-center mt-2 space-y-1 sm:space-y-0 sm:space-x-6 text-sm">
									<div className="flex items-center space-x-2">
										<CheckCircleIcon className="w-4 h-4 text-green-500" />
										<span className="font-bold text-gray-700">{summaries.length} suggestions</span>
									</div>
									{aiProvider && (
										<div className="flex items-center space-x-2">
											<div className="status-online"></div>
											<span className="font-bold text-gray-700">{aiProvider}</span>
										</div>
									)}
									{generatedAt && (
										<span className="text-gray-600 font-medium">
											Generated {new Date(generatedAt).toLocaleTimeString()}
										</span>
									)}
								</div>
							</div>
						</div>
						<button onClick={onClear} className="btn-secondary text-sm flex items-center space-x-2">
							<XMarkIcon className="w-4 h-4" />
							<span>Clear</span>
						</button>
					</div>
				</div>

				<div className="max-h-80 overflow-y-auto custom-scrollbar">
					{summaries.map((summary, index) => {
						const generatedCode = generatedCodes.get(summary.summaryId);
						const isLoadingCode = loadingCode.has(summary.summaryId);
						const codeError = codeErrors.get(summary.summaryId);

						return (
							<div
								key={summary.summaryId}
								className={`border-b border-gray-100 last:border-b-0 transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 ${
									index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
								}`}
							>
								{/* Summary Section */}
								<div className="p-6 group">
									<div className="flex items-start space-x-4">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 gradient-primary text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg">
												{index + 1}
											</div>
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-gray-900 text-lg leading-relaxed font-medium">
												{summary.summaryText}
											</p>
											<div className="mt-4 flex items-center justify-between">
												<span className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-lg">
													ID: {summary.summaryId.slice(0, 8)}...
												</span>
												<div className="flex items-center space-x-3">
													<button
														onClick={() => copySummary(summary.summaryText)}
														className="btn-secondary text-sm flex items-center space-x-2"
													>
														<DocumentDuplicateIcon className="w-4 h-4" />
														<span>Copy Summary</span>
													</button>
													<button
														onClick={() => generateTestCode(summary)}
														disabled={isLoadingCode}
														className="btn-success text-sm flex items-center space-x-2"
													>
														{isLoadingCode ? (
															<>
																<ArrowPathIcon className="w-4 h-4 animate-spin" />
																<span>Generating...</span>
															</>
														) : (
															<>
																<CodeBracketIcon className="w-4 h-4" />
																<span>Generate Code</span>
															</>
														)}
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Code Error Section */}
								{codeError && (
									<div className="px-6 pb-6">
										<div className="glass border-l-4 border-red-500 rounded-xl p-4">
											<div className="flex items-center">
												<ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3" />
												<div className="flex-1">
													<h5 className="font-bold text-red-800 mb-1">
														Code Generation Failed
													</h5>
													<span className="text-red-700 text-sm font-medium">
														{codeError}
													</span>
												</div>
												<button
													onClick={() => clearGeneratedCode(summary.summaryId)}
													className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-xl transition-all duration-300 hover-lift"
												>
													<XMarkIcon className="w-4 h-4" />
												</button>
											</div>
										</div>
									</div>
								)}

								{/* Generated Code Section */}
								{generatedCode && (
									<div className="border-t border-purple-200 glass-dark">
										<div className="px-6 py-4 border-b border-purple-200">
											<div className="flex items-center justify-between">
												<div className="flex items-center space-x-4">
													<div className="flex items-center space-x-2">
														<CheckCircleIcon className="w-5 h-5 text-green-500" />
														<span className="text-lg font-bold text-gray-900">
															Generated Test Code
														</span>
													</div>
													<div className="flex items-center space-x-3 text-sm">
														<span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
															{generatedCode.language}
														</span>
														<span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">
															{generatedCode.testFramework}
														</span>
														<span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-bold">
															{generatedCode.aiProvider}
														</span>
													</div>
												</div>
												<div className="flex items-center space-x-3">
													<button
														onClick={() => copyCode(generatedCode.code)}
														className="btn-primary text-sm flex items-center space-x-2"
													>
														<DocumentDuplicateIcon className="w-4 h-4" />
														<span>Copy Code</span>
													</button>
													<button
														onClick={() => clearGeneratedCode(summary.summaryId)}
														className="btn-secondary text-sm flex items-center space-x-2"
													>
														<XMarkIcon className="w-4 h-4" />
														<span>Clear</span>
													</button>
												</div>
											</div>
										</div>
										<div className="p-6">
											<pre className="bg-gray-900 text-gray-100 p-6 rounded-2xl text-sm overflow-x-auto shadow-professional-lg">
												<code className="language-javascript">{generatedCode.code}</code>
											</pre>
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>

				<div className="glass-dark border-t border-purple-200 px-8 py-6 rounded-b-3xl">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3 text-gray-700">
							<LightBulbIcon className="w-5 h-5 text-yellow-500" />
							<span className="font-medium">
								These are AI-generated suggestions. Review and adapt them for your specific testing
								needs.
							</span>
						</div>
						<button className="btn-primary flex items-center space-x-2">
							<CloudArrowDownIcon className="w-4 h-4" />
							<span>Export All</span>
						</button>
					</div>
				</div>
			</div>
			<Toast {...toast} onClose={hideToast} />
		</>
	);
};
