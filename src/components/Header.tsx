import React, { useState, useEffect } from 'react';
import { Search, Bell, AlertTriangle, ArrowRight, User, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  storeName: string;
  lowStockCount: number;
  pendingUdhaar: number;
  isOnline: boolean;
  offlineCount: number;
  stores: any[];
  activeStoreId: string;
  onStoreSwitch: (id: string) => void;
  onAddStore: (name: string, type: string) => void;
  userName?: string;
  userPlan?: string;
}

export default function Header({ 
  storeName, 
  lowStockCount, 
  pendingUdhaar,
  isOnline,
  offlineCount,
  stores,
  activeStoreId,
  onStoreSwitch,
  onAddStore,
  userName = "Suresh",
  userPlan = "Pro"
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    // Generate standard form e.g. Wed, 3 Jun 2026
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date("2026-06-10T13:02:10Z");
    const dayName = days[d.getUTCDay()];
    const dateNum = d.getUTCDate();
    const monthName = months[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    setCurrentDateStr(`${dayName}, ${dateNum} ${monthName} ${year}`);
  }, []);

  return (
    <div className="h-18 px-8 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-20" id="header-container">
      {/* Greetings & Date */}
      <div>
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          Good morning, {userName} <span className="animate-bounce">👋</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">{currentDateStr || "Wed, 10 Jun 2026"}</p>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-4">
        {/* Sync Status Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full select-none cursor-help shrink-0" title={isOnline ? "LeadgerX sync engine connected" : "You are working offline. Entries are buffered safely in IndexedDB"}>
          <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'}`} />
          <span className="text-[10px] font-bold text-slate-600 tracking-tight">
            {isOnline ? 'ONLINE' : `OFFLINE (${offlineCount} PENDING)`}
          </span>
        </div>

        {/* Search Input bar */}
        <div className="relative w-64 hidden xl:block">
          <span className="absolute left-3.5 top-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            id="global-sc-bar"
            placeholder="Search entries, items, customers..."
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-black text-xs px-9 py-2.5 rounded-full focus:outline-none transition-all font-medium"
          />
        </div>

        {/* Notifications Tray */}
        <div className="relative">
          <button
            id="btn-header-bell"
            onClick={() => setShowNotifications(!showNotifications)}
            className="h-9 w-9 border border-slate-205 hover:bg-slate-50 rounded-full flex items-center justify-center relative transition-all cursor-pointer"
          >
            <Bell className="h-4 w-4 text-slate-600" />
            {(lowStockCount > 0 || pendingUdhaar > 0) && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 border border-white animate-pulse"></span>
            )}
          </button>

          {/* Tray Box dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-4 space-y-3 z-30" id="notification-bell-tray">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="font-bold text-xs text-slate-900 tracking-tight">Active Alerts</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Realtime System</span>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {lowStockCount > 0 && (
                  <div className="flex gap-2.5 bg-red-50/50 p-2.5 rounded-lg border border-red-100">
                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-red-950">Low Inventory levels</p>
                      <p className="text-[10px] text-red-700 leading-relaxed">You have {lowStockCount} item(s) approaching/at critical zero stock volumes.</p>
                    </div>
                  </div>
                )}

                {pendingUdhaar > 0 && (
                  <div className="flex gap-2.5 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-amber-950">Outstanding Credit</p>
                      <p className="text-[10px] text-amber-700 leading-relaxed">₹{pendingUdhaar.toLocaleString()} credit collection awaiting payment recovery.</p>
                    </div>
                  </div>
                )}

                {lowStockCount === 0 && pendingUdhaar === 0 && (
                  <div className="text-center py-6 space-y-1.5">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-800">No active shop alerts!</p>
                    <p className="text-[10px] text-slate-400">All inventory and ledger records healthy.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Store Selector dropdown */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <div className="h-8 w-8 rounded-lg bg-teal-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {storeName ? storeName.slice(0, 2).toUpperCase() : 'SK'}
          </div>
          <div className="text-left select-none">
            <select
              value={activeStoreId}
              onChange={(e) => onStoreSwitch(e.target.value)}
              className="font-bold text-xs text-slate-900 bg-transparent border-none pr-1.5 focus:outline-none focus:ring-0 cursor-pointer outline-none hover:text-teal-700 transition-colors"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 mt-0.5 leading-none">
              <span className="text-[9px] bg-teal-50 border border-teal-100 text-teal-700 font-bold uppercase tracking-wider px-1 rounded-sm">
                {userPlan} Tier
              </span>
              <button
                onClick={() => {
                  const name = prompt("Enter new business / store name:");
                  if (name) onAddStore(name, "kirana");
                }}
                className="text-[9px] text-slate-400 hover:text-slate-900 font-bold transition-all underline cursor-pointer"
              >
                + New Entity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
