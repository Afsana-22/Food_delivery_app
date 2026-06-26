import path from 'path';
import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
dotenv.config();
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes';
import restaurantRoutes from './routes/restaurantRoutes';
import orderRoutes from './routes/orderRoutes';
import couponRoutes from './routes/couponRoutes';
import userRoutes from './routes/userRoutes';
import { connectDB } from './db';
import { updateTrafficScore, getHeatmapData } from './controllers/restaurantController';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH']
    }
});

const port = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('joinOrder', (orderId) => {
        socket.join(orderId);
        console.log(`User joined order room: ${orderId}`);
    });

    socket.on('updateDriverLocation', async (data) => {
        const { orderId, lat, lng, city, driverId } = data;
        io.to(orderId).emit('driverLocationUpdate', { lat, lng });

        // Update Traffic Pulse
        if (city && driverId) {
            updateTrafficScore(city, driverId, lat, lng);
            const heatmap = await getHeatmapData();
            io.emit('heatmapUpdate', heatmap);
        }
    });

    socket.on('sendOrderMessage', (data) => {
        const { orderId, message } = data;
        io.to(orderId).emit('orderMessage', { orderId, message });
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

export { io };

app.use(express.static(path.join(__dirname, '../../frontend/dist')));

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/users', userRoutes);

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
