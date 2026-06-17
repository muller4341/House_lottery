import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from '../middleware/auth.js';
import {
  getDashboardStats,
  getHouses,
  uploadHouses,
  getApplicants,
  uploadApplicants,
  runLottery,
  getLotteryResults,
  getLotteryHistory,
  downloadResultsExcel,
} from '../controllers/adminController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// All admin routes require JWT auth
router.use(verifyToken);

// Multer — Excel only, stored in uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed.'), false);
    }
  },
});

// Dashboard
router.get('/dashboard', getDashboardStats);

// Houses
router.get('/houses', getHouses);
router.post('/upload-houses', upload.single('file'), uploadHouses);

// Applicants
router.get('/applicants', getApplicants);
router.post('/upload-applicants', upload.single('file'), uploadApplicants);

// Lottery — NOTE: download must come before :runId to avoid route conflict
router.post('/run-lottery', runLottery);
router.get('/lottery-history', getLotteryHistory);
router.get('/results/download/:runId', downloadResultsExcel);
router.get('/results/:runId', getLotteryResults);

export default router;