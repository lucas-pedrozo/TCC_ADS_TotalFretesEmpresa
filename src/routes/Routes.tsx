import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'

const HomePage = lazy(() => import('@/pages/Home'))
const LoginPage = lazy(() => import('@/pages/Login'))
const StartPage = lazy(() => import('@/pages/Start'))


export const Router = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Carregando...</div>}>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<StartPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}