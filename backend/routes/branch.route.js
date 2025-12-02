// routes/users.route.js
import express from 'express';
import { getBranches, createBranch, updateBranch, deleteBranch, getBranchById ,bulkCreateBranches} from '../controllers/branchController.js';

const router = express.Router();


router.get('/', getBranches);
router.post('/', createBranch);
router.put('/:id', updateBranch);
router.delete('/:id', deleteBranch);
router.get('/:id', getBranchById);  // New (for view/edit prefill)
router.post('/bulk', bulkCreateBranches);

export default router;