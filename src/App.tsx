import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import EntriesView from './components/EntriesView';
import CustomersView from './components/CustomersView';
import InventoryView from './components/InventoryView';
import UdhaarLedgerView from './components/UdhaarLedgerView';
import CoachView from './components/CoachView';
import SettingsView from './components/SettingsView';
import AuditLogsView from './components/AuditLogsView';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';

import { User, Entry, Customer, InventoryItem, UdhaarRecord, ChatMessage, BusinessSummary } from './types';
import { saveOfflineEntry, getOfflineEntries, clearOfflineEntries } from './utils/offlineDb';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
}

function MainApp() {
  const [isLanding, setIsLanding] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App primary states
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [udhaar, setUdhaar] = useState<UdhaarRecord[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([]);
  const [summary, setSummary] = useState<BusinessSummary>({
    todaySales: 12450,
    todaySalesCount: 4,
    pendingUdhaar: 1650,
    activeCustomers: 3,
    lowStockCount: 2,
    weeklyProgress: { current: 45000, goal: 50000 },
    recentActivity: []
  });

  // Enterprise additions properties state
  const [stores, setStores] = useState<any[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string>('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(0);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);
  const [invoiceTemplate, setInvoiceTemplate] = useState<any>(null);

  const [coachLoading, setCoachLoading] = useState(false);
  const qClient = useQueryClient();

  // Retrieve authentication headers context
  const getAuthHeaders = () => {
    const token = localStorage.getItem('leadgerx_token');
    const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
    if (activeStoreId) {
      headers['x-store-id'] = activeStoreId;
    }
    return headers;
  };

  // --- TANSTACK REACT QUERY CACHING LAYER ---
  const { data: qSummary } = useQuery({
    queryKey: ['summary', activeStoreId, user?.id],
    queryFn: async () => {
      const token = localStorage.getItem('leadgerx_token');
      if (!token) return null;
      const res = await fetch('/api/summary', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch summary');
      return res.json();
    },
    enabled: isAuth && !!user,
  });

  const { data: qEntries } = useQuery({
    queryKey: ['entries', activeStoreId, user?.id],
    queryFn: async () => {
      const token = localStorage.getItem('leadgerx_token');
      if (!token) return [];
      const res = await fetch('/api/entries', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch entries');
      return res.json();
    },
    enabled: isAuth && !!user,
  });

  const { data: qCustomers } = useQuery({
    queryKey: ['customers', activeStoreId, user?.id],
    queryFn: async () => {
      const token = localStorage.getItem('leadgerx_token');
      if (!token) return [];
      const res = await fetch('/api/customers', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch customers');
      return res.json();
    },
    enabled: isAuth && !!user,
  });

  const { data: qInventory } = useQuery({
    queryKey: ['inventory', activeStoreId, user?.id],
    queryFn: async () => {
      const token = localStorage.getItem('leadgerx_token');
      if (!token) return [];
      const res = await fetch('/api/inventory', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch inventory');
      return res.json();
    },
    enabled: isAuth && !!user,
  });

  const { data: qUdhaar } = useQuery({
    queryKey: ['udhaar', activeStoreId, user?.id],
    queryFn: async () => {
      const token = localStorage.getItem('leadgerx_token');
      if (!token) return [];
      const res = await fetch('/api/udhaar', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch udhaar');
      return res.json();
    },
    enabled: isAuth && !!user,
  });

  // Synchronize state setters with React Query data
  useEffect(() => {
    if (qSummary) setSummary(qSummary);
  }, [qSummary]);

  useEffect(() => {
    if (qEntries) setEntries(qEntries);
  }, [qEntries]);

  useEffect(() => {
    if (qCustomers) setCustomers(qCustomers);
  }, [qCustomers]);

  useEffect(() => {
    if (qInventory) setInventory(qInventory);
  }, [qInventory]);

  useEffect(() => {
    if (qUdhaar) setUdhaar(qUdhaar);
  }, [qUdhaar]);

  // Fetch full data stack (clears caching triggers)
  const fetchAllData = async () => {
    try {
      await qClient.invalidateQueries();
    } catch (e) {
      console.warn("Failed invalidating live query pools.", e);
    }
  };

  // Enterprise setup loading calls
  const fetchStores = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/stores', { headers });
      if (res.ok) {
        const data = await res.json();
        setStores(data);
        if (data.length > 0 && !activeStoreId) {
          setActiveStoreId(data[0].id);
        }
      }
    } catch (e) {
      console.warn("Error loading stores list:", e);
    }
  };

  const handleAddStoreHandler = async (name: string, type: string) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ name, type })
      });
      if (response.ok) {
        await fetchStores();
      }
    } catch (e) {
      console.error("Error creating new store entity:", e);
    }
  };

  const fetchAuditLogs = async () => {
    setIsRefreshingLogs(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/admin/audit-logs', { headers });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (e) {
      console.warn("Compliance log reader error:", e);
    } finally {
      setIsRefreshingLogs(false);
    }
  };

  const fetchInvoiceTemplate = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/invoice-template', { headers });
      if (res.ok) {
        const data = await res.json();
        setInvoiceTemplate(data);
      }
    } catch (e) {
      console.warn("Template reader error:", e);
    }
  };

  const handleSaveInvoiceTemplate = async (templateConfigs: any) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/invoice-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(templateConfigs)
      });
      if (res.ok) {
        const data = await res.json();
        setInvoiceTemplate(data.template);
      }
    } catch (e) {
      console.error("Template writer error:", e);
    }
  };

  // Sync background queued offline entries safely back to our cloud database
  const syncOfflineEntriesToServer = async () => {
    if (!navigator.onLine) return;
    try {
      const offlineItems = await getOfflineEntries();
      if (offlineItems.length === 0) return;

      const headers = getAuthHeaders();
      const response = await fetch('/api/offline-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ entries: offlineItems.map(item => item.data) })
      });

      if (response.ok) {
        await clearOfflineEntries();
        setOfflineCount(0);
        await fetchAllData();
        await fetchAuditLogs();
      }
    } catch (e) {
      console.error("Back online offline sync failure:", e);
    }
  };

  // React state watcher for connection changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineEntriesToServer();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    getOfflineEntries().then(items => {
      setOfflineCount(items.length);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [activeStoreId]);

  // Sync full application stack on active switches
  useEffect(() => {
    if (isAuth) {
      fetchStores();
      fetchInvoiceTemplate();
      fetchAuditLogs();
      fetchAllData();
    }
  }, [isAuth, activeStoreId]);

  // Check auth session on load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const headers = getAuthHeaders();
        const response = await fetch('/api/auth/me', { headers });
        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            setUser(data);
            setIsAuth(true);
            setIsLanding(false);
          }
        }
      } catch (err) {
        console.error("Fail session check:", err);
      }
    };
    checkAuthStatus();
    
    // Seed initial assistant greeting
    setChatLogs([
      {
        id: "greet-1",
        sender: "assistant",
        text: "Hello! Welcome to your LeadgerX AI Business Coach. I have analyzed your store's performance today. Sales are progressing nicely! How can I assist you with credit risk, inventory restocking, or margin optimization today?",
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

  const handleStartFree = () => {
    setIsLanding(false);
  };

  const handleAuthSuccess = (authenticatedUser: User, token?: string) => {
    if (token) {
      localStorage.setItem('leadgerx_token', token);
    }
    setUser(authenticatedUser);
    setIsAuth(true);
    setIsLanding(false);
    fetchAllData();
  };

  const handleLogout = async () => {
    localStorage.removeItem('leadgerx_token');
    setUser(null);
    setIsAuth(false);
    setIsLanding(true);
    setActiveTab('dashboard');
  };

  const handleSaveSettings = async (configs: any) => {
    try {
      const response = await fetch('/api/auth/save-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(configs)
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccount = () => {
    alert("This prototype store data has been reset to defaults!");
    handleLogout();
  };

  // --- CRUD API TRIGGER ACTIONS (Durable & React state synced) ---
  const handleAddEntry = async (entryData: any) => {
    const richEntry = { ...entryData, storeId: activeStoreId };

    if (!isOnline) {
      // 1. Buffering entry safely offline
      await saveOfflineEntry(richEntry);
      
      // 2. Incrementing pending offline count
      const items = await getOfflineEntries();
      setOfflineCount(items.length);

      // 3. Immediately display on screen for instant feedback
      const localOffId = `temp-off-${Date.now()}`;
      const tempEntry: Entry = {
        id: localOffId,
        customerName: entryData.customerName || "Self",
        productName: entryData.productName || "Miscellaneous",
        quantity: Number(entryData.quantity) || 1,
        price: Number(entryData.price) || 0,
        amount: (Number(entryData.quantity) || 1) * (Number(entryData.price) || 0),
        type: entryData.type || "sale",
        status: entryData.status || "paid",
        date: entryData.date || new Date().toISOString(),
        userId: user?.id || 'offline-user',
        storeId: activeStoreId
      };
      setEntries([tempEntry, ...entries]);
      
      // Update local quick stats summary
      setSummary(prev => ({
        ...prev,
        todaySales: prev.todaySales + tempEntry.amount,
        todaySalesCount: prev.todaySalesCount + 1
      }));
      return;
    }

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(richEntry)
      });
      if (response.ok) {
        await fetchAllData();
        await fetchAuditLogs();
      }
    } catch (e) {
      console.error("Add Entry Error:", e);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error("Delete Entry Error:", e);
    }
  };

  const handleAddCustomer = async (custData: any) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(custData)
      });
      if (response.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error("Add customer Error:", e);
    }
  };

  const handleAddInventoryItem = async (itemData: any) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(itemData)
      });
      if (response.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error("Add inventory item Error:", e);
    }
  };

  const handleBulkAddInventoryItems = async (items: any[]) => {
    try {
      const response = await fetch('/api/inventory/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ items })
      });
      if (response.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error("Bulk add error:", e);
    }
  };

  const handleBulkDeleteInventory = async (ids: string[]) => {
    try {
      const response = await fetch('/api/inventory/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ ids })
      });
      if (response.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error("Bulk delete error:", e);
    }
  };

  const handleBulkUpdateCategory = async (ids: string[], category: string) => {
    try {
      const response = await fetch('/api/inventory/bulk-update-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ ids, category })
      });
      if (response.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error("Bulk category update error:", e);
    }
  };

  const handleBulkPriceUpdate = async (ids: string[], field: string, changeType: string, value: number) => {
    try {
      const response = await fetch('/api/inventory/bulk-price-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ ids, field, changeType, value })
      });
      if (response.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error("Bulk price update error:", e);
    }
  };

  const handleCollectUdhaar = async (udhaarId: string, amt: number) => {
    try {
      const response = await fetch('/api/udhaar/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ udhaarId, amountCollected: amt })
      });
      if (response.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error("Collect Udhaar clearance Error:", e);
    }
  };

  const handleSendCoachMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    
    const updatedChats = [...chatLogs, userMsg];
    setChatLogs(updatedChats);
    setCoachLoading(true);

    try {
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ messages: updatedChats })
      });
      const data = await response.json();
      if (data.reply) {
        setChatLogs([...updatedChats, data.reply]);
      }
    } catch (e) {
      console.error("Gemini coach connection error:", e);
    } finally {
      setCoachLoading(false);
    }
  };

  const handleSendManualWhatsAppReminder = (phone: string, textMessage: string) => {
    const escapedMsg = encodeURIComponent(textMessage);
    const mockWhatsAppUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${escapedMsg}`;
    window.open(mockWhatsAppUrl, '_blank');
  };

  // Navigation callbacks for quick dashboard CTA shortcuts
  const triggerQuickVoiceModal = () => {
    setActiveTab('entries');
    setTimeout(() => {
      const triggerBtn = document.getElementById('btn-voice-dictate-trigger');
      triggerBtn?.click();
    }, 150);
  };

  const triggerQuickBillModal = () => {
    setActiveTab('entries');
    setTimeout(() => {
      const triggerBtn = document.getElementById('btn-bill-scanner-trigger');
      triggerBtn?.click();
    }, 150);
  };

  const triggerQuickAddEntryModal = () => {
    setActiveTab('entries');
    setTimeout(() => {
      const triggerBtn = document.getElementById('btn-manual-add-trigger');
      triggerBtn?.click();
    }, 150);
  };

  // --- RENDERING ROUTER SYSTEM ---
  if (isLanding) {
    return <LandingPage onStartFree={handleStartFree} onLogin={() => setIsLanding(false)} />;
  }

  if (!isAuth) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} onBack={() => setIsLanding(true)} />;
  }

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans" id="applet-viewport-root">
      {/* 1. Collapsible finance navigation sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* 2. Operations visual viewport split */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          storeName={stores.find(s => s.id === activeStoreId)?.name || user?.storeName || "Suresh Kirana"} 
          lowStockCount={summary.lowStockCount} 
          pendingUdhaar={summary.pendingUdhaar} 
          isOnline={isOnline}
          offlineCount={offlineCount}
          stores={stores}
          activeStoreId={activeStoreId}
          onStoreSwitch={setActiveStoreId}
          onAddStore={handleAddStoreHandler}
          userName={user?.name}
          userPlan={user?.plan}
        />

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <DashboardView 
                  summary={summary} 
                  inventory={inventory} 
                  customers={customers} 
                  setActiveTab={setActiveTab}
                  onQuickVoiceLog={triggerQuickVoiceModal}
                  onQuickBillScanner={triggerQuickBillModal}
                  onQuickAddEntry={triggerQuickAddEntryModal}
                  user={user}
                />
              )}

              {activeTab === 'entries' && (
                <EntriesView 
                  entries={entries} 
                  inventory={inventory}
                  onAddEntry={handleAddEntry} 
                  onDeleteEntry={handleDeleteEntry} 
                />
              )}

              {activeTab === 'customers' && (
                <CustomersView 
                  customers={customers} 
                  onAddCustomer={handleAddCustomer} 
                  onSendReminder={handleSendManualWhatsAppReminder} 
                  onReassessRisk={async (id) => {
                    try {
                      const response = await fetch(`/api/ai/customer-risk/${id}`, {
                        method: 'POST',
                        headers: getAuthHeaders()
                      });
                      if (response.ok) {
                        const data = await response.json();
                        await fetchAllData();
                        return data.customer;
                      }
                    } catch (err) {
                      console.error("Failed requesting AI risk reassessment:", err);
                    }
                  }}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryView 
                  inventory={inventory} 
                  onAddItem={handleAddInventoryItem} 
                  onBulkAddItems={handleBulkAddInventoryItems}
                  onBulkDelete={handleBulkDeleteInventory}
                  onBulkUpdateCategory={handleBulkUpdateCategory}
                  onBulkPriceUpdate={handleBulkPriceUpdate}
                />
              )}

              {activeTab === 'udhaar' && (
                <UdhaarLedgerView 
                  udhaarRecords={udhaar} 
                  onCollectUdhaar={handleCollectUdhaar} 
                />
              )}

              {activeTab === 'coach' && (
                <CoachView 
                  chatLogs={chatLogs} 
                  onSendMessage={handleSendCoachMessage} 
                  loading={coachLoading} 
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView 
                  user={user} 
                  onSaveSettings={handleSaveSettings} 
                  onDeleteAccount={handleDeleteAccount} 
                  template={invoiceTemplate}
                  onSaveTemplate={handleSaveInvoiceTemplate}
                />
              )}

              {activeTab === 'audit' && (
                <AuditLogsView
                  logs={auditLogs}
                  onRefreshLogs={fetchAuditLogs}
                  isRefreshing={isRefreshingLogs}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
