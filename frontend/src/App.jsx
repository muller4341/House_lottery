import  { BrowserRouter as Router,Route, Routes} from 'react-router-dom'
import Signin from './pages/Signin'
import Dashboard from './pages/Dashboard'
import AssignmentPage from './pages/AssignmentPage'
import AddUserPage from './pages/AddUserPage'
import AssignmentViewPage from './pages/AssignmentViewPage'
import ProtectedRoute from './components/ProtectedRoute'
import BranchManagementPage from './pages/BranchManagementPage'

function App() {
  

  return (
    
<Router>
 
  {/* <Navbar/> */}
<Routes>
<Route path="/"element={<Signin/>} />
<Route path="/signin" element={<Signin/>}/>
<Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
<Route path='/daily-assignment' element={<AssignmentPage/>}/>
<Route path='/add-user' element={<AddUserPage/>}/>
<Route path='/assignment-view' element={<AssignmentViewPage/>}/>
<Route path='/branch-management' element={<BranchManagementPage/>}/>
    
  </Routes> 
  
 
  







    </Router>      
  )
}

export default App
