import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type TaskPayload = {
  taskId: string;
  title: string;
  summary: string;
  budget: string;
  deadline?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<TaskPayload>;

    if (!body.taskId || !body.title || !body.summary || !body.budget) {
      return NextResponse.json(
        { error: "Missing taskId, title, summary, or budget" },
        { status: 400 }
      );
    }

    const broadcastPayload = {
      taskId: body.taskId,
      title: body.title,
      summary: body.summary,
      budget: body.budget,
      deadline: body.deadline ?? null,
      createdAt: new Date().toISOString(),
    };

    // TODO (Gensyn AXL SDK):
    // 1) Initialize the AXL client and connect to the P2P network.
    // 2) Broadcast `broadcastPayload` on the marketplace discovery topic.
    // Example (pseudo):
    // const axl = await createAxlClient({ apiKey: process.env.GENSYN_API_KEY });
    // await axl.broadcast("agentic-ocean.tasks", broadcastPayload);

    const placeholderBroadcastId = "axl-broadcast-placeholder";

    return NextResponse.json({ ok: true, broadcastId: placeholderBroadcastId });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to broadcast task" },
      { status: 500 }
    );
  }
}
