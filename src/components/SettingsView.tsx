import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, ShieldCheck, Mail, Store, Key, CircleAlert, ToggleLeft, ToggleRight, Trash2, Palette, FileText, Check, Upload, Receipt } from 'lucide-react';
import { User } from '../types';

interface SettingsProps {
  user: User | null;
  onSaveSettings: (settings: { name: string; storeName: string; email: string; plan: 'Free' | 'Pro'; role: 'Owner' | 'Employee' }) => Promise<void>;
  onDeleteAccount: () => void;
  // Invoice template settings props
  template: {
    themeColor: string;
    logoUrl: string;
    layout: string;
    footerText: string;
    gstEnabled: boolean;
    termsEnabled: boolean;
  } | null;
  onSaveTemplate: (data: {
    themeColor: string;
    logoUrl: string;
    layout: string;
    footerText: string;
    gstEnabled: boolean;
    termsEnabled: boolean;
  }) => Promise<void>;
}

export default function SettingsView({ 
  user, 
  onSaveSettings, 
  onDeleteAccount,
  template,
  onSaveTemplate
}: SettingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'invoice'>('profile');

  // Profile forms state
  const [name, setName] = useState(user?.name || 'Suresh Kumar');
  const [storeName, setStoreName] = useState(user?.storeName || 'Suresh Kirana Store');
  const [email, setEmail] = useState(user?.email || 'prashantmenaria7@gmail.com');
  const [plan, setPlan] = useState<'Free' | 'Pro'>(user?.plan || 'Pro');
  const [role, setRole] = useState<'Owner' | 'Employee'>(user?.role === 'Employee' ? 'Employee' : 'Owner');
  const [notifSound, setNotifSound] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Invoice Template form state
  const [themeColor, setThemeColor] = useState(template?.themeColor || '#0f766e');
  const [layout, setLayout] = useState(template?.layout || 'standard');
  const [footerText, setFooterText] = useState(template?.footerText || 'Thank you for shopping with us! Visit again.');
  const [gstEnabled, setGstEnabled] = useState(template?.gstEnabled ?? true);
  const [termsEnabled, setTermsEnabled] = useState(template?.termsEnabled ?? true);
  const [logoUrl, setLogoUrl] = useState(template?.logoUrl || '');
  const [uploading, setUploading] = useState(false);

  // Update states whenever template or user changes
  useEffect(() => {
    if (template) {
      setThemeColor(template.themeColor);
      setLayout(template.layout);
      setFooterText(template.footerText);
      setGstEnabled(template.gstEnabled);
      setTermsEnabled(template.termsEnabled);
      setLogoUrl(template.logoUrl);
    }
  }, [template]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setStoreName(user.storeName);
      setEmail(user.email);
      setPlan(user.plan);
      setRole(user.role === 'Employee' ? 'Employee' : 'Owner');
    }
  }, [user]);

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings({ name, storeName, email, plan, role });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveTemplate({
      themeColor,
      logoUrl,
      layout,
      footerText,
      gstEnabled,
      termsEnabled
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogoUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      // Simulate Cloudinary secure upload with delay
      setTimeout(() => {
        setLogoUrl(reader.result as string);
        setUploading(false);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const presetColors = [
    { name: 'Teal Green', value: '#0f766e' },
    { name: 'Classic Blue', value: '#1d4ed8' },
    { name: 'Emerald Green', value: '#047857' },
    { name: 'Cosmic Indigo', value: '#4338ca' },
    { name: 'Warm Crimson', value: '#be123c' },
    { name: 'Sleek Slate', value: '#334155' }
  ];

  return (
    <div className="p-8 space-y-6 max-w-5xl" id="settings-module-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5 font-display">
            Settings & Branding <span className="text-[10px] bg-slate-100 border border-slate-205 text-slate-700 font-bold px-2.5 py-0.5 rounded-full uppercase font-sans">Configs</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium font-sans">Adjust checkout configurations, account plans, business profiles and PDF invoice themes.</p>
        </div>

        {/* Sub-tabs header switches */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'profile' ? 'bg-white text-black shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Store Profile
          </button>
          <button
            onClick={() => setActiveSubTab('invoice')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'invoice' ? 'bg-white text-black shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Invoice Templates
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3.5 border border-emerald-200 rounded-2xl" id="settings-save-alert">
          Settings successfully saved and synchronized with LeadgerX servers!
        </div>
      )}

      {/* Profile Section Tab */}
      {activeSubTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Primary store properties card */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6">
              <form onSubmit={handleSaveSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Owner Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Store Trade Title</label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Primary Contact email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Subscription Account Plan</label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-700"
                  >
                    <option value="Pro">Pro Access (₹499/Mo automatic billing)</option>
                    <option value="Free">Free Basic (Limits Voice Logs / Vision Scanner)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">System Authorization Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-700"
                  >
                    <option value="Owner">Owner (Full administrative rights)</option>
                    <option value="Employee">Employee (Restricted financial metrics, locked logs/customization)</option>
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

            {/* Notification triggers preference layout */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Business automation rules</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 leading-none">Instant WhatsApp Alerts</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Automatically alert udhaar credit accounts upon payment dates passing.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setNotifSound(!notifSound)}
                  className="text-slate-700 cursor-pointer text-lg leading-none shrink-0"
                >
                  {notifSound ? <ToggleRight className="h-9 w-9 text-slate-900 animate-pulse" /> : <ToggleLeft className="h-9 w-9 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Account Deletion warning card */}
            <div className="bg-red-50/40 border border-red-200 rounded-3xl p-6 space-y-4">
              <div className="flex gap-2.5">
                <CircleAlert className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-red-950 leading-none">Purge Store Records</h4>
                  <p className="text-[10px] text-red-700 leading-relaxed font-sans">Clearing Suresh Kirana databases purges transactions, CRM records and credit ledgers permanently.</p>
                </div>
              </div>

              <button
                onClick={onDeleteAccount}
                id="btn-purge-settings"
                className="border border-red-200 hover:border-red-400 bg-white hover:bg-red-50 text-red-600 font-bold px-4 py-2 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm w-full justify-center"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Purge all records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Template styling Section */}
      {activeSubTab === 'invoice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Settings inputs column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-5">
              <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-slate-500" />
                Layout Customization
              </h3>

              <form onSubmit={handleSaveTemplateSubmit} className="space-y-5">
                {/* Logo uploader */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Store Business Logo</span>
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <div className="relative">
                        <img src={logoUrl} alt="Store logo" referrerPolicy="no-referrer" className="h-14 w-14 object-contain border border-slate-200 rounded-xl bg-slate-50 p-1" />
                        <button
                          type="button"
                          onClick={() => setLogoUrl('')}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 text-[8px] h-4 w-4 flex items-center justify-center font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="h-14 w-14 border border-dashed border-slate-300 hover:border-slate-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 text-slate-400 hover:text-slate-700 transition-all select-none">
                        <Upload className="h-4 w-4" />
                        <span className="text-[8px] font-bold mt-1">Logo</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUploadSim} />
                      </label>
                    )}
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-slate-800">
                        {uploading ? 'Processing file upload...' : 'Upload PNG or JPEG'}
                      </p>
                      <p className="text-[9px] text-slate-400 leading-normal">Logo automatically stores in Cloudinary and prints on PDF receipts.</p>
                    </div>
                  </div>
                </div>

                {/* Theme Palette */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receipt Color Accent</span>
                  <div className="grid grid-cols-3 gap-2">
                    {presetColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setThemeColor(color.value)}
                        style={{ borderColor: themeColor === color.value ? '#000000' : 'rgba(226, 232, 240, 1)' }}
                        className="p-1 px-2 border rounded-lg text-left flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer transition-all"
                      >
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color.value }} />
                        <span className="text-[9px] font-semibold text-slate-700 truncate">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Invoice Layout structures */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invoice Print Layout</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['standard', 'minimal', 'compact'].map((lay) => (
                      <button
                        key={lay}
                        type="button"
                        onClick={() => setLayout(lay)}
                        className={`p-2.5 border rounded-xl text-center capitalize cursor-pointer transition-all ${layout === lay ? 'border-black bg-slate-50 font-bold text-black' : 'border-slate-200 text-slate-500 text-xs font-semibold'}`}
                      >
                        <FileText className="h-4 w-4 mx-auto mb-1 opacity-70" />
                        <p className="text-[10px]">{lay}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle details */}
                <div className="div-toggle-settings border-t border-slate-100 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Include GSTIN Tax Invoice formatting</p>
                      <p className="text-[9px] text-slate-400">Append state tax percentages and GST/HSN ledger column fields</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGstEnabled(!gstEnabled)}
                      className="cursor-pointer shrink-0"
                    >
                      {gstEnabled ? <ToggleRight className="h-8 w-8 text-slate-900" /> : <ToggleLeft className="h-8 w-8 text-slate-400" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Print Standard Terms & Conditions</p>
                      <p className="text-[9px] text-slate-400">Include "No return policy" or standard offline bookkeeping regulations.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTermsEnabled(!termsEnabled)}
                      className="cursor-pointer shrink-0"
                    >
                      {termsEnabled ? <ToggleRight className="h-8 w-8 text-slate-900" /> : <ToggleLeft className="h-8 w-8 text-slate-400" />}
                    </button>
                  </div>
                </div>

                {/* Footer text input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Invoice Custom Footer Note</label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="E.g. Visit again! For returns contact shop owner."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-semibold text-slate-800"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    Save Template Layout
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Interactive invoice live preview column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">A4 Invoice Paper Live Preview</span>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 underline flex items-center gap-1 cursor-pointer"
              >
                Print PDF / Share
              </button>
            </div>

            {/* Dynamic visual invoice paper sheets mock */}
            <div className={`bg-white border select-none border-slate-200 rounded-2xl shadow-md p-8 min-h-[580px] text-slate-800 font-sans relative ${layout === 'compact' ? 'max-w-md mx-auto p-4' : ''}`}>
              {/* Header border theme strip */}
              <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-2xl" style={{ backgroundColor: themeColor }} />

              {/* Dynamic store titles */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  {logoUrl ? (
                    <img src={logoUrl} alt="logo" referrerPolicy="no-referrer" className="h-10 object-contain max-w-32 mb-1" />
                  ) : (
                    <div className="h-8 w-8 rounded-lg text-white font-bold text-xs flex items-center justify-center" style={{ backgroundColor: themeColor }}>
                      {storeName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <h4 className="font-extrabold text-[#111] text-base leading-none mt-1">{storeName}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Main Market Street, Block B, Landmark Hub</p>
                  <p className="text-[9px] text-slate-400 font-medium">Contact: {user?.email || 'admin@leadgerx.co'}</p>
                </div>
                
                <div className="text-right space-y-1">
                  <h3 className="font-extrabold text-xs tracking-wider uppercase" style={{ color: themeColor }}>TAX INVOICE</h3>
                  <p className="text-[10px] font-bold text-slate-700">Invoice: <span className="font-mono">#LX-2026-8923</span></p>
                  <p className="text-[9px] text-slate-400">Date: {new Date().toLocaleDateString()}</p>
                  {gstEnabled && (
                    <p className="text-[9px] bg-slate-50 font-mono text-slate-500 px-1.5 py-0.5 rounded-sm inline-block">
                      GSTIN: 08AAAAA1111A1Z1
                    </p>
                  )}
                </div>
              </div>

              {/* Billed To coordinates */}
              <div className="py-5 grid grid-cols-2 gap-4 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Billed To</span>
                  <p className="font-bold text-slate-900">Amit Singh</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">+91 98765 43210</p>
                  <p className="text-[10px] text-slate-500">Sector 12, Block C, Resident Apts</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Billing Account</span>
                  <p className="font-bold text-slate-800">LeadgerX Ledger Record</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Payment Status: <span className="text-emerald-700 font-bold">PAID (CASH)</span></p>
                </div>
              </div>

              {/* Items ledger list table */}
              <div className="py-4 space-y-3">
                <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                  <div className="col-span-6">Product Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                <div className="grid grid-cols-12 text-xs font-semibold text-slate-700 items-center">
                  <div className="col-span-6 space-y-0.5">
                    <p className="font-bold text-slate-900 leading-none">Aashirvaad Shudh Chakki Atta 5kg</p>
                    {gstEnabled && <p className="text-[9px] font-mono text-slate-400">HSN: 110100 • SGST 2.5% • CGST 2.5%</p>}
                  </div>
                  <div className="col-span-2 text-right font-mono">2</div>
                  <div className="col-span-2 text-right font-mono">₹240.00</div>
                  <div className="col-span-2 text-right font-bold text-slate-900 font-mono">₹480.00</div>
                </div>

                <div className="grid grid-cols-12 text-xs font-semibold text-slate-700 items-center">
                  <div className="col-span-6 space-y-0.5">
                    <p className="font-bold text-slate-900 leading-none">Amul Premium Salted Butter 100g</p>
                    {gstEnabled && <p className="text-[9px] font-mono text-slate-400">HSN: 040510 • SGST 6% • CGST 6%</p>}
                  </div>
                  <div className="col-span-2 text-right font-mono">1</div>
                  <div className="col-span-2 text-right font-mono">₹55.00</div>
                  <div className="col-span-2 text-right font-bold text-slate-900 font-mono">₹55.00</div>
                </div>
              </div>

              {/* Total calculations */}
              <div className="border-t border-slate-100 pt-3 flex justify-end">
                <div className="w-56 text-xs space-y-1.5">
                  <div className="flex justify-between font-semibold text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹535.00</span>
                  </div>
                  {gstEnabled && (
                    <div className="flex justify-between text-[10px] font-medium text-slate-400">
                      <span>SGST + CGST Taxes:</span>
                      <span className="font-mono">₹28.75</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-100 pt-1.5" style={{ color: themeColor }}>
                    <span>Grand Total:</span>
                    <span className="font-mono">₹{gstEnabled ? '563.75' : '535.00'}</span>
                  </div>
                </div>
              </div>

              {/* Note and standard terms */}
              <div className="absolute bottom-6 left-8 right-8 border-t border-slate-100 pt-4 flex justify-between items-end">
                <div className="max-w-xs space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Footer Memo</p>
                  <p className="text-[10px] text-slate-600 font-semibold leading-normal italic">
                    "{footerText}"
                  </p>
                </div>
                {termsEnabled && (
                  <div className="text-right max-w-xxs">
                    <p className="text-[8px] font-bold text-slate-400">Terms &amp; Conditions</p>
                    <p className="text-[8px] text-slate-400 leading-snug mt-0.5">Computer-generated billing. Goods once sold cannot be returned.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
