import { Schema, model, Document } from 'mongoose';

// 1. Role Schema and Interface
export interface IRole extends Document {
  name: 'Owner' | 'Manager' | 'Employee' | 'Admin';
  permissions: string[];
}

export const RoleSchema = new Schema<IRole>({
  name: { type: String, required: true, enum: ['Owner', 'Manager', 'Employee', 'Admin'] },
  permissions: [{ type: String }]
});

export const RoleModel = model<IRole>('Role', RoleSchema);

// 2. User Schema and Interface
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  storeName: string;
  role: 'Owner' | 'Manager' | 'Employee' | 'Admin';
  plan: 'Free' | 'Pro';
  activeStoreId?: string;
  createdAt: Date;
}

export const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  storeName: { type: String, default: 'LeadgerX Shop' },
  role: { type: String, enum: ['Owner', 'Manager', 'Employee', 'Admin'], default: 'Owner' },
  plan: { type: String, enum: ['Free', 'Pro'], default: 'Pro' },
  activeStoreId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const UserModel = model<IUser>('User', UserSchema);

// 3. Store Schema and Interface
export interface IStore extends Document {
  name: string;
  type: string; // "kirana", "medical", etc.
  ownerId: Schema.Types.ObjectId;
  address?: string;
  gstin?: string;
  createdAt: Date;
}

export const StoreSchema = new Schema<IStore>({
  name: { type: String, required: true },
  type: { type: String, default: 'kirana' },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String },
  gstin: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const StoreModel = model<IStore>('Store', StoreSchema);

// 4. Entry Schema and Interface
export interface IEntry extends Document {
  storeId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  customerName: string;
  productName: string;
  quantity: number;
  price: number;
  amount: number;
  type: 'sale' | 'purchase' | 'expense' | 'income' | 'return';
  status: 'paid' | 'pending' | 'udhaar';
  paymentMethod: 'cash' | 'upi' | 'card' | 'credit';
  date: Date;
  notes?: string;
}

export const EntrySchema = new Schema<IEntry>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 },
  type: { type: String, enum: ['sale', 'purchase', 'expense', 'income', 'return'], required: true },
  status: { type: String, enum: ['paid', 'pending', 'udhaar'], default: 'paid' },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'credit'], default: 'cash' },
  date: { type: Date, default: Date.now },
  notes: { type: String }
});

export const EntryModel = model<IEntry>('Entry', EntrySchema);

// 5. Customer Schema and Interface
export interface ICustomer extends Document {
  storeId: Schema.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  outstandingBalance: number;
  aiRiskScore: number;
  aiRiskStatus: 'Low' | 'Medium' | 'High';
  aiRecoverySuggestions: string[];
  purchaseCount: number;
  tags?: string[];
  notes?: string;
}

export const CustomerSchema = new Schema<ICustomer>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  outstandingBalance: { type: Number, default: 0 },
  aiRiskScore: { type: Number, default: 0 },
  aiRiskStatus: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  aiRecoverySuggestions: [{ type: String }],
  purchaseCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  notes: { type: String }
});

export const CustomerModel = model<ICustomer>('Customer', CustomerSchema);

// 6. Inventory Schema and Interface
export interface IInventory extends Document {
  storeId: Schema.Types.ObjectId;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  purchasePrice?: number;
  expiryDate?: Date;
  supplierName?: string;
  barcode?: string;
  qrCode?: string;
}

export const InventorySchema = new Schema<IInventory>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true, default: 'General' },
  stock: { type: Number, required: true, default: 0 },
  minStock: { type: Number, required: true, default: 5 },
  price: { type: Number, required: true, default: 0 },
  purchasePrice: { type: Number },
  expiryDate: { type: Date },
  supplierName: { type: String },
  barcode: { type: String },
  qrCode: { type: String }
});

export const InventoryModel = model<IInventory>('Inventory', InventorySchema);

// 7. Supplier Schema and Interface
export interface ISupplier extends Document {
  storeId: Schema.Types.ObjectId;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  outstandingBalance: number;
}

export const SupplierSchema = new Schema<ISupplier>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  name: { type: String, required: true },
  contactPerson: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  outstandingBalance: { type: Number, default: 0 }
});

export const SupplierModel = model<ISupplier>('Supplier', SupplierSchema);

// 8. Transaction Schema and Interface
export interface ITransaction extends Document {
  storeId: Schema.Types.ObjectId;
  refId: string; // e-id or custom-id
  amount: number;
  type: 'credit' | 'debit';
  timestamp: Date;
  details: string;
}

export const TransactionSchema = new Schema<ITransaction>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  refId: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String, required: true }
});

export const TransactionModel = model<ITransaction>('Transaction', TransactionSchema);

// 9. Udhaar Ledger Schema and Interface
export interface IUdhaar extends Document {
  storeId: Schema.Types.ObjectId;
  customerId: Schema.Types.ObjectId;
  totalAmount: number;
  pendingAmount: number;
  dueDate?: Date;
  status: 'active' | 'settled';
  lastPaymentDate?: Date;
  paymentHistory: { date: Date; amount: number }[];
}

export const UdhaarSchema = new Schema<IUdhaar>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  totalAmount: { type: Number, required: true },
  pendingAmount: { type: Number, required: true },
  dueDate: { type: Date },
  status: { type: String, enum: ['active', 'settled'], default: 'active' },
  lastPaymentDate: { type: Date },
  paymentHistory: [{
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true }
  }]
});

export const UdhaarModel = model<IUdhaar>('Udhaar', UdhaarSchema);

// 10. Notification Schema and Interface
export interface INotification extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  message: string;
  type: 'UDHAAR_OVERDUE' | 'LOW_STOCK' | 'SYSTEM' | 'REPORT' | 'AI_COACH';
  isRead: boolean;
  createdAt: Date;
}

export const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['UDHAAR_OVERDUE', 'LOW_STOCK', 'SYSTEM', 'REPORT', 'AI_COACH'], required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const NotificationModel = model<INotification>('Notification', NotificationSchema);

// 11. Report Schema and Interface
export interface IReport extends Document {
  storeId: Schema.Types.ObjectId;
  type: 'sales' | 'udhaar' | 'inventory' | 'profit';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  downloadUrl?: string;
  createdAt: Date;
}

export const ReportSchema = new Schema<IReport>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  type: { type: String, enum: ['sales', 'udhaar', 'inventory', 'profit'], required: true },
  period: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], required: true },
  downloadUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const ReportModel = model<IReport>('Report', ReportSchema);

// 12. ChatHistory Schema and Interface
export interface IChatHistory extends Document {
  userId: Schema.Types.ObjectId;
  messages: { role: 'user' | 'assistant'; content: string; timestamp: Date }[];
  updatedAt: Date;
}

export const ChatHistorySchema = new Schema<IChatHistory>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
});

export const ChatHistoryModel = model<IChatHistory>('ChatHistory', ChatHistorySchema);

// 13. AIInsight Schema and Interface
export interface IAIInsight extends Document {
  storeId: Schema.Types.ObjectId;
  metricName: string;
  recommendation: string;
  importance: 'high' | 'medium' | 'low';
  createdAt: Date;
}

export const AIInsightSchema = new Schema<IAIInsight>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  metricName: { type: String, required: true },
  recommendation: { type: String, required: true },
  importance: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  createdAt: { type: Date, default: Date.now }
});

export const AIInsightModel = model<IAIInsight>('AIInsight', AIInsightSchema);

// 14. ActivityLog Schema and Interface
export interface IActivityLog extends Document {
  userId: Schema.Types.ObjectId;
  userName: string;
  action: string;
  details: string;
  storeId: Schema.Types.ObjectId;
  timestamp: Date;
}

export const ActivityLogSchema = new Schema<IActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  timestamp: { type: Date, default: Date.now }
});

export const ActivityLogModel = model<IActivityLog>('ActivityLog', ActivityLogSchema);

// 15. SystemSettings Schema and Interface
export interface ISystemSettings extends Document {
  storeId: Schema.Types.ObjectId;
  gstinEnabled: boolean;
  termsEnabled: boolean;
  termsText: string;
  whatsappAutomation: boolean;
  themeColor: string;
}

export const SystemSettingsSchema = new Schema<ISystemSettings>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', unique: true, required: true },
  gstinEnabled: { type: Boolean, default: true },
  termsEnabled: { type: Boolean, default: true },
  termsText: { type: String, default: 'Computer-generated billing. Goods once sold cannot be returned.' },
  whatsappAutomation: { type: Boolean, default: true },
  themeColor: { type: String, default: '#0f766e' }
});

export const SystemSettingsModel = model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
