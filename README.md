# Food_delivery_app
A full-stack food delivery web app with role-based dashboards for customers, vendors, drivers, and admins — featuring real-time order tracking, AI food recommendations, coupon system, and payments.
# 🚀 Zaptaste — Regional Food Delivery Platform

Zaptaste is a full-stack food delivery web application built for regional markets 
(Sivakasi, Virudhunagar, Madurai). It supports four user roles with dedicated 
dashboards, real-time order tracking via WebSockets, AI-powered food recommendations, 
and an integrated payment system.

## ✨ Features

### 👥 Multi-Role System
- **Customer** — Browse restaurants, add to cart, place & track orders, view history
- **Vendor** — Manage menu items, accept/reject orders via "My Kitchen" dashboard
- **Driver** — View assigned deliveries via "Delivery Radar" dashboard
- **Admin** — Full platform control via "Command Center" dashboard

### 🛒 Core Functionality
- Restaurant browsing with search and filters (Pure Veg, 4.5+ Rating, Express)
- Cart management with coupon codes and eco-friendly options
- Live order tracking with real-time status updates (Socket.io)
- Order history and user profile management
- Zaptaste Pro membership (free delivery, exclusive offers)

### 🤖 Smart Features
- AI food recommendations powered by Google Generative AI
- Live delivery heatmap
- NLP-style search ("Order dosa from nearest hotel")
- Festival offers and local legends sections

### 💳 Payments & Auth
- Razorpay payment integration
- JWT-based authentication with bcrypt password hashing
- Dark / Light mode toggle
- i18n internationalization support

## 🛠️ Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React, React Router v7, TailwindCSS, Framer Motion, Lucide React |
| Backend   | Node.js, Express v5, TypeScript         |
| Database  | MySQL (via mysql2), MongoDB (Mongoose)  |
| Realtime  | Socket.io                               |
| AI        | Google Generative AI (`@google/generative-ai`) |
| Payments  | Razorpay                                |
| Auth      | JWT, bcrypt                             |
| Build     | Webpack, Babel, ts-node, nodemon        |

## 🚀 Quick Start

```bash
# Install all dependencies
npm run install-all

# Start both frontend & backend concurrently
npm run dev
