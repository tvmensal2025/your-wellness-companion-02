/**
 * Centralized OpenAI client for edge functions
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export interface ChatCompletionOptions {
  model?: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "text" | "json_object";
}

export interface ChatCompletionResult {
  success: boolean;
  content?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

/**
 * Get OpenAI API key from environment
 */
function getOpenAIKey(): string {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }
  return apiKey;
}

/**
 * Call OpenAI Chat Completions API
 */
export async function chatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResult> {
  try {
    const apiKey = getOpenAIKey();

    const payload: Record<string, unknown> = {
      model: options.model || "gpt-4o-mini",
      messages: options.messages,
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature ?? 0.7,
    };

    if (options.responseFormat === "json_object") {
      payload.response_format = { type: "json_object" };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    const choice = result.choices?.[0];

    return {
      success: true,
      content: choice?.message?.content || "",
      usage: result.usage
        ? {
            promptTokens: result.usage.prompt_tokens,
            completionTokens: result.usage.completion_tokens,
            totalTokens: result.usage.total_tokens,
          }
        : undefined,
    };
  } catch (error) {
    console.error("OpenAI API exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Analyze an image using OpenAI Vision
 */
export async function analyzeImage(
  imageUrl: string,
  prompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
    systemPrompt?: string;
  }
): Promise<ChatCompletionResult> {
  const messages: ChatMessage[] = [];

  if (options?.systemPrompt) {
    messages.push({ role: "system", content: options.systemPrompt });
  }

  messages.push({
    role: "user",
    content: [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: imageUrl } },
    ],
  });

  return chatCompletion({
    model: options?.model || "gpt-4o",
    messages,
    maxTokens: options?.maxTokens || 4000,
  });
}

/**
 * Generate structured JSON response from OpenAI
 */
export async function generateJSON<T>(
  prompt: string,
  systemPrompt?: string,
  options?: {
    model?: string;
    maxTokens?: number;
  }
): Promise<{ success: boolean; data?: T; error?: string }> {
  const messages: ChatMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  messages.push({ role: "user", content: prompt });

  const result = await chatCompletion({
    model: options?.model || "gpt-4o-mini",
    messages,
    maxTokens: options?.maxTokens || 2000,
    responseFormat: "json_object",
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  try {
    const data = JSON.parse(result.content || "{}") as T;
    return { success: true, data };
  } catch (parseError) {
    return { success: false, error: "Failed to parse JSON response" };
  }
}
