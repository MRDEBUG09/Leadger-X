import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Package, Search, PlusCircle, AlertTriangle, ShieldCheck, HelpCircle, BarChart3, RefreshCw, Calendar, ArrowUpRight, Zap } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryProps {
  inventory: InventoryItem[];
  onAddItem: (item: any) => Promise<void>;
}

export default function InventoryView({ inventory, onAddItem }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Create item form
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState(1);
  const [minAlert, setMinAlert] = useState(5);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [category, setCategory] = useState('Grocery');
  const [supplierName, setSupplierName] = useState('');

  // AI predictions states
  const [predictions, setPredictions] = useState<any[]>([]);
  const [predictLoading, setPredictLoading] = useState(false);

  const triggerDemandForecasting = async () => {
    setPredictLoading(true);
    try {
      const response = await fetch('/api/ai/predictions');
      const data = await response.json();
      if (data.predictions) {
        setPredictions(data.predictions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPredictLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await onAddItem({
      name,
      sku,
      stock,
      minStockAlert: minAlert,
      purchasePrice,
      sellingPrice,
      category,
      supplierName,
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 6 months default expiry
    });
    // reset
    setName('');
    setSku('');
    setStock(1);
    setMinAlert(5);
    setPurchasePrice(0);
    setSellingPrice(0);
    setCategory('Grocery');
    setSupplierName('');
    setShowAddModal(false);
  };

  const filteredItems = inventory.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || (i.sku && i.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' ? true : i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Grocery', 'Dairy', 'Packaged Foods', 'Oils', 'General'];

  return (
    <div className="p-8 space-y-6" id="inventory-module-container">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 border border-slate-200 shadow-sm rounded-3xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5 font-display">
            Inventory & Stock Books <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Storage</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium font-sans">Automate wholesale supply updates, trace expiration sheets, and evaluate stock margins seamlessly.</p>
        </div>

        <button
          id="btn-inventory-add-modal"
          onClick={() => setShowAddModal(true)}
          className="bg-black hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-md cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          Add Store Product
        </button>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search Input bar */}
        <div className="relative w-72">
          <span className="absolute left-3.5 top-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            id="inv-local-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by SKU or name..."
            className="w-full bg-slate-50 border border-slate-200 hover:bg-white focus:bg-white focus:border-black text-xs px-9 py-2.5 rounded-full focus:outline-none transition-all font-semibold text-slate-750"
          />
        </div>

        {/* Categories Tab pills */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-50 border border-slate-100 p-1 rounded-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-[10px] font-bold px-4 py-1.5 rounded-full transition-all text-center ${
                categoryFilter === cat ? 'bg-black text-white shadow-xs' : 'text-slate-500 hover:text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Inventory Items grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-slate-400">
              <span>Product Specifications</span>
              <div className="flex gap-16 mr-14">
                <span>Margins (Cost/Sell)</span>
                <span>In-Stock Count</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-120 overflow-y-auto">
              {filteredItems.map(item => {
                const isOutOfStock = item.stock <= 0;
                const isLowStock = item.stock > 0 && item.stock <= item.minStockAlert;
                
                return (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-sm shadow-3xs ${
                        isOutOfStock 
                          ? 'bg-red-50 text-red-600' 
                          : isLowStock 
                          ? 'bg-amber-50 text-amber-655' 
                          : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        <Package className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-none">{item.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium font-mono mt-1.5">{item.sku || 'N/A'} • Category: {item.category} • Supplier: {item.supplierName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-14 mr-6">
                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-600 font-mono">₹{item.purchasePrice} / ₹{item.sellingPrice}</span>
                        <div className="text-[10px] text-emerald-600 font-bold mt-1">Margin: ₹{item.sellingPrice - item.purchasePrice}</div>
                      </div>
                      
                      <div className="text-right w-24">
                        <span className={`text-xs font-bold font-mono ${
                          isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-800'
                        }`}>
                          {item.stock} in stock
                        </span>
                        
                        <div className="mt-1">
                          {isOutOfStock ? (
                            <span className="text-[9px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded border border-red-200">Out of Stock</span>
                          ) : isLowStock ? (
                            <span className="text-[9px] bg-amber-50 text-amber-655 font-bold px-1.5 py-0.5 rounded border border-amber-200">Low Stock ({item.minStockAlert})</span>
                          ) : (
                            <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-250">Healthy</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  <p className="text-xs font-bold text-slate-850">No inventory products registered on shelf filter.</p>
                  <p className="text-[10px] mt-1">Log supplies from invoice bills or create items manually to begin tracking stock.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right smart AI Predictions container */}
        <div className="space-y-4">
          <div className="bg-black text-white rounded-3xl p-6 space-y-4 shadow-xl" id="ai-inventory-demand-analytics">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
              <Zap className="h-4 w-4 text-emerald-400 animate-pulse" /> LeadgerX AI Mastermind Prediction
            </span>
            <div className="space-y-1">
              <h3 className="font-bold text-sm tracking-tight leading-none text-white font-display">Demand Forecasting Panel</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-2">Let Gemini evaluate weekly store transactions velocity, expiration sheets, and determine upcoming shop reorders automatically.</p>
            </div>

            <button
              onClick={triggerDemandForecasting}
              id="btn-inventory-ai-predict"
              disabled={predictLoading}
              className="w-full bg-white hover:bg-slate-100 text-black text-xs font-bold py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              {predictLoading ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : <BarChart3 className="h-4.5 w-4.5" />}
              Forecast Stockout Risks
            </button>

            {/* AI Predictions outputs */}
            {predictions.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-800" id="predict-outputs-box">
                <span className="text-[9px] font-bold text-slate-400 uppercase">EXPECTED OUT OF STOCKS (NEXT 14 DAYS)</span>
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {predictions.map((p, idx) => (
                    <div key={idx} className="bg-slate-800/80 border border-slate-700 p-3 rounded-lg space-y-1.5">
                      <div className="flex justify-between items-center leading-none">
                        <span className="font-bold text-xs text-slate-50">{p.productName}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          p.urgency === 'High' 
                            ? 'bg-red-950/50 border-red-900 text-red-400' 
                            : 'bg-amber-950/50 border-amber-900 text-amber-500'
                        }`}>
                          {p.urgency} Urgency
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-relaxed font-sans">{p.reason}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-700/50 pt-1.5">
                        <span>Reorder suggested: <span className="font-bold text-white font-mono">{p.restockQuantity} units</span></span>
                        <span>Stockout expected in: <span className="text-white font-bold font-mono">{p.expectedStockoutDays} days</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DIALOG SHEET: ADD INVENTORY */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-md w-full p-6 space-y-5"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-bold text-sm text-slate-900">Add Stock Item details</span>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer text-lg">
                ×
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Product Item Trade Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tata Tea Premium Gold"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-700"
                  >
                    <option value="Grocery">Grocery</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Packaged Foods">Packaged Foods</option>
                    <option value="Oils">Oils</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">SKU / Code ID</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. TG-500"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cost Price (Buy ₹)</label>
                  <input
                    type="number"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Retail Price (Sell ₹)</label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Initial Stock on Floor</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Reorder Alert Stock</label>
                  <input
                    type="number"
                    required
                    value={minAlert}
                    onChange={(e) => setMinAlert(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Supplier / Wholesaler</label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="e.g. Mehra Wholesale Groceries"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:outline-none font-medium text-slate-800"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-750 font-semibold rounded-xl text-xs hover:bg-slate-50 text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-black text-white font-bold rounded-xl text-xs hover:bg-slate-800 text-center cursor-pointer shadow-xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
