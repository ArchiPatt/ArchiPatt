
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Providers } from './components/Providers/Providers'
import { Home } from './pages/Home/Home'

function App() {

  return (
    <Providers>
    <BrowserRouter>
       <Routes>
        <Route path="/" element={<Home />} />
       </Routes>
    </BrowserRouter>
 </Providers>
  )
}

export default App
