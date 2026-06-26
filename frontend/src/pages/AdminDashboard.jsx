import React, { useState, useEffect, useMemo } from 'react';
import { Shield, CheckCircle, X, Store, TrendingUp, BarChart2, MapPin, RefreshCw, AlertTriangle, User, Bike, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [unapprovedUsers, setUnapprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [restaurantResponse, orderResponse, userResponse] = await Promise.all([
        axios.get(`${API_BASE}/restaurants`, { params: { includeAll: true } }),
        axios.get(`${API_BASE}/orders/active`),
        axios.get(`${API_BASE}/users/unapproved`)
      ]);
      if (restaurantResponse.data.status === 'success') setRestaurants(restaurantResponse.data.data);
      if (orderResponse.data.status === 'success') setAllOrders(orderResponse.data.data);
      if (userResponse.data.status === 'success') setUnapprovedUsers(userResponse.data.data);
    } catch (error) {
      console.error('Admin dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    try {
      await axios.patch(`${API_BASE}/restaurants/${id}/approve`);
      setRestaurants((prev) => prev.map((restaurant) => restaurant._id === id ? { ...restaurant, isApproved: true } : restaurant));
    } catch (error) {
      alert('Approval failed');
    }
  };

  const handleApproveUser = async (id) => {
    try {
      await axios.patch(`${API_BASE}/users/${id}/approve`);
      setUnapprovedUsers((prev) => prev.filter((u) => u._id !== id));
      // Refresh data to show any side effects
      fetchData();
    } catch (error) {
      alert('User approval failed');
    }
  };

  const pending = useMemo(() => restaurants.filter((restaurant) => !restaurant.isApproved), [restaurants]);
  const revenue = useMemo(() => allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0), [allOrders]);
  const cities = useMemo(() => [...new Set(restaurants.map((restaurant) => restaurant.city))], [restaurants]);

  const statCards = [
    { label: 'Total Restaurants', value: restaurants.length, icon: <Store size={24} />, color: 'text-orange-500 bg-orange-50' },
    { label: 'Active Orders', value: allOrders.length, icon: <TrendingUp size={24} />, color: 'text-blue-500 bg-blue-50' },
    { label: 'Revenue Today', value: `Rs.${revenue.toLocaleString()}`, icon: <BarChart2 size={24} />, color: 'text-green-600 bg-green-50' },
    { label: 'Cities Served', value: cities.length, icon: <MapPin size={24} />, color: 'text-purple-500 bg-purple-50' }
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6 pt-8 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-tl from-slate-900/10 to-transparent rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 bg-white/50 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-sm">
          <div>
            <span className="bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block flex items-center gap-2 w-fit"><Shield size={12} /> System Admin</span>
            <h1 className="text-5xl font-black text-slate-800 tracking-tighter leading-none">Control Panel</h1>
            <p className="text-slate-400 font-bold mt-2">Manage the Zaptaste ecosystem across Tier-2 cities.</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm"><RefreshCw size={18} /> Refresh</button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, index) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="bg-slate-900 text-white p-8 rounded-[32px] shadow-xl shadow-slate-900/10 border border-slate-800 flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-1 transition-all">
              <div className={`absolute top-0 right-0 w-32 h-32 ${card.color.replace('text-', 'bg-').split(' ')[0]}/20 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`}></div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/10 ${card.color.split(' ')[0]} backdrop-blur-sm relative z-10`}>{card.icon}</div>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{card.label}</p>
                <p className="text-4xl font-black text-white tracking-tighter">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <section className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Partner Approvals</h2>
            {unapprovedUsers.length > 0 && <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-xs font-black flex items-center gap-2"><AlertTriangle size={14} /> {unapprovedUsers.length} partners pending</span>}
          </div>
          {loading ? (
            <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100 font-bold text-slate-400">Syncing user data...</div>
          ) : unapprovedUsers.length === 0 ? (
            <div className="bg-white/50 backdrop-blur-sm rounded-[32px] p-12 text-center border border-white">
              <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
              <p className="font-black text-xl text-slate-400">All partners are verified.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {unapprovedUsers.map((u) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    key={u._id} 
                    className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl transition-all relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${u.role === 'vendor' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                        {u.role === 'vendor' ? <Utensils size={28} /> : <Bike size={28} />}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveUser(u._id)} className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all font-black"><CheckCircle size={20} /></button>
                        <button className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"><X size={20} /></button>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-black text-slate-800 mb-1">{u.name}</h3>
                      <p className="text-sm text-slate-400 font-bold mb-4">{u.email}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${u.role === 'vendor' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                          {u.role === 'vendor' ? 'Restaurant Partner' : 'Delivery Partner'}
                        </span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{u.phone}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Restaurant Approvals</h2>
            {pending.length > 0 && <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-xs font-black flex items-center gap-2"><AlertTriangle size={14} /> {pending.length} entities waiting</span>}
          </div>
          {loading ? (
            <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100 font-bold text-slate-400">Loading restaurants...</div>
          ) : pending.length === 0 ? (
            <div className="bg-white/50 backdrop-blur-sm rounded-[32px] p-12 text-center border border-white">
              <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
              <p className="font-black text-xl text-slate-400">All entities are approved.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pending.map((restaurant) => (
                <div key={restaurant._id} className="bg-white p-8 rounded-[32px] shadow-sm border border-orange-100 hover:shadow-xl transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center"><Store className="text-orange-500" size={28} /></div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(restaurant._id)} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-500 hover:text-white transition-all font-black"><CheckCircle size={20} /></button>
                      <button className="p-3 bg-slate-100 text-slate-400 rounded-xl"><X size={20} /></button>
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-1">{restaurant.name}</h3>
                  <p className="text-sm text-slate-400 font-bold flex items-center gap-1"><MapPin size={14} /> {restaurant.address}, {restaurant.city}</p>
                  <p className="text-xs text-slate-300 font-bold mt-2 flex gap-2 flex-wrap">{restaurant.cuisine?.map((cuisine) => <span key={cuisine} className="bg-slate-50 px-2 py-1 rounded-lg">{cuisine}</span>)}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Registry</h2>
            <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Live DB</span>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-[40px] overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50 p-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left p-6 text-xs font-black uppercase tracking-widest text-slate-400">Restaurant</th>
                    <th className="text-left p-6 text-xs font-black uppercase tracking-widest text-slate-400">City</th>
                    <th className="text-left p-6 text-xs font-black uppercase tracking-widest text-slate-400">Rating</th>
                    <th className="text-left p-6 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="text-left p-6 text-xs font-black uppercase tracking-widest text-slate-400">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((restaurant, index) => (
                    <tr key={restaurant._id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${index % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                      <td className="p-6 font-black text-slate-800">{restaurant.name}</td>
                      <td className="p-6 font-bold text-slate-500">{restaurant.city}</td>
                      <td className="p-6 font-black text-orange-500">{restaurant.rating || 0}</td>
                      <td className="p-6"><span className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${restaurant.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{restaurant.isApproved ? 'Approved' : 'Pending'}</span></td>
                      <td className="p-6">{restaurant.isHomeChef && <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-black">Home Chef</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
