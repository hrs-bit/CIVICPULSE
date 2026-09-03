import React, { useState, useRef, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Send, MapPin, Sparkles, ClipboardList, Radio, ShieldCheck, Loader2, ChevronRight } from "lucide-react";

// ---------------------------------------------------------------------------
// This app classifies complaints entirely in the browser using keyword rules —
// no API key, no server, no external calls. It deploys as-is to GitHub Pages.
// See classifyLocally() below for the logic, and CATEGORY_RULES to tune it.
// ---------------------------------------------------------------------------

const CATEGORY_RULES = [
  {
    category: "Water Supply",
    department: "Water Supply & Sewerage Board",
    keywords: ["water supply", "no water", "tap water", "water shortage", "pipeline leak", "water pressure", "sewage", "drainage", "borewell"],
    sdgLink: "Clean water and sanitation access",
  },
  {
    category: "Waste Management",
    department: "Sanitation Department",
    keywords: ["garbage", "trash", "waste", "bin", "collection", "sanitation", "smell", "stray animals"],
    sdgLink: "Sustainable waste management",
  },
  {
    category: "Illegal Dumping",
    department: "Municipal Enforcement Cell",
    keywords: ["illegal dumping", "dumping", "debris", "encroach", "construction waste"],
    sdgLink: "Reduced environmental degradation",
  },
  {
    category: "Streetlighting",
    department: "Electrical Maintenance Division",
    keywords: ["streetlight", "street light", "lamp", "lighting", "dark street", "no light"],
    sdgLink: "Safe and inclusive public spaces",
  },
  {
    category: "Roads & Infrastructure",
    department: "Public Works Department",
    keywords: ["pothole", "road", "footpath", "sidewalk", "bridge", "pavement", "accident", "bus stop"],
    sdgLink: "Resilient infrastructure",
  },
  {
    category: "Public Safety",
    department: "Public Safety & Traffic Police",
    keywords: ["unsafe", "danger", "crime", "assault", "traffic signal", "harassment", "children walking"],
    sdgLink: "Safe and inclusive communities",
  },
  {
    category: "Parks & Environment",
    department: "Parks & Horticulture Department",
    keywords: ["park", "tree", "garden", "playground", "green space", "pollution"],
    sdgLink: "Access to green and public spaces",
  },
];

const URGENCY_KEYWORDS = {
  High: ["accident", "unsafe", "danger", "children", "elderly", "unbearable", "emergency", "urgent", "injur"],
  Medium: ["week", "days", "since yesterday", "several", "struggling"],
};

const POSITIVE_WORDS = ["thank", "great", "appreciate", "cleaned up", "improved", "good job"];

function classifyLocally(complaintText) {
  const lower = complaintText.toLowerCase();

  let match = CATEGORY_RULES.find((rule) => rule.keywords.some((kw) => lower.includes(kw)));
  if (!match) {
    match = { category: "Other", department: "General Administration Office", sdgLink: "General civic responsiveness" };
  }

  const isPositive = POSITIVE_WORDS.some((w) => lower.includes(w));

  let urgency = "Low";
  if (URGENCY_KEYWORDS.High.some((kw) => lower.includes(kw))) urgency = "High";
  else if (URGENCY_KEYWORDS.Medium.some((kw) => lower.includes(kw))) urgency = "Medium";
  if (isPositive) urgency = "Low";

  const sentiment = isPositive ? "Appreciative" : urgency === "High" ? "Distressed" : urgency === "Medium" ? "Concerned" : "Neutral";

  const estimatedResolutionDays = isPositive ? 0 : urgency === "High" ? 2 : urgency === "Medium" ? 5 : 10;

  const suggestedAction = isPositive
    ? "Log as positive feedback and share with the responsible field team."
    : urgency === "High"
    ? `Dispatch a field team from ${match.department} within 24 hours to assess and act.`
    : `Schedule an inspection with ${match.department} and log for routine resolution.`;

  return {
    category: match.category,
    urgency,
    sentiment,
    department: match.department,
    estimatedResolutionDays,
    suggestedAction,
    sdgLink: match.sdgLink,
  };
}

const SAMPLE_COMPLAINTS = [
  "There has been an overflowing garbage bin near the Sector 12 market for 5 days now. The smell is unbearable and stray animals keep scattering waste onto the road.",
  "No water supply in Rampur colony since yesterday morning. Several elderly residents are struggling to fetch water from far away.",
  "The streetlights on the entire stretch of MG Road near the school have been off for two weeks. It's very unsafe for children walking home after evening classes.",
  "A large pothole has formed right at the bus stop junction on Ring Road. Two bike accidents have already happened this week.",
  "Someone is illegally dumping construction debris behind the community park every night, and it's slowly encroaching on the children's play area.",
  "Thank you to the sanitation team — the new segregated waste bins installed last month have really cleaned up our street!",
];

const CATEGORY_COLORS = {
  "Waste Management": "#1F7A6C",
  "Water Supply": "#2E6E9E",
  "Roads & Infrastructure": "#8A6D3B",
  "Streetlighting": "#D89B3E",
  "Illegal Dumping": "#C6493C",
  "Public Safety": "#7A4FA0",
  "Parks & Environment": "#3E8E5A",
  "Other": "#5B6B7A",
};

const URGENCY_STYLES = {
  High: { bg: "#FBEAE7", text: "#C6493C", dot: "#C6493C" },
  Medium: { bg: "#FBF1E1", text: "#B67A22", dot: "#D89B3E" },
  Low: { bg: "#E9F3F0", text: "#1F7A6C", dot: "#1F7A6C" },
};

function TicketStamp({ department }) {
  return (
    <div
      style={{
        border: "2px solid #0F2237",
        color: "#0F2237",
        transform: "rotate(-4deg)",
        fontFamily: "'IBM Plex Mono', monospace",
      }}
      className="inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase whitespace-nowrap"
    >
      Routed &rarr; {department}
    </div>
  );
}

function GrievanceTicket({ ticket }) {
  const u = URGENCY_STYLES[ticket.urgency] || URGENCY_STYLES.Low;
  const catColor = CATEGORY_COLORS[ticket.category] || CATEGORY_COLORS.Other;
  return (
    <div className="relative bg-white border border-slate-200 shadow-sm">
      <div
        className="absolute -left-1 top-0 bottom-0 w-1"
        style={{
          background: `repeating-linear-gradient(180deg, ${catColor} 0 6px, transparent 6px 12px)`,
        }}
      />
      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className="text-[11px] tracking-widest uppercase font-semibold"
              style={{ color: catColor, fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {ticket.id} &middot; {ticket.category}
            </div>
            <p className="text-sm text-slate-700 mt-1.5 leading-snug">{ticket.text}</p>
          </div>
          <span
            className="shrink-0 text-[11px] font-bold px-2 py-1 flex items-center gap-1"
            style={{ background: u.bg, color: u.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: u.dot }} />
            {ticket.urgency}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <TicketStamp department={ticket.department} />
          <span className="text-[11px] text-slate-500">
            Suggested resolution: <span className="font-medium text-slate-700">{ticket.estimatedResolutionDays}d</span>
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 italic">&ldquo;{ticket.suggestedAction}&rdquo;</div>
      </div>
    </div>
  );
}

export default function CivicPulseAI() {
  const [text, setText] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const counterRef = useRef(1);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [tickets.length]);

  function classify(complaintText) {
    if (!complaintText.trim()) return;
    setLoading(true);
    setError(null);
    // Small artificial delay so the "Analyzing..." state is visible — this is
    // a local, synchronous, rule-based classifier, no network call involved.
    setTimeout(() => {
      try {
        const parsed = classifyLocally(complaintText);
        const id = `CP-${new Date().getFullYear()}-${String(counterRef.current).padStart(4, "0")}`;
        counterRef.current += 1;
        setTickets((prev) => [{ id, text: complaintText, ...parsed }, ...prev]);
        setText("");
      } catch (e) {
        setError("Couldn't classify that complaint. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 400);
  }

  const categoryCounts = Object.keys(CATEGORY_COLORS)
    .map((cat) => ({ name: cat, count: tickets.filter((t) => t.category === cat).length }))
    .filter((c) => c.count > 0);

  const urgencyCounts = ["High", "Medium", "Low"].map((u) => ({
    level: u,
    count: tickets.filter((t) => t.urgency === u).length,
  }));

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "#EDF1F5",
        backgroundImage: "radial-gradient(circle, #C9D4DE 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <header className="px-6 md:px-10 pt-8 pb-6 border-b-2" style={{ borderColor: "#0F2237" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <div
              className="text-[11px] uppercase tracking-[0.25em] mb-1"
              style={{ color: "#1F7A6C", fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Dept. of Civic Intelligence &middot; SDG 11 Prototype
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold"
              style={{ color: "#0F2237", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              CivicPulse AI
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-md">
              AI-assisted triage that reads a citizen's complaint, classifies it, and routes it to
              the right municipal desk in seconds.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-2 bg-white border border-slate-300" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            <Radio size={14} color="#1F7A6C" />
            <span className="text-slate-700">{tickets.length} tickets logged this session</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-8 grid md:grid-cols-5 gap-8">
        {/* Left: intake */}
        <section className="md:col-span-2 space-y-5">
          <div className="bg-white border border-slate-300 p-5">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList size={16} color="#0F2237" />
              <h2 className="font-semibold text-sm" style={{ color: "#0F2237", fontFamily: "'Space Grotesk', sans-serif" }}>
                Submit a Complaint
              </h2>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe the civic issue, e.g. a broken streetlight, water shortage, uncollected garbage..."
              className="w-full h-28 text-sm p-3 border border-slate-300 focus:outline-none focus:ring-2 resize-none"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            <button
              onClick={() => classify(text)}
              disabled={loading || !text.trim()}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white disabled:opacity-40 transition-opacity"
              style={{ background: "#0F2237" }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              {loading ? "Analyzing..." : "Analyze & Route"}
            </button>
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-[11px] text-slate-500 mb-2 uppercase tracking-wide" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                Or try a sample report
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {SAMPLE_COMPLAINTS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => classify(s)}
                    disabled={loading}
                    className="w-full text-left text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-2 py-1.5 flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <ChevronRight size={12} className="shrink-0" />
                    <span className="truncate">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {urgencyCounts.some((u) => u.count > 0) && (
            <div className="bg-white border border-slate-300 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} color="#0F2237" />
                <h2 className="font-semibold text-sm" style={{ color: "#0F2237", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Category Volume
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={categoryCounts} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                    {categoryCounts.map((c, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[c.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="p-4 border border-dashed" style={{ borderColor: "#1F7A6C" }}>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={15} color="#1F7A6C" />
              <span className="text-xs font-semibold" style={{ color: "#1F7A6C" }}>Responsible AI note</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              This prototype classifies complaints locally in your browser using keyword-based rules — no
              personal or location-tracking data leaves your device, and no external API is called. Every
              classification is shown with its full reasoning fields so a human officer can review, override,
              or confirm routing before action is taken.
            </p>
          </div>
        </section>

        {/* Right: log */}
        <section className="md:col-span-3">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} color="#0F2237" />
            <h2 className="font-semibold text-sm" style={{ color: "#0F2237", fontFamily: "'Space Grotesk', sans-serif" }}>
              Live Grievance Log
            </h2>
          </div>
          <div ref={scrollRef} className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {tickets.length === 0 && (
              <div className="text-sm text-slate-400 border border-dashed border-slate-300 p-8 text-center">
                No tickets yet — submit a complaint or try a sample report to see the AI triage in action.
              </div>
            )}
            {tickets.map((t) => (
              <GrievanceTicket key={t.id} ticket={t} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
