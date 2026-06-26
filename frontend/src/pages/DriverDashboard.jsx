import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Truck, MapPin, CheckCircle, Clock, Zap, Navigation, Package,
  RefreshCw, Star, Phone, ChevronRight, Wifi, WifiOff, Bell, X,
  Send, MessageSquare, User, Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const socket = io('http://localhost:5000');
const API    = 'http://localhost:5000/api';

const STATUS_META = {
  accepted:   { label: 'Ready for Pickup',  color: 'text-amber-400',   bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
  picked_up:  { label: 'Picked Up',         color: 'text-blue-400',    bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  on_the_way: { label: 'On the Way',         color: 'text-purple-400',  bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  delivered:  { label: 'Delivered',          color: 'text-emerald-400', bg: 'bg-emerald-500/10',border: 'border-emerald-500/20' },
};

/* ─── Radar animation ring ─── */
function RadarRing({ delay = 0 }) {
  return (
    <div className="absolute inset-0 rounded-full border border-cyan-500/30"
      style={{ animation: `radar-ring 3s ${delay}s ease-out infinite` }} />
  );
}

/* ─── Driver Chat Component ─── */
function DriverChat({ orderId, messages, setMessages, customerName = 'Customer' }) {
  const [input, setInput] = useState('');
  const quickMsgs = ['I have arrived!', 'Running 5 mins late', 'At the building gate'];

  const send = async (text) => {
    const msgText = (text || input).trim();
    if (!msgText) return;

    const msg = { sender: 'driver', text: msgText, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, msg]);
    setInput('');

    try {
      await axios.post(`${API}/orders/${orderId}/messages`, { sender: 'driver', text: msgText });
      socket.emit('sendOrderMessage', { orderId, message: msg });
    } catch (err) { console.error('Chat error:', err); }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-[32px] overflow-hidden flex flex-col h-[400px] shadow-2xl">
      <div className="p-5 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 flex justify-between items-center text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
            <User size={20} className="text-cyan-400" />
          </div>
          <div>
            <p className="font-black text-white text-sm">Chat with {customerName}</p>
            <p className="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" /> Online
            </p>
          </div>
        </div>
        <MessageSquare size={18} className="text-slate-500" />
      </div>

      <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar text-left">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'driver' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm ${
              m.sender === 'driver' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-white'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <Smile size={40} className="mb-2" />
            <p className="text-sm font-black">No messages yet</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-800/50 border-t border-slate-700">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {quickMsgs.map(q => (
            <button key={q} onClick={() => send(q)} className="whitespace-nowrap bg-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-400 transition-all">{q}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && send()}
            placeholder="Send a message..." className="flex-1 bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-white focus:ring-1 focus:ring-cyan-500" />
          <button onClick={() => send()} className="p-3 bg-cyan-500 text-slate-950 rounded-xl hover:bg-cyan-400 transition-all"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}

/* ─── Available order card ─── */
function AvailableCard({ order, onAccept, accepting }) {
  const rest = order.restaurantId;
  const total = order.totalAmount || 0;
  const items = order.items || [];

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
      className="bg-slate-800/80 backdrop-blur border border-cyan-500/20 rounded-[28px] p-5 hover:border-cyan-500/40 transition-all group">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5 mb-1">
            <Zap size={9} fill="currentColor" /> New Order · #{order._id.slice(-5).toUpperCase()}
          </span>
          <h3 className="text-lg font-black text-white leading-tight">{rest?.name || 'Restaurant'}</h3>
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5"><MapPin size={11} />{rest?.city || 'Unknown'}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-cyan-400">Rs.{total}</p>
          <p className="text-[10px] text-slate-400 font-bold">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-2xl p-3 mb-4 space-y-1.5 border border-slate-700/40">
        {items.slice(0, 3).map((item, i) => (
          <div key={i} className="flex justify-between text-sm font-bold">
            <span className="text-slate-300">{item.quantity}× {item.name}</span>
            <span className="text-slate-500">Rs.{(item.price || 0) * item.quantity}</span>
          </div>
        ))}
        {items.length > 3 && <p className="text-xs text-slate-500 font-bold">+{items.length - 3} more items</p>}
      </div>

      {order.deliveryAddress && (
        <div className="flex items-center gap-2 mb-4 bg-slate-700/30 rounded-2xl px-3 py-2">
          <Navigation size={14} className="text-cyan-400 flex-shrink-0" />
          <p className="text-xs font-bold text-slate-300 truncate">{order.deliveryAddress}</p>
        </div>
      )}

      <button onClick={() => onAccept(order._id)} disabled={accepting === order._id}
        className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-sm hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-60">
        {accepting === order._id
          ? <><RefreshCw size={16} className="animate-spin" /> Accepting...</>
          : <><Truck size={16} /> Accept Delivery</>
        }
      </button>
    </motion.div>
  );
}

/* ─── Active delivery panel ─── */
function ActiveDelivery({ order, onUpdate, simulating }) {
  const [messages, setMessages] = useState(order.chatMessages || []);
  const STATUS_STEPS = ['accepted', 'picked_up', 'on_the_way', 'delivered'];
  const currentIdx   = STATUS_STEPS.indexOf(order.status);
  const stepLabels   = ['Ready', 'Picked Up', 'On the Way', 'Delivered'];

  useEffect(() => {
    socket.emit('joinOrder', order._id);
    const handleMsg = (data) => {
      if (data.orderId === order._id) setMessages(prev => [...prev, data.message]);
    };
    socket.on('orderMessage', handleMsg);
    return () => socket.off('orderMessage', handleMsg);
  }, [order._id]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800/80 backdrop-blur border border-cyan-500/30 rounded-[40px] p-8 shadow-2xl shadow-cyan-500/5">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse inline-block" /> Active Delivery
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">{order.restaurantId?.name || 'Restaurant'}</h2>
          <p className="text-slate-400 font-medium text-sm flex items-center gap-1 mt-0.5"><MapPin size={13} /> {order.restaurantId?.city}</p>
        </div>
        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <Truck size={26} className="text-white" />
        </div>
      </div>

      {/* Items */}
      <div className="bg-slate-900/60 rounded-2xl p-4 mb-5 border border-slate-700/50 space-y-2">
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm font-bold text-slate-300">
            <span><span className="text-cyan-400">{item.quantity}×</span> {item.name}</span>
            <span className="text-slate-500">Rs.{(item.price || 0) * item.quantity}</span>
          </div>
        ))}
        <div className="pt-2 border-t border-slate-700 flex justify-between font-black text-white">
          <span>Total</span><span className="text-cyan-400">Rs.{order.totalAmount}</span>
        </div>
      </div>

      {/* Delivery address */}
      {order.deliveryAddress && (
        <div className="flex items-start gap-3 bg-slate-900/60 rounded-2xl p-4 mb-5 border border-slate-700/50">
          <div className="w-9 h-9 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin size={18} className="text-cyan-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Delivery Address</p>
            <p className="font-bold text-white text-sm leading-snug">{order.deliveryAddress}</p>
          </div>
        </div>
      )}

      {/* Progress steps */}
      <div className="relative mb-8 px-2">
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-700" />
        <div className="absolute top-4 left-4 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
          style={{ width: `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%` }} />
        <div className="relative flex justify-between">
          {STATUS_STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black z-10 border-2 border-slate-800 transition-all duration-500 ${
                i < currentIdx  ? 'bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]' :
                i === currentIdx ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.6)]' :
                'bg-slate-700 text-slate-500'
              }`}>
                {i < currentIdx ? <CheckCircle size={14} strokeWidth={3} /> : i + 1}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest mt-2 text-center w-16 leading-tight ${i <= currentIdx ? 'text-cyan-400' : 'text-slate-600'}`}>
                {stepLabels[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        {order.status === 'accepted' && (
          <button onClick={() => onUpdate('picked_up')}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-lg hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-3">
            <Package size={22} /> Confirm Pickup
          </button>
        )}
        {order.status === 'picked_up' && (
          <button onClick={() => onUpdate('on_the_way')}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-2xl font-black text-lg hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3">
            <Navigation size={22} fill="currentColor" /> Start Delivery
          </button>
        )}
        {order.status === 'on_the_way' && (
          <>
            <div className={`py-3 rounded-2xl text-center font-black text-sm border ${simulating ? 'bg-cyan-900/30 text-cyan-400 border-cyan-500/30 animate-pulse' : 'bg-slate-900 text-slate-500 border-slate-700'}`}>
              {simulating ? '📡 Broadcasting GPS location...' : '📍 GPS inactive'}
            </div>
            <button onClick={() => onUpdate('delivered')}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-black text-lg hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3">
              <CheckCircle size={22} /> Confirm Delivery
            </button>
          </>
        )}
        {order.status === 'preparing' && (
          <div className="py-4 bg-slate-900 border border-slate-700 text-slate-500 rounded-2xl font-black text-center flex items-center justify-center gap-2">
            <Clock size={18} className="animate-spin [animation-duration:3s]" /> Waiting for kitchen to finish...
          </div>
        )}
      </div>
    </motion.div>

      {/* Chat Section */}
      <DriverChat orderId={order._id} messages={messages} setMessages={setMessages} customerName={order.userId?.name} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function DriverDashboard() {
  const { user }  = useAuth();
  const [allOrders,    setAllOrders]    = useState([]);
  const [activeOrder,  setActiveOrder]  = useState(null);
  const [isOnline,     setIsOnline]     = useState(true);
  const [simulating,   setSimulating]   = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);
  const [accepting,    setAccepting]    = useState(null);
  const [earnings,     setEarnings]     = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);

  const token = () => localStorage.getItem('token');

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/orders/active`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (res.data.status === 'success') {
        const ords = res.data.data || [];
        setAllOrders(ords);
        // look for an order this driver already owns
        const mine = ords.find(o =>
          String(o.driverId) === String(user?._id) &&
          ['accepted', 'preparing', 'picked_up', 'on_the_way'].includes(o.status)
        );
        setActiveOrder(mine || null);
      }
    } catch (err) {
      console.error('Driver fetch error:', err);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchOrders();
    const i = setInterval(fetchOrders, 8000);
    return () => clearInterval(i);
  }, [fetchOrders]);

  /* Socket: listen for new orders */
  useEffect(() => {
    socket.on('newOrder', () => fetchOrders());
    socket.on('orderStatusChanged', () => fetchOrders());
    return () => { socket.off('newOrder'); socket.off('orderStatusChanged'); };
  }, [fetchOrders]);

  const acceptOrder = async (orderId) => {
    setAccepting(orderId);
    try {
      await axios.patch(`${API}/orders/${orderId}/status`,
        { status: 'picked_up', driverId: user?._id },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      await fetchOrders();
    } catch { alert('Could not accept order. Try again.'); }
    setAccepting(null);
  };

  const updateStatus = async (targetStatus) => {
    if (!activeOrder) return;
    try {
      await axios.patch(`${API}/orders/${activeOrder._id}/status`,
        { status: targetStatus, driverId: user?._id },
        { headers: { Authorization: `Bearer ${token()}` } }
      );

      if (targetStatus === 'on_the_way') {
        startSimulation();
      }

      if (targetStatus === 'delivered') {
        setEarnings(e => e + (activeOrder.deliveryFee || 40));
        setDeliveredCount(c => c + 1);
        setTimeout(() => { setActiveOrder(null); fetchOrders(); }, 1000);
        return;
      }

      setActiveOrder(prev => prev ? { ...prev, status: targetStatus } : prev);
    } catch { alert('Status update failed.'); }
  };

  const startSimulation = () => {
    setSimulating(true);
    let lat = 9.4533, lng = 77.8024;
    const interval = setInterval(() => {
      lat += (Math.random() - 0.4) * 0.002;
      lng += (Math.random() - 0.4) * 0.002;
      socket.emit('updateDriverLocation', { orderId: activeOrder?._id, lat, lng });
    }, 3000);
    setTimeout(() => { clearInterval(interval); setSimulating(false); }, 90000);
  };

  const doRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  // Available = "accepted" + no driver assigned yet
  const availableOrders = useMemo(() =>
    allOrders.filter(o => o.status === 'accepted' && !o.driverId),
    [allOrders]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* ambient glow */}
      <div className="fixed top-0 right-0 w-[700px] h-[700px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">

        {/* ── Top header ── */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400/70 mb-2 block">Dispatch Terminal</span>
            <h1 className="text-4xl font-black tracking-tighter text-white">Delivery Hub</h1>
            <p className="text-slate-400 font-medium text-sm mt-1">Hey {user?.name?.split(' ')[0] || 'Driver'} 👋</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={doRefresh} disabled={refreshing}
              className="w-11 h-11 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95">
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setIsOnline(v => !v)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-sm transition-all border shadow-lg ${
                isOnline ? 'bg-cyan-500 text-slate-900 border-cyan-400 shadow-cyan-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
              {isOnline ? <><Wifi size={16} /> Online</> : <><WifiOff size={16} /> Offline</>}
            </button>
          </div>
        </div>

        {/* ── Earnings mini-stats ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Today Earnings',  value: `Rs.${earnings}`,     color: 'text-cyan-400' },
            { label: 'Deliveries Done', value: deliveredCount,        color: 'text-emerald-400' },
            { label: 'Available Now',   value: availableOrders.length,color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
              <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Main content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT — Active delivery or radar */}
          <div>
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              {activeOrder ? <><span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse inline-block" /> Active Delivery</> : '🎯 Awaiting Assignment'}
            </h2>

            <AnimatePresence mode="wait">
              {activeOrder ? (
                <ActiveDelivery key="active" order={activeOrder} onUpdate={updateStatus} simulating={simulating} />
              ) : (
                <motion.div key="radar" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
                  className="bg-slate-800/60 border border-slate-700 rounded-[40px] p-12 text-center relative overflow-hidden">
                  {/* Radar UI */}
                  <div className="w-40 h-40 rounded-full border border-slate-700 mx-auto mb-8 relative flex items-center justify-center">
                    <RadarRing delay={0} />
                    <RadarRing delay={1} />
                    <RadarRing delay={2} />
                    <div className="w-28 h-28 absolute rounded-full border border-slate-700 opacity-40" />
                    <div className="relative z-10 w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                      <Navigation size={28} className="text-cyan-400" fill="currentColor" />
                    </div>
                  </div>
                  {isOnline ? (
                    <>
                      <h3 className="text-xl font-black text-white mb-2">Scanning for Orders</h3>
                      <p className="text-cyan-500 font-bold text-sm">Accept an order from the list →</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-black text-slate-400 mb-2">You're Offline</h3>
                      <p className="text-slate-500 font-bold text-sm">Toggle online to see orders</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT — Available orders list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Bell size={18} className="text-cyan-400" />
                Available Orders
                {availableOrders.length > 0 && (
                  <span className="ml-1 w-6 h-6 bg-cyan-500 text-slate-900 rounded-full text-[11px] font-black flex items-center justify-center">
                    {availableOrders.length}
                  </span>
                )}
              </h2>
            </div>

            <div className="space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar pr-1">
              <AnimatePresence>
                {!isOnline ? (
                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                    className="py-20 text-center text-slate-600">
                    <WifiOff size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-black">Go online to see orders</p>
                  </motion.div>
                ) : availableOrders.length === 0 ? (
                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                    className="py-20 text-center text-slate-600">
                    <div className="w-20 h-20 border-2 border-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Truck size={32} className="opacity-30" />
                    </div>
                    <p className="font-black text-lg">No orders available</p>
                    <p className="text-sm font-medium text-slate-500 mt-1">New orders will appear here automatically</p>
                  </motion.div>
                ) : (
                  availableOrders.map(o => (
                    <AvailableCard key={o._id} order={o} onAccept={acceptOrder} accepting={accepting} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
