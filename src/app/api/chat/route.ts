import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies chat messages server-side to the existing Lagi Worker
 * (fiji-chat-widget). DiscoverFiji.ai does not run its own AI brain —
 * this calls the SAME endpoint every other partner site uses, in
 * "public" mode (site_id: 'lagi_public'), which already includes:
 *   - RAG search across Lagi's full Vectorize knowledge base
 *   - Heat scoring + automatic D1 lead capture
 *   - Partner directory routing + WhatsApp referral buttons
 *   - Email/WhatsApp notification to the matched partner
 * None of that needs to be rebuilt here. See Session 46 decision log.
 *
 * Calling server-side (not from the browser) sidesteps the Worker's
 * ALLOWED_ORIGINS allow-list entirely — no Worker changes needed to ship this.
 */

const LAGI_WORKER_URL = "https://fiji-chat-widget.helpronline.workers.dev/";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  let body: { messages?: ChatMessage[]; session_id?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { messages, session_id } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Missing messages." }, { status: 400 });
  }

  try {
    const lagiResponse = await fetch(LAGI_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Server-to-server call — Origin header isn't browser-controlled here,
        // but Lagi's CORS check only applies to browser-originated requests anyway.
      },
      body: JSON.stringify({
        messages,
        site_id: "lagi_public",
        partner_id: null,
        session_id: session_id || `discoverfiji_${Date.now()}`,
      }),
    });

    const data = await lagiResponse.json();

    if (!lagiResponse.ok) {
      return NextResponse.json(
        { error: "Lagi is temporarily unavailable.", detail: data },
        { status: lagiResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Lagi proxy error:", err);
    return NextResponse.json(
      {
        type: "error",
        message:
          "Sorry, I'm having trouble connecting right now. Please WhatsApp us instead.",
        whatsappUrl: "https://wa.me/61478886145",
      },
      { status: 502 }
    );
  }
}
