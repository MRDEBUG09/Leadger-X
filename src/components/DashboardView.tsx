import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Mic, ArrowUpRight, ArrowDownRight, Users, CreditCard, Package, ChevronRight, CheckCircle, RefreshCw, FileText, Check, AlertTriangle, Play } from 'lucide-react';
import { Entry, Customer, InventoryItem, BusinessSummary, User } from '../types';

interface DashboardProps {
  summary: BusinessSummary;
  inventory: InventoryItem[];
  customers: Customer[];
  setActiveTab: (tab: string) => void;
  onQuickVoiceLog: () => void;
  onQuickBillScanner: () => void;
  onQuickAddEntry: () => void;
  user?: User | null;
}

export default function DashboardView({ 
  summary, 
  inventory, 
  customers, 
  setActiveTab, 
  onQuickVoiceLog, 
  onQuickBillScanner, 
  onQuickAddEntry,
  user
}: DashboardProps) {

  const progressPercent = Math.min(100, Math.round((summary.weeklyProgress?.current / summary.weeklyProgress?.goal) * 100)) || 90;

  return (
    <div className="p-8 space-y-6" id="dashboard-viewport">
      {/* 1. Large Hero Interactive Assist Banner */}
      <div className="bg-black text-white p-6 md:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden" id="dashboard-ai-hero">
        {/* Abstract subtle visual gradient elements */}
        <div className="absolute -right-4 -top-4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="space-y-2.5 max-w-xl z-10">
          <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
            AI Assistant Active
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">Log entries with your voice</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Tap the mic and dictact your sale like <span className="italic font-bold text-slate-200">"Sold 5 units to Amit on credit"</span>. We'll extract variables, update regional inventory, and sync udhaar books instantly.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={onQuickVoiceLog}
            id="btn-hero-voice"
            className="bg-white hover:bg-slate-100 text-black text-xs font-bold px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg hover:translate-y-[-1px] transition-all cursor-pointer"
          >
            <Mic className="h-4 w-4 text-emerald-500 animate-pulse" />
            Tap to Speak
          </button>
          
          <button
            onClick={onQuickBillScanner}
            id="btn-hero-vision"
            className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold px-6 py-2.5 rounded-full flex items-center gap-2 border border-white/10 shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer"
          >
            <FileText className="h-4 w-4 text-emerald-400" />
            Scan Bill
          </button>
        </div>
      </div>

      {user?.role === 'Employee' && (
        <div className="bg-amber-55/60 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-bold leading-none">Standard Employee View Mode</p>
              <p className="text-[10px] text-amber-700 mt-1">Store financials are redacted. Audit logs and store invoice customization sections are restricted only to company Owners.</p>
            </div>
          </div>
          <span className="text-[9px] bg-amber-100 border border-amber-200 font-bold text-amber-805 px-2 py-0.5 rounded-md uppercase font-mono">Restricted Access</span>
        </div>
      )}

      {/* 2. Visual KPI Overview stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" id="dashboard-stats-row">
        {/* Card 1: Revenue sales */}
        <div className="bg-white border border-slate-205 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-slate-50 text-slate-805"><LayoutDashboard className="h-3 w-3" /></span> Today's Sales
            </p>
            <h3 className="text-2xl font-bold text-black font-sans tracking-tight">
              {user?.role === 'Employee' ? '₹••,•••' : `₹${summary.todaySales?.toLocaleString()}`}
            </h3>
            {user?.role === 'Employee' ? (
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                Redacted for Employee
              </span>
            ) : (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                <ArrowUpRight className="h-3 w-3 text-emerald-500" /> +14% today
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Pending Udhaar */}
        <div className="bg-white border border-slate-205 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-slate-50 text-slate-805"><CreditCard className="h-3 w-3" /></span> Pending Udhaar
            </p>
            <h3 className="text-2xl font-bold text-black font-sans tracking-tight">
              {user?.role === 'Employee' ? '₹••,•••' : `₹${summary.pendingUdhaar?.toLocaleString()}`}
            </h3>
            {user?.role === 'Employee' ? (
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                Redacted for Employee
              </span>
            ) : (
              <span className="text-[10px] text-red-650 font-bold bg-red-50 border border-red-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                <ArrowDownRight className="h-3 w-3 text-red-500" /> Outstanding
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Active Buyers */}
        <div className="bg-white border border-slate-205 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-slate-50 text-slate-805"><Users className="h-3 w-3" /></span> Active Customers
            </p>
            <h3 className="text-2xl font-bold text-black font-sans tracking-tight">{summary.activeCustomers || 142}</h3>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" /> +5 visits today
            </span>
          </div>
        </div>

        {/* Card 4: Low Stock Warnings */}
        <div className="bg-white border border-slate-205 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-slate-50 text-slate-805"><Package className="h-3 w-3" /></span> Low Stock Items
            </p>
            <h3 className="text-2xl font-bold text-black font-sans tracking-tight">{summary.lowStockCount || 0}</h3>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
              <AlertTriangle className="h-3 w-3 text-amber-500" /> Needs Restock
            </span>
          </div>
        </div>
      </div>

      {/* Quick Access shortcuts strip */}
      <div className="flex flex-wrap items-center gap-3" id="dashboard-shortcuts-row">
        <button
          onClick={onQuickAddEntry}
          className="bg-white border border-slate-200 hover:border-black text-black text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 duration-150 transition-all cursor-pointer shadow-sm hover:bg-slate-50"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          Add Entry
        </button>
        <button
          onClick={onQuickBillScanner}
          className="bg-white border border-slate-200 hover:border-black text-black text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 duration-150 transition-all cursor-pointer shadow-sm hover:bg-slate-50"
        >
          <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
          Scan Bill
        </button>
        <button
          onClick={onQuickVoiceLog}
          className="bg-white border border-slate-200 hover:border-black text-black text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 duration-150 transition-all cursor-pointer shadow-sm hover:bg-slate-50"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-555 animate-pulse"></span>
          Voice Entry
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className="bg-white border border-slate-200 hover:border-black text-black text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 duration-150 transition-all cursor-pointer shadow-sm hover:bg-slate-50"
        >
          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          Inventory
        </button>
      </div>

      {/* 3. Splitted Activities & Goal tracker blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-widgets-grid">
        {/* Left widget: Recent Entries logs */}
        <div className="space-y-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-bold text-sm text-black tracking-tight font-display">Recent Activity</span>
              <button 
                onClick={() => setActiveTab('entries')} 
                className="text-xs font-semibold text-slate-500 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
              >
                View all <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {summary.recentActivity?.map((act, id) => (
                <div key={id} className="flex justify-between items-center bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 hover:bg-white transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-[10px] border ${
                      act.type === 'sale' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                        : 'bg-orange-50 text-orange-900 border-orange-150'
                    }`}>
                      {act.type === 'sale' ? 'OUT' : 'EXP'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-black leading-tight">{act.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium font-sans">{act.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium font-mono">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock alerting list box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="font-bold text-sm text-black tracking-tight font-display block">Low Stock Alerts</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Critical items that need restocking soon.</p>
              </div>
              <button 
                onClick={() => setActiveTab('inventory')} 
                className="text-xs font-bold bg-slate-50 hover:bg-slate-100 text-black border border-slate-200 px-4 py-2 rounded-full flex items-center gap-1 cursor-pointer transition-all"
              >
                Manage Stock
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {inventory.slice(0, 4).map((item) => {
                const isCritical = item.stock <= 0;
                return (
                  <div key={item.id} className="flex justify-between items-center bg-slate-50/50 border border-slate-100 p-3.5 rounded-2xl hover:bg-white duration-150 transition-all leading-none">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-100 text-slate-750 rounded-lg">
                        <Package className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs text-black truncate max-w-[150px]">{item.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 font-medium">{item.stock} in stock</span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border font-sans ${
                      isCritical
                        ? 'bg-red-50 border-red-200 text-red-655'
                        : item.stock <= item.minStockAlert
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-emerald-50 border-emerald-150 text-emerald-805'
                    }`}>
                      {isCritical ? 'Out' : item.stock <= item.minStockAlert ? 'Low' : 'Health'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right widget: Weekly targets progress & pending customer credit list table */}
        <div className="space-y-4">
          {/* Goal tracker box */}
          <div className="bg-black text-white rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between" id="dashboard-weekly-goal">
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1 leading-none">✦ STORE PROGRESS GOALS</span>
            
            <div className="space-y-1">
              <h4 className="text-xl font-bold font-sans leading-none text-white">₹{summary.weeklyProgress?.current?.toLocaleString()} / ₹{summary.weeklyProgress?.goal?.toLocaleString()}</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-1">Your target paces Suresh Kirana's record 2026 week margins!</p>
            </div>

            {/* Custom linear progress bar */}
            <div className="space-y-2 pt-1">
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-slate-400 leading-none">
                <span>Weekly Goal ({progressPercent}% Achieved)</span>
                <span>Goal ₹50,050</span>
              </div>
            </div>
          </div>

          {/* Pending customer Udhaars table list */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="font-bold text-sm text-black tracking-tight font-display">Customer Udhaar</span>
              <button onClick={() => setActiveTab('udhaar')} className="text-xs font-semibold text-slate-400 hover:text-black cursor-pointer transition-colors">
                View Ledger
              </button>
            </div>

            <div className="space-y-3 h-48 overflow-y-auto">
              {customers.filter(c => c.outstandingBalance > 0).slice(0, 4).map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-white transition-all text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="font-bold text-black block">{c.name}</span>
                      <span className="text-[9px] text-slate-400 font-bold block">Today</span>
                    </div>
                  </div>
                  <span className="font-bold text-red-600 font-mono">₹{c.outstandingBalance}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setActiveTab('customers')}
              className="w-full text-center border border-slate-200 hover:border-black text-black bg-white hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-full transition-all cursor-pointer"
            >
              View all customers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
