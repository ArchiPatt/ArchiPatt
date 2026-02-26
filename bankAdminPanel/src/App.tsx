import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Providers } from './components/Providers/Providers'
import { Layout } from './components/Layout/Layout'
import { Home } from './pages/Home/Home'
import { Tariffs } from './pages/Tariffs/Tariffs'
import { Users } from './pages/Users/Users'

function App() {
   return (
      <Providers>
         <BrowserRouter>
            <Routes>
               <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/tariffs" element={<Tariffs />} />
                  <Route path="/users" element={<Users />} />
               </Route>
            </Routes>
         </BrowserRouter>
      </Providers>
   )
}

export default App
