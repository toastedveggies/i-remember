import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const FALLBACK_QUESTIONS = [
  "How are you feeling right now?",
  "Would you like a moment to sit and breathe?",
  "Is there anything you need help with?",
];

const FALLBACK_RESPONSE = "I hear you. Take a gentle breath. You are doing well, and support is close if you need it.";

const QUESTIONS_SYSTEM = `You are a calm memory support guide. Generate exactly 3 short, warm check-in questions for someone who may feel confused or unsettled. Each question should be one sentence, supportive, and relevant to the current context. If recentHelpMeNowQuestion is provided, make one question relevant to that recent interaction. Return only a JSON array of 3 strings.`;

const RESPONSE_SYSTEM = `You are a calm memory support guide speaking directly to a person who may feel confused or unsettled. Respond warmly and briefly to their selected check-in question. Keep the whole response under 4 sentences. End with one sentence phrased exactly like "In a full version, I would [action]." Never mention AI or be clinical.`;

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
      ? Object.entries(context).map(([key, value]) => `${key}: ${value}`).join("\n")
      : "No context available.";

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    if (mode === "questions") {
      const userPrompt = `Generate 3 check-in questions for ${name} based on this context:\n${contextBlock}`;
      try {
        const message = await client.messages.create({
          model: "claude-3-5-haiku-latest",
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
      } catch (error) {
        console.error("[checkin] questions error:", error instanceof Error ? error.message : error);
        return Response.json(FALLBACK_QUESTIONS);
      }
    }

    const userPrompt = `${name} selected this check-in option: "${selectedQuestion ?? ""}"\n\nContext:\n${contextBlock}\n\nRespond directly to ${name} now.`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await client.messages.stream({
            model: "claude-3-5-haiku-latest",
            max_tokens: 200,
            system: RESPONSE_SYSTEM,
            messages: [{ role: "user", content: userPrompt }],
          });
          for await (const event of anthropicStream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (error) {
          console.error("[checkin] response stream error:", error instanceof Error ? error.message : error);
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
