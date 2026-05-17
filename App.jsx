import { useState, useRef, useCallback } from "react";

// ─── Design Tokens ───────────────────────────────────────────
const T = {
  bg:       "#070B14",
  surface:  "#0D1220",
  card:     "#111827",
  border:   "#1E2D40",
  accent:   "#00E5B4",
  accentLo: "#00E5B418",
  accentMd: "#00E5B435",
  gold:     "#F5C842",
  goldLo:   "#F5C84218",
  red:      "#F43F5E",
  redLo:    "#F43F5E18",
  green:    "#10B981",
  greenLo:  "#10B98118",
  blue:     "#3B82F6",
  blueLo:   "#3B82F618",
  amber:    "#F59E0B",
  violet:   "#8B5CF6",
  text:     "#F1F5F9",
  sub:      "#94A3B8",
  muted:    "#475569",
  font:     "'DM Sans', 'Helvetica Neue', sans-serif",
  mono:     "'JetBrains Mono', 'Fira Code', monospace",
};

// ─── Helpers ─────────────────────────────────────────────────
const fmt = (n) => "₹" + Math.abs(n).toLocaleString("en-IN");
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ─── Sub-components ──────────────────────────────────────────
const Chip = ({ children, color = T.accent }) => (
  <span style={{
    background: color + "25", color, padding: "3px 12px",
    borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
    border: `1px solid ${color}40`,
  }}>{children}</span>
);

const Card = ({ children, style = {}, glow }) => (
  <div style={{
    background: T.card, border: `1px solid ${glow ? glow + "50" : T.border}`,
    borderRadius: 18, padding: 22,
    boxShadow: glow ? `0 0 28px ${glow}18` : "none",
    ...style,
  }}>{children}</div>
);

const Stat = ({ label, value, sub, color = T.accent, icon }) => (
  <div style={{
    background: color + "10", border: `1px solid ${color}30`,
    borderRadius: 16, padding: "18px 20px", flex: 1, minWidth: 140,
  }}>
    <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: T.mono }}>{value}</div>
    <div style={{ fontSize: 12, color: T.sub, marginTop: 3 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{sub}</div>}
  </div>
);

// ─── Animated progress bar ───────────────────────────────────
const Bar = ({ pct, color, label, amount, rank }) => {
  const w = clamp(pct, 2, 100);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 20, height: 20, borderRadius: 6, background: color + "30",
            color, fontSize: 10, fontWeight: 800, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>{rank}</span>
          <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: T.sub, fontFamily: T.mono }}>{amount}</span>
          <span style={{ fontSize: 11, color: T.muted }}>{pct}%</span>
        </div>
      </div>
      <div style={{ background: T.border, borderRadius: 999, height: 7, overflow: "hidden" }}>
        <div style={{
          width: `${w}%`, height: "100%", background: `linear-gradient(90deg, ${color}, ${color}99)`,
          borderRadius: 999, boxShadow: `0 0 10px ${color}66`,
          animation: "growBar 1s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }} />
      </div>
    </div>
  );
};

// ─── Upload Zone ─────────────────────────────────────────────
function UploadZone({ onFile }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();

  const handle = (file) => {
    if (file && file.type === "application/pdf") onFile(file);
    else alert("Please upload a PDF bank statement.");
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
      onClick={() => ref.current.click()}
      style={{
        border: `2px dashed ${drag ? T.accent : T.border}`,
        borderRadius: 20, padding: "48px 32px", textAlign: "center",
        cursor: "pointer", background: drag ? T.accentLo : T.surface,
        transition: "all 0.25s",
        boxShadow: drag ? `0 0 40px ${T.accentMd}` : "none",
      }}
    >
      <input ref={ref} type="file" accept=".pdf" style={{ display: "none" }}
        onChange={(e) => handle(e.target.files[0])} />
      <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 8 }}>
        Drop your bank statement here
      </div>
      <div style={{ fontSize: 14, color: T.sub, marginBottom: 20 }}>
        Works with HDFC · SBI · ICICI · Axis · Kotak · PNB · and all Indian banks
      </div>
      <div style={{
        display: "inline-block", background: `linear-gradient(135deg, ${T.accent}, ${T.blue})`,
        color: "#000", padding: "12px 28px", borderRadius: 12,
        fontWeight: 800, fontSize: 14,
      }}>
        Choose PDF File
      </div>
      <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 24 }}>
        {["🔒 Never stored", "🤖 AI-powered", "⚡ Results in 10s"].map(x => (
          <span key={x} style={{ fontSize: 12, color: T.muted }}>{x}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Loading State ───────────────────────────────────────────
function Analyzing({ filename }) {
  const steps = [
    "Reading your bank statement…",
    "Identifying transactions…",
    "Categorizing spending…",
    "Calculating cash flow…",
    "Generating AI insights…",
  ];
  const [step, setStep] = useState(0);

  useState(() => {
    const id = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1800);
    return () => clearInterval(id);
  });

  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: `conic-gradient(${T.accent} 0%, transparent 60%)`,
        margin: "0 auto 32px",
        animation: "spin 1s linear infinite",
      }} />
      <div style={{ fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 8 }}>
        Analyzing {filename}
      </div>
      <div style={{ fontSize: 14, color: T.accent, marginBottom: 32 }}>
        {steps[step]}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 300, margin: "0 auto" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              background: i <= step ? T.accent : T.border,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: i <= step ? "#000" : T.muted,
              transition: "all 0.4s",
            }}>{i <= step ? "✓" : ""}</div>
            <span style={{ fontSize: 13, color: i <= step ? T.text : T.muted, transition: "color 0.4s" }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Results Dashboard ────────────────────────────────────────
function Results({ data, onReset }) {
  const [tab, setTab] = useState("overview");
  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "transactions", label: "⇄ Transactions" },
    { id: "spending", label: "🎯 Spending" },
    { id: "insights", label: "🤖 AI Insights" },
  ];

  const catColors = [T.accent, T.blue, T.amber, T.violet, T.red, T.green, T.gold, "#EC4899"];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>
            {data.bank_name || "Bank Statement"}
          </div>
          <div style={{ fontSize: 13, color: T.sub, marginTop: 3 }}>
            {data.account_number} · {data.period}
          </div>
        </div>
        <button onClick={onReset} style={{
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10,
          padding: "8px 16px", color: T.sub, fontSize: 13, cursor: "pointer",
          fontFamily: T.font,
        }}>↩ New Statement</button>
      </div>

      {/* Stats Row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <Stat icon="💰" label="Closing Balance" value={fmt(data.closing_balance)} color={T.accent} />
        <Stat icon="📈" label="Total Credits" value={fmt(data.total_credits)} color={T.green} sub={`${data.credit_count} transactions`} />
        <Stat icon="📉" label="Total Debits" value={fmt(data.total_debits)} color={T.red} sub={`${data.debit_count} transactions`} />
        <Stat icon="🏦" label="Net Savings" value={fmt(data.net_savings)}
          color={data.net_savings >= 0 ? T.accent : T.red}
          sub={data.savings_rate ? `${data.savings_rate}% savings rate` : ""} />
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 20,
        background: T.surface, padding: 5, borderRadius: 14,
        border: `1px solid ${T.border}`,
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "10px 8px", border: "none", borderRadius: 10,
            background: tab === t.id ? T.accent : "transparent",
            color: tab === t.id ? "#000" : T.sub,
            fontWeight: 700, fontSize: 12, cursor: "pointer",
            transition: "all 0.2s", fontFamily: T.font,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Monthly Cash Flow */}
          {data.monthly_flow && data.monthly_flow.length > 0 && (
            <Card glow={T.accent}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>
                Monthly Cash Flow
              </div>
              {data.monthly_flow.map((m, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: i < data.monthly_flow.length - 1 ? `1px solid ${T.border}` : "none",
                }}>
                  <span style={{ fontSize: 14, color: T.text, fontWeight: 600 }}>{m.month}</span>
                  <div style={{ display: "flex", gap: 20 }}>
                    <span style={{ fontSize: 13, color: T.green, fontFamily: T.mono }}>+{fmt(m.credits)}</span>
                    <span style={{ fontSize: 13, color: T.red, fontFamily: T.mono }}>-{fmt(m.debits)}</span>
                    <Chip color={m.credits >= m.debits ? T.green : T.red}>
                      {m.credits >= m.debits ? "Surplus" : "Deficit"}
                    </Chip>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Top Merchants */}
          {data.top_merchants && data.top_merchants.length > 0 && (
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>
                Top Merchants
              </div>
              {data.top_merchants.map((m, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "9px 0", borderBottom: i < data.top_merchants.length - 1 ? `1px solid ${T.border}` : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: 8, background: T.accentLo,
                      color: T.accent, fontSize: 12, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 13, color: T.text }}>{m.name}</span>
                  </div>
                  <span style={{ fontSize: 13, color: T.sub, fontFamily: T.mono }}>{fmt(m.amount)}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {tab === "transactions" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            padding: "14px 20px", borderBottom: `1px solid ${T.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontWeight: 700, color: T.text }}>All Transactions</span>
            <Chip>{data.transactions?.length || 0} entries</Chip>
          </div>
          <div style={{ maxHeight: 480, overflowY: "auto" }}>
            {(data.transactions || []).map((t, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", padding: "13px 20px",
                borderBottom: `1px solid ${T.border}`,
                background: i % 2 === 0 ? "transparent" : T.surface + "80",
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                  background: t.type === "CR" ? T.greenLo : T.redLo,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, marginRight: 12,
                }}>{t.type === "CR" ? "↓" : "↑"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: T.text,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{t.description}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                    {t.category} · {t.date}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700, fontFamily: T.mono,
                    color: t.type === "CR" ? T.green : T.red,
                  }}>
                    {t.type === "CR" ? "+" : "-"}{fmt(t.amount)}
                  </div>
                  {t.balance && (
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Bal: {fmt(t.balance)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Spending Tab */}
      {tab === "spending" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Spending by Category</span>
            <Chip>{fmt(data.total_debits)} total</Chip>
          </div>
          {(data.spending_categories || []).map((c, i) => (
            <Bar
              key={i}
              label={c.category}
              amount={fmt(c.amount)}
              pct={c.percentage}
              color={catColors[i % catColors.length]}
              rank={i + 1}
            />
          ))}
        </Card>
      )}

      {/* AI Insights Tab */}
      {tab === "insights" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Health Score */}
          <Card glow={T.accent}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Financial Health Score</span>
              <span style={{
                fontSize: 28, fontWeight: 900, fontFamily: T.mono,
                color: data.health_score >= 70 ? T.green : data.health_score >= 40 ? T.amber : T.red,
              }}>{data.health_score}<span style={{ fontSize: 14, color: T.muted }}>/100</span></span>
            </div>
            <div style={{ background: T.border, borderRadius: 999, height: 10, overflow: "hidden" }}>
              <div style={{
                width: `${data.health_score}%`, height: "100%",
                background: data.health_score >= 70
                  ? `linear-gradient(90deg, ${T.green}, ${T.accent})`
                  : data.health_score >= 40
                    ? `linear-gradient(90deg, ${T.amber}, ${T.gold})`
                    : `linear-gradient(90deg, ${T.red}, ${T.amber})`,
                borderRadius: 999, transition: "width 1s ease",
              }} />
            </div>
          </Card>

          {/* Insights */}
          {(data.insights || []).map((insight, i) => (
            <Card key={i} style={{ borderLeft: `4px solid ${insight.type === "warning" ? T.red : insight.type === "tip" ? T.accent : T.green}` }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{insight.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>
                    {insight.title}
                  </div>
                  <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.6 }}>{insight.body}</div>
                </div>
              </div>
            </Card>
          ))}

          {/* Recommendations */}
          {data.recommendations && (
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>
                🎯 Action Plan
              </div>
              {data.recommendations.map((r, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, padding: "10px 0",
                  borderBottom: i < data.recommendations.length - 1 ? `1px solid ${T.border}` : "none",
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 8, background: T.accentLo,
                    color: T.accent, fontSize: 12, fontWeight: 800, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: T.sub, lineHeight: 1.6 }}>{r}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState("upload"); // upload | analyzing | results | error
  const [filename, setFilename] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });

  const analyze = useCallback(async (file) => {
    setFilename(file.name);
    setPhase("analyzing");
    setError("");

    try {
      const base64 = await toBase64(file);

      const prompt = `Analyze this Indian bank statement PDF. Return ONLY raw JSON, no markdown, no explanation, no code fences. Start your response with { and end with }.

Use this exact structure:
{"bank_name":"","account_number":"XXXX1234","period":"","opening_balance":0,"closing_balance":0,"total_credits":0,"total_debits":0,"credit_count":0,"debit_count":0,"net_savings":0,"savings_rate":0,"health_score":70,"monthly_flow":[{"month":"","credits":0,"debits":0}],"transactions":[{"date":"","description":"","amount":0,"type":"CR","category":"","balance":0}],"spending_categories":[{"category":"","amount":0,"percentage":0}],"top_merchants":[{"name":"","amount":0}],"insights":[{"type":"tip","icon":"💡","title":"","body":""}],"recommendations":[""]}

Rules:
- type is "CR" for credit, "DR" for debit
- health_score 0-100 based on savings rate and habits
- Categories: Food & Dining, Transport, Shopping, Utilities, Rent & Housing, Health & Medical, Entertainment, Education, Salary & Income, ATM & Cash, Transfers, Investment, Insurance, Other
- Limit transactions to max 50 most recent
- spending_categories: only debit spending, sorted by amount desc
- insights: 3-5 items, mix of warning/tip/good types
- recommendations: 3 specific actionable items
- All amounts in numbers not strings
- IMPORTANT: Keep JSON compact, complete the entire object`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_AI_API_KEY,
          "anthropic-version": "2023-06-01",
          "dangerously-allow-browser": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: { type: "base64", media_type: "application/pdf", data: base64 },
                },
                { type: "text", text: prompt },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";

      // Robust JSON extraction — find outermost { }
      const extract = (str) => {
        const start = str.indexOf("{");
        if (start === -1) throw new Error("No JSON found in response");
        let depth = 0;
        for (let i = start; i < str.length; i++) {
          if (str[i] === "{") depth++;
          else if (str[i] === "}") {
            depth--;
            if (depth === 0) return str.slice(start, i + 1);
          }
        }
        throw new Error("PDF too large — try a 1-month statement instead.");
      };

      const jsonStr = extract(raw);
      const parsed = JSON.parse(jsonStr);

      setResults(parsed);
      setPhase("results");
    } catch (e) {
      setError(e.message || "Analysis failed. Please try again.");
      setPhase("error");
    }
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.bg}; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${T.surface}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes growBar { from { width: 0; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{
        minHeight: "100vh", background: T.bg,
        fontFamily: T.font, color: T.text,
        padding: "0 0 48px",
      }}>
        {/* Top Nav */}
        <div style={{
          borderBottom: `1px solid ${T.border}`, padding: "16px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: T.surface, position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: `linear-gradient(135deg, ${T.accent}, ${T.blue})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>🇮🇳</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>BankBridge</div>
              <div style={{ fontSize: 10, color: T.muted }}>AI Bank Statement Analyzer</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Chip color={T.green}>Free</Chip>
            <Chip color={T.blue}>All Indian Banks</Chip>
          </div>
        </div>

        <div style={{
          maxWidth: 780, margin: "0 auto", padding: "32px 20px",
          animation: "fadeUp 0.5s ease forwards",
        }}>
          {phase === "upload" && (
            <>
              {/* Hero */}
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <div style={{
                  display: "inline-block", background: T.accentLo, border: `1px solid ${T.accentMd}`,
                  borderRadius: 20, padding: "6px 16px", fontSize: 12, color: T.accent,
                  fontWeight: 700, marginBottom: 20, letterSpacing: 0.5,
                }}>
                  🤖 POWERED BY AI
                </div>
                <h1 style={{
                  fontSize: 38, fontWeight: 900, color: T.text,
                  lineHeight: 1.15, marginBottom: 14,
                }}>
                  Understand your<br />
                  <span style={{ color: T.accent }}>bank statement</span> instantly
                </h1>
                <p style={{ fontSize: 16, color: T.sub, maxWidth: 480, margin: "0 auto" }}>
                  Upload any Indian bank PDF — AI reads it and gives you balance, spending breakdown, and financial insights in seconds.
                </p>
              </div>

              <UploadZone onFile={analyze} />

              {/* How it works */}
              <div style={{ display: "flex", gap: 16, marginTop: 32, flexWrap: "wrap" }}>
                {[
                  ["📤", "Upload PDF", "Your HDFC, SBI, ICICI — any bank statement"],
                  ["🤖", "AI Analyzes", "AI reads every transaction instantly"],
                  ["📊", "Get Insights", "Balance, spending, trends, action plan"],
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{
                    flex: 1, minWidth: 180, textAlign: "center",
                    padding: "20px 16px", background: T.surface,
                    border: `1px solid ${T.border}`, borderRadius: 16,
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 6 }}>{title}</div>
                    <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {phase === "analyzing" && <Analyzing filename={filename} />}

          {phase === "results" && results && (
            <Results data={results} onReset={() => { setPhase("upload"); setResults(null); }} />
          )}

          {phase === "error" && (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.red, marginBottom: 12 }}>Analysis Failed</div>
              <div style={{ fontSize: 14, color: T.sub, marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>{error}</div>
              <button onClick={() => setPhase("upload")} style={{
                background: T.accent, border: "none", borderRadius: 12,
                padding: "12px 28px", color: "#000", fontWeight: 700,
                fontSize: 14, cursor: "pointer", fontFamily: T.font,
              }}>Try Again</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
// Triggering fresh Vercel build for branding update
