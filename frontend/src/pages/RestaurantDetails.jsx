import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, MapPin, Search, Plus, X, ChefHat, Crown, Zap, Leaf, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { resolveFoodImage, createFoodArtwork } from '../utils/foodImages';

const API_BASE = 'http://localhost:5000/api';

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showSmartSuggestion, setShowSmartSuggestion] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE}/restaurants/${id}`);
        if (res.data.status === 'success') {
          setRestaurant(res.data.data);
        }
      } catch (error) {
        console.error('Fetch details error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const menu = useMemo(() => {
    if (!restaurant?.menu) return [];
    let filtered = restaurant.menu;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    return filtered.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [restaurant, searchQuery, selectedCategory]);

  const availableCategories = useMemo(() => {
    if (!restaurant?.menu) return ['All'];
    const cats = new Set(restaurant.menu.map(item => item.category).filter(Boolean));
    return ['All', ...cats];
  }, [restaurant]);

  const handleAddItem = (item) => {
    addToCart({ ...item }, restaurant);

    const addon = item.recommendedAddons?.[0];
    if (addon) {
      setShowSmartSuggestion({ itemName: item.name, addon });
    }
  };

  const addSuggestedAddon = () => {
    if (!showSmartSuggestion) return;
    addToCart({ ...showSmartSuggestion.addon, image: resolveFoodImage(showSmartSuggestion.addon.name, showSmartSuggestion.itemName, restaurant.image) }, restaurant);
    setShowSmartSuggestion(null);
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onresult = (event) => setSearchQuery(event.results[0][0].transcript);
    recognition.start();
  };

  if (loading) return <div className="p-20 text-center font-bold">Loading restaurant...</div>;
  if (!restaurant) return <div className="p-20 text-center font-bold text-red-500">Restaurant not found.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 mb-8 hover:text-orange-500 transition-all font-bold group">
        <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" /> Back to explore
      </button>

      <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/40 border border-slate-100 mb-12 relative overflow-hidden flex flex-col md:flex-row gap-10 items-center">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-orange-100 to-red-50 rounded-full -mr-40 -mt-40 opacity-30 blur-3xl"></div>
        <div className="w-full md:w-64 h-64 rounded-[32px] overflow-hidden shadow-2xl border-8 border-white flex-shrink-0 relative z-10">
          <img src={resolveFoodImage(restaurant.name, restaurant.city, restaurant.image)} onError={(e) => { e.target.onerror = null; e.target.src = createFoodArtwork(restaurant.name, restaurant.city); }} alt={restaurant.name} className="w-full h-full object-cover scale-105" />
        </div>

        <div className="relative z-10 text-center md:text-left flex-grow">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
            <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{restaurant.city}</span>
            {restaurant.isHomeChef && <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Crown size={10} /> Home Chef</span>}
            {restaurant.fastDeliveryBadge && <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Zap size={10} /> {restaurant.smartEtaMins} mins</span>}
            {restaurant.ecoPackagingAvailable && <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Leaf size={10} /> Eco</span>}
          </div>
          <h1 className="text-5xl font-black mb-4 text-slate-800 tracking-tighter leading-none">{restaurant.name}</h1>
          <p className="text-slate-400 mb-6 font-bold text-lg flex items-center justify-center md:justify-start gap-2 max-w-xl">
            <MapPin size={22} className="text-orange-500" /> {restaurant.address}
          </p>
          <div className="flex flex-wrap gap-3 mb-6 justify-center md:justify-start">
            {(restaurant.localSpecialties || []).map((special) => (
              <span key={special} className="bg-orange-50 text-orange-700 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest">{special}</span>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-left">
            <div>
              <span className="text-[10px] uppercase font-black text-slate-300 tracking-widest mb-2 block">Avg rating</span>
              <span className="flex items-center gap-2 font-black text-2xl text-slate-800 leading-none"><Star size={24} className="fill-orange-400 text-orange-400" /> {restaurant.rating || 4.2}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-slate-300 tracking-widest mb-2 block">Delivery time</span>
              <span className="flex items-center gap-2 font-black text-2xl text-slate-800 leading-none"><Clock size={24} className="text-orange-500" /> {restaurant.smartEtaMins}m</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-slate-300 tracking-widest mb-2 block">Delivery fee</span>
              <span className="font-black text-2xl text-slate-800 leading-none">Rs.{restaurant.dynamicDeliveryFee}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-8 mb-5">
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md border border-slate-100 px-6 py-4 rounded-3xl text-slate-500 shadow-sm transition-all focus-within:shadow-md focus-within:bg-white">
          <Search size={18} />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="Search local specials, snacks, combos..." className="bg-transparent border-none focus:outline-none text-sm font-bold flex-1" />
          <button onClick={startVoiceSearch} className="p-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white transition-colors shadow-sm"><Mic size={18} /></button>
        </div>
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-[28px] p-6 text-left shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-300 mb-2 relative z-10">Smart add-ons</p>
          <h3 className="text-2xl font-black tracking-tighter mb-3 relative z-10">Boost your cart</h3>
          <p className="text-sm text-slate-300 font-medium relative z-10">We surface recommended drinks and sides based on what people usually pair with these dishes.</p>
        </div>
      </div>

      <div className="overflow-x-auto pb-6 mb-4 hide-scrollbar">
        <div className="flex gap-3">
          {availableCategories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm ${selectedCategory === cat ? 'bg-orange-500 text-white shadow-orange-500/30' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {menu.map((item, index) => (
          <motion.div
            key={item._id || item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex gap-6 items-center group hover:shadow-2xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all duration-300 relative"
          >
            <div className="w-28 h-28 rounded-[24px] overflow-hidden bg-slate-50 border border-slate-50 flex-shrink-0 relative">
              <img src={resolveFoodImage(item.name, item.description || restaurant.name, item.image || restaurant.image)} onError={(e) => { e.target.onerror = null; e.target.src = createFoodArtwork(item.name, restaurant.name); }} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className={`absolute top-2 left-2 p-1 bg-white rounded-md shadow-sm flex items-center justify-center border ${item.veg ? 'border-green-600' : 'border-red-600'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${item.veg ? 'bg-green-600' : 'bg-red-600'}`}></div>
              </div>
            </div>

            <div className="flex-grow text-left">
              <div className="mb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {item.isLocalSpecial && <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Local special</span>}
                  {(item.tags || []).slice(0, 2).map((tag) => <span key={tag} className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{tag}</span>)}
                </div>
                <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">{item.name}</h3>
                <p className="text-slate-400 text-xs font-bold leading-relaxed">{item.description || 'A signature local favorite that captures the essence of Zaptaste quality.'}</p>
              </div>
              <div className="flex justify-between items-center mt-4 gap-4">
                <div>
                  <p className="font-black text-2xl text-slate-900 tracking-tighter">Rs.{item.price}</p>
                  {item.recommendedAddons?.[0] && <p className="text-[11px] text-orange-500 font-black uppercase tracking-widest mt-1">Try with {item.recommendedAddons[0].name}</p>}
                </div>
                <button onClick={() => handleAddItem(item)} className="bg-white border-2 border-slate-900 text-slate-900 px-6 py-2.5 rounded-2xl font-black text-xs hover:bg-slate-900 hover:text-white transition-all active:scale-95 flex items-center gap-2">
                  Add <Plus size={14} strokeWidth={4} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>

        {showSmartSuggestion && (
          <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl p-8 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600">
                <Zap size={32} />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight">Smart cart suggestion</h3>
              <p className="text-slate-500 font-medium mb-8">People also pair <span className="font-black text-slate-800">{showSmartSuggestion.itemName}</span> with <span className="font-black text-slate-800">{showSmartSuggestion.addon.name}</span>.</p>
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 mb-8 text-left border border-slate-100">
                <img src={resolveFoodImage(showSmartSuggestion.addon.name, showSmartSuggestion.itemName, restaurant.image)} onError={(e) => { e.target.onerror = null; e.target.src = createFoodArtwork(showSmartSuggestion.addon.name); }} className="w-16 h-16 rounded-xl object-cover" alt={showSmartSuggestion.addon.name} />
                <div className="flex-grow">
                  <p className="font-bold text-slate-800">{showSmartSuggestion.addon.name}</p>
                  <p className="font-black text-orange-600">Rs.{showSmartSuggestion.addon.price}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowSmartSuggestion(null)} className="flex-1 py-4 font-black text-slate-400">No, thanks</button>
                <button onClick={addSuggestedAddon} className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black shadow-lg shadow-orange-500/20">Add it</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

