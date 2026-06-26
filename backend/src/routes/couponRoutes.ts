import { Router } from 'express';
import { validateCoupon, getSmartCoupons } from '../controllers/couponController';

const router = Router();

router.get('/smart', getSmartCoupons);
router.post('/validate', validateCoupon);

export default router;
