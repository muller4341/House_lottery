import  { BrowserRouter as Router,Route, Routes} from 'react-router-dom'
import Signin from './pages/Signin'
import Dashboard from './pages/Dashboard'
import AssignmentPage from './pages/AssignmentPage'
import AddUserPage from './pages/AddUserPage'
import AssignmentViewPage from './pages/AssignentViewPage'

function App() {
  

  return (
    
<Router>
 
  {/* <Navbar/> */}
<Routes>
<Route path="/"element={<Signin/>} />
<Route path="/signin" element={<Signin/>}/>
<Route path="/dashboard" element={<Dashboard/>}/>
<Route path='/daily-assignment' element={<AssignmentPage/>}/>
<Route path='/add-user' element={<AddUserPage/>}/>
<Route path='/assignment-view' element={<AssignmentViewPage/>}/>
    
  </Routes> 
  
 
  







    </Router>      
  )
}

export default App
