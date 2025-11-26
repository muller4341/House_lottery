import express from 'express'
import {  updateUser ,deleteUser, signOut, getUser, getCustomers, getEmployees} from '../controllers/userController.js'
import verifyUser from '../utils/verifyUser.js'
const router = express.Router()


 router.put('/update/:userId',verifyUser,updateUser)  
 router.delete('/delete/:userId',verifyUser, deleteUser)
 router.post('/signout',  signOut)
 //router.get('/getusers',verifyUser, getUsers);
 router.get('/getemployees',verifyUser, getEmployees)
 router.get('/getcustomers',verifyUser, getCustomers)
 router.get('/:userId', getUser);
export default router