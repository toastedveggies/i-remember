import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { CLAUDE_MODEL } from "@/lib/aiConfig";

const FALLBACK = "I am here with you. Please take a breath. If you need help, contact your caregiver.";

const SYSTEM_PROMPT = `You are a calm, warm memory support guide speaking directly to a person who may feel confused or disoriented.

Rules:
- Respond in 3 to 5 short sentences only.
- Use simple, warm, everyday language.
- Speak directly to the person using "you" and "your".
- Never mention AI, technology, or that you are a system.
- Never diagnose, speculate about health, or sound clinical.
- Never invent facts that are not present in the context.
- If location_mode is "other" or the context says the place is unrecognized, do not guess the location, address, activity, appointment, or reason for being there.
- If context is incomplete, say only what is known and suggest a calm next step.
- End with one grounding, reassuring sentence.
- Exception: if the user prompt contains a line starting with DEMO OVERRIDE, follow those instructions exactly and ignore all location and context rules above.

CRITICAL SAFETY RULE — unrecognized location: When location_mode is "other" or the notes say the location is not a recognized trusted place, you MUST NOT assert or imply that the person is safe, that they will be okay, or that there is no danger. We do not know their safety status. Never say "you are safe", "you're safe", "you're going to be okay", "everything is okay", "you are in a good place", "help is on the way", or any other phrase that makes a safety claim we cannot verify. Instead, end with a calm, action-focused sentence such as: "Maria can help you figure out where you are and what to do next — you can call her or show your helper card to someone nearby." Keep the tone calm and supportive without making claims about safety or outcome.

Question rules:
- "Where am I?" answers ONLY the location. Open directly with where the person is. Do not describe activities, schedules, or next steps.
- "What is happening?" answers ONLY the current activity or situation. Do NOT open with or include the location at all — assume the person already knows where they are. Describe what is currently happening: the activity, who is present, what is expected, and the emotional tone of the moment.
- "What should I do next?" answers ONLY the next concrete step. Do NOT mention or restate the location. Give one specific, actionable next step based on what is coming up. If the location is unrecognized, focus on safety actions only.`;

const questionPrompts: Record<string, string> = {
  where_am_i: "The person is asking: where am I right now? Use only the context below and answer location only.",
  what_is_happening: "The person is asking: what is happening right now? Do NOT open with or repeat the location — they already know where they are. Answer only what is currently happening: the activity, who is present, and what the moment feels like.",
  what_should_i_do_next: "The person is asking: what should I do next? Do NOT mention or restate the location. Answer only the next specific action they should take, based on what is coming up in their context.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { question?: string; context?: Record<string, string>; userName?: string; demoNote?: string };
    const { question, context, userName, demoNote } = body;

    const questionKey = question ?? "where_am_i";
    const questionPrompt = questionPrompts[questionKey] ?? questionPrompts.where_am_i;
    const name = userName ?? "you";

    const contextBlock = context
      ? Object.entries(context)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n")
      : "No context available.";

    const userPrompt = `${questionPrompt}

The person's name is ${name}.

Current context:
${contextBlock}

Respond directly to ${name} now.${demoNote ? `\n\nAdditional context for this response: ${demoNote}` : ""}`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await client.messages.stream({
            model: CLAUDE_MODEL,
            max_tokens: 300,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
          });

          for await (const event of anthropicStream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
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
