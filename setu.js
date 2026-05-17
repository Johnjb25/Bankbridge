// setu.js - Setu Account Aggregator API Integration
import axios from "axios";

const SETU_BASE_URL = process.env.SETU_BASE_URL || "https://fiu-sandbox.setu.co";
const SETU_CLIENT_ID = process.env.SETU_CLIENT_ID || "your_client_id";
const SETU_CLIENT_SECRET = process.env.SETU_CLIENT_SECRET || "your_client_secret";
const SETU_PRODUCT_INSTANCE_ID = process.env.SETU_PRODUCT_INSTANCE_ID || "your_product_instance_id";

// Get access token from Setu
export async function getSetuToken() {
  try {
    const response = await axios.post(`${SETU_BASE_URL}/auth/token`, {
      clientID: SETU_CLIENT_ID,
      secret: SETU_CLIENT_SECRET,
    });
    return response.data.accessToken;
  } catch (error) {
    throw new Error(`Setu auth failed: ${error.response?.data?.message || error.message}`);
  }
}

// Create a consent request for user to approve bank access
export async function createConsentRequest(userId, mobileNumber) {
  const token = await getSetuToken();
  const now = new Date();
  const futureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  try {
    const response = await axios.post(
      `${SETU_BASE_URL}/consents`,
      {
        Detail: {
          consentStart: now.toISOString(),
          consentExpiry: futureDate.toISOString(),
          consentMode: "VIEW",
          fetchType: "PERIODIC",
          consentTypes: ["TRANSACTIONS", "SUMMARY", "PROFILE"],
          fiTypes: ["DEPOSIT", "TERM_DEPOSIT", "RECURRING_DEPOSIT", "SAVINGS"],
          DataConsumer: {
            id: SETU_CLIENT_ID,
          },
          Customer: {
            id: `${mobileNumber}@setu`,
          },
          Purpose: {
            code: "101",
            refUri: "https://api.rebit.org.in/aa/purpose/101.xml",
            text: "Wealth management service",
            Category: { type: "string" },
          },
          FIDataRange: {
            from: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
            to: futureDate.toISOString(),
          },
          DataLife: { unit: "YEAR", value: 1 },
          Frequency: { unit: "MONTH", value: 1 },
          DataFilter: [],
        },
        redirectUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/consent-callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-product-instance-id": SETU_PRODUCT_INSTANCE_ID,
        },
      }
    );

    return {
      consentId: response.data.id,
      consentUrl: response.data.url,
      status: response.data.status,
    };
  } catch (error) {
    throw new Error(`Consent creation failed: ${error.response?.data?.message || error.message}`);
  }
}

// Check consent status
export async function getConsentStatus(consentId) {
  const token = await getSetuToken();
  try {
    const response = await axios.get(`${SETU_BASE_URL}/consents/${consentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-product-instance-id": SETU_PRODUCT_INSTANCE_ID,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Consent status check failed: ${error.response?.data?.message || error.message}`);
  }
}

// Create data session to fetch bank data
export async function createDataSession(consentId, fromDate, toDate) {
  const token = await getSetuToken();
  try {
    const response = await axios.post(
      `${SETU_BASE_URL}/sessions`,
      {
        consentId,
        DataRange: {
          from: fromDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          to: toDate || new Date().toISOString(),
        },
        format: "json",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-product-instance-id": SETU_PRODUCT_INSTANCE_ID,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Data session creation failed: ${error.response?.data?.message || error.message}`);
  }
}

// Fetch financial data from session
export async function fetchFinancialData(sessionId) {
  const token = await getSetuToken();
  try {
    const response = await axios.get(`${SETU_BASE_URL}/sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-product-instance-id": SETU_PRODUCT_INSTANCE_ID,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Data fetch failed: ${error.response?.data?.message || error.message}`);
  }
}

// Parse and extract account summary from Setu response
export function parseAccounts(financialData) {
  const accounts = [];
  try {
    const fiObjects = financialData?.FI || [];
    for (const fi of fiObjects) {
      const data = fi?.data?.[0]?.decryptedData || fi?.data?.[0];
      if (data) {
        accounts.push({
          id: fi.fipID || "unknown",
          bank: fi.fipID || "Indian Bank",
          accountType: data.Account?.type || "SAVINGS",
          maskedNumber: data.Account?.maskedAccNumber || "XXXX",
          balance: data.Account?.Summary?.currentBalance || 0,
          currency: "INR",
          lastUpdated: new Date().toISOString(),
        });
      }
    }
  } catch (e) {
    // Return empty if parse fails
  }
  return accounts;
}

// Parse transactions from Setu response
export function parseTransactions(financialData, limit = 50) {
  const transactions = [];
  try {
    const fiObjects = financialData?.FI || [];
    for (const fi of fiObjects) {
      const data = fi?.data?.[0]?.decryptedData || fi?.data?.[0];
      const txns = data?.Account?.Transactions?.Transaction || [];
      for (const txn of txns) {
        transactions.push({
          id: txn.txnId || Math.random().toString(36),
          date: txn.valueDate || txn.transactionTimestamp,
          amount: parseFloat(txn.amount) || 0,
          type: txn.type || "DEBIT",
          narration: txn.narration || "Transaction",
          balance: parseFloat(txn.currentBalance) || 0,
          mode: txn.mode || "OTHER",
          bank: fi.fipID || "Bank",
        });
      }
    }
  } catch (e) {
    // Return empty if parse fails
  }
  return transactions.slice(0, limit);
}

// Categorize transactions using keywords
export function categorizeTransactions(transactions) {
  const categories = {
    "Food & Dining": ["swiggy", "zomato", "restaurant", "food", "cafe", "pizza", "hotel", "dining"],
    "Transport": ["uber", "ola", "rapido", "petrol", "fuel", "metro", "bus", "train", "irctc"],
    "Shopping": ["amazon", "flipkart", "myntra", "meesho", "mall", "shop", "store"],
    "Utilities": ["electricity", "water", "gas", "internet", "airtel", "jio", "bsnl", "wifi"],
    "Health": ["pharmacy", "hospital", "clinic", "doctor", "medical", "health", "apollo", "medplus"],
    "Entertainment": ["netflix", "hotstar", "spotify", "amazon prime", "movie", "theatre"],
    "Education": ["school", "college", "course", "fees", "tuition", "udemy"],
    "Rent & Housing": ["rent", "maintenance", "society", "housing"],
    "Salary & Income": ["salary", "neft", "imps", "credit", "income", "payment received"],
    "ATM & Cash": ["atm", "cash withdrawal"],
    "Transfers": ["transfer", "upi", "neft", "rtgs", "imps"],
    "Other": [],
  };

  return transactions.map((txn) => {
    const narration = txn.narration.toLowerCase();
    let category = "Other";
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some((kw) => narration.includes(kw))) {
        category = cat;
        break;
      }
    }
    return { ...txn, category };
  });
}
