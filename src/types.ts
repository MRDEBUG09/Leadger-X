export interface User {
  id: string;
  email: string;
  name: string;
  storeName: string;
  plan: 'Free' | 'Pro';
}

export interface Entry {
  id: string;
  customerId?: string;
  customerName: string;
  productId?: string;
  productName: string;
  quantity: number;
  price: number;
  amount: number;
  type: 'sale' | 'expense';
  status: 'paid' | 'pending' | 'udhaar';
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  outstandingBalance: number; // Total unpaid Udhaar
  aiRiskScore: number; // Low (1-30), Medium (31-70), High (71-100)
  aiRiskStatus: 'Low' | 'Medium' | 'High';
  aiRecoverySuggestions: string[];
  purchaseCount: number;
}

export interface UdhaarRecord {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: 'pending' | 'partially_paid' | 'settled';
  dueDate: string;
  dateCreated: string;
  lastPaymentDate?: string;
  paymentHistory: { date: string; amount: number }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  stock: number;
  minStockAlert: number;
  purchasePrice: number;
  sellingPrice: number;
  category: string;
  supplierName?: string;
  expiryDate?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface BusinessSummary {
  todaySales: number;
  todaySalesCount: number;
  pendingUdhaar: number;
  activeCustomers: number;
  lowStockCount: number;
  weeklyProgress: { current: number; goal: number };
  recentActivity: { id: string; type: string; title: string; subtitle: string; time: string }[];
}
