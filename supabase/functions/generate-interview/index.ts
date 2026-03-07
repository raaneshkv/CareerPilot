import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { role, skills, resumeText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    const systemPrompt = `You are an experienced interviewer for the role: ${role}.

Based on the candidate's skills: ${(skills || []).join(", ")}
And their resume content.

Generate exactly 8 structured interview questions covering technical, behavioral, and HR topics.
Mix difficulties: 2 easy, 4 medium, 2 hard.

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {
    "question": "The interview question text",
    "type": "technical",
    "difficulty": "medium"
  }
]

Rules:
- "type" must be one of: "technical", "behavioral", "hr"
- "difficulty" must be one of: "easy", "medium", "hard"
- Questions should be specific to the role and skills provided
- Technical questions should test real knowledge, not trivia
- Behavioral questions should use STAR method format
- Exactly 8 questions`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate interview questions for a ${role} candidate.\n\nResume:\n${resumeText || "No resume provided."}` },
        ],
      }),
    });

    if (!response.ok) {
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
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let questions;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      questions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse:", content);
      throw new Error("Failed to parse AI response");
    }

    if (!Array.isArray(questions)) throw new Error("Invalid response format");

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-interview error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
