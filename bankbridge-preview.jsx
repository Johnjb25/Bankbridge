import { useState, useEffect } from "react";

const C = {
  bg: "#0A0F1E", card: "#111827", border: "#1F2937",
  accent: "#00D4AA", accentGlow: "#00D4AA44",
  warn: "#F59E0B", danger: "#EF4444", success: "#10B981",
  text: "#F9FAFB", dim: "#9CA3AF", muted: "#4B5563",
  indigo: "#6366F1",
};

const ACCOUNTS = [
  { bank: "HDFC Bank", type: "SAVINGS", masked: "XXXX 4521", balance: 15000, color: "#00D4AA" },
  { bank: "SBI", type: "SAVINGS", masked: "XXXX 8834", balance: 42500, color: "#6366F1" },
];
const TXNS = [
  { date: "17 May", desc: "Swiggy Order", amount: -450, cat: "Food & Dining", credit: false },
  { date: "16 May", desc: "Salary Credit", amount: 45000, cat: "Income", credit: true },
  { date: "15 May", desc: "Rent Payment", amount: -12000, cat: "Housing", credit: false },
  { date: "14 May", desc: "Amazon", amount: -2399, cat: "Shopping", credit: false },
  { date: "13 May", desc: "Jio Recharge", amount: -299, cat: "Utilities", credit: false },
  { date: "12 May", desc: "Zomato", amount: -380, cat: "Food & Dining", credit: false },
  { date: "11 May", desc: "Uber", amount: -180, cat: "Transport", credit: false },
  { date: "10 May", desc: "Netflix", amount: -649, cat: "Entertainment", credit: false },
];
const SPEND = [
  { cat: "Rent & Housing", amt: 12000, pct: 42, color: "#6366F1" },
  { cat: "Food & Dining", amt: 4200, pct: 15, color: "#00D4AA" },
  { cat: "Shopping", amt: 3800, pct: 13, color: "#F59E0B" },
  { cat: "Utilities", amt: 1200, pct: 4, color: "#10B981" },
  { cat: "Transport", amt: 900, pct: 3, color: "#EF4444" },
  { cat: "Entertainment", amt: 649, pct: 2, color: "#8B5CF6" },
];
const BANKS = ["SBI","HDFC","ICICI","Axis","Kotak","PNB","Canara","BoB","IndusInd","Yes Bank","IDFC","Federal"];

const Pill = ({ children, color }) => (
  <span style={{ background: color+"22", color, padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{children}</span>
);
const Card = ({ children, style={} }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20, ...style }}>{children}</div>
);

function ConnectScreen({ onConnect }) {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const go = () => { if(mobile.length!==10) return; setLoading(true); setTimeout(()=>{setLoading(false);onConnect();},1400); };
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"system-ui,sans-serif" }}>
      <div style={{ position:"fixed", top:"15%", left:"50%", transform:"translateX(-50%)", width:500, height:500, background:`radial-gradient(circle,${C.accentGlow} 0%,transparent 70%)`, pointerEvents:"none" }} />
      <div style={{ width:"100%", maxWidth:420, position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:64, height:64, borderRadius:20, background:`linear-gradient(135deg,${C.accent},${C.indigo})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 14px", boxShadow:`0 0 40px ${C.accentGlow}` }}>🇮🇳</div>
          <h1 style={{ fontSize:26, fontWeight:800, color:C.text, margin:0 }}>BankBridge</h1>
          <p style={{ color:C.dim, marginTop:8, fontSize:14 }}>Connect your Indian bank to Claude · Free</p>
        </div>
        <Card style={{ marginBottom:16 }}>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:11, color:C.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Mobile Number</div>
            <div style={{ display:"flex", gap:10 }}>
              <div style={{ background:C.border, borderRadius:10, padding:"12px 14px", color:C.dim, fontSize:15, fontWeight:600 }}>🇮🇳 +91</div>
              <input type="tel" maxLength={10} value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,""))} placeholder="9876543210"
                style={{ flex:1, background:C.border, border:`1px solid ${mobile.length===10?C.accent:C.border}`, borderRadius:10, padding:"12px 16px", color:C.text, fontSize:16, outline:"none", fontFamily:"monospace", transition:"border-color 0.2s" }} />
            </div>
          </div>
          <button onClick={go} disabled={mobile.length!==10||loading}
            style={{ width:"100%", padding:14, background:mobile.length===10?`linear-gradient(135deg,${C.accent},${C.indigo})`:C.border, border:"none", borderRadius:12, color:mobile.length===10?"#000":C.muted, fontSize:15, fontWeight:700, cursor:mobile.length===10?"pointer":"not-allowed", transition:"all 0.2s", boxShadow:mobile.length===10?`0 0 24px ${C.accentGlow}`:"none", fontFamily:"inherit" }}>
            {loading ? "⏳ Connecting..." : "Connect My Bank →"}
          </button>
        </Card>
        <Card>
          <div style={{ fontSize:11, color:C.muted, textAlign:"center", marginBottom:10, letterSpacing:1, textTransform:"uppercase" }}>50+ Banks Supported</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
            {BANKS.map(b=><span key={b} style={{ background:C.border, color:C.dim, padding:"3px 10px", borderRadius:8, fontSize:12 }}>{b}</span>)}
          </div>
        </Card>
        <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:18 }}>
          {["🔒 RBI Regulated","🛡️ No Password","✅ OTP Only"].map(x=><span key={x} style={{ fontSize:11, color:C.muted }}>{x}</span>)}
        </div>
      </div>
    </div>
  );
}

function BarRow({ item, idx }) {
  const [w, setW] = useState(0);
  useEffect(()=>{setTimeout(()=>setW(item.pct),300+idx*100);},[]);
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:13, color:C.text }}>{item.cat}</span>
        <span style={{ fontSize:13, color:C.dim }}>₹{item.amt.toLocaleString("en-IN")}</span>
      </div>
      <div style={{ background:C.border, borderRadius:999, height:6, overflow:"hidden" }}>
        <div style={{ width:`${w}%`, height:"100%", background:item.color, borderRadius:999, transition:"width 0.8s cubic-bezier(0.34,1.56,0.64,1)", boxShadow:`0 0 8px ${item.color}88` }} />
      </div>
    </div>
  );
}

function Dashboard() {
  const [tab, setTab] = useState("overview");
  const totalBal = ACCOUNTS.reduce((s,a)=>s+a.balance,0);
  const totalSpent = SPEND.reduce((s,i)=>s+i.amt,0);
  const tabs = [["overview","◈ Overview"],["transactions","⇄ Transactions"],["spending","◎ Spending"]];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"system-ui,sans-serif", color:C.text }}>
      <div style={{ position:"fixed", top:0, right:"5%", width:350, height:350, background:`radial-gradient(circle,${C.accentGlow} 0%,transparent 70%)`, pointerEvents:"none", zIndex:0 }} />
      <div style={{ maxWidth:760, margin:"0 auto", padding:"20px 16px", position:"relative", zIndex:1 }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:20 }}>🇮🇳</span>
              <span style={{ fontSize:17, fontWeight:800, color:C.text }}>BankBridge</span>
            </div>
            <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>Setu AA · RBI Licensed</div>
          </div>
          <Pill color={C.accent}>● Live</Pill>
        </div>

        {/* Balance Banner */}
        <div style={{ background:`linear-gradient(135deg,${C.accent}18,${C.indigo}18)`, border:`1px solid ${C.accent}33`, borderRadius:20, padding:"22px 24px", marginBottom:20 }}>
          <div style={{ fontSize:12, color:C.dim, marginBottom:6 }}>Total Balance</div>
          <div style={{ fontSize:38, fontWeight:800, color:C.text, fontFamily:"monospace" }}>₹{totalBal.toLocaleString("en-IN")}</div>
          <div style={{ display:"flex", gap:24, marginTop:14, flexWrap:"wrap" }}>
            {[["Income","45,000",C.success],["Spent",totalSpent.toLocaleString("en-IN"),C.danger],["Saved",(45000-totalSpent).toLocaleString("en-IN"),C.accent]].map(([l,v,color])=>(
              <div key={l}>
                <div style={{ fontSize:11, color:C.dim }}>{l}</div>
                <div style={{ fontSize:15, color, fontWeight:700 }}>₹{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:6, marginBottom:20, background:C.card, padding:5, borderRadius:13, border:`1px solid ${C.border}` }}>
          {tabs.map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:"9px", border:"none", borderRadius:9, background:tab===id?C.accent:"transparent", color:tab===id?"#000":C.dim, fontWeight:700, fontSize:12, cursor:"pointer", transition:"all 0.2s", fontFamily:"inherit" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab==="overview" && (
          <div>
            <div style={{ fontSize:11, color:C.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>Accounts</div>
            <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:20 }}>
              {ACCOUNTS.map((acc,i)=>(
                <div key={i} style={{ flex:1, minWidth:180, background:`linear-gradient(135deg,${acc.color}18,${C.card})`, border:`1px solid ${acc.color}44`, borderRadius:16, padding:18 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                    <div>
                      <div style={{ fontSize:13, color:C.dim }}>{acc.bank}</div>
                      <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{acc.masked}</div>
                    </div>
                    <Pill color={acc.color}>{acc.type}</Pill>
                  </div>
                  <div style={{ fontSize:26, fontWeight:700, fontFamily:"monospace", color:C.text }}>₹{acc.balance.toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {[["⇄","24 Txns","this month",C.indigo],["🏠","Housing","top spend",C.warn],["📈","46%","savings rate",C.success]].map(([icon,val,sub,color],i)=>(
                <Card key={i} style={{ textAlign:"center", padding:14 }}>
                  <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
                  <div style={{ fontSize:16, fontWeight:800, color }}>{val}</div>
                  <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{sub}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Transactions */}
        {tab==="transactions" && (
          <Card style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontWeight:700, fontSize:14 }}>Recent Transactions</span>
              <Pill color={C.accent}>{TXNS.length} entries</Pill>
            </div>
            {TXNS.map((t,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", padding:"13px 18px", borderBottom:i<TXNS.length-1?`1px solid ${C.border}`:"none" }}>
                <div style={{ width:38, height:38, borderRadius:11, background:(t.credit?C.success:C.danger)+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, marginRight:12, flexShrink:0 }}>
                  {t.credit?"↓":"↑"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{t.desc}</div>
                  <div style={{ fontSize:11, color:C.dim, marginTop:1 }}>{t.cat} · {t.date}</div>
                </div>
                <div style={{ fontSize:14, fontWeight:700, color:t.credit?C.success:C.danger }}>
                  {t.credit?"+":"-"}₹{Math.abs(t.amount).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Spending */}
        {tab==="spending" && (
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
              <span style={{ fontWeight:700 }}>Spending Breakdown</span>
              <Pill color={C.accent}>May 2026</Pill>
            </div>
            {SPEND.map((item,i)=><BarRow key={i} item={item} idx={i} />)}
            <div style={{ marginTop:18, padding:"13px 15px", background:C.border, borderRadius:12, fontSize:13, color:C.dim, lineHeight:1.6 }}>
              💡 <strong style={{ color:C.text }}>AI Insight:</strong> Rent is 42% of spending. You saved ₹{(45000-totalSpent).toLocaleString("en-IN")} — a healthy 46% savings rate. Reduce food delivery to save an extra ₹2,000/month.
            </div>
          </Card>
        )}

        <div style={{ textAlign:"center", marginTop:28, fontSize:11, color:C.muted }}>
          Secured by Setu AA · RBI Licensed · No credentials stored · Built for India
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [connected, setConnected] = useState(false);
  return connected ? <Dashboard /> : <ConnectScreen onConnect={()=>setConnected(true)} />;
}
