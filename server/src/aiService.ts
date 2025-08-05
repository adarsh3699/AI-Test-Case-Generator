import { GoogleGenerativeAI } from "@google/generative-ai";
import { FileInput, TestSummary, GenerateCodeRequest } from "./types";

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private isConfigured: boolean = false;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.isConfigured = true;
      console.log("✅ Google Gemini AI integration enabled");
    } else {
      console.error("❌ GEMINI_API_KEY not found. AI features will not work.");
    }
  }

  /**
   * Generate test case summaries using AI
   */
  async generateTestSummaries(
    files: FileInput[]
  ): Promise<{ summaries: TestSummary[]; aiProvider: string }> {
    if (!this.isConfigured || !this.genAI) {
      throw new Error(
        "AI service not configured. Please set GEMINI_API_KEY in environment variables."
      );
    }

    return await this.generateWithGemini(files);
  }

  /**
   * Generate summaries using Google Gemini
   */
  private async generateWithGemini(
    files: FileInput[]
  ): Promise<{ summaries: TestSummary[]; aiProvider: string }> {
    const model = this.genAI!.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = this.buildPrompt(files);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the AI response to extract test summaries
    const summaries = this.parseAIResponse(text);

    return {
      summaries,
      aiProvider: "Google Gemini",
    };
  }

  /**
   * Build a comprehensive prompt for the AI
   */
  private buildPrompt(files: FileInput[]): string {
    const fileContents = files
      .map(
        (file) => `
**File: ${file.filename}**
\`\`\`
${file.content.slice(0, 2000)}${
          file.content.length > 2000 ? "... (truncated)" : ""
        }
\`\`\`
    `
      )
      .join("\n");

    return `You are a senior software engineer tasked with creating comprehensive test case summaries for the provided code files.

**Instructions:**
1. Analyze each file and understand its functionality
2. Generate 3-5 test case summaries per significant function/component
3. Focus on edge cases, error handling, and common user scenarios
4. Return ONLY a JSON array of test summaries in this exact format:
[
  {"summaryId": "unique-id-1", "summaryText": "Test summary description"},
  {"summaryId": "unique-id-2", "summaryText": "Test summary description"}
]

**Code Files to Analyze:**
${fileContents}

**Response Requirements:**
- Return ONLY valid JSON array
- Each summaryId should be unique (use format: test-{filename}-{number})
- Each summaryText should be 1-2 sentences describing a specific test case
- Focus on testing logic, edge cases, error conditions, and user interactions
- Do not include any explanation or additional text outside the JSON

Generate the test case summaries now:`;
  }

  /**
   * Parse AI response to extract test summaries
   */
  private parseAIResponse(text: string): TestSummary[] {
    try {
      // Clean the response text
      const cleanText = text.trim();

      // Try to extract JSON from the response
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);

        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item) =>
              item &&
              typeof item.summaryId === "string" &&
              typeof item.summaryText === "string"
          );
        }
      }

      // Fallback: try to parse the entire response as JSON
      const parsed = JSON.parse(cleanText);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item) =>
            item &&
            typeof item.summaryId === "string" &&
            typeof item.summaryText === "string"
        );
      }

      throw new Error("Invalid JSON structure");
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      console.log("Raw AI response:", text);

      // Return a single summary indicating parsing failure
      return [
        {
          summaryId: "parse-error-1",
          summaryText:
            "AI generated response but failed to parse. Please try again or check the selected files.",
        },
      ];
    }
  }

  /**
   * Generate test code for a specific test summary
   */
  async generateTestCode(request: GenerateCodeRequest): Promise<{
    code: string;
    language: string;
    testFramework: string;
    aiProvider: string;
  }> {
    if (!this.isConfigured || !this.genAI) {
      throw new Error(
        "AI service not configured. Please set GEMINI_API_KEY in environment variables."
      );
    }

    return await this.generateCodeWithGemini(request);
  }

  /**
   * Generate test code using Google Gemini
   */
  private async generateCodeWithGemini(request: GenerateCodeRequest): Promise<{
    code: string;
    language: string;
    testFramework: string;
    aiProvider: string;
  }> {
    const model = this.genAI!.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = this.buildCodePrompt(request);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the AI response to extract test code
    const codeResult = this.parseCodeResponse(text, request);

    return {
      ...codeResult,
      aiProvider: "Google Gemini",
    };
  }

  /**
   * Build a prompt for test code generation
   */
  private buildCodePrompt(request: GenerateCodeRequest): string {
    const { summaryText, fileContent, filename } = request;

    // Detect file type and determine appropriate test framework
    const fileExtension = filename?.toLowerCase().split(".").pop() || "";
    const isReact =
      fileContent.includes("React") ||
      fileExtension === "tsx" ||
      fileExtension === "jsx";
    const isTypeScript = fileExtension === "ts" || fileExtension === "tsx";
    const isJavaScript = fileExtension === "js" || fileExtension === "jsx";
    const isPython = fileExtension === "py";

    let framework = "Jest";
    let language = "JavaScript";

    if (isReact) {
      framework = "Jest + React Testing Library";
    }
    if (isTypeScript) {
      language = "TypeScript";
    }
    if (isPython) {
      framework = "pytest";
      language = "Python";
    }

    return `You are an expert test engineer. Generate comprehensive test code for the following scenario.

**Test Requirement:**
${summaryText}

**Source Code to Test:**
\`\`\`${language.toLowerCase()}
${fileContent.slice(0, 3000)}${
      fileContent.length > 3000 ? "\n... (truncated)" : ""
    }
\`\`\`

**Instructions:**
1. Generate complete, runnable test code using ${framework}
2. Follow ${language} best practices and conventions
3. Include proper imports and setup
4. Add descriptive test names and comments
5. Cover the scenario described in the test requirement
6. Include assertions that verify expected behavior
7. Add any necessary mocks or test utilities

**Response Format:**
Return ONLY the test code without any explanation or markdown formatting. Start directly with the imports/code.

**Language**: ${language}
**Framework**: ${framework}
**File**: ${filename || "unknown"}

Generate the test code now:`;
  }

  /**
   * Parse AI response to extract test code
   */
  private parseCodeResponse(
    text: string,
    request: GenerateCodeRequest
  ): {
    code: string;
    language: string;
    testFramework: string;
  } {
    // Clean the response text
    let cleanCode = text.trim();

    // Remove markdown code blocks if present
    cleanCode = cleanCode.replace(/^```[\w]*\n/, "").replace(/\n```$/, "");

    // Determine language and framework from file extension
    const fileExtension =
      request.filename?.toLowerCase().split(".").pop() || "";
    const isTypeScript = fileExtension === "ts" || fileExtension === "tsx";
    const isReact =
      request.fileContent.includes("React") ||
      fileExtension === "tsx" ||
      fileExtension === "jsx";
    const isPython = fileExtension === "py";

    let language = "JavaScript";
    let testFramework = "Jest";

    if (isPython) {
      language = "Python";
      testFramework = "pytest";
    } else if (isTypeScript) {
      language = "TypeScript";
      testFramework = isReact ? "Jest + React Testing Library" : "Jest";
    } else if (isReact) {
      testFramework = "Jest + React Testing Library";
    }

    return {
      code: cleanCode,
      language,
      testFramework,
    };
  }

  /**
   * Check if AI service is properly configured
   */
  isAIConfigured(): boolean {
    return this.isConfigured;
  }
}
