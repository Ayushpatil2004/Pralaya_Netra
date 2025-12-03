import React, { useContext } from 'react'
import {assets} from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import api from '../api'

const Navbar = () => {
  
  const navigate = useNavigate()
  const {userData, backendUrl, setUserData, setIsLoggedin} = useContext(AppContext)

  const sendVerificationOtp = async () => {
    try{
      const {data} = await api.post('/api/auth/send-verify-otp')

      if(data.success){
        navigate('/email-verify')
        toast.success(data.message)
      }else{
        toast.error(data.message)
      }
    } catch (error){
      toast.error(error.response?.data?.message || error.message)
    }
  }

   const logout = async () =>{
    try{
      const {data} = await api.post('/api/auth/logout')
      if(data.success){
        setIsLoggedin(false)
        setUserData(false)
        navigate('/')
      }
    } catch (error){
      toast.error(error.response?.data?.message || error.message)
    }
  }
    
  return (
    <div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0'>
      <img src={assets.pralaya_netra} alt="" className='w-28 sm:w-32' style={{height: '66px', width: '105px', marginLeft: '-85px', marginTop: '-23px'}}/>
      {userData ? 
      <div className='w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group'>
        {userData.name[0].toUpperCase()}
        <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10'>
          <ul className='list-none m-0 p-2 bg-gray-100 text-sm'>
            {!userData.isAccountVerified &&
            <li onClick={sendVerificationOtp} className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>Verify Email</li>
            }
            <li onClick={logout} className='py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10'>Logout</li>
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