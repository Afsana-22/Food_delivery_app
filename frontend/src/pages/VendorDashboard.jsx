import React, { useState, useEffect, useMemo } from 'react';
import {
  Package, Utensils, RefreshCw, CheckCircle2, AlertCircle, Store,
  ChevronRight, Zap, MapPin, Plus, ArrowRight, Clock, Edit3,
  Trash2, Image, DollarSign, ToggleLeft, ToggleRight, X, Save,
  TrendingUp, Star, TicketPercent, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

const STATUS_COLORS = {
  pending:    'bg-amber-100 text-amber-700 border-amber-200',
  preparing:  'bg-violet-100 text-violet-700 border-violet-200',
  accepted:   'bg-blue-100 text-blue-700 border-blue-200',
  picked_up:  'bg-cyan-100 text-cyan-700 border-cyan-200',
  on_the_way: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled:  'bg-slate-100 text-slate-500 border-slate-200',
};

/* ─── Empty dish template ─── */
const emptyDish = () => ({
  name: '', price: '', image: '', description: '', category: 'lunch', veg: true, isAvailable: true
});

/* ─── Stat card ─── */
function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        <p className="text-2xl font-black text-white leading-none mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ─── Order Kanban Card ─── */
function OrderCard({ order, onUpdate }) {
  const status = order.status;
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-slate-800/80 backdrop-blur rounded-3xl p-5 border ${order.status === 'pending' ? 'border-orange-500/40 shadow-orange-500/10' : 'border-slate-700/60'} shadow-lg`}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-700/60 px-2 py-1 rounded-lg">#{order._id.slice(-5)}</span>
        {status === 'pending' && <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-400 animate-pulse"><Zap size={10} fill="currentColor" /> New</span>}
        {status === 'preparing' && <span className="text-[10px] font-black text-blue-400 uppercase">Cooking</span>}
        {status === 'accepted' && <span className="text-[10px] font-black text-emerald-400 uppercase">Ready</span>}
      </div>

      <div className="space-y-1 mb-4">
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-slate-300 font-bold"><span className="text-orange-400">{item.quantity}×</span> {item.name}</span>
            <span className="text-slate-500 font-bold">Rs.{(item.price || 0) * item.quantity}</span>
          </div>
        ))}
        <div className="pt-2 mt-1 border-t border-slate-700 flex justify-between font-black text-white text-sm">
          <span>Total</span><span className="text-orange-400">Rs.{order.totalAmount}</span>
        </div>
      </div>

      {order.customInstructions && (
        <div className="mb-4 p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20">
          <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Customer Note</p>
          <p className="text-xs font-bold text-slate-300 leading-tight">{order.customInstructions}</p>
        </div>
      )}

      <div className="space-y-2">
        {status === 'pending' && (
          <div className="flex gap-2">
            <button onClick={() => onUpdate(order._id, 'preparing')} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-black hover:bg-orange-400 transition-all active:scale-95 shadow-lg shadow-orange-500/20">Accept & Cook</button>
            <button onClick={() => onUpdate(order._id, 'cancelled')} className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-xs font-black hover:bg-red-500/20 transition-all active:scale-95">Reject</button>
          </div>
        )}
        {status === 'preparing' && (
          <button onClick={() => onUpdate(order._id, 'accepted')} className="w-full py-2.5 rounded-xl bg-blue-500 text-white text-xs font-black hover:bg-blue-400 transition-all active:scale-95 shadow-lg shadow-blue-500/20">Mark as Ready →</button>
        )}
        {status === 'accepted' && (
          <div className="py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-black text-center border border-emerald-500/20">🚀 Awaiting Driver Pickup</div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Edit Dish Modal ─── */
function DishModal({ dish, onSave, onClose }) {
  const [form, setForm] = useState({ ...dish });
  const ch = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-900 border border-slate-700 rounded-[32px] p-8 w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-white">Edit Dish</h3>
          <button onClick={onClose} className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <input value={form.name} onChange={e => ch('name', e.target.value)} placeholder="Dish name" className="input-field bg-slate-800 text-white border-slate-700" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={form.price} onChange={e => ch('price', e.target.value)} placeholder="Price (Rs.)" className="input-field bg-slate-800 text-white border-slate-700" />
            <select value={form.category} onChange={e => ch('category', e.target.value)} className="input-field bg-slate-800 text-white border-slate-700">
              {['breakfast','lunch','dinner','starter','dessert','drink'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input value={form.image} onChange={e => ch('image', e.target.value)} placeholder="Image URL" className="input-field bg-slate-800 text-white border-slate-700" />
          {form.image && <div className="h-28 rounded-2xl overflow-hidden"><img src={form.image} className="w-full h-full object-cover" alt="" onError={e => e.target.style.display='none'} /></div>}
          <textarea value={form.description} onChange={e => ch('description', e.target.value)} rows={2} placeholder="Description" className="input-field bg-slate-800 text-white border-slate-700 resize-none" />
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`toggle-track ${form.veg ? 'on' : ''}`} onClick={() => ch('veg', !form.veg)}><div className="toggle-thumb" /></div>
              <span className="text-sm font-bold text-slate-300">Vegetarian</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`toggle-track ${form.isAvailable ? 'on' : ''}`} onClick={() => ch('isAvailable', !form.isAvailable)}><div className="toggle-thumb" /></div>
              <span className="text-sm font-bold text-slate-300">Available</span>
            </label>
          </div>
        </div>
        <button onClick={() => onSave(form)} className="mt-6 w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-black text-base hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2">
          <Save size={18} /> Save Changes
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function VendorDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('orders'); // 'orders' | 'menu' | 'stats'
  const [restaurants, setRestaurants] = useState([]);
  const [selectedId, setSelectedId]   = useState('');
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [editDish, setEditDish]       = useState(null);      // dish being edited
  const [showAddDish, setShowAddDish] = useState(false);
  const [newDish, setNewDish]         = useState(emptyDish());
  const [savingMenu, setSavingMenu]   = useState(false);

  const token = () => localStorage.getItem('token');

  /* ── fetch vendor restaurants ── */
  const fetchRestaurants = async () => {
    try {
      const res = await axios.get(`${API}/restaurants/managed`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = res.data?.data || [];
      setRestaurants(data);
      if (!selectedId && data.length > 0) {
        setSelectedId(data[0]._id);
        fetchOrders(data[0]._id);
      }
    } catch (err) {
      console.error('Vendor restaurants error:', err);
    }
  };

  const fetchOrders = async (restaurantId) => {
    if (!restaurantId) return;
    try {
      const res = await axios.get(`${API}/orders/vendor/${restaurantId}`);
      setOrders(res.data?.data || []);
    } catch (err) { console.error('Vendor orders error:', err); }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchRestaurants();
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetchOrders(selectedId);
    const interval = setInterval(() => fetchOrders(selectedId), 10000);
    return () => clearInterval(interval);
  }, [selectedId]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API}/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch { alert('Status update failed'); }
  };

  /* ── menu management ── */
  const selected = useMemo(() => restaurants.find(r => r._id === selectedId) || null, [restaurants, selectedId]);
  const menu     = selected?.menu || [];

  const saveMenuToServer = async (updatedMenu) => {
    if (!selectedId) return;
    setSavingMenu(true);
    try {
      await axios.patch(`${API}/restaurants/${selectedId}/menu`,
        { menu: updatedMenu },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      await fetchRestaurants();
    } catch (err) { alert('Failed to save menu. Please try again.'); }
    setSavingMenu(false);
  };

  const handleSaveDish = async (updatedDish) => {
    const newMenu = menu.map(d => d._id === updatedDish._id ? { ...d, ...updatedDish } : d);
    await saveMenuToServer(newMenu);
    setEditDish(null);
  };

  const handleToggleAvail = async (dishId) => {
    const newMenu = menu.map(d => d._id === dishId ? { ...d, isAvailable: !d.isAvailable } : d);
    await saveMenuToServer(newMenu);
  };

  const handleDeleteDish = async (dishId) => {
    if (!window.confirm('Remove this dish from the menu?')) return;
    const newMenu = menu.filter(d => d._id !== dishId);
    await saveMenuToServer(newMenu);
  };

  const handleAddDish = async () => {
    if (!newDish.name || !newDish.price) { alert('Name and price are required.'); return; }
    const updated = [...menu, { ...newDish, price: Number(newDish.price) }];
    await saveMenuToServer(updated);
    setNewDish(emptyDish());
    setShowAddDish(false);
  };

  /* ── order stats ── */
  const pending   = orders.filter(o => o.status === 'pending').length;
  const preparing = orders.filter(o => o.status === 'preparing').length;
  const ready     = orders.filter(o => o.status === 'accepted').length;
  const revenue   = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.totalAmount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-bold">Loading your kitchen...</p>
        </div>
      </div>
    );
  }

  /* ── No restaurant yet ── */
  if (restaurants.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
          className="bg-slate-900 border border-slate-800 rounded-[40px] p-12 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Store size={40} className="text-orange-500" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter mb-3">No Restaurant Yet</h2>
          <p className="text-slate-400 font-medium mb-8 leading-relaxed">
            Your restaurant is either pending admin approval, or you haven't set one up yet.
            Complete your signup to get started!
          </p>
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-500 bg-slate-800 px-4 py-3 rounded-2xl border border-slate-700">
              📩 Check your email for approval updates
            </p>
            <button onClick={fetchRestaurants} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-400 transition-all active:scale-95 flex items-center justify-center gap-2">
              <RefreshCw size={18} /> Refresh Status
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* bg glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">

        {/* ── Top Header ── */}
        <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400 flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse inline-block" /> Live Kitchen Dashboard
            </span>
            <h1 className="text-4xl font-black tracking-tighter text-white">{selected?.name || 'My Restaurant'}</h1>
            {selected && <p className="text-slate-400 font-medium mt-1 flex items-center gap-1"><MapPin size={14} />{selected.city} · {selected.isApproved ? <span className="text-emerald-400 font-bold">Approved ✓</span> : <span className="text-amber-400 font-bold">Pending Approval</span>}</p>}
          </div>

          <div className="flex items-center gap-3">
            {restaurants.length > 1 && (
              <select value={selectedId} onChange={e => { setSelectedId(e.target.value); fetchOrders(e.target.value); }}
                className="input-field bg-slate-800 text-white border-slate-700 text-sm py-2 px-4">
                {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
            )}
            <button onClick={() => fetchOrders(selectedId)} className="w-12 h-12 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-orange-500/20">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Stat icon={AlertCircle} label="Incoming"  value={pending}   color="bg-orange-500/20 text-orange-400" />
          <Stat icon={Utensils}   label="Cooking"    value={preparing} color="bg-blue-500/20 text-blue-400" />
          <Stat icon={Package}    label="Ready"      value={ready}     color="bg-emerald-500/20 text-emerald-400" />
          <Stat icon={TrendingUp} label="Revenue"    value={`Rs.${revenue}`} color="bg-violet-500/20 text-violet-400" />
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 p-1 bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700 mb-8 max-w-sm">
          {[['orders','🍽️ Orders'],['menu','🥗 Menu'],['stats','📊 Stats']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${tab === key ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Incoming */}
            <Column title="🔴 Incoming" count={pending} accent="orange">
              <AnimatePresence>
                {orders.filter(o => o.status === 'pending').map(o => <OrderCard key={o._id} order={o} onUpdate={updateStatus} />)}
                {!pending && <EmptyLane emoji="😌" text="No new orders yet" />}
              </AnimatePresence>
            </Column>

            {/* In Kitchen */}
            <Column title="🔵 In Kitchen" count={preparing} accent="blue">
              <AnimatePresence>
                {orders.filter(o => o.status === 'preparing').map(o => <OrderCard key={o._id} order={o} onUpdate={updateStatus} />)}
                {!preparing && <EmptyLane emoji="🧑‍🍳" text="Kitchen is clear" />}
              </AnimatePresence>
            </Column>

            {/* Ready / Dispatch */}
            <Column title="🟢 Dispatch Line" count={ready} accent="green">
              <AnimatePresence>
                {orders.filter(o => o.status === 'accepted').map(o => <OrderCard key={o._id} order={o} onUpdate={updateStatus} />)}
                {!ready && <EmptyLane emoji="📦" text="Nothing awaiting pickup" />}
              </AnimatePresence>
            </Column>
          </div>
        )}

        {/* ── MENU TAB ── */}
        {tab === 'menu' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-white">Menu Management</h2>
                <p className="text-slate-400 font-medium text-sm">{menu.length} items · {menu.filter(m => m.isAvailable).length} available</p>
              </div>
              <button onClick={() => setShowAddDish(v => !v)}
                className="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-orange-500/20">
                <Plus size={16} /> Add Dish
              </button>
            </div>

            {/* Add dish form */}
            <AnimatePresence>
              {showAddDish && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                  className="bg-slate-800 border border-slate-700 rounded-3xl p-6 mb-6 overflow-hidden">
                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Plus size={18} className="text-orange-400" /> New Dish</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={newDish.name} onChange={e => setNewDish(p => ({...p, name: e.target.value}))} placeholder="Dish name *" className="input-field bg-slate-700 text-white border-slate-600" />
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input type="number" value={newDish.price} onChange={e => setNewDish(p => ({...p, price: e.target.value}))} placeholder="Price * (Rs.)" className="input-field pl-9 bg-slate-700 text-white border-slate-600" />
                    </div>
                    <input value={newDish.image} onChange={e => setNewDish(p => ({...p, image: e.target.value}))} placeholder="Image URL" className="input-field bg-slate-700 text-white border-slate-600" />
                    <select value={newDish.category} onChange={e => setNewDish(p => ({...p, category: e.target.value}))} className="input-field bg-slate-700 text-white border-slate-600">
                      {['breakfast','lunch','dinner','starter','dessert','drink'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <textarea value={newDish.description} onChange={e => setNewDish(p => ({...p, description: e.target.value}))} placeholder="Description" rows={2} className="input-field bg-slate-700 text-white border-slate-600 resize-none md:col-span-2" />
                  </div>
                  <div className="flex gap-6 mt-4 items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={`toggle-track ${newDish.veg ? 'on' : ''}`} onClick={() => setNewDish(p => ({...p, veg: !p.veg}))}><div className="toggle-thumb" /></div>
                      <span className="text-sm font-bold text-slate-300">Vegetarian</span>
                    </label>
                    <div className="flex gap-3 ml-auto">
                      <button onClick={() => setShowAddDish(false)} className="px-5 py-2.5 rounded-xl bg-slate-700 text-slate-400 font-black text-sm hover:bg-slate-600"><X size={14} className="inline mr-1" />Cancel</button>
                      <button onClick={handleAddDish} disabled={savingMenu} className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm hover:bg-orange-400 active:scale-95 flex items-center gap-2">
                        {savingMenu ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} Save Dish
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Menu grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {menu.map(dish => (
                  <motion.div key={dish._id} layout initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }}
                    className={`bg-slate-800/80 border ${dish.isAvailable ? 'border-slate-700' : 'border-slate-800 opacity-60'} rounded-3xl overflow-hidden group hover:border-orange-500/30 transition-all`}>
                    {/* Image */}
                    <div className="h-40 bg-slate-700 relative overflow-hidden">
                      {dish.image
                        ? <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => e.target.style.display='none'} />
                        : <div className="w-full h-full flex items-center justify-center"><Image size={32} className="text-slate-500" /></div>
                      }
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${dish.veg ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                          {dish.veg ? '🟢 Veg' : '🔴 Non-Veg'}
                        </span>
                        <span className="text-[10px] font-black text-white bg-slate-800/80 px-2 py-1 rounded-lg">{dish.category}</span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-black text-white text-base leading-tight">{dish.name}</h4>
                          {dish.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{dish.description}</p>}
                        </div>
                        <span className="text-lg font-black text-orange-400 flex-shrink-0 ml-2">Rs.{dish.price}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <button onClick={() => handleToggleAvail(dish._id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${dish.isAvailable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400' : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-emerald-500/10 hover:text-emerald-400'}`}>
                          {dish.isAvailable ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          {dish.isAvailable ? 'Available' : 'Unavailable'}
                        </button>
                        <button onClick={() => setEditDish(dish)} className="ml-auto p-2 rounded-xl bg-slate-700 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => handleDeleteDish(dish._id)} className="p-2 rounded-xl bg-slate-700 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {menu.length === 0 && (
                <div className="col-span-3 py-20 text-center text-slate-500">
                  <Utensils size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-black text-lg">No menu items yet</p>
                  <p className="text-sm font-medium mt-1">Add your first dish above</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STATS TAB ── */}
        {tab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6">
                <p className="text-sm font-black text-slate-400 mb-1 uppercase tracking-widest">Total Orders</p>
                <p className="text-4xl font-black text-white">{orders.length}</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6">
                <p className="text-sm font-black text-slate-400 mb-1 uppercase tracking-widest">Total Revenue</p>
                <p className="text-4xl font-black text-orange-400">Rs.{revenue}</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6">
                <p className="text-sm font-black text-slate-400 mb-1 uppercase tracking-widest">Delivery Rate</p>
                <p className="text-4xl font-black text-emerald-400">
                  {orders.length ? Math.round((orders.filter(o => o.status === 'delivered').length / orders.length) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {orders.slice(0, 10).map(o => (
                  <div key={o._id} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                    <div>
                      <p className="font-black text-white text-sm">#{o._id.slice(-6)} · {o.items?.length} item(s)</p>
                      <p className="text-xs text-slate-400 font-medium">{new Date(o.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-orange-400">Rs.{o.totalAmount}</span>
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase border ${STATUS_COLORS[o.status] || ''}`}>{o.status}</span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-slate-500 text-center py-8 font-bold">No orders yet</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Dish Modal ── */}
      <AnimatePresence>
        {editDish && <DishModal dish={editDish} onSave={handleSaveDish} onClose={() => setEditDish(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* ─── Kanban column ─── */
function Column({ title, count, accent, children }) {
  const colors = { orange: 'text-orange-400', blue: 'text-blue-400', green: 'text-emerald-400' };
  return (
    <div className="flex flex-col bg-slate-900/60 border border-slate-800 rounded-[32px] overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-slate-800 flex justify-between items-center">
        <h3 className={`text-base font-black ${colors[accent]}`}>{title}</h3>
        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black text-white bg-${accent === 'orange' ? 'orange' : accent === 'blue' ? 'blue' : 'emerald'}-500/20 border border-${accent === 'orange' ? 'orange' : accent === 'blue' ? 'blue' : 'emerald'}-500/30`}>{count}</span>
      </div>
      <div className="p-4 flex-1 overflow-y-auto max-h-[60vh] space-y-3 custom-scrollbar">
        {children}
      </div>
    </div>
  );
}

function EmptyLane({ emoji, text }) {
  return (
    <div className="py-12 text-center text-slate-600">
      <p className="text-3xl mb-2">{emoji}</p>
      <p className="font-bold text-sm">{text}</p>
    </div>
  );
}
