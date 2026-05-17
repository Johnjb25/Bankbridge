// index.js - India Bank MCP Server
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";
import {
  createConsentRequest,
  getConsentStatus,
  createDataSession,
  fetchFinancialData,
  parseAccounts,
  parseTransactions,
  categorizeTransactions,
} from "./setu.js";

dotenv.config();

// In-memory session store (use Supabase in production)
const userSessions = new Map();

const server = new McpServer({
  name: "india-bank-connector",
  version: "1.0.0",
  description: "Connect your Indian bank account to Claude via Setu Account Aggregator",
});

// ─────────────────────────────────────────────
// TOOL 1: Connect Bank Account
// ─────────────────────────────────────────────
server.tool(
  "connect_bank",
  "Connect your Indian bank account (HDFC, SBI, ICICI, Axis, etc.) securely via OTP. No password required.",
  {
    mobile_number: z.string().describe("Your registered mobile number with the bank (10 digits)"),
    user_id: z.string().optional().describe("Optional unique user identifier"),
  },
  async ({ mobile_number, user_id }) => {
    try {
      const userId = user_id || `user_${mobile_number}`;
      const consent = await createConsentRequest(userId, mobile_number);

      userSessions.set(userId, {
        consentId: consent.consentId,
        mobile: mobile_number,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              message: "Bank connection initiated! Please approve access.",
              consent_url: consent.consentUrl,
              consent_id: consent.consentId,
              user_id: userId,
              instructions: [
                "1. Click the consent URL above",
                "2. Select your bank (HDFC, SBI, ICICI, etc.)",
                "3. Enter your registered mobile OTP",
                "4. Approve the data access request",
                "5. Come back and ask Claude to show your accounts",
              ],
              supported_banks: [
                "SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB",
                "Canara", "Bank of Baroda", "IndusInd", "Yes Bank",
                "IDFC First", "Federal Bank", "and 40+ more"
              ],
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: error.message, tip: "Make sure your Setu API keys are configured in .env file" }) }],
      };
    }
  }
);

// ─────────────────────────────────────────────
// TOOL 2: List Accounts & Balances
// ─────────────────────────────────────────────
server.tool(
  "list_accounts",
  "Show all your linked Indian bank accounts with current balances",
  {
    user_id: z.string().describe("Your user ID from connect_bank step"),
  },
  async ({ user_id }) => {
    try {
      const session = userSessions.get(user_id);
      if (!session) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "No bank connected. Please run connect_bank first." }) }],
        };
      }

      // Check consent status
      const consent = await getConsentStatus(session.consentId);
      if (consent.status !== "ACTIVE") {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: "Bank consent not yet approved",
              status: consent.status,
              action: "Please approve the consent request via the URL provided during connect_bank",
            }),
          }],
        };
      }

      // Fetch data
      const dataSession = await createDataSession(session.consentId);
      await new Promise((r) => setTimeout(r, 2000)); // Wait for data
      const financialData = await fetchFinancialData(dataSession.id);
      const accounts = parseAccounts(financialData);

      // Cache data
      userSessions.set(user_id, { ...session, financialData, status: "ACTIVE" });

      const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            total_balance: `₹${totalBalance.toLocaleString("en-IN")}`,
            total_accounts: accounts.length,
            accounts: accounts.map((acc) => ({
              bank: acc.bank,
              type: acc.accountType,
              masked_number: acc.maskedNumber,
              balance: `₹${acc.balance.toLocaleString("en-IN")}`,
              last_updated: acc.lastUpdated,
            })),
          }, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: error.message }) }],
      };
    }
  }
);

// ─────────────────────────────────────────────
// TOOL 3: Get Transactions
// ─────────────────────────────────────────────
server.tool(
  "get_transactions",
  "Get your recent bank transactions with dates, amounts, and merchant details",
  {
    user_id: z.string().describe("Your user ID"),
    limit: z.number().optional().describe("Number of transactions to fetch (default: 20)"),
    days: z.number().optional().describe("Number of past days to fetch (default: 30)"),
  },
  async ({ user_id, limit = 20, days = 30 }) => {
    try {
      const session = userSessions.get(user_id);
      if (!session?.financialData) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Please run list_accounts first to fetch data." }) }],
        };
      }

      const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const rawTransactions = parseTransactions(session.financialData, limit);
      const transactions = categorizeTransactions(rawTransactions);

      // Filter by date
      const filtered = transactions.filter((t) => new Date(t.date) >= new Date(fromDate));

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            period: `Last ${days} days`,
            total_transactions: filtered.length,
            transactions: filtered.map((t) => ({
              date: new Date(t.date).toLocaleDateString("en-IN"),
              description: t.narration,
              amount: `${t.type === "DEBIT" ? "-" : "+"}₹${t.amount.toLocaleString("en-IN")}`,
              type: t.type,
              category: t.category,
              balance_after: `₹${t.balance.toLocaleString("en-IN")}`,
              mode: t.mode,
            })),
          }, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: error.message }) }],
      };
    }
  }
);

// ─────────────────────────────────────────────
// TOOL 4: Analyze Spending
// ─────────────────────────────────────────────
server.tool(
  "analyze_spending",
  "Analyze where you're spending your money — broken down by category with totals and percentages",
  {
    user_id: z.string().describe("Your user ID"),
    days: z.number().optional().describe("Days to analyze (default: 30)"),
  },
  async ({ user_id, days = 30 }) => {
    try {
      const session = userSessions.get(user_id);
      if (!session?.financialData) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Please run list_accounts first." }) }],
        };
      }

      const rawTransactions = parseTransactions(session.financialData, 500);
      const transactions = categorizeTransactions(rawTransactions);
      const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const filtered = transactions.filter((t) => new Date(t.date) >= fromDate);

      const debits = filtered.filter((t) => t.type === "DEBIT");
      const credits = filtered.filter((t) => t.type === "CREDIT");

      const totalSpent = debits.reduce((sum, t) => sum + t.amount, 0);
      const totalIncome = credits.reduce((sum, t) => sum + t.amount, 0);

      // Group by category
      const categoryTotals = {};
      for (const txn of debits) {
        categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + txn.amount;
      }

      const sortedCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .map(([category, amount]) => ({
          category,
          total: `₹${amount.toLocaleString("en-IN")}`,
          percentage: `${((amount / totalSpent) * 100).toFixed(1)}%`,
          transactions: debits.filter((t) => t.category === category).length,
        }));

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            period: `Last ${days} days`,
            summary: {
              total_income: `₹${totalIncome.toLocaleString("en-IN")}`,
              total_spent: `₹${totalSpent.toLocaleString("en-IN")}`,
              net_savings: `₹${(totalIncome - totalSpent).toLocaleString("en-IN")}`,
              savings_rate: totalIncome > 0 ? `${(((totalIncome - totalSpent) / totalIncome) * 100).toFixed(1)}%` : "N/A",
            },
            spending_breakdown: sortedCategories,
            insight: totalSpent > totalIncome
              ? "⚠️ You're spending more than you earn this period."
              : `✅ You saved ₹${(totalIncome - totalSpent).toLocaleString("en-IN")} this period.`,
          }, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: error.message }) }],
      };
    }
  }
);

// ─────────────────────────────────────────────
// TOOL 5: Cash Flow Summary
// ─────────────────────────────────────────────
server.tool(
  "get_cash_flow",
  "Get your monthly income vs expenses cash flow summary",
  {
    user_id: z.string().describe("Your user ID"),
    months: z.number().optional().describe("Number of months to analyze (default: 3)"),
  },
  async ({ user_id, months = 3 }) => {
    try {
      const session = userSessions.get(user_id);
      if (!session?.financialData) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Please run list_accounts first." }) }],
        };
      }

      const rawTransactions = parseTransactions(session.financialData, 1000);
      const transactions = categorizeTransactions(rawTransactions);

      // Group by month
      const monthlyData = {};
      for (const txn of transactions) {
        const date = new Date(txn.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!monthlyData[key]) {
          monthlyData[key] = { income: 0, expenses: 0, transactions: 0 };
        }
        if (txn.type === "CREDIT") monthlyData[key].income += txn.amount;
        else monthlyData[key].expenses += txn.amount;
        monthlyData[key].transactions++;
      }

      const sortedMonths = Object.entries(monthlyData)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, months)
        .map(([month, data]) => ({
          month,
          income: `₹${data.income.toLocaleString("en-IN")}`,
          expenses: `₹${data.expenses.toLocaleString("en-IN")}`,
          net: `₹${(data.income - data.expenses).toLocaleString("en-IN")}`,
          status: data.income >= data.expenses ? "✅ Surplus" : "⚠️ Deficit",
          transactions: data.transactions,
        }));

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            cash_flow_by_month: sortedMonths,
          }, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: error.message }) }],
      };
    }
  }
);

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("🇮🇳 India Bank MCP Server running — Connect your Indian bank to Claude!");
