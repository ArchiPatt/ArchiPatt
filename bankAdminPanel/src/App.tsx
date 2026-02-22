import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Providers } from './components/Providers/Providers'
import { Layout } from './components/Layout/Layout'
import { Home } from './pages/Home/Home'

function App() {
   return (
      <Providers>
         <BrowserRouter>
            <Routes>
               <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/tariffs" element={<div>Тарифы</div>} />
                  <Route path="/users" element={<div>Пользователи</div>} />
               </Route>
            </Routes>
         </BrowserRouter>
      </Providers>
   )
}

export default App
