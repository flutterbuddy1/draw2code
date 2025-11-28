import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateAppCode(prompt: string, canvasData: any, framework: string, language: string) {
  console.log('Generating app with Gemini:', { prompt, framework, language });

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const fullPrompt = `
    You are an expert frontend developer.
    Task: Generate a single HTML file containing the complete code for a web application based on the user's description and canvas data.
    
    User Description: ${prompt}
    Canvas Context: ${JSON.stringify(canvasData)}
    Target Framework: ${framework}
    Target Language: ${language}
    
    Requirements:
    - Output ONLY valid HTML code with embedded CSS (<style>) and JavaScript (<script>).
    - Use Tailwind CSS via CDN for styling: <script src="https://cdn.tailwindcss.com"></script>
    - Ensure the design is modern, clean, mobile friendly and responsive.
    - Do NOT include markdown code fences (like \`\`\`html). Just the raw code.
    - The app should be functional and interactive if requested.
    - All UI text, labels, and placeholders MUST be in ${language}.
    - If the framework is 'react' or 'vue', use the appropriate CDN and syntax for a single-file demo (e.g., React via Babel standalone).
  `;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown fences if present
    text = text.replace(/```html/g, '').replace(/```/g, '');

    return text;
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw new Error("Failed to generate code with Gemini");
  }
}
