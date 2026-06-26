import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Store, Truck, User as UserIcon, Mail, Phone, Settings, LogOut, Camera, Crown, MapPin, Zap } from 'lucide-react';

export default function Profile() {
  const { user, logout, updateUser, token } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    image: user?.image || ''
  });
  const [saveLoading, setSaveLoading] = useState(false);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await axios.patch('http://localhost:5000/api/users/profile', editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'success') {
        updateUser(res.data.data);
        setIsEditing(false);
      }
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaveLoading(false);
    }
  };

  const roleConfig = {
    admin: { label: 'System Admin', icon: <Shield size={20} className="text-red-500" />, color: 'from-red-400 to-rose-600', bg: 'bg-red-50' },
    vendor: { label: 'Registered Vendor', icon: <Store size={20} className="text-orange-500" />, color: 'from-orange-400 to-amber-600', bg: 'bg-orange-50' },
    driver: { label: 'Delivery Partner', icon: <Truck size={20} className="text-blue-500" />, color: 'from-blue-400 to-cyan-600', bg: 'bg-blue-50' },
    customer: { label: 'Zaptaste Member', icon: <UserIcon size={20} className="text-emerald-500" />, color: 'from-emerald-400 to-teal-600', bg: 'bg-emerald-50' }
  };

  const currentRole = roleConfig[user.role] || roleConfig.customer;

  return (
    <div className="min-h-screen bg-slate-50 relative pb-24 w-full">
      {/* Dynamic Background Blurs */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 bg-gradient-to-br ${currentRole.color}`}></div>
      
      <div className="max-w-5xl mx-auto pt-16 px-4 relative z-10">
        <h1 className="text-5xl font-black text-slate-800 tracking-tighter mb-10 text-left">Identity Center</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Identity Card */}
          <div className="md:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center relative overflow-hidden text-left">
              <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-br ${currentRole.color} opacity-10`}></div>
              
              <div className="relative group mb-6 mt-4">
                <div className={`w-32 h-32 bg-gradient-to-tr ${currentRole.color} rounded-[32px] p-1 shadow-lg shadow-slate-900/10`}>
                  <div className="w-full h-full bg-white rounded-[28px] flex items-center justify-center relative overflow-hidden">
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-800 to-slate-400">
                        {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setIsEditing(true)}>
                      <Camera className="text-white" size={24} />
                    </div>
                  </div>
                </div>
                {user.isPro && (
                  <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-lg flex items-center gap-1">
                    <Crown size={12} fill="currentColor" /> PRO
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">{user.name}</h2>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest mb-6 ${currentRole.bg}`}>
                {currentRole.icon}
                <span className="text-slate-700">{currentRole.label}</span>
              </div>

              <div className="w-full h-px bg-slate-100 mb-6"></div>

              <div className="w-full space-y-3">
                <button 
                  onClick={() => setActiveTab('personal')}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'personal' ? 'bg-slate-900 text-white shadow-lg' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
                >
                  <UserIcon size={18} /> Personal Info
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'settings' ? 'bg-slate-900 text-white shadow-lg' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
                >
                  <Settings size={18} /> Preferences
                </button>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} onClick={logout} className="w-full bg-red-50 text-red-600 px-6 py-5 rounded-[24px] font-black tracking-tight text-lg flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all shadow-sm">
              <LogOut size={20} /> Terminate Session
            </motion.button>
          </div>

          {/* Details Section */}
          <div className="md:col-span-2">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 h-full text-left">
              {activeTab === 'personal' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">Private Details</h3>
                    <p className="text-slate-400 font-bold mb-8">Manage the data associated with your Zaptaste identity.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2">Full Legal Name</label>
                      {isEditing ? (
                        <input className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-800 font-bold" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} />
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 text-slate-800 font-bold">
                          <UserIcon className="text-slate-400" size={18} /> {user.name}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2">Registered Email</label>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 text-slate-400 font-bold opacity-60">
                        <Mail className="text-slate-400" size={18} /> {user.email || 'Not provided'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2">Contact Number</label>
                      {isEditing ? (
                        <input className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-800 font-bold" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} />
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 text-slate-800 font-bold">
                          <Phone className="text-slate-400" size={18} /> {user.phone || 'Verify phone number +'}
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2">Profile Image URL</label>
                        <input className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-800 font-bold" value={editData.image} placeholder="https://..." onChange={(e) => setEditData({...editData, image: e.target.value})} />
                      </div>
                    )}
                  </div>

                  {user.role === 'vendor' && (
                    <div className="mt-8 p-6 bg-orange-50 rounded-3xl border border-orange-100">
                      <div className="flex items-center gap-3 mb-4">
                        <Zap size={20} className="text-orange-500" />
                        <h4 className="text-lg font-black text-slate-800 tracking-tight">Vendor Analytics Hook</h4>
                      </div>
                      <p className="text-sm font-bold text-slate-600 mb-4">Your store performance matrix is fully active. Make sure to keep your kitchen hardware online to intercept rapid orders.</p>
                      <button className="bg-orange-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20">Go to Kitchen Ops</button>
                    </div>
                  )}

                  <div className="pt-8 border-t border-slate-100 flex gap-4">
                    {isEditing ? (
                      <>
                        <button onClick={handleSave} disabled={saveLoading} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black tracking-tight text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20">
                          {saveLoading ? 'Saving...' : 'Save Meta Data'}
                        </button>
                        <button onClick={() => setIsEditing(false)} className="bg-slate-100 text-slate-500 px-8 py-4 rounded-2xl font-black tracking-tight text-lg hover:bg-slate-200 transition-all">Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setIsEditing(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black tracking-tight text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">Edit Data</button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">Notification Matrix</h3>
                    <p className="text-slate-400 font-bold mb-8">Control how Zaptaste communicates with your devices.</p>
                  </div>

                  <div className="space-y-4">
                    {['Push Notifications', 'Email Digests', 'Live Order GPS Tracking (Driver)', 'Promotional SMS'].map((setting, idx) => (
                      <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-slate-300 transition-colors">
                        <span className="font-bold text-slate-700">{setting}</span>
                        <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer shadow-inner">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
