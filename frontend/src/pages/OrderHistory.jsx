import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, Package, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  preparing: 'bg-blue-100 text-blue-700',
  on_the_way: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

export default function OrderHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:5000/api/orders/user/${user._id}`)
      .then((res) => {
        if (res.data.status === 'success') {
          setOrders(res.data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 p-8">
        <ShoppingBag size={64} className="text-slate-200" />
        <p className="font-black text-2xl text-slate-400">Please login to view your orders</p>
        <button onClick={() => navigate('/login')} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black">
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
          Your Journey
        </span>
        <h1 className="text-5xl font-black text-slate-800 tracking-tighter leading-none">Order History</h1>
      </div>

      {loading ? (
        <div className="text-center py-20 font-bold text-slate-400">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-[48px] p-20 text-center border border-slate-100 shadow-sm">
          <Package size={80} className="mx-auto text-slate-200 mb-6" />
          <p className="text-3xl font-black text-slate-300 tracking-tight">No orders yet!</p>
          <p className="text-slate-400 mt-2 mb-10">Your delicious order history will appear here</p>
          <button
            onClick={() => navigate('/')}
            className="px-12 py-5 bg-slate-900 text-white rounded-3xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
          >
            Order Now
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
              onClick={() => navigate(`/track/${order._id}`)}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-500'}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                      <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="font-bold text-slate-500 text-sm mb-2">
                    {order.items?.map((item) => `${item.quantity}x ${item.name}`).join(', ')}
                  </p>
                  <p className="font-black text-2xl text-slate-800 tracking-tighter">Rs.{order.totalAmount}</p>
                  {order.ecoFriendly && <span className="text-[10px] text-green-600 font-black mt-1 inline-block">Eco-friendly order</span>}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">#{order._id.slice(-6).toUpperCase()}</p>
                  <ChevronRight size={24} className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-2 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
