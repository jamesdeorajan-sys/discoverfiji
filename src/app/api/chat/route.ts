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
 * IMPORTANT: the Worker's `isAllowedOrigin` check is NOT browser-enforced
 * CORS — it's a manual origin allow-list checked first thing inside
 * handleChat(), and it rejects requests with no Origin header at all
 * (which is what a bare server-side fetch sends by default). So we must
 * explicitly set an Origin header that's already in the Worker's
 * ALLOWED_ORIGINS list. Using vakaviti.ai's own origin here is accurate,
 * not a spoof — DiscoverFiji.ai is architecturally part of that network.
 */

const LAGI_WORKER_URL = "https://fiji-chat-widget.helpronline.workers.dev/";
const TRUSTED_ORIGIN = "https://vakaviti.ai";

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
        Origin: TRUSTED_ORIGIN,
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
      console.error("Lagi returned non-ok status:", lagiResponse.status, data);
      // Pass through whatever message Lagi gave us (capacity/error states
      // often have a real user-facing message even on non-200), rather
      // than hiding it behind a generic error.
      return NextResponse.json(
        {
          message:
            data.message ||
            "Sorry, I'm having trouble right now. Please WhatsApp us at +61 478 886 145.",
          whatsappUrl: data.whatsappUrl || "https://wa.me/61478886145",
          _debug_status: lagiResponse.status,
        },
        { status: 200 } // 200 so the frontend renders the message instead of erroring
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
