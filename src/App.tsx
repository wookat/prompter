import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '@/pages/Home'
import { USE_CASE_LINKS } from '@/lib/useCaseLinks'

// Route-level chunk: use-case page copy only downloads when one is visited
const UseCase = lazy(() => import('@/pages/UseCase'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {USE_CASE_LINKS.map((u) => (
          <Route
            key={u.slug}
            path={u.path}
            element={
              <Suspense fallback={null}>
                <UseCase />
              </Suspense>
            }
          />
        ))}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
