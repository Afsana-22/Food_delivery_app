import { Request, Response } from 'express';
import { Coupon } from '../db';

function inferFestival(now: Date) {
    const month = now.getMonth() + 1;
    if (month === 1) return { festivalName: 'Pongal', defaultCode: 'PONGALFREE' };
    if (month === 10 || month === 11) return { festivalName: 'Diwali', defaultCode: 'DIWALI20' };
    if (month === 12) return { festivalName: 'New Year', defaultCode: 'NEWYEAR25' };
    return { festivalName: 'Local Fest', defaultCode: 'LOCALTASTE10' };
}

function calculateDiscount(coupon: any, orderAmount: number) {
    if (coupon.discountPercent > 0) {
        return Math.round((orderAmount * coupon.discountPercent) / 100);
    }
    if (coupon.flatDiscount > 0) {
        return coupon.flatDiscount;
    }
    return 0;
}

export const validateCoupon = async (req: Request, res: Response) => {
    try {
        const { code, orderAmount, city } = req.body;

        if (!code || !orderAmount) {
            return res.status(400).json({ status: 'error', message: 'Coupon code and order amount are required' });
        }

        const coupon = await Coupon.findOne({ code: String(code).toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ status: 'error', message: 'Invalid or expired coupon code' });
        }

        if (coupon.expiryDate && new Date() > coupon.expiryDate) {
            return res.status(400).json({ status: 'error', message: 'Coupon has expired' });
        }

        if (coupon.city && city && coupon.city.toLowerCase() !== String(city).toLowerCase()) {
            return res.status(400).json({ status: 'error', message: `This offer is only valid in ${coupon.city}` });
        }

        if (Number(orderAmount) < coupon.minOrderAmount) {
            return res.status(400).json({ status: 'error', message: `Minimum order amount of Rs.${coupon.minOrderAmount} required` });
        }

        const discount = calculateDiscount(coupon, Number(orderAmount));

        res.json({
            status: 'success',
            isValid: true,
            discountAmount: discount,
            message: 'Coupon applied successfully!',
            coupon: {
                code: coupon.code,
                festivalName: coupon.festivalName,
                city: coupon.city
            }
        });
    } catch (error) {
        console.error('Coupon validation error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const getSmartCoupons = async (req: Request, res: Response) => {
    try {
        const city = String(req.query.city || 'Sivakasi');
        const now = new Date();
        const { festivalName, defaultCode } = inferFestival(now);
        const activeCoupons = await Coupon.find({ isActive: true, $or: [{ city }, { city: null }, { city: { $exists: false } }] }).sort({ autoApply: -1, expiryDate: 1 });

        const enriched = activeCoupons.map((coupon: any) => ({
            code: coupon.code,
            festivalName: coupon.festivalName || festivalName,
            city: coupon.city || city,
            autoApply: coupon.autoApply,
            discountLabel: coupon.discountPercent > 0 ? `${coupon.discountPercent}% OFF` : `Rs.${coupon.flatDiscount} OFF`,
            minOrderAmount: coupon.minOrderAmount
        }));

        res.json({
            status: 'success',
            data: enriched,
            suggested: enriched.find((coupon) => coupon.autoApply) || {
                code: defaultCode,
                festivalName,
                city,
                autoApply: true,
                discountLabel: 'Festival Deal'
            }
        });
    } catch (error) {
        console.error('Smart coupon error:', error);
        res.status(500).json({ status: 'error', message: 'Unable to fetch festival coupons' });
    }
};
