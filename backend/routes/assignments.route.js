// routes/assignments.route.js
import express from 'express';
import { getAssignments, createAssignment, updateAssignment, deleteAssignment, bulkCreateAssignments, exportToCSV ,getMyAssignments} from '../controllers/assignmentController.js';
import multer from 'multer';  // For bulk file upload
import verifyUser from '../utils/verifyUser.js';
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();



router.get('/', getAssignments);
router.post('/', createAssignment);
router.put('/:id', updateAssignment);  // New
router.delete('/:id', deleteAssignment);  // New
router.post('/bulk', upload.single('file'), bulkCreateAssignments);  // New (multer for Excel)
router.get('/export', exportToCSV);  // Existing, but ensure ?format=excel for XLSX
router.get('/my-assignments', verifyUser, getMyAssignments);

export default router;