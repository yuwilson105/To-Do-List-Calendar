import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/connection";
import { TimeBlockStore } from "@/lib/db/time-block-store";
import type { TimeBlock } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { taskId: string; start: string; end: string };
    const block: TimeBlock = {
      taskId: body.taskId,
      start: new Date(body.start),
      end: new Date(body.end),
    };
    new TimeBlockStore(getDb()).insert(block);
    return NextResponse.json(block, { status: 201 });
  } catch (err) {
    console.error("[POST /api/time-blocks]", err);
    return NextResponse.json({ error: "Failed to create time block" }, { status: 500 });
  }
}
