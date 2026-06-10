import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, ShieldCheck, Mail, Store, Key, CircleAlert, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { User } from '../types';

interface SettingsProps {
  user: User | null;
  onSaveSettings: (settings: { name: string; storeName: string; email: string; plan: 'Free' | 'Pro' }) => Promise<void>;
  onDeleteAccount: () => void;
}

export default function SettingsView({ user, onSaveSettings, onDeleteAccount }: SettingsProps) {
  const [name, setName] = useState(user?.name || 'Suresh Kumar');
  const [storeName, setStoreName] = useState(user?.storeName || 'Suresh Kirana Store');
  const [email, setEmail] = useState(user?.email || 'prashantmenaria7@gmail.com');
  const [plan, setPlan] = useState<'Free' | 'Pro'>(user?.plan || 'Pro');

  const [notifSound, setNotifSound] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings({ name, storeName, email, plan });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-8 space-y-6 max-w-2xl" id="settings-module-container">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5 font-display">
          Store Settings <span className="text-[10px] bg-slate-100 border border-slate-205 text-slate-700 font-bold px-2.5 py-0.5 rounded-full uppercase font-sans">Setup</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium font-sans">Adjust checkout configurations, account plans, business titles and notification parameters.</p>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3.5 border border-emerald-200 rounded-2xl" id="settings-save-alert">
          Settings successfully persisted to server database store!
        </div>
      )}

      {/* Primary store properties card */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6">
        <form onSubmit={handleSaveSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Owner Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Store Trade Title</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Primary Contact email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subscription Account Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-700"
            >
              <option value="Pro">Pro Access (₹499/Mo automatic billing)</option>
              <option value="Free">Free Basic (Limits Voice Logs / Vision Scanner)</option>
            </select>
          </div>

          <button
            type="submit"
            id="btn-save-settings"
            className="px-6 py-2.5 bg-black hover:bg-slate-800 text-white rounded-full text-xs font-bold shadow-md cursor-pointer transition-colors"
          >
            Save configurations
          </button>
        </form>
      </div>

      {/* Notification and backup options card */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Business preferences</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs text-slate-900 leading-none">Instant WhatsApp Alerts</h4>
            <p className="text-[10px] text-slate-400 mt-1">Automatically alert udhaar credit accounts upon 14-days expiration thresholds.</p>
          </div>
          <button 
            type="button" 
            onClick={() => setNotifSound(!notifSound)}
            className="text-slate-700 cursor-pointer text-lg leading-none shrink-0"
          >
            {notifSound ? <ToggleRight className="h-9 w-9 text-slate-900" /> : <ToggleLeft className="h-9 w-9 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Account Deletion card warning */}
      <div className="bg-red-50/50 border border-red-150 rounded-3xl p-6 space-y-3.5">
        <div className="flex gap-2.5">
          <CircleAlert className="h-5 w-5 text-red-650 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs text-red-950 leading-none">Purge Store Database and Logs</h4>
            <p className="text-[10px] text-red-700 leading-relaxed font-sans">Clearing Suresh Kirana Store purges regional transactions logs, CRM contacts, and outstanding due ledgers permanently.</p>
          </div>
        </div>

        <button
          onClick={onDeleteAccount}
          id="btn-purge-settings"
          className="border border-red-200 hover:border-red-400 bg-white hover:bg-red-50 text-red-600 font-bold px-4 py-2 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Purge all records
        </button>
      </div>
    </div>
  );
}
