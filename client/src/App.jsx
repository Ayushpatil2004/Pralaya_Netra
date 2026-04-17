import React, { Suspense, lazy } from 'react';
import './index.css';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load pages to reduce initial bundle size
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const EmailVerify = lazy(() => import('./pages/EmailVerify'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Loading text fallback for Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen text-white bg-slate-900">
    Fetching Page...
  </div>
);

const App = () => {
  return (
    <div className='main-content-container'>
      <ToastContainer position="top-right" autoClose={3000} />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/email-verify' element={<EmailVerify/>}/>
          <Route path='/reset-password' element={<ResetPassword/>}/>
          <Route path='/admin' element={<AdminDashboard/>}/>
        </Routes>
      </Suspense>
    </div>
  )
}

export default App;