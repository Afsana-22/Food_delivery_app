import { Request, Response } from 'express';
import { User } from '../db';

export const getUnapprovedUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({ 
            role: { $in: ['vendor', 'driver'] },
            isApproved: false 
        }).select('-password');
        
        res.json({ status: 'success', data: users });
    } catch (error) {
        console.error('Get Unapproved Users Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const approveUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { isApproved: true }, { new: true });
        
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        
        res.json({ status: 'success', message: 'User approved successfully', data: user });
    } catch (error) {
        console.error('Approve User Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

        const { name, phone, image } = req.body;
        const user = await User.findByIdAndUpdate(userId, { name, phone, image }, { new: true }).select('-password');
        
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

        res.json({ status: 'success', message: 'Profile updated successfully', data: user });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update profile' });
    }
};
