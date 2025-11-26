import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='background bg-green-100 rounded-full p-10'>

      <h1 className="text-3xl font-bold underline text-fuchsia-900 ">
        Hello friends!
      </h1>
      <h1 className="text-3xl font-bold underline text-green-900">
        This is the bloom app
      </h1>
    </div>
    
  )
}

export default App
