import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const FALLBACK_QUESTIONS = [
  "How are you feeling right now?",
  "Would you like a moment to sit and breathe?",
  "Is there anything you need help with?",
];

const FALLBACK_RESPONSE = "I hear you. Take a gentle breath. You are doing well, and support is close if you need it.";

const QUESTIONS_SYSTEM = `You are a calm memory support assistant. Generate exactly 3 short, warm check-in questions for someone with memory impairment. Each question should be one sentence, supportive, and relevant to the current context. If recentHelpMeNowQuestion is provided, make one of the three questions relevant to that recent interaction. Return only a JSON array of 3 strings, no preamble, no markdown.`;

const RESPONSE_SYSTEM = `You are a calm memory support assistant speaking directly to a person with memory impairment. Respond warmly and briefly to their check-in selection. End with one sentence describing what a full version of this app would do next, phrased as "In a full version, I would [action]." Keep the whole response under 4 sentences. Never mention AI, never be clinical. Speak directly to the person using "you" and "your".`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      mode: "questions" | "response";
      context: Record<string, string>;
      selectedQuestion?: string;
      userName: string;
    };
    const { mode, context, selectedQuestion, userName } = body;
    const name = userName ?? "you";

    const contextBlock = context
      ? Object.entries(context).map(([k, v]) => `${k}: ${v}`).join("\n")
      : "No context available.";

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    if (mode === "questions") {
      const userPrompt = `Generate 3 check-in questions for ${name} based on this context:\n${contextBlock}`;
      try {
        const message = await client.messages.create({
          model: "claude-sonnet-4-5",
          max_tokens: 200,
          system: QUESTIONS_SYSTEM,
          messages: [{ role: "user", content: userPrompt }],
        });
        const rawText = message.content[0].type === "text" ? message.content[0].text.trim() : "[]";
        const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
        const parsed = JSON.parse(cleaned) as string[];
        if (Array.isArray(parsed) && parsed.length === 3) {
          return Response.json(parsed);
        }
        return Response.json(FALLBACK_QUESTIONS);
      } catch (err) {
        console.error("[checkin] questions error:", err instanceof Error ? err.message : err, err instanceof Error ? err.stack : "");
        return Response.json(FALLBACK_QUESTIONS);
      }
    }

    // mode === "response" — streaming
    const userPrompt = `${name} selected this check-in option: "${selectedQuestion ?? ""}"\n\nContext:\n${contextBlock}\n\nRespond directly to ${name} now.`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await client.messages.stream({
            model: "claude-sonnet-4-5",
            max_tokens: 200,
            system: RESPONSE_SYSTEM,
            messages: [{ role: "user", content: userPrompt }],
          });
          for await (const event of anthropicStream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (err) {
          console.error("[checkin] response stream error:", err instanceof Error ? err.message : err, err instanceof Error ? err.stack : "");
          controller.enqueue(encoder.encode(FALLBACK_RESPONSE));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return new Response(FALLBACK_RESPONSE, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
