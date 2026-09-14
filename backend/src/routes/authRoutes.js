import { Router } from 'express';
import { login, register, refresh, logout, me, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { body } from 'express-validator';
import { handleValidation } from '../middleware/validation.js';

const router = Router();
const mobile = (field) => body(field).matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10 digit Indian mobile number.');
const password = body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.');
router.post('/register', [body('name').trim().notEmpty().withMessage('Full name is required.'), mobile('mobileNumber'), mobile('partnerMobileNumber'), password, body('partnerName').trim().notEmpty().withMessage('Partner name is required.'), body('relationshipName').trim().notEmpty().withMessage('Relationship name is required.'), handleValidation], asyncHandler(register));
router.post('/login', [mobile('mobileNumber'), body('password').notEmpty().withMessage('Password is required.'), handleValidation], asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', protect, asyncHandler(logout));
router.get('/me', protect, me);
router.post('/change-password', protect, [body('currentPassword').notEmpty().withMessage('Temporary password is required.'), body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'), body('confirmPassword').notEmpty().withMessage('Confirm your new password.'), handleValidation], asyncHandler(changePassword));
export default router;
