import  { BrowserRouter as Router,Route, Routes} from 'react-router-dom'
import Signin from './pages/Signin'
import Dashboard from './pages/Dashboard'

function App() {
  

  return (
    
<Router>
 
  {/* <Navbar/> */}
<Routes>
<Route path="/"element={<Signin/>} />
<Route path="/signin" element={<Signin/>}/>
<Route path="/dashboard" element={<Dashboard/>}/>
    
  </Routes> 
  
 
  







    </Router>      
  )
}

export default App
