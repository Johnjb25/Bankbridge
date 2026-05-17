# 🇮🇳 BankBridge — India Bank MCP Connector
### Connect any Indian bank to Claude. Built on Setu Account Aggregator.

---

## What This Does
Ask Claude questions like:
- "What's my bank balance?"
- "Where did I spend most this month?"
- "Show my last 20 transactions"
- "Am I saving enough?"
- "Analyze my cash flow"

Works with: SBI, HDFC, ICICI, Axis, Kotak, PNB, Canara, Bank of Baroda, IndusInd, Yes Bank, IDFC First, Federal Bank + 40 more.

---

## Setup in 4 Steps

### Step 1 — Get Setu Sandbox Keys (Free, 15 min)
1. Go to https://setu.co
2. Click "Get Started" → Create free account
3. Go to Products → Account Aggregator → FIU
4. Create a sandbox app
5. Copy: Client ID, Client Secret, Product Instance ID
6. Paste them in `mcp-server/.env`

### Step 2 — Install & Run MCP Server
```bash
cd mcp-server
npm install
cp .env.example .env
# Edit .env with your Setu keys
npm start
```

### Step 3 — Connect to Claude Desktop
Add to your Claude Desktop config file:

**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "india-bank-connector": {
      "command": "node",
      "args": ["/full/path/to/mcp-server/src/index.js"],
      "env": {
        "SETU_CLIENT_ID": "your_id",
        "SETU_CLIENT_SECRET": "your_secret",
        "SETU_PRODUCT_INSTANCE_ID": "your_instance_id"
      }
    }
  }
}
```

Restart Claude Desktop.

### Step 4 — Run Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

---

## Usage in Claude

Once connected, just ask:
```
Connect my bank → mobile number 9876543210
Show my accounts
Get my last 30 transactions
Analyze my spending this month
Show cash flow for last 3 months
```

---

## Deploy to Production (Free)

### Backend → Railway
```bash
npm install -g railway
railway login
railway init
railway up
```

### Frontend → Vercel
```bash
npm install -g vercel
cd frontend
vercel --prod
```

### Database → Supabase
1. Go to supabase.com → Create free project
2. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env

---

## Monetization — Razorpay Integration

Add subscription payments:
```javascript
// In frontend, add pricing page
// Plans: Free (1 bank) | Pro ₹99/mo (3 banks) | Premium ₹299/mo (unlimited)
// Razorpay setup: razorpay.com → free account → test keys
```

---

## Project Structure
```
india-bank-mcp/
├── mcp-server/
│   ├── src/
│   │   ├── index.js      ← MCP server + all tools
│   │   └── setu.js       ← Setu AA API integration
│   ├── .env.example      ← Config template
│   └── package.json
├── frontend/
│   └── src/
│       └── App.jsx       ← Full React dashboard
├── claude-config.json    ← Claude Desktop config
└── README.md
```

---

## MCP Tools Available to Claude

| Tool | Description |
|---|---|
| `connect_bank` | Initiate bank connection via OTP |
| `list_accounts` | Show all accounts + balances |
| `get_transactions` | Fetch recent transactions |
| `analyze_spending` | Category-wise spending breakdown |
| `get_cash_flow` | Monthly income vs expenses |

---

## Security
- No bank credentials ever stored
- RBI-regulated Account Aggregator framework
- User OTP consent required for every connection
- Data encrypted in transit
- Consent can be revoked anytime

---

## Support & Contact
Built with ❤️ for India. 
Powered by Setu Account Aggregator.
