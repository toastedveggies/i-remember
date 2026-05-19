import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const FALLBACK = "I am here with you. Please take a breath. If you need help, contact Maria.";

const SYSTEM_PROMPT = `You are a calm, warm memory support assistant speaking directly to a person who may feel confused or disoriented. Your only job is to gently ground them in the present moment using the context provided.

Rules you must follow:
- Respond in 3 to 5 short sentences only. Never longer.
- Use simple, warm, everyday language. No clinical terms.
- Speak directly to the person: use "you" and "your".
- Never mention AI, technology, or that you are an assistant.
- Never diagnose or suggest medical concerns.
- Never mention memory loss, dementia, or any condition directly.
- Never invent facts not present in the context.
- If context is incomplete, acknowledge what is known and suggest contacting the caregiver.
- End with one grounding, reassuring sentence.`;

const questionPrompts: Record<string, string> = {
  where_am_i: "The person is asking: where am I right now? Using only the context below, tell them clearly and warmly where they are.",
  what_is_happening: "The person is asking: what is happening right now? Using only the context below, tell them what time of day it is and what is going on.",
  what_should_i_do_next: "The person is asking: what should I do next? Using only the context below, give them one clear, simple next step.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { question?: string; context?: Record<string, string>; userName?: string };
    const { question, context, userName } = body;

    const questionKey = question ?? "where_am_i";
    const questionPrompt = questionPrompts[questionKey] ?? questionPrompts.where_am_i;
    const name = userName ?? "you";

    const contextBlock = context
      ? Object.entries(context)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n")
      : "No context available.";

    const userPrompt = `${questionPrompt}

The person's name is ${name}.

Current context:
${contextBlock}

Respond directly to ${name} now.`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await client.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 300,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
          });

          for await (const event of anthropicStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch {
          controller.enqueue(encoder.encode(FALLBACK));
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
    return new Response(FALLBACK, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
