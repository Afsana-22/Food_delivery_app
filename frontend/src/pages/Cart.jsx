import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Tag, ChevronRight, Zap, Leaf, Calendar, Clock3, TicketPercent } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { resolveFoodImage } from '../utils/foodImages';

const API_BASE = 'http://localhost:5000/api';

function PaymentModal({ amount, onConfirm, onClose }) {
  const [cardData, setCardData] = useState({ number: '4242 4242 4242 4242', expiry: '12/26', cvc: '123' });

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[48px] w-full max-w-md shadow-2xl p-10 text-left border border-slate-100">
        <h3 className="text-3xl font-black mb-2 tracking-tighter text-slate-800">Secure Payment</h3>
        <p className="text-slate-400 font-bold mb-8">Authorize the transaction of <span className="text-slate-900">Rs.{amount}</span></p>

        <div className="space-y-6 mb-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Card Number</label>
            <input className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold text-slate-800" value={cardData.number} readOnly />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Expiry</label>
              <input className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold text-slate-800" value={cardData.expiry} readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">CVC</label>
              <input className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold text-slate-800" value={cardData.cvc} readOnly />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-5 font-black text-slate-400">Cancel</button>
          <button onClick={onConfirm} className="flex-[2] py-5 bg-slate-900 text-white rounded-[24px] font-black shadow-xl shadow-slate-900/20 active:scale-95 transition-all">Pay & Place Order</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Cart() {
  const { cartItems, cartRestaurant, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEcoFriendly, setIsEcoFriendly] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');
  const [orderStatus, setOrderStatus] = useState('idle');
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [festivalCoupons, setFestivalCoupons] = useState([]);
  const [orderNote, setOrderNote] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!cartRestaurant?.city) return;
      try {
        const response = await axios.get(`${API_BASE}/coupons/smart`, { params: { city: cartRestaurant.city } });
        setFestivalCoupons(response.data?.data || []);
        if (response.data?.suggested?.code) {
          setCoupon(response.data.suggested.code);
        }
      } catch (error) {
        console.error('Coupon fetch error:', error);
      }
    };
    fetchCoupons();
  }, [cartRestaurant?.city]);

  const deliveryFee = useMemo(() => {
    if (user?.isPro) return 0;
    if (!cartRestaurant) return 40;
    return cartRestaurant.dynamicDeliveryFee || 40;
  }, [user, cartRestaurant]);

  const surgeLabel = useMemo(() => {
    if (!cartRestaurant?.demandLevel) return '';
    return cartRestaurant.demandLevel === 'high' ? 'Busy zone surge' : cartRestaurant.demandLevel === 'low' ? 'Low-demand pricing' : 'Smart radius fee';
  }, [cartRestaurant]);

  const finalTotal = Math.max(0, totalAmount + deliveryFee - appliedDiscount);

  const applyCoupon = async (codeOverride) => {
    const couponToApply = codeOverride || coupon;
    if (!couponToApply) return;
    try {
      const response = await axios.post(`${API_BASE}/coupons/validate`, {
        code: couponToApply,
        orderAmount: totalAmount,
        city: cartRestaurant?.city
      });
      setAppliedDiscount(response.data.discountAmount || 0);
      setCoupon(couponToApply);
      setCouponMessage(response.data.message || 'Coupon applied');
    } catch (error) {
      setAppliedDiscount(0);
      setCouponMessage(error.response?.data?.message || 'Unable to apply coupon');
    }
  };

  const handleCheckout = async (paymentMethod = 'cod') => {
    if (!user) {
      navigate('/login');
      return;
    }

    setOrderStatus('processing');
    setShowPayment(false);
    try {
      const res = await axios.post(`${API_BASE}/orders`, {
        userId: user._id,
        restaurantId: cartItems[0].restaurantId,
        items: cartItems,
        subtotal: totalAmount,
        totalAmount: finalTotal,
        paymentMethod,
        deliveryFee,
        discountAmount: appliedDiscount,
        ecoFriendly: isEcoFriendly,
        deliveryAddress: `${cartRestaurant?.city || 'Sivakasi'} smart delivery zone`,
        couponCode: coupon || undefined,
        couponMeta: coupon ? { code: coupon, city: cartRestaurant?.city } : undefined,
        customInstructions: orderNote || cartItems.map((item) => item.customInstructions).filter(Boolean).join(' | '),
        scheduledFor: scheduledFor || undefined
      });

      if (res.data.status === 'success') {
        clearCart();
        navigate(`/track/${res.data.data._id}`);
      }
    } catch (err) {
      alert('Checkout failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setOrderStatus('idle');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-64 h-64 bg-orange-50 rounded-full flex items-center justify-center mb-8 relative">
          <ShoppingCart size={80} className="text-orange-200" />
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-2 -right-2 bg-orange-500 p-4 rounded-full text-white shadow-xl shadow-orange-500/20">
            <Plus size={32} />
          </motion.div>
        </div>
        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter">Your bucket is empty</h2>
        <p className="text-slate-400 font-medium mb-10">Good food is just a few clicks away.</p>
        <button onClick={() => navigate('/')} className="px-12 py-5 bg-slate-900 text-white rounded-3xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95">
          Order Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row items-end justify-between mb-12 border-b border-slate-50 pb-8 gap-6">
        <div>
          <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Checkout Bucket</span>
          <h1 className="text-5xl font-black text-slate-800 tracking-tighter leading-none">Your Selection</h1>
          {cartRestaurant && <p className="text-slate-400 font-bold mt-3">{cartRestaurant.name} | {cartRestaurant.city}</p>}
        </div>
        <p className="text-slate-400 font-bold">{cartItems.length} items selected</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
          {cartItems.map((item) => (
            <motion.div key={item.id || item._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-50 flex items-center justify-between group hover:shadow-2xl hover:shadow-orange-500/5 transition-all">
              <div className="flex gap-8 items-center text-left">
                <div className="w-24 h-24 rounded-[28px] overflow-hidden bg-slate-50 border border-slate-50 flex-shrink-0">
                  <img src={resolveFoodImage(item.name, cartRestaurant?.name || '', item.image || cartRestaurant?.image)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight mb-1">{item.name}</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Item total: Rs.{item.price * item.quantity}</p>
                  {item.customInstructions && <p className="text-xs text-orange-600 font-bold mb-4">Chef note: {item.customInstructions}</p>}
                  <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl w-fit border border-slate-100 shadow-inner">
                    <button onClick={() => updateQuantity(item.id || item._id, Math.max(1, item.quantity - 1))} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400"><Minus size={16} /></button>
                    <span className="font-black text-slate-800 w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id || item._id, item.quantity + 1)} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400"><Plus size={16} /></button>
                  </div>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.id || item._id)} className="p-4 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-3xl">
                <Trash2 size={24} />
              </button>
            </motion.div>
          ))}

          <div className="bg-green-50/50 p-8 rounded-[40px] border border-green-100 text-left space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center"><Leaf size={24} /></div>
                <div>
                  <p className="font-black text-slate-800">Eco-friendly packaging</p>
                  <p className="text-xs font-bold text-green-600 uppercase tracking-widest">No plastic packaging request</p>
                </div>
              </div>
              <button onClick={() => setIsEcoFriendly(!isEcoFriendly)} className={`w-14 h-8 rounded-full transition-all relative ${isEcoFriendly ? 'bg-green-500' : 'bg-slate-200'}`}>
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isEcoFriendly ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="border-t border-green-100 pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center"><Calendar size={24} /></div>
                <div>
                  <p className="font-black text-slate-800">Schedule delivery</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order now, deliver later</p>
                </div>
              </div>
              <input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 font-bold text-slate-700" />
            </div>

            <div className="border-t border-green-100 pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center"><Tag size={24} /></div>
                <div>
                  <p className="font-black text-slate-800">Note to Restaurant</p>
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Extra spicy, no onions, etc.</p>
                </div>
              </div>
              <textarea 
                value={orderNote} 
                onChange={(e) => setOrderNote(e.target.value)} 
                placeholder="Any special instructions for the restaurant?"
                className="w-full bg-white border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-700 resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-3xl shadow-slate-900/40 relative overflow-hidden lg:sticky lg:top-32 text-left">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <h2 className="text-3xl font-black mb-10 tracking-tighter">Order Summary</h2>

            <div className="space-y-6 mb-10">
              <div className="flex justify-between font-bold text-slate-400"><span>Subtotal</span><span className="text-white">Rs.{totalAmount}</span></div>
              <div className="flex justify-between font-bold text-slate-400"><span className="flex items-center gap-2">Delivery fee <Zap size={14} className="text-orange-500" /></span><span className="text-white">{deliveryFee === 0 ? 'FREE' : `Rs.${deliveryFee}`}</span></div>
              <div className="flex justify-between font-bold text-slate-400"><span className="flex items-center gap-2">Pricing mode <Clock3 size={14} className="text-orange-500" /></span><span className="text-white text-sm">{surgeLabel}</span></div>
              {appliedDiscount > 0 && <div className="flex justify-between font-bold text-green-400"><span>Discount applied</span><span>-Rs.{appliedDiscount}</span></div>}
              <div className="pt-6 border-t border-white/5 flex justify-between items-end"><span className="font-black text-slate-400 uppercase tracking-widest text-xs">Total to pay</span><span className="text-5xl font-black tracking-tighter">Rs.{finalTotal}</span></div>
            </div>

            <div className="bg-white/5 p-6 rounded-[32px] mb-6">
              <div className="flex items-center gap-2 mb-4"><Tag size={18} className="text-orange-500" /><span className="text-xs font-black tracking-widest uppercase">Apply offer</span></div>
              <div className="flex gap-2 mb-3">
                <input type="text" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code" className="bg-white/10 border-none rounded-2xl p-4 text-sm font-bold flex-grow focus:ring-2 focus:ring-orange-500" />
                <button onClick={() => applyCoupon()} className="bg-white text-slate-900 px-6 rounded-2xl font-black text-xs hover:bg-orange-500 hover:text-white transition-all">Apply</button>
              </div>
              {couponMessage && <p className={`text-xs font-bold ${appliedDiscount > 0 ? 'text-green-400' : 'text-orange-300'}`}>{couponMessage}</p>}
            </div>

            {festivalCoupons.length > 0 && (
              <div className="bg-white/5 p-6 rounded-[32px] mb-8">
                <div className="flex items-center gap-2 mb-4"><TicketPercent size={18} className="text-orange-500" /><span className="text-xs font-black tracking-widest uppercase">Festival picks</span></div>
                <div className="space-y-3">
                  {festivalCoupons.slice(0, 3).map((offer) => (
                    <button key={offer.code} onClick={() => applyCoupon(offer.code)} className="w-full text-left bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-4">
                      <p className="font-black text-white">{offer.code}</p>
                      <p className="text-xs font-bold text-slate-400">{offer.festivalName} | {offer.discountLabel}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={() => handleCheckout('cod')} 
                disabled={orderStatus === 'processing'} 
                className="flex-1 bg-white/10 py-6 rounded-[32px] font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 disabled:opacity-50"
              >
                COD
              </button>
              <button 
                onClick={() => setShowPayment(true)} 
                disabled={orderStatus === 'processing'} 
                className="flex-[2] bg-orange-500 py-6 rounded-[32px] font-black text-xl hover:bg-orange-400 transition-all shadow-2xl shadow-orange-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {orderStatus === 'processing' ? 'Processing...' : 'Pay Online'}
                <ChevronRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal 
          amount={finalTotal} 
          onConfirm={() => handleCheckout('online')} 
          onClose={() => setShowPayment(false)} 
        />
      )}
    </div>
  );
}
