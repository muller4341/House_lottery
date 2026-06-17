const express = require('express');
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Multer configuration for Excel uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed!'), false);
    }
  }
});

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Houses
router.get('/houses', adminController.getHouses);
router.post('/upload-houses', upload.single('file'), adminController.uploadHouses);

// Applicants
router.get('/applicants', adminController.getApplicants);
router.post('/upload-applicants', upload.single('file'), adminController.uploadApplicants);

// Lottery
router.post('/run-lottery', adminController.runLottery);
router.get('/results/:runId', adminController.getLotteryResults);
router.get('/lottery-history', adminController.getLotteryHistory);
router.get('/results/download/:runId', adminController.downloadResultsExcel);

module.exports = router;