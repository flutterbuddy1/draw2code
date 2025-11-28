import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateAppCode(
  prompt: string,
  canvasData: any,
  framework: string = 'react',
  language: string = 'english',
  supabaseConfig?: any,
  customApiConfig?: any
) {
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

    ${supabaseConfig?.enabled ? `
    IMPORTANT: SUPABASE INTEGRATION REQUIRED
    - The user wants to use Supabase for backend features.
    - Initialize the Supabase client using:
      const supabaseUrl = '${supabaseConfig.url}';
      const supabaseKey = '${supabaseConfig.key}';
      const supabase = supabase.createClient(supabaseUrl, supabaseKey);
    - Use the @supabase/supabase-js library from CDN: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
    - Implement the requested features using this client (e.g., auth, database queries).
    ` : ''}

    ${customApiConfig?.endpoints?.length > 0 ? `
    IMPORTANT: USE CUSTOM API ENDPOINTS
    - The user has provided specific API endpoints to use.
    - Do NOT mock data if a relevant endpoint is available.
    - Available Endpoints:
    ${customApiConfig.endpoints.map((e: any) => `- ${e.method} ${e.url}: ${e.desc}`).join('\n')}
    ` : ''}
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
