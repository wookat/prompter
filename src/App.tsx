import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '@/pages/Home'
import UseCase from '@/pages/UseCase'
import { USE_CASES } from '@/lib/useCases'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {USE_CASES.map((u) => (
          <Route key={u.slug} path={u.path} element={<UseCase />} />
        ))}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
