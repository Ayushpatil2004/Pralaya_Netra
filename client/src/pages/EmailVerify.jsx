import React from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'  
import { useContext } from 'react'
import { useEffect } from 'react'
import { useState } from 'react' 
import { assets } from '../assets/assets'

function EmailVerify() {
  
  axios.defaults.withCredentials = true;
  const {backendUrl, isLoggedin, userData, getUserData} = useContext(AppContext)
  const navigate = useNavigate()
  const inputRefs = React.useRef([])
  
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  const POWER_BI_LINK = "https://app.powerbi.com/reportEmbed?reportId=ecfe448a-f4a8-43e0-88d6-a804091bdfca&autoAuth=true&ctid=aa74b0a8-dc31-4e56-b78a-68531b73a97b"


  const handleInput = (e, index) => {
    if(e.target.value.length > 0 && index < inputRefs.current.length -1){
      inputRefs.current[index + 1].focus();
    }
  }

  const handleKeyDown = (e, index) => {
    if(e.key === 'Backspace' && e.target.value === '' && index > 0){
      inputRefs.current[index - 1].focus();
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('');
    pasteArray.forEach((char, index) => {
      if(inputRefs.current[index]){
        inputRefs.current[index].value = char;
      }
    })
  }

  const onSubmitHandler = async (e) => {
    try{
      e.preventDefault();
      
      // 🆕 NEW GUARD: Prevent form submission if not logged in
      if (!isLoggedin) {
        toast.error("Please log in to verify your account.");
        navigate('/login');
        return;
      }

      const otpArray = inputRefs.current.map(e => e.value);
      const otp = otpArray.join('')

      const {data} = await axios.post(backendUrl + '/api/auth/verify-account', {otp})
      if(data.success){
        toast.success(data.message)
        getUserData()
        
        setVerificationSuccess(true); 
        
        // Direct Redirection 1: Successful verification attempt 
        setTimeout(() => {
            window.location.href = POWER_BI_LINK; 
        }, 700);
        
      }else{
        toast.error(data.message)
      }
    } catch (error){
      toast.error(error.response?.data?.message || "An unexpected error occurred.") 
    }
  }

  // Effect to handle access control and already-verified users
  useEffect(() => {
    // 🛑 CRITICAL CHECK 1: If user is NOT logged in, redirect to login page
    if (!isLoggedin) {
        toast.warn("Access denied. Please log in.");
        navigate('/login');
        return;
    }
    
    // CRITICAL CHECK 2: If user IS logged in AND verified, redirect to Power BI
    if (!verificationSuccess && isLoggedin && userData && userData.isAccountVerified) {
       toast.success("Account already verified! Redirecting to Power BI...");
       // Direct Redirection 2: Already verified user visiting this page
       setTimeout(() => {
           window.location.href = POWER_BI_LINK; 
       }, 700);
    }
    
    // NOTE: If logged in but unverified, the component renders the form normally.
    
  },[isLoggedin, userData, navigate, verificationSuccess]) 

  return (
    <div className="flex items-center justify-center min-h-screen">
       <img
        onClick={() => navigate("/")}
        src={assets.pralaya_netra}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        style={{height : '66px', width : '105px', marginLeft : '-69px', marginTop : '-19px'}}
      />
      <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
         <h1 className='text-white text-2xl font-semibold text-center mb-4'>Email Verify OTP</h1>
         <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email id.</p>
         <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index)=>(
            <input type="text" maxLength='1' key={index} required
            className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
            ref={e => inputRefs.current[index] = e}
            onInput={(e) => handleInput(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
         </div>
         <button className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>Verify Email</button>
      </form>
    </div>
  )
}

export default EmailVerify