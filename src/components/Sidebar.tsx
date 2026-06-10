import React from 'react';
import { LayoutDashboard, ReceiptText, Users, Package, CreditCard, MessageSquare, ShieldAlert, Settings, LogOut, Activity } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'entries', name: 'Entries', icon: ReceiptText },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'inventory', name: 'Inventory', icon: Package },
    { id: 'udhaar', name: 'Udhaar Ledger', icon: CreditCard },
    { id: 'coach', name: 'AI Business Coach', icon: MessageSquare },
    { id: 'audit', name: 'Audit Logs', icon: Activity },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const allowedMenuItems = menuItems.filter(item => {
    if (user?.role === 'Employee') {
      return item.id !== 'audit' && item.id !== 'settings';
    }
    return true;
  });

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col justify-between sticky top-0" id="leadgerx-sidebar">
      <div>
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
            <div className="w-4 h-4 border-2 border-emerald-400 rotate-45"></div>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-black leading-none">
              LeadgerX<span className="text-emerald-500 underline decoration-2 underline-offset-4">AI</span>
            </h1>
            <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider mt-1">Business OS</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {allowedMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-black text-white shadow-md'
                    : 'text-slate-500 hover:text-black hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 font-bold text-slate-800 flex items-center justify-center border border-slate-200 shadow-3xs">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'SK'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-slate-900 truncate tracking-tight">{user?.storeName || 'Suresh Kirana'}</h4>
            <p className="text-[10px] text-emerald-600 font-bold tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              {user?.plan ? `${user.plan} Account` : 'Pro Plan'}
            </p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          id="btn-sidebar-logout"
          className="w-full border border-slate-200 hover:border-red-200 bg-white text-slate-500 hover:text-red-650 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log Out
        </button>
      </div>
    </div>
  );
}
