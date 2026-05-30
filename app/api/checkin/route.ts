import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { CLAUDE_MODEL } from "@/lib/aiConfig";

const FALLBACK_QUESTIONS = [
  "How are you feeling right now?",
  "Would you like a moment to sit and breathe?",
  "Is there anything you need help with?",
];

const FALLBACK_RESPONSE = "I hear you. Take a gentle breath. You are doing well, and support is close if you need it.";

const QUESTIONS_SYSTEM = `You are a calm memory support guide. Generate exactly 3 short, warm check-in questions for someone who may feel confused or unsettled. Each question should be one sentence, supportive, and relevant to the current context. If recentHelpMeNowQuestion is provided, make one question relevant to that recent interaction. Return only a JSON array of 3 strings.`;

const RESPONSE_SYSTEM = `You are a calm memory support guide speaking directly to a person who may feel confused or unsettled. Respond warmly and briefly to their selected check-in question. Keep the whole response under 4 sentences. End with one sentence phrased exactly like "In a full version, I would [action]." Never mention AI or be clinical.`;

const PACKET_SYSTEM = `You are Claira, a warm cognitive support companion for a person with memory impairment. Generate exactly 3 short warm check-in questions specific to the provided context. Each question gauges emotional readiness or awareness of what is happening. For each question also generate exactly 3 response label options: one positive and ready (with a 😊 emoji), one uncertain or unsure (with a 🤔 emoji), one confused or disoriented (with a 😳 emoji). Keep labels short — under 8 words each. Return only valid JSON with no markdown fences matching this exact structure: [{"id":"q1","text":"...","responses":{"positive":"...","uncertain":"...","confused":"..."}},{"id":"q2",...},{"id":"q3",...}]`;

const BRANCH_SYSTEM = `You are Claira, a warm cognitive support companion speaking directly to a person with memory impairment. The person just selected a check-in response indicating they feel BRANCH_TYPE. Respond with 2 to 3 short warm sentences. If branch is uncertain: reassure them it is okay and mention that you can show them the upcoming details. If branch is confused: gently remind them of what is coming up using the context and offer to show the details. End every response by asking if they would like to see the details. Never mention AI. Never be clinical.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      mode: "packet" | "branch" | "questions" | "response";
      context: Record<string, string>;
      selectedQuestion?: string;
      selectedResponse?: string;
      branch?: "uncertain" | "confused";
      userName: string;
    };
    const { mode, context, selectedQuestion, selectedResponse, branch, userName } = body;
    const name = userName ?? "you";

    const contextBlock = context
      ? Object.entries(context).map(([key, value]) => `${key}: ${value}`).join("\n")
      : "No context available.";

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    if (mode === "questions") {
      const userPrompt = `Generate 3 check-in questions for ${name} based on this context:\n${contextBlock}`;
      try {
        const message = await client.messages.create({
          model: CLAUDE_MODEL,
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

    if (mode === "packet") {
      const packetFallback = [
        { id: "q1", text: "How are you feeling right now?", responses: { positive: "Feeling good 😊", uncertain: "A bit unsure 🤔", confused: "Not sure 😳" } },
        { id: "q2", text: "Do you know what is coming up next?", responses: { positive: "Yes I do 😊", uncertain: "Kind of, not sure 🤔", confused: "No idea 😳" } },
        { id: "q3", text: "Is there anything on your mind?", responses: { positive: "All good 😊", uncertain: "A little worried 🤔", confused: "Feeling confused 😳" } },
      ];
      try {
        const message = await client.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 400,
          system: PACKET_SYSTEM,
          messages: [{ role: "user", content: `Generate a check-in packet for ${name} based on this context:\n${contextBlock}` }],
        });
        const rawText = message.content[0].type === "text" ? message.content[0].text.trim() : "[]";
        const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
        const parsed = JSON.parse(cleaned) as unknown[];
        if (Array.isArray(parsed) && parsed.length === 3) {
          return Response.json(parsed);
        }
        return Response.json(packetFallback);
      } catch (error) {
        console.error("[checkin] packet error:", error instanceof Error ? error.message : error);
        return Response.json(packetFallback);
      }
    }

    if (mode === "branch") {
      const branchSystem = BRANCH_SYSTEM.replace("BRANCH_TYPE", branch ?? "uncertain");
      const branchPrompt = `${name} responded to the check-in question '${selectedQuestion ?? ""}' by selecting '${selectedResponse ?? ""}'. Context:\n${contextBlock}\n\nRespond to ${name} now.`;
      const encoder = new TextEncoder();
      const branchStream = new ReadableStream({
        async start(controller) {
          try {
            const anthropicStream = await client.messages.stream({
              model: CLAUDE_MODEL,
              max_tokens: 200,
              system: branchSystem,
              messages: [{ role: "user", content: branchPrompt }],
            });
            for await (const event of anthropicStream) {
              if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
                controller.enqueue(encoder.encode(event.delta.text));
              }
            }
          } catch (error) {
            console.error("[checkin] branch stream error:", error instanceof Error ? error.message : error);
            controller.enqueue(encoder.encode(FALLBACK_RESPONSE));
          } finally {
            controller.close();
          }
        },
      });
      return new Response(branchStream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
          "Cache-Control": "no-cache",
        },
      });
    }

    const userPrompt = `${name} selected this check-in option: "${selectedQuestion ?? ""}"\n\nContext:\n${contextBlock}\n\nRespond directly to ${name} now.`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await client.messages.stream({
            model: CLAUDE_MODEL,
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
