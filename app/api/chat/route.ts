import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "N8N_WEBHOOK_URL is not set" },
        { status: 500 }
      );
    }

    const r = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: body.session_id || body.sessionId,
        message: body.message || body.content,
      }),
    });

    const data = await r.json();

    // ⭐ ดึงเฉพาะ reply ที่เราต้องการ
    return NextResponse.json(
      {
        role: "assistant",
        content: data.reply ?? "ไม่สามารถตอบกลับได้",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("API /chat error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
