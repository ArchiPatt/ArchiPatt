import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Providers } from './Providers'
import { Layout } from './ui/components/Layout/Layout'
import { Home } from './ui/pages/Home/Home'
import { Tariffs } from './ui/pages/Tariffs/Tariffs'
import { Users } from './ui/pages/Users/Users'
import { AccountDetails } from './ui/pages/AccountDetails/AccountDetails'
import { CreditDetails } from './ui/pages/CreditDetails/CreditDetails'
import { ErrorBoundary } from 'react-error-boundary'
import { RumRouteTracker } from './monitoring/RumRouteTracker'
import { sendRumReactError } from './monitoring/rum'

function App() {
   return (
      <ErrorBoundary
         onError={(error) => {
            sendRumReactError(error as Error)
         }}
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
               <RumRouteTracker />
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
