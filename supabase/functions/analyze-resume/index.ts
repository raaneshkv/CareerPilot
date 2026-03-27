import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText, fileName, roadmapTarget } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    const systemPrompt = `You are a career advisor AI. Analyze the resume text provided and return a structured JSON career roadmap. Return ONLY valid JSON with this exact structure:
{
  "summary": "Brief 1-2 sentence summary of the candidate's profile",
  "current_skills": ["skill1", "skill2"],
  "career_roles": ["role1", "role2"],
  "nodes": [
    {
      "id": "node-1",
      "title": "Short skill/topic title",
      "description": "Why this skill matters for the candidate's career goals",
      "currentLevel": 30,
      "targetLevel": 80,
      "category": "frontend|backend|devops|softskills|data|design",
      "concepts": ["concept1", "concept2", "concept3"],
      "resources": {
        "youtube": [{"label": "Channel/Video Name", "url": "https://..."}],
        "docs": [{"label": "Documentation Name", "url": "https://..."}],
        "github": [{"label": "Repo Name", "url": "https://..."}]
      }
    }
  ]
}

Rules:
- Provide 6-10 nodes ordered from most urgent to least urgent skill gap.
- currentLevel is the candidate's estimated proficiency (0-100) based on resume evidence.
- targetLevel is the recommended proficiency for career readiness (always > currentLevel).
- Provide 3-5 concepts per node.
- Provide at least 1 real, RECENT (from the last 1-2 years) and highly-rated resource per category (youtube, docs, github) with valid URLs. Do NOT suggest outdated resources or deprecated tutorials. Focus on modern standards.
- Provide 4-6 career_roles and all current_skills found in the resume.
- Be specific and actionable based on the resume content.
- Categories should reflect the skill domain accurately.`;

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
          { role: "user", content: roadmapTarget 
            ? `Generate a career roadmap from scratch specifically for this goal: ${roadmapTarget}` 
            : `Analyze this resume (file: ${fileName}):\n\n${resumeText}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let roadmap;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      roadmap = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    // Ensure nodes have status field
    if (roadmap.nodes) {
      roadmap.nodes = roadmap.nodes.map((node: any, i: number) => ({
        ...node,
        id: node.id || `node-${i + 1}`,
        status: "pending",
      }));
    }

    return new Response(JSON.stringify({ roadmap }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-resume error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
