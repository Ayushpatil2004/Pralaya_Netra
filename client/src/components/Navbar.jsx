import React, { useContext } from 'react'
import {assets} from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Navbar = () => {
  
  const navigate = useNavigate()
  const {userData, backendUrl, setUserData, setIsLoggedin} = useContext(AppContext)

  const sendVerificationOtp = async () => {
    try{
      // axios.defaults.withCredentials = true;
      const {data} = await axios.post(backendUrl + '/api/auth/send-verify-otp')
      
      if(data.success){
        navigate('/email-verify')
        toast.success(data.message)
      }else{
        toast.error(data.message)
      }
    } catch (error){
      toast.error(error.message)  
    }
  }

  const logout = async () =>{
    try{
      // axios.defaults.withCredentials = true;
      const {data} = await axios.post(backendUrl + '/api/auth/logout')
      data.success && setIsLoggedin(false)
      data.success && setUserData(false)
      if(data.success){
        localStorage.removeItem('token');
      }
      navigate('/')
    } catch (error){
      toast.error(error.message)
    }
  }
    
  return (
    <div className='w-full flex justify-between items-center p-4 sm:px-10 lg:px-24 absolute top-0'>
      <img src={assets.pralaya_netra} alt="Pralaya Netra" className='w-28 sm:w-32 object-contain cursor-pointer' onClick={() => navigate("/")} />
      {userData ? 
      <div className='w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group hover:cursor-pointer'>
        {userData.name[0].toUpperCase()}
        <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black pt-10'>
          <ul className='list-none m-0 p-0 bg-white shadow-lg rounded-md border border-gray-200 text-sm overflow-hidden min-w-[120px]'>
            {!userData.isAccountVerified &&
            <li onClick={sendVerificationOtp} className='py-2 px-4 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer border-b border-gray-100'>Verify Email</li>
            }
            {userData.role === 'admin' &&
            <li onClick={() => navigate('/admin')} className='py-2 px-4 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer border-b border-gray-100 font-semibold'>Admin Panel</li>
            }
            <li onClick={logout} className='py-2 px-4 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer'>Logout</li>
          </ul>
        </div>
      </div>
    : <button onClick={()=>navigate('/login')}
      className='flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-white hover:bg-gray-700 transition-all hover:cursor-pointer'>Login <img src={assets.arrow_icon} alt=""/></button>
    }
      
    </div>
  )
}

export default Navbar