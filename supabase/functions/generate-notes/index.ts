import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notes, type, file, fileMimeType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    const tools: any[] = [];
    let tool_choice: any = undefined;

    if (type === "summary") {
      systemPrompt = `You are a study assistant. Given student notes, create a concise summary of exactly 8-10 bullet points that captures the most important concepts. Each bullet should be clear, complete, and useful for exam revision.`;
      tools.push({
        type: "function",
        function: {
          name: "create_summary",
          description: "Return a structured summary of the notes",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "A short title for the notes topic" },
              bullets: {
                type: "array",
                items: { type: "string" },
                description: "8-10 concise bullet point summaries",
              },
              keyTopics: {
                type: "array",
                items: { type: "string" },
                description: "3-5 key topic names extracted from the notes",
              },
            },
            required: ["title", "bullets", "keyTopics"],
            additionalProperties: false,
          },
        },
      });
      tool_choice = { type: "function", function: { name: "create_summary" } };
    } else if (type === "quiz") {
      systemPrompt = `You are a quiz generator for students. Given study notes, generate exactly 10 multiple-choice questions. Each question must have exactly 4 options (A, B, C, D) with exactly one correct answer. Questions should test understanding, not just memorization. Cover different topics from the notes. Each question should be associated with a topic from the notes.`;
      tools.push({
        type: "function",
        function: {
          name: "create_quiz",
          description: "Return a structured quiz with 10 MCQ questions",
          parameters: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    options: {
                      type: "array",
                      items: { type: "string" },
                      description: "Exactly 4 options",
                    },
                    correctIndex: {
                      type: "number",
                      description: "Index (0-3) of the correct option",
                    },
                    topic: { type: "string", description: "The topic this question covers" },
                  },
                  required: ["question", "options", "correctIndex", "topic"],
                  additionalProperties: false,
                },
              },
            },
            required: ["questions"],
            additionalProperties: false,
          },
        },
      });
      tool_choice = { type: "function", function: { name: "create_quiz" } };
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build user message: either text notes or a file (multimodal)
    let userContent: any;
    if (file && fileMimeType) {
      // Multimodal: send the document as inline data + instruction
      userContent = [
        {
          type: "text",
          text: notes
            ? `Here are additional notes context:\n${notes}\n\nPlease also analyze the uploaded document.`
            : "Please analyze the uploaded document and use its content.",
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${fileMimeType};base64,${file}`,
          },
        },
      ];
    } else {
      userContent = notes;
    }

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
          { role: "user", content: userContent },
        ],
        tools,
        tool_choice,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-notes error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
