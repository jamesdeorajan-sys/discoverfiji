import OpenAI from "openai";

/** Server-only OpenAI client for the AI concierge, quote generator,
 *  and itinerary builder. Never import this in client components. */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
