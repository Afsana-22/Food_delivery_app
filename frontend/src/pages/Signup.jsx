import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Lock, ArrowRight, Loader2, Utensils, Bike,
  Store, Sparkles, Eye, EyeOff, Plus, Trash2, Image, Tag, DollarSign,
  ChevronRight, CheckCircle2, Camera, X, TicketPercent, ShieldCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

const STEP_LABELS = ['Account', 'Restaurant', 'Menu & Prices', 'Done'];

/* ─── Reusable field ────────────────────────────────────── */
function Field({ label, icon: Icon, error, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-bold text-slate-600 ml-1">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />}
        <input className={`input-field ${Icon ? 'pl-11' : ''} ${error ? 'border-red-400 ring-1 ring-red-400' : ''}`} {...props} />
      </div>
      {error && <p className="text-xs text-red-500 font-semibold ml-1">{error}</p>}
    </div>
  );
}

/* ─── Role selector card ────────────────────────────────── */
function RoleCard({ role, label, icon: Icon, description, gradient, selected, onClick }) {
  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={onClick}
      className={`relative flex flex-col items-center text-center p-5 rounded-3xl border-2 transition-all ${
        selected ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/10' : 'border-slate-100 bg-white hover:border-slate-200'
      }`}>
      {selected && (
        <span className="absolute top-3 right-3 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
          <CheckCircle2 size={12} className="text-white" />
        </span>
      )}
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-lg`}>
        <Icon size={26} className="text-white" />
      </div>
      <p className="font-black text-slate-800 text-base">{label}</p>
      <p className="text-[11px] text-slate-400 font-medium mt-1 leading-tight">{description}</p>
    </motion.button>
  );
}

/* ─── Menu Item Row ─────────────────────────────────────── */
function MenuItemRow({ item, onChange, onRemove }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}
      className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <input placeholder="Dish name (e.g. Chicken Biryani)"
            value={item.name} onChange={e => onChange('name', e.target.value)}
            className="input-field text-sm" />
        </div>
        <button onClick={onRemove} className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors mt-0.5">
          <Trash2 size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input type="number" placeholder="Price (Rs.)" min={0}
            value={item.price} onChange={e => onChange('price', e.target.value)}
            className="input-field pl-9 text-sm" />
        </div>
        <select value={item.category} onChange={e => onChange('category', e.target.value)}
          className="input-field text-sm">
          {['breakfast','lunch','dinner','starter','dessert','drink'].map(c =>
            <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
          )}
        </select>
      </div>
      <input placeholder="Food image URL (e.g. https://...)"
        value={item.image} onChange={e => onChange('image', e.target.value)}
        className="input-field text-sm" />
      <div className="flex gap-3 items-center">
        <textarea placeholder="Short description (optional)"
          value={item.description} onChange={e => onChange('description', e.target.value)}
          rows={2} className="input-field text-sm flex-1 resize-none" />
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`toggle-track ${item.veg ? 'on' : ''}`} onClick={() => onChange('veg', !item.veg)}>
              <div className="toggle-thumb" />
            </div>
            <span className="text-xs font-bold text-slate-600">Veg</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`toggle-track ${item.isAvailable ? 'on' : ''}`} onClick={() => onChange('isAvailable', !item.isAvailable)}>
              <div className="toggle-thumb" />
            </div>
            <span className="text-xs font-bold text-slate-600">Available</span>
          </label>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Coupon Row ────────────────────────────────────────── */
function CouponRow({ coupon, onChange, onRemove }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}
      className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <input placeholder="Coupon code (e.g. SAVE20)" value={coupon.code}
            onChange={e => onChange('code', e.target.value.toUpperCase())}
            className="input-field text-sm font-black tracking-widest uppercase" />
        </div>
        <button onClick={onRemove} className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors mt-0.5">
          <Trash2 size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input type="number" placeholder="Discount %" min={0} max={100}
          value={coupon.discountPercent} onChange={e => onChange('discountPercent', e.target.value)}
          className="input-field text-sm" />
        <input type="number" placeholder="Min order (Rs.)" min={0}
          value={coupon.minOrderAmount} onChange={e => onChange('minOrderAmount', e.target.value)}
          className="input-field text-sm" />
      </div>
      <input placeholder="Festival / label (e.g. Diwali Special)"
        value={coupon.festivalName} onChange={e => onChange('festivalName', e.target.value)}
        className="input-field text-sm" />
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function Signup() {
  const navigate  = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(0); // 0=role+account, 1=restaurant, 2=menu, 3=done
  const [role, setRole] = useState('customer');
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  /* ── Step 0: account fields ── */
  const [account, setAccount] = useState({ name:'', email:'', phone:'', password:'', confirmPassword:'' });

  /* ── Step 1: restaurant details ── */
  const [restaurant, setRestaurant] = useState({
    name:'', city:'', address:'', cuisine:'', image:''
  });

  /* ── Step 2: menu items ── */
  const [menuItems, setMenuItems] = useState([
    { name:'', price:'', image:'', description:'', category:'lunch', veg:true, isAvailable:true }
  ]);

  /* ── Step 2: coupons ── */
  const [coupons, setCoupons] = useState([]);

  /* ── helpers ── */
  const acctChange  = e => setAccount(p => ({ ...p, [e.target.name]: e.target.value }));
  const restChange  = e => setRestaurant(p => ({ ...p, [e.target.name]: e.target.value }));

  const addMenuItem  = () => setMenuItems(p => [...p, { name:'', price:'', image:'', description:'', category:'lunch', veg:true, isAvailable:true }]);
  const removeMenu   = i  => setMenuItems(p => p.filter((_, idx) => idx !== i));
  const changeMenu   = (i, key, val) => setMenuItems(p => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));

  const addCoupon    = () => setCoupons(p => [...p, { code:'', discountPercent:'', minOrderAmount:'', festivalName:'' }]);
  const removeCoupon = i  => setCoupons(p => p.filter((_, idx) => idx !== i));
  const changeCoupon = (i, key, val) => setCoupons(p => p.map((c, idx) => idx === i ? { ...c, [key]: val } : c));

  /* ── step navigator ── */
  const goNext = async () => {
    setError('');
    if (step === 0) {
      if (!account.name || !account.email || !account.phone || !account.password) { setError('Please fill all required fields.'); return; }
      if (account.password !== account.confirmPassword) { setError('Passwords do not match.'); return; }
      if (account.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (role === 'customer' || role === 'driver') { await submitAccount(); return; }
      setStep(1);
    } else if (step === 1) {
      if (!restaurant.name || !restaurant.city || !restaurant.address) { setError('Restaurant name, city & address are required.'); return; }
      setStep(2);
    } else if (step === 2) {
      await submitAll();
    }
  };

  const submitAccount = async () => {
    setLoading(true);
    const result = await register({ ...account, role });
    setLoading(false);
    if (result.success) {
      setStep(3);
    } else {
      setError(result.message);
    }
  };

  const submitAll = async () => {
    setLoading(true);
    try {
      const validMenu = menuItems.filter(m => m.name && m.price);
      const payload = {
        name:  account.name,
        email: account.email,
        phone: account.phone,
        password: account.password,
        role,
        restaurant: {
          ...restaurant,
          cuisine: restaurant.cuisine.split(',').map(c => c.trim()).filter(Boolean),
          menu: validMenu.map(m => ({
            ...m,
            price: Number(m.price),
          })),
        },
        coupons: coupons.filter(c => c.code).map(c => ({
          ...c,
          discountPercent:  Number(c.discountPercent) || 0,
          minOrderAmount:   Number(c.minOrderAmount)  || 0,
        })),
      };
      const result = await register(payload);
      if (result.success) {
        setStep(3);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Submission failed. Please try again.');
    }
    setLoading(false);
  };

  const roles = [
    { role:'customer', label:'Customer', icon:User,    description:'Order food & track deliveries', gradient:'from-orange-500 to-red-500' },
    { role:'vendor',   label:'Vendor',   icon:Store,   description:'List your restaurant & manage orders', gradient:'from-violet-500 to-purple-600' },
    { role:'driver',   label:'Driver',   icon:Bike,    description:'Accept & deliver orders', gradient:'from-cyan-500 to-blue-600' },
  ];

  const totalSteps = role === 'vendor' ? 4 : 1;
  const progress   = role === 'vendor' ? ((step) / 3) * 100 : (step >= 3 ? 100 : 0);

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-violet-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-400/10 rounded-full blur-[80px] pointer-events-none" />

      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} className="w-full max-w-xl">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.2),transparent)]" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles size={28} className="text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter">Join Zaptaste</h1>
                <p className="text-slate-400 font-medium text-sm mt-0.5">
                  {step === 3 ? 'Account created! 🎉' : `Step ${Math.min(step + 1, totalSteps)} of ${totalSteps}`}
                </p>
              </div>
            </div>
            {/* Progress bar */}
            {step < 3 && (
              <div className="mt-6 h-1.5 bg-white/10 rounded-full overflow-hidden relative z-10">
                <motion.div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${role === 'vendor' ? (step / 3) * 100 : (step > 0 ? 100 : 20)}%` }}
                  transition={{ duration: 0.5 }} />
              </div>
            )}
          </div>

          <div className="p-8">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                  className="mb-5 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold border border-red-100 flex items-start gap-2">
                  <X size={16} className="mt-0.5 flex-shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">

              {/* ── STEP 0: Role + Account ─── */}
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-6">
                  <div>
                    <p className="text-sm font-bold text-slate-600 mb-3">I am joining as...</p>
                    <div className="grid grid-cols-3 gap-3">
                      {roles.map(r => (
                        <RoleCard key={r.role} {...r} selected={role === r.role} onClick={() => setRole(r.role)} />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <Field label="Full Name" icon={User} name="name" value={account.name} onChange={acctChange} placeholder="John Doe" required />
                    <Field label="Email" icon={Mail} name="email" type="email" value={account.email} onChange={acctChange} placeholder="you@example.com" required />
                    <Field label="Phone" icon={Phone} name="phone" type="tel" value={account.phone} onChange={acctChange} placeholder="9876543210" required />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-600 ml-1">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                          <input name="password" type={showPw ? 'text' : 'password'} value={account.password} onChange={acctChange}
                            required className="input-field pl-11 pr-10" placeholder="Min 6 chars" />
                          <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-600 ml-1">Confirm</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                          <input name="confirmPassword" type="password" value={account.confirmPassword} onChange={acctChange}
                            required className="input-field pl-11" placeholder="••••••••" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 1: Restaurant Details ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center">
                      <Store size={20} className="text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800">Restaurant Details</h3>
                      <p className="text-xs text-slate-400 font-medium">Tell us about your restaurant</p>
                    </div>
                  </div>

                  <Field label="Restaurant Name" icon={Store} name="name" value={restaurant.name} onChange={restChange} placeholder="e.g. Spice Garden" required />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-600 ml-1">City</label>
                      <select name="city" value={restaurant.city} onChange={restChange} className="input-field">
                        <option value="">Select city</option>
                        {['Sivakasi','Virudhunagar','Madurai','Chennai','Coimbatore'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <Field label="Cuisines" name="cuisine" value={restaurant.cuisine} onChange={restChange} placeholder="Indian, Chinese" icon={Utensils} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-600 ml-1">Full Address</label>
                    <textarea name="address" value={restaurant.address} onChange={restChange} rows={2}
                      className="input-field resize-none" placeholder="123 Main Street, Near..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-600 ml-1 flex items-center gap-2">
                      <Camera size={15} className="text-slate-400" /> Restaurant Cover Image URL
                    </label>
                    <input name="image" type="url" value={restaurant.image} onChange={restChange} className="input-field"
                      placeholder="https://example.com/restaurant.jpg" />
                    {restaurant.image && (
                      <div className="h-32 rounded-2xl overflow-hidden border border-slate-200 mt-2">
                        <img src={restaurant.image} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Menu + Coupons ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-8">
                  {/* Menu Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                          <Utensils size={20} className="text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800">Menu Items</h3>
                          <p className="text-xs text-slate-400 font-medium">Add your dishes with prices</p>
                        </div>
                      </div>
                      <button onClick={addMenuItem} type="button"
                        className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl font-black text-xs transition-all hover:bg-orange-400 active:scale-95">
                        <Plus size={14} /> Add Dish
                      </button>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                      <AnimatePresence>
                        {menuItems.map((item, i) => (
                          <MenuItemRow key={i} item={item}
                            onChange={(key, val) => changeMenu(i, key, val)}
                            onRemove={() => removeMenu(i)} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Coupons Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                          <TicketPercent size={20} className="text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800">Coupons (Optional)</h3>
                          <p className="text-xs text-slate-400 font-medium">Attract more customers</p>
                        </div>
                      </div>
                      <button onClick={addCoupon} type="button"
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl font-black text-xs transition-all hover:bg-amber-400 active:scale-95">
                        <Plus size={14} /> Add Coupon
                      </button>
                    </div>

                    <div className="space-y-3">
                      <AnimatePresence>
                        {coupons.map((coupon, i) => (
                          <CouponRow key={i} coupon={coupon}
                            onChange={(key, val) => changeCoupon(i, key, val)}
                            onRemove={() => removeCoupon(i)} />
                        ))}
                      </AnimatePresence>
                      {coupons.length === 0 && (
                        <div className="py-6 text-center text-slate-400 text-sm font-medium border-2 border-dashed border-slate-200 rounded-2xl">
                          No coupons yet — add them to attract customers
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Done ── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="text-center py-8 space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 animate-bounce">
                    <CheckCircle2 size={52} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Account Created!</h2>
                    <p className="text-slate-500 font-medium mt-2">
                      {role === 'vendor'
                        ? 'Your restaurant is submitted for admin approval. You can login once approved!'
                        : role === 'driver'
                        ? 'Your driver account is pending admin approval. Login once approved!'
                        : 'Welcome aboard! Sign in now to start ordering.'}
                    </p>
                  </div>
                  <button onClick={() => navigate('/login')}
                    className="btn-primary flex items-center gap-2 mx-auto px-10 py-4">
                    Go to Login <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}

            </AnimatePresence>

            {/* ── Action buttons ── */}
            {step < 3 && (
              <div className={`flex gap-3 mt-8 ${step > 0 ? 'justify-between' : 'justify-end'}`}>
                {step > 0 && (
                  <button onClick={() => { setStep(s => s - 1); setError(''); }}
                    className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 font-black text-sm hover:bg-slate-200 transition-all">
                    ← Back
                  </button>
                )}
                <button onClick={goNext} disabled={loading}
                  className="btn-primary flex items-center gap-2 px-8 py-3 rounded-2xl text-sm disabled:opacity-60 disabled:scale-100">
                  {loading
                    ? <><Loader2 className="animate-spin" size={18} /> Working...</>
                    : step === 2
                    ? <><span>Submit & Finish</span><CheckCircle2 size={16} /></>
                    : role !== 'vendor' && step === 0
                    ? <><span>Create Account</span><ArrowRight size={16} /></>
                    : <><span>Continue</span><ChevronRight size={16} /></>
                  }
                </button>
              </div>
            )}

            {step === 0 && (
              <p className="text-center text-slate-500 text-sm mt-5">
                Already have an account?{' '}
                <Link to="/login" className="text-orange-500 font-bold hover:text-orange-600 hover:underline">Sign in</Link>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
