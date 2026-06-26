import PlannerChat from "@/components/PlannerChat";

// STOP-GAP FIX (Session 48): the dedicated DiscoverFiji.ai pages these tiles
// were meant to link to (/tours, /resorts, etc.) haven't been built yet —
// they were 404ing on the live site. Routing to real, live pages on
// fijitourtransfers.com / nadiairporttransfers.com instead so no click on
// this page is a dead end. Swap each `href` back to an internal route as the
// real DiscoverFiji page for that category gets built.
const categories = [
  { label: "Airport Transfers", sounding: "14", href: "https://nadiairporttransfers.com/", external: true },
  { label: "Private Tours", sounding: "27", href: "https://fijitourtransfers.com/tours/", external: true },
  { label: "Island Tours", sounding: "63", href: "https://fijitourtransfers.com/tours/", external: true },
  { label: "Resorts", sounding: "08", href: "https://wa.me/61478886145", external: true },
  { label: "Things To Do", sounding: "41", href: "https://fijitourtransfers.com/tours/", external: true },
  { label: "Travel Guide", sounding: "19", href: "https://fijitourtransfers.com/guide/fiji-with-kids/", external: true },
  { label: "Horse Riding", sounding: "76", href: "https://wa.me/61478886145", external: true },
  { label: "Adventure Activities", sounding: "52", href: "https://fijitourtransfers.com/tours/", external: true },
];

const reasons = [
  {
    mark: "01",
    title: "Local Knowledge, Not Guesswork",
    body: "Built on real route data, real operator pricing, and real Fiji geography — not a generic travel chatbot reciting brochure copy.",
  },
  {
    mark: "02",
    title: "Plans in Seconds, Not Days",
    body: "Tell it your dates, your group, your interests. Get a full itinerary with transfers and activities mapped out before your coffee's cold.",
  },
  {
    mark: "03",
    title: "Instant, Honest Pricing",
    body: "Transfer quotes calculated on the spot — vehicle type, route, and price, with nothing held back until checkout.",
  },
  {
    mark: "04",
    title: "A Real Person, When You Need One",
    body: "Every plan ends with a way to WhatsApp a real local team — the AI gets you 90% of the way, never the whole way alone.",
  },
];

export default function Home() {
  return (
    <main className="bg-depth text-cream">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-paper/10">
        <ChartBackdrop />

        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-center px-6 py-24">
          <p className="font-mono text-xs tracking-[0.25em] text-reef-light uppercase">
            17.7134°S · 178.0650°E — Viti Levu, Fiji
          </p>

          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight text-cream sm:text-6xl md:text-7xl">
            Your personal
            <br />
            AI guide to Fiji.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-paper/90 sm:text-xl">
            Plan your dream Fiji holiday in seconds. Transfers, tours, and a
            full itinerary — charted out before you&apos;ve finished reading this.
          </p>

          {/* AI prompt box — wired to Lagi via /api/chat, not decorative */}
          <div id="planner">
            <PlannerChat />
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#planner"
              className="rounded-md bg-coral px-6 py-3 font-display text-sm font-medium text-cream transition hover:bg-coral-light"
            >
              Start Planning
            </a>
            <a
              href="https://nadiairporttransfers.com/"
              className="rounded-md border border-paper/30 px-6 py-3 font-display text-sm font-medium text-paper transition hover:border-paper hover:bg-paper/5"
            >
              Book Airport Transfer
            </a>
            <a
              href="https://wa.me/61478886145"
              className="rounded-md border border-reef-light/40 px-6 py-3 font-display text-sm font-medium text-reef-light transition hover:border-reef-light hover:bg-reef/10"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-reef-light">
          Chart your course
        </p>
        <h2 className="mt-3 font-display text-3xl text-cream sm:text-4xl">
          Where to next.
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-paper/15 bg-paper/15 sm:grid-cols-4">
          {categories.map((c) => (
            <a
              key={c.label}
              href={c.href}
              className="group flex flex-col justify-between bg-depth p-5 transition hover:bg-depth-light"
            >
              <span className="font-mono text-xs text-paper/40 group-hover:text-coral">
                {c.sounding}
              </span>
              <span className="mt-6 font-display text-base text-paper group-hover:text-cream">
                {c.label}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="border-t border-paper/10 bg-depth-light/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-reef-light">
            Why Lagi
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl text-cream sm:text-4xl">
            An AI that actually knows the reef from the rumour.
          </h2>

          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            {reasons.map((r) => (
              <div key={r.mark} className="flex gap-5">
                <span className="font-mono text-sm text-coral">{r.mark}</span>
                <div>
                  <h3 className="font-display text-lg text-cream">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-paper/75">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-2xl font-display text-3xl text-cream sm:text-4xl">
          Tell it where you&apos;re headed. It&apos;ll chart the rest.
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#planner"
            className="rounded-md bg-coral px-7 py-3.5 font-display text-sm font-medium text-cream transition hover:bg-coral-light"
          >
            Start Planning Free
          </a>
        </div>
      </section>

      <footer className="border-t border-paper/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-mono text-xs text-paper/50 sm:flex-row">
          <span>Lagi — Fiji&apos;s AI travel guide</span>
          <span>Powered by Vakaviti.ai</span>
        </div>
      </footer>
    </main>
  );
}

/** Signature hero element — an abstract bathymetric chart of Fiji's reefs,
 *  contour lines with depth soundings, in place of a generic hero image. */
function ChartBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="depthFade" cx="50%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#142F3E" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0B1F2A" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#depthFade)" />

      {[
        "M 150 600 Q 300 500 450 540 T 750 520 T 1050 560",
        "M 100 520 Q 280 430 480 460 T 800 440 T 1100 480",
        "M 60 440 Q 260 360 500 380 T 850 360 T 1140 400",
        "M 40 360 Q 240 300 520 310 T 880 290 T 1160 320",
        "M 30 280 Q 220 240 540 240 T 900 220 T 1170 250",
      ].map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#3F9C8E"
          strokeWidth={1}
          strokeOpacity={0.45 - i * 0.05}
        />
      ))}

      {[
        { x: 220, y: 470, v: "42" },
        { x: 540, y: 410, v: "118" },
        { x: 860, y: 380, v: "7" },
        { x: 980, y: 510, v: "63" },
        { x: 360, y: 540, v: "29" },
      ].map((s, i) => (
        <text
          key={i}
          x={s.x}
          y={s.y}
          fontSize="11"
          fontFamily="monospace"
          fill="#E4D9C2"
          opacity={0.5}
        >
          {s.v}
        </text>
      ))}
    </svg>
  );
}
