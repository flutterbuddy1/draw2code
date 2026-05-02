import { GoogleGenerativeAI } from "@google/generative-ai";

// We'll use fetch for OpenAI to avoid dependency issues with the SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface SupabaseConfig {
  enabled: boolean;
  url: string;
  key: string;
}

export interface ApiEndpoint {
  method: string;
  url: string;
  desc: string;
}

export interface CustomApiConfig {
  endpoints: ApiEndpoint[];
}

export async function generateAppCode(
  prompt: string,
  canvasData: unknown,
  framework: string = 'react',
  language: string = 'english',
  supabaseConfig?: SupabaseConfig,
  customApiConfig?: CustomApiConfig
) {
  const provider = process.env.AI_PROVIDER || 'openai';
  const modelName = process.env.CODE_MODEL || (provider === 'openai' ? 'gpt-4o' : 'gemini-1.5-flash');

  console.log(`Generating app with ${provider} (${modelName}):`, { prompt, framework, language });

  const systemPrompt = `
    You are a world-class Senior Frontend Engineer and UI/UX Designer.
    Your goal is to create a STUNNING, premium, and fully functional web application based on the user's sketch/description.

    Design Principles:
    - Aesthetics: Use a modern, "Apple-like" or "SaaS premium" aesthetic. Use vibrant gradients, subtle shadows, and glassmorphism where appropriate.
    - Typography: Use "Inter" or "System-UI" fonts. Ensure clear hierarchy.
    - Colors: Use a curated color palette (e.g., Slate, Indigo, Violet). Avoid pure black/white; use deep grays and soft whites.
    - Spacing: Use generous whitespace and consistent padding.
    - Components: Use modern UI patterns. If the user asks for a button, make it look professional with hover states.

    Technical Requirements:
    - Output ONLY valid HTML code with embedded CSS (<style>) and JavaScript (<script>).
    - Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
    - Use Lucide Icons: <script src="https://unpkg.com/lucide@latest"></script>
    - If the framework is 'react', use React via CDN and Babel standalone.
    - Ensure the app is fully responsive (mobile, tablet, desktop).
    - All UI text must be in ${language}.
    - IMAGES: 
        - If the 'Canvas Data' contains shapes of type 'image', use their 'url' property for <img> tags.
        - If you need decorative images, use high-quality Unsplash URLs (e.g., https://images.unsplash.com/photo-...).
        - Use descriptive alt tags for all images.

    Context:
    - User Description: ${prompt}
    - Canvas Data (Spatial layout): ${JSON.stringify(canvasData)}

    ${supabaseConfig?.enabled ? `
    Supabase Integration:
    - URL: ${supabaseConfig.url}
    - Key: ${supabaseConfig.key}
    - Use @supabase/supabase-js via CDN. Initialize and implement logic.
    ` : ''}

    ${customApiConfig?.endpoints && customApiConfig.endpoints.length > 0 ? `
    Custom API Integration:
    ${customApiConfig.endpoints.map((e: ApiEndpoint) => `- ${e.method} ${e.url}: ${e.desc}`).join('\n')}
    ` : ''}

    Output Format:
    - Return ONLY the raw HTML code.
    - NO markdown fences (no \`\`\`html).
    - Ensure it is a single, copy-pasteable file that works instantly.
  `;

  try {
    if (provider === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const text = data.choices[0].message.content || "";
      return text.replace(/```html/g, '').replace(/```/g, '').trim();
    } else {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(systemPrompt + "\n\nUser Prompt: " + prompt);
      const response = await result.response;
      const text = response.text();
      return text.replace(/```html/g, '').replace(/```/g, '').trim();
    }
  } catch (error) {
    console.error("AI generation error:", error);
    throw error;
  }
}
