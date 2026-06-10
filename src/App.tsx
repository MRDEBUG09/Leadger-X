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
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';

import { User, Entry, Customer, InventoryItem, UdhaarRecord, ChatMessage, BusinessSummary } from './types';

export default function App() {
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

  const [coachLoading, setCoachLoading] = useState(false);

  // Retrieve authentication headers context
  const getAuthHeaders = () => {
    const token = localStorage.getItem('leadgerx_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Fetch full data stack
  const fetchAllData = async () => {
    try {
      const headers = getAuthHeaders();
      const [resSummary, resEntries, resCust, resInv, resUdhaar] = await Promise.all([
        fetch('/api/summary', { headers }),
        fetch('/api/entries', { headers }),
        fetch('/api/customers', { headers }),
        fetch('/api/inventory', { headers }),
        fetch('/api/udhaar', { headers })
      ]);

      const [dataSummary, dataEntries, dataCust, dataInv, dataUdhaar] = await Promise.all([
        resSummary.json(),
        resEntries.json(),
        resCust.json(),
        resInv.json(),
        resUdhaar.json()
      ]);

      setSummary(dataSummary);
      setEntries(dataEntries);
      setCustomers(dataCust);
      setInventory(dataInv);
      setUdhaar(dataUdhaar);
    } catch (e) {
      console.warn("Failed fetching live datasets, loading seeding fallback.", e);
    }
  };

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
            fetchAllData();
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
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(entryData)
      });
      if (response.ok) {
        await fetchAllData();
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
          storeName={user?.storeName || "Suresh Kirana"} 
          lowStockCount={summary.lowStockCount} 
          pendingUdhaar={summary.pendingUdhaar} 
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
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
