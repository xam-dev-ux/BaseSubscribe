import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Creator } from './pages/Creator'
import { Subscriber } from './pages/Subscriber'
import { PlanDetails } from './pages/PlanDetails'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="creator" element={<Creator />} />
          <Route path="subscriptions" element={<Subscriber />} />
          <Route path="plan/:planId" element={<PlanDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
