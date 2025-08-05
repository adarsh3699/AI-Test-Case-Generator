import React, { useState } from "react";
import type { TestSummary, GenerateCodeRequest } from "../types";
import { apiService, handleApiError } from "../services/api";
import { Toast } from "./Toast";
import { useToast } from "../hooks/useToast";

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
  const [generatedCodes, setGeneratedCodes] = useState<
    Map<string, GeneratedCode>
  >(new Map());
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

        setGeneratedCodes(
          (prev) => new Map(prev.set(summary.summaryId, newCode))
        );
        showSuccess(
          `Test code generated successfully for "${summary.summaryText.slice(
            0,
            50
          )}..."`
        );
      } else {
        throw new Error("Failed to generate test code");
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setCodeErrors(
        (prev) => new Map(prev.set(summary.summaryId, errorMessage))
      );
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
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy code:", error);
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
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3"></div>
          <span className="text-gray-600">Generating test summaries...</span>
        </div>
        <p className="text-sm text-gray-500 text-center mt-2">
          This may take a few moments while AI analyzes your files
        </p>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-6">
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Test Summaries Yet
          </h3>
          <p className="text-sm">
            Select files and click "Generate Test Summaries" to see AI-powered
            test suggestions
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-300 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                AI Test Summaries
              </h3>
              <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                <span>{summaries.length} suggestions</span>
                {aiProvider && (
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    {aiProvider}
                  </span>
                )}
                {generatedAt && (
                  <span>
                    Generated {new Date(generatedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClear}
              className="text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-1 rounded transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {summaries.map((summary, index) => {
            const generatedCode = generatedCodes.get(summary.summaryId);
            const isLoadingCode = loadingCode.has(summary.summaryId);
            const codeError = codeErrors.get(summary.summaryId);

            return (
              <div
                key={summary.summaryId}
                className={`border-b border-gray-100 last:border-b-0 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                {/* Summary Section */}
                <div className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm leading-relaxed">
                        {summary.summaryText}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-mono">
                          ID: {summary.summaryId}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyCode(summary.summaryText)}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                          >
                            Copy Summary
                          </button>
                          <button
                            onClick={() => generateTestCode(summary)}
                            disabled={isLoadingCode}
                            className="text-xs bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 px-3 py-1 rounded transition-colors flex items-center"
                          >
                            {isLoadingCode ? (
                              <>
                                <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-1"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                  />
                                </svg>
                                Generate Code
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
                  <div className="px-4 pb-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-red-400 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-red-800 text-xs">
                          {codeError}
                        </span>
                        <button
                          onClick={() => clearGeneratedCode(summary.summaryId)}
                          className="ml-auto text-red-600 hover:text-red-800"
                        >
                          <svg
                            className="w-3 h-3"
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
                      </div>
                    </div>
                  </div>
                )}

                {/* Generated Code Section */}
                {generatedCode && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-gray-900">
                              Generated Test Code
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {generatedCode.language}
                            </span>
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              {generatedCode.testFramework}
                            </span>
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {generatedCode.aiProvider}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyCode(generatedCode.code)}
                            className="text-xs bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded transition-colors flex items-center"
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            Copy Code
                          </button>
                          <button
                            onClick={() =>
                              clearGeneratedCode(summary.summaryId)
                            }
                            className="text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                        <code className="language-javascript">
                          {generatedCode.code}
                        </code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-gray-50 px-4 py-3 border-t border-gray-300 rounded-b-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              💡 These are AI-generated suggestions. Review and adapt them for
              your specific testing needs.
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Export All
            </button>
          </div>
        </div>
      </div>
      <Toast {...toast} onClose={hideToast} />
    </>
  );
};
