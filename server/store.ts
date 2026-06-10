import fs from 'fs';
import path from 'path';
import { User, Entry, Customer, InventoryItem, UdhaarRecord, ChatMessage } from '../src/types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

interface DatabaseSchema {
  users: User[];
  entries: Entry[];
  customers: Customer[];
  inventory: InventoryItem[];
  udhaar: UdhaarRecord[];
  chatHistory: ChatMessage[];
}

const DEFAULT_DB: DatabaseSchema = {
  users: [
    {
      id: "user-suresh",
      email: "prashantmenaria7@gmail.com",
      name: "Suresh Kumar",
      storeName: "Suresh Kirana Store",
      plan: "Pro"
    }
  ],
  entries: [
    {
      id: "e-1",
      customerName: "Amit Singh",
      productName: "Aashirvaad Atta 5kg",
      quantity: 2,
      price: 270,
      amount: 540,
      type: "sale",
      status: "paid",
      date: "2026-06-09T10:30:00Z"
    },
    {
      id: "e-2",
      customerName: "Priya Sharma",
      productName: "Amul Butter 100g",
      quantity: 3,
      price: 55,
      amount: 165,
      type: "sale",
      status: "udhaar",
      date: "2026-06-09T14:45:00Z"
    },
    {
      id: "e-3",
      customerName: "Rahul Kumar",
      productName: "Tata Salt 1kg",
      quantity: 1,
      price: 25,
      amount: 25,
      type: "sale",
      status: "udhaar",
      date: "2026-06-10T08:00:00Z"
    },
    {
      id: "e-4",
      customerName: "Self",
      productName: "Shop Cleaning Supplies",
      quantity: 1,
      price: 350,
      amount: 350,
      type: "expense",
      status: "paid",
      date: "2026-06-08T11:20:00Z"
    },
    {
      id: "e-5",
      customerName: "Amit Singh",
      productName: "Fortune Mustard Oil 1L",
      quantity: 2,
      price: 180,
      amount: 360,
      type: "sale",
      status: "paid",
      date: "2026-06-10T09:15:00Z"
    }
  ],
  customers: [
    {
      id: "cust-1",
      name: "Amit Singh",
      phone: "+91 98765 43210",
      email: "amit.singh@gmail.com",
      outstandingBalance: 0,
      aiRiskScore: 12,
      aiRiskStatus: "Low",
      aiRecoverySuggestions: [
        "Excellent payor. Offer seasonal discount.",
        "Consider expanding high-margin snack items to this customer."
      ],
      purchaseCount: 15
    },
    {
      id: "cust-2",
      name: "Priya Sharma",
      phone: "+91 91234 56789",
      email: "priya.sharma@hotmail.com",
      outstandingBalance: 1200,
      aiRiskScore: 38,
      aiRiskStatus: "Medium",
      aiRecoverySuggestions: [
        "Gentle WhatsApp reminder on weekend.",
        "Suggest partial payment option next visit."
      ],
      purchaseCount: 8
    },
    {
      id: "cust-3",
      name: "Rahul Kumar",
      phone: "+91 88888 77777",
      email: "rahul.k@outlook.com",
      outstandingBalance: 450,
      aiRiskScore: 65,
      aiRiskStatus: "Medium",
      aiRecoverySuggestions: [
        "Request pending payment clear before logging new udhaar.",
        "Set strict limit of ₹500 outstanding credit limit."
      ],
      purchaseCount: 4
    }
  ],
  inventory: [
    {
      id: "inv-1",
      name: "Aashirvaad Atta 5kg",
      sku: "AA-5K",
      stock: 12,
      minStockAlert: 15,
      purchasePrice: 240,
      sellingPrice: 270,
      category: "Grocery",
      supplierName: "ITC Distributor",
      expiryDate: "2026-12-31"
    },
    {
      id: "inv-2",
      name: "Tata Salt 1kg",
      sku: "TS-1K",
      stock: 3,
      minStockAlert: 10,
      purchasePrice: 21,
      sellingPrice: 25,
      category: "Grocery",
      supplierName: "Tata Foods Ltd",
      expiryDate: "2027-04-15"
    },
    {
      id: "inv-3",
      name: "Maggi Noodles",
      sku: "MN-70",
      stock: 0,
      minStockAlert: 20,
      purchasePrice: 11,
      sellingPrice: 14,
      category: "Packaged Foods",
      supplierName: "Nestle Distribution",
      expiryDate: "2026-11-20"
    },
    {
      id: "inv-4",
      name: "Amul Butter 100g",
      sku: "AB-100",
      stock: 24,
      minStockAlert: 8,
      purchasePrice: 48,
      sellingPrice: 55,
      category: "Dairy",
      supplierName: "Amul Distributor",
      expiryDate: "2026-07-15"
    },
    {
      id: "inv-5",
      name: "Fortune Mustard Oil 1L",
      sku: "FMO-1",
      stock: 35,
      minStockAlert: 10,
      purchasePrice: 150,
      sellingPrice: 180,
      category: "Oils",
      supplierName: "Adani Wilmar Ltd",
      expiryDate: "2026-10-10"
    }
  ],
  udhaar: [
    {
      id: "u-1",
      customerId: "cust-2",
      customerName: "Priya Sharma",
      amount: 1200,
      status: "pending",
      dueDate: "2026-06-25T00:00:00Z",
      dateCreated: "2026-06-09T14:45:00Z",
      paymentHistory: []
    },
    {
      id: "u-2",
      customerId: "cust-3",
      customerName: "Rahul Kumar",
      amount: 450,
      status: "pending",
      dueDate: "2026-06-25T00:00:00Z",
      dateCreated: "2026-06-10T08:00:00Z",
      paymentHistory: []
    }
  ],
  chatHistory: [
    {
      id: "c-1",
      sender: "assistant",
      text: "Hello Suresh! Welcome to LeadgerX Business Coach. I've analyzed your sales today. Your sales are pacing nicely! Ask me anything about increasing your profitability or restock requirements.",
      timestamp: "2026-06-10T07:34:16Z"
    }
  ]
};

export class LocalStore {
  private static init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      this.save(DEFAULT_DB);
    }
  }

  private static load(): DatabaseSchema {
    this.init();
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading db file, restoring defaults.", e);
      return DEFAULT_DB;
    }
  }

  private static save(data: DatabaseSchema) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Get all data
  public static getAll() {
    return this.load();
  }

  // Generic DB setter
  public static updateAll(updater: (db: DatabaseSchema) => void) {
    const db = this.load();
    updater(db);
    this.save(db);
  }

  // Helper getters
  public static getUsers() { return this.load().users; }
  public static getEntries() { return this.load().entries; }
  public static getCustomers() { return this.load().customers; }
  public static getInventory() { return this.load().inventory; }
  public static getUdhaar() { return this.load().udhaar; }
  public static getChatHistory() { return this.load().chatHistory; }
}
