import express from 'express';
import multer from 'multer';
import path from 'path';
import verifyUser from '../utils/verifyUser.js';
import { createMemo, getMemos, deleteMemo, updateMemo, downloadMemo } from '../controllers/memoController.js';

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/memos');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Role-based middleware
const checkAuthorized = (req, res, next) => {
    const { role } = req.user;
    if (role === 'TEAM_LEADER' || role === 'CENTRAL_KYC_MANAGER') {
        next();
    } else {
        res.status(403).json({ error: 'Unauthorized: Only Team Leaders and KYC Managers can perform this action' });
    }
};

router.post('/', verifyUser, checkAuthorized, upload.single('memo'), createMemo);
router.get('/', verifyUser, getMemos);
router.get('/:id/download', verifyUser, downloadMemo);
router.put('/:id', verifyUser, checkAuthorized, updateMemo);
router.delete('/:id', verifyUser, checkAuthorized, deleteMemo);

export default router;
