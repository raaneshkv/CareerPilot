import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 25000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callAI(systemPrompt: string, maxRetries = 2): Promise<Response> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("API key not configured");

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Evaluate this answer." },
            ],
          }),
        },
        25000
      );

      if (response.status === 429 || response.status === 402) return response;
      if (response.ok) return response;

      lastError = new Error(`AI gateway returned ${response.status}`);
      console.error(`Attempt ${attempt + 1} failed:`, response.status);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      console.error(`Attempt ${attempt + 1} error:`, lastError.message);
    }

    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastError || new Error("AI call failed after retries");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, answer, questionType, role } = await req.json();

    const systemPrompt = `You are evaluating a candidate's interview answer for the role: ${role}.

Question type: ${questionType}
Question: ${question}
Answer: ${answer}

Evaluate on:
- Technical depth (0–10): How well does the answer demonstrate technical knowledge?
- Clarity (0–10): How clear and easy to understand is the answer?
- Structure (0–10): How well organized and structured is the answer?

Return ONLY valid JSON, no markdown:
{
  "technical_score": 7,
  "clarity_score": 8,
  "structure_score": 6,
  "feedback": "Detailed improvement suggestions in 2-3 sentences."
}`;

    const response = await callAI(systemPrompt);

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let evaluation;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse:", content);
      // Return fallback scores instead of failing
      evaluation = {
        technical_score: 5,
        clarity_score: 5,
        structure_score: 5,
        feedback: "Evaluation could not be fully processed. Default scores applied.",
      };
    }

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate-answer error:", e);
    // Return fallback instead of 500 to keep interview flowing
    return new Response(
      JSON.stringify({
        technical_score: 5,
        clarity_score: 5,
        structure_score: 5,
        feedback: "Evaluation timed out. Default scores applied.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
