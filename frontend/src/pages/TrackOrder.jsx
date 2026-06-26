import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import { Clock, Truck, CheckCircle, MapPin as MapPinIcon, ArrowLeft, Phone, User as UserIcon, Send, MessageSquare, CalendarClock, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const socket = io('http://localhost:5000');
const API_BASE = 'http://localhost:5000/api';



let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdate({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.2 });
  }, [center, map]);
  return null;
}

function QuickChat({ orderId, messages, setMessages, driverName = 'Pilot' }) {
  const [input, setInput] = useState('');
  const quickMsgs = ['Call me when you arrive', 'Leave at door', 'Bring to gate'];

  const send = async (messageText) => {
    const text = (messageText || input).trim();
    if (!text) return;

    const optimisticMessage = { sender: 'user', text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticMessage]);
    setInput('');

    try {
      await axios.post(`${API_BASE}/orders/${orderId}/messages`, { sender: 'user', text });
      socket.emit('sendOrderMessage', { orderId, message: optimisticMessage });
    } catch (error) {
      console.error('Message send error:', error);
    }
  };

  return (
    <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-[420px]">
      <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-black tracking-tight">Chat with {driverName}</span>
        </div>
        <MessageSquare size={18} />
      </div>
      <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((message, index) => (
          <div key={`${message.createdAt || index}-${index}`} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-2xl font-bold text-sm ${message.sender === 'user' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white text-slate-700 shadow-sm'}`}>
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-white border-t border-slate-50">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {quickMsgs.map((quickMessage) => (
            <button key={quickMessage} onClick={() => send(quickMessage)} className="whitespace-nowrap bg-slate-100 px-4 py-2 rounded-xl text-xs font-black text-slate-500 hover:bg-orange-50 hover:text-orange-600 transition-all">{quickMessage}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-grow bg-slate-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-orange-500" />
          <button onClick={() => send()} className="p-3 bg-slate-900 text-white rounded-xl"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('pending');
  const [driverLocation, setDriverLocation] = useState([9.4533, 77.8024]);
  const [messages, setMessages] = useState([{ sender: 'driver', text: 'On my way with your hot meal!', createdAt: new Date().toISOString() }]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${API_BASE}/orders/${orderId}`);
        const orderData = response.data?.data;
        setOrder(orderData);
        setStatus(orderData?.status || 'pending');
        if (orderData?.chatMessages?.length) {
          setMessages(orderData.chatMessages);
        }
      } catch (error) {
        console.error('Track order fetch error:', error);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    socket.emit('joinOrder', orderId);

    const handleDriverUpdate = (data) => setDriverLocation([data.lat, data.lng]);
    const handleStatusChange = (data) => {
      if (String(data.orderId) === String(orderId)) {
        setStatus(data.status);
      }
    };
    const handleOrderMessage = (data) => {
      if (String(data.orderId) === String(orderId)) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    socket.on('driverLocationUpdate', handleDriverUpdate);
    socket.on('orderStatusChanged', handleStatusChange);
    socket.on('orderMessage', handleOrderMessage);

    return () => {
      socket.off('driverLocationUpdate', handleDriverUpdate);
      socket.off('orderStatusChanged', handleStatusChange);
      socket.off('orderMessage', handleOrderMessage);
    };
  }, [orderId]);

  const statusSteps = [
    { label: 'Confirmed', status: 'pending', icon: <CheckCircle /> },
    { label: 'Accepted', status: 'accepted', icon: <CheckCircle className="text-emerald-500" /> },
    { label: 'Kitchen Prep', status: 'preparing', icon: <Clock /> },
    { label: 'Ready', status: 'ready', icon: <Package size={20} /> },
    { label: 'Picked Up', status: 'picked_up', icon: <Truck /> },
    { label: 'On the Way', status: 'on_the_way', icon: <Truck className="text-orange-500" /> },
    { label: 'Delivered', status: 'delivered', icon: <CheckCircle /> }
  ];

  const currentStepIdx = Math.max(0, statusSteps.findIndex((step) => step.status === status));
  const etaText = useMemo(() => `${order?.estimatedDeliveryMins || 20} mins`, [order]);

  return (
    <div className="min-h-screen bg-slate-50 pt-12 px-4 pb-24 w-full">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex justify-between items-center px-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black group hover:text-orange-600 transition-colors">
            <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" /> Back
          </button>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tracking reference</p>
            <p className="text-sm font-black text-slate-800 tracking-tighter">#{orderId.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-10 rounded-[48px] shadow-2xl shadow-slate-200/40 border border-slate-100 flex flex-col">
              <div className="mb-10 text-left">
                <span className="bg-orange-100 text-orange-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 inline-block">Live tracking</span>
                <h1 className="text-5xl font-black text-slate-800 tracking-tighter leading-none mb-4">Almost there</h1>
                <p className="text-slate-400 font-bold text-lg">Arriving in <span className="text-slate-800 font-black underline decoration-orange-500">{etaText}</span></p>
                {order?.scheduledFor && <p className="text-sm font-bold text-orange-600 mt-4 flex items-center gap-2"><CalendarClock size={16} /> Scheduled for {new Date(order.scheduledFor).toLocaleString('en-IN')}</p>}
              </div>

              <div className="space-y-10 relative text-left">
                <div className="absolute left-6 top-8 bottom-8 w-1 bg-slate-50 -z-0"></div>
                {statusSteps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIdx;
                  const isActive = idx === currentStepIdx;
                  return (
                    <div key={step.status} className="flex items-center gap-8 relative z-10 group">
                      <motion.div animate={isActive ? { scale: [1, 1.08, 1] } : {}} transition={{ repeat: Infinity, duration: 3 }} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl ${isCompleted ? 'bg-orange-500 text-white shadow-orange-500/30' : 'bg-slate-100 text-slate-300'}`}>
                        {step.icon}
                      </motion.div>
                      <div className="flex-1">
                        <p className={`font-black text-xl tracking-tight ${isCompleted ? 'text-slate-800' : 'text-slate-300'}`}>{step.label}</p>
                        {isActive && <p className="text-xs text-orange-600 font-black uppercase tracking-widest mt-1">Live action...</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-14 pt-10 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-5 text-left">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center shadow-inner">
                    <UserIcon size={36} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-xl tracking-tight leading-none mb-1">
                      {order?.driverId?.name || 'Searching for Pilot...'}
                    </p>
                    <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">
                      {order?.driverId ? 'Verified Partner' : 'Smart Dispatcher Active'}
                    </p>
                  </div>
                </div>
                {order?.driverId && (
                  <button className="w-14 h-14 bg-slate-900 text-white rounded-2xl hover:bg-orange-500 transition-all flex items-center justify-center shadow-xl shadow-slate-900/20 active:scale-90">
                    <Phone size={24} />
                  </button>
                )}
              </div>
            </div>

            <QuickChat orderId={orderId} messages={messages} setMessages={setMessages} driverName={order?.driverId?.name} />
          </div>

          <div className="lg:col-span-2 relative h-[600px] lg:h-auto min-h-[700px]">
            <div className="bg-white rounded-[56px] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40 h-full relative border-8 border-white">
              <MapContainer center={driverLocation} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={driverLocation}>
                  <Popup>
                    <div className="p-2 font-black text-slate-800 text-center">
                      <p>{order?.driverId?.name || 'Your driver'} is nearby.</p>
                    </div>
                  </Popup>
                </Marker>
                <MapUpdate center={driverLocation} />
              </MapContainer>

              <div className="absolute top-10 left-10 z-[1000]">
                <div className="bg-white/90 backdrop-blur-xl px-6 py-4 rounded-3xl shadow-2xl border border-white/50 flex items-center gap-4">
                  <div className="w-4 h-4 bg-orange-500 rounded-full animate-ping"></div>
                  <span className="text-sm font-black text-slate-800 tracking-tighter uppercase tracking-[0.2em]">Live positioning</span>
                </div>
              </div>

              <div className="absolute bottom-10 left-10 right-10 z-[1000]">
                <div className="bg-slate-900/95 backdrop-blur-2xl p-8 rounded-[40px] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6 text-left">
                    <div className="w-16 h-16 bg-white/10 flex items-center justify-center rounded-[24px] text-white"><MapPinIcon size={32} /></div>
                    <div>
                      <p className="font-black text-white text-xl tracking-tight">Current zone</p>
                      <p className="text-sm font-bold text-slate-400">{order?.deliveryZone || 'Sivakasi'} smart delivery area</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end">
                    <div className="flex gap-2 items-center mb-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></span>
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">HD signal verified</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Updated live</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
