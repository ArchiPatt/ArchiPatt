import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Providers } from './ui/components/Providers/Providers'
import { Layout } from './ui/components/Layout/Layout'
import { Home } from './ui/pages/Home/Home'
import { Tariffs } from './ui/pages/Tariffs/Tariffs'
import { Users } from './ui/pages/Users/Users'
import { AccountDetails } from './ui/pages/AccountDetails/AccountDetails'
import { CreditDetails } from './ui/pages/CreditDetails/CreditDetails'
import { ErrorBoundary } from 'react-error-boundary'

function App() {
   return (
      <ErrorBoundary
         fallbackRender={({ error }) => (
            <div
               style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
               }}
            >
               <h2>Something went wrong.</h2>
               <p>{`${error}`}</p>
            </div>
         )}
      >
         <Providers>
            <BrowserRouter>
               <Routes>
                  <Route element={<Layout />}>
                     <Route path="/" element={<Home />} />
                     <Route path="/tariffs" element={<Tariffs />} />
                     <Route path="/users" element={<Users />} />
                     <Route path="/accounts/:id" element={<AccountDetails />} />
                     <Route path="/credits/:id" element={<CreditDetails />} />
                  </Route>
               </Routes>
            </BrowserRouter>
         </Providers>
      </ErrorBoundary>
   )
}

export default App
