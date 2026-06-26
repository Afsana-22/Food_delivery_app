import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Restaurant, Coupon } from '../db';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_12345';

export const signup = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password, role, restaurant, coupons } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'An account with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Customers are auto-approved; vendors/drivers wait for admin
        const isApproved = !role || role === 'customer';

        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role: role || 'customer',
            isApproved,
        });

        await newUser.save();

        // ── vendor: create restaurant + menu + coupons ──
        if (role === 'vendor' && restaurant) {
            const newRestaurant = new Restaurant({
                name:       restaurant.name,
                city:       restaurant.city,
                address:    restaurant.address,
                cuisine:    Array.isArray(restaurant.cuisine) ? restaurant.cuisine : [restaurant.cuisine],
                image:      restaurant.image || '',
                menu:       (restaurant.menu || []).map((item: any) => ({
                    name:        item.name,
                    price:       Number(item.price) || 0,
                    description: item.description || '',
                    image:       item.image || '',
                    veg:         Boolean(item.veg ?? true),
                    isAvailable: Boolean(item.isAvailable ?? true),
                    category:    item.category || 'lunch',
                })),
                ownerId:   newUser._id,
                isApproved: false,
            });
            await newRestaurant.save();

            // Create coupons if any
            if (Array.isArray(coupons) && coupons.length > 0) {
                const couponDocs = coupons
                    .filter((c: any) => c.code)
                    .map((c: any) => ({
                        code:            c.code.toUpperCase(),
                        discountPercent: Number(c.discountPercent) || 0,
                        flatDiscount:    Number(c.flatDiscount)    || 0,
                        minOrderAmount:  Number(c.minOrderAmount)  || 0,
                        festivalName:    c.festivalName || '',
                        city:            restaurant.city || '',
                        isActive:        true,
                    }));

                if (couponDocs.length > 0) {
                    await Coupon.insertMany(couponDocs, { ordered: false }).catch(() => {
                        // Ignore duplicate code errors silently
                    });
                }
            }
        }

        const message =
            role === 'vendor' ? 'Restaurant submitted for approval! Login after admin approves you.' :
            role === 'driver' ? 'Driver account created! Login after admin approves you.' :
            'Account created successfully! You can sign in now.';

        res.status(201).json({
            status: 'success',
            message,
            user: {
                _id:        newUser._id,
                name:       newUser.name,
                email:      newUser.email,
                role:       newUser.role,
                isApproved: newUser.isApproved,
            },
        });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error during signup.' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: 'error', message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: 'error', message: 'No account found with this email.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: 'error', message: 'Incorrect password. Please try again.' });
        }

        // Force admin privileges for the main admin account
        if (user.email === 'zaptaste@gmail.com') {
            user.role = 'admin';
            user.isApproved = true;
        }

        if (!user.isApproved) {
            return res.status(403).json({ status: 'error', message: 'Your account is pending admin approval. Please wait.' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' as any }
        );

        res.json({
            status: 'success',
            token,
            user: {
                _id:   user._id,
                id:    user._id,
                name:  user.name,
                email: user.email,
                phone: user.phone,
                role:  user.role,
                isPro: user.isPro,
            },
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error during login.' });
    }
};
