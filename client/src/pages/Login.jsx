import React from "react";
import { assets } from "../assets/assets";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {

  const navigate = useNavigate();
  
  const {backendUrl, setIsLoggedin, getUserData} = useContext(AppContext)
  
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  
  const onSubmitHandler = async(e) => {
    try{
      e.preventDefault();
      
      axios.defaults.withCredentials = true;

      const POWER_BI_LINK = "https://app.powerbi.com/reportEmbed?reportId=ecfe448a-f4a8-43e0-88d6-a804091bdfca&autoAuth=true&ctid=aa74b0a8-dc31-4e56-b78a-68531b73a97b"

      // Determine the API endpoint based on state
    const endpoint = state === "Sign Up" ? '/api/auth/register' : '/api/auth/login';
    const payload = state === "Sign Up" ? {name, email, password} : {email, password};
    const {data} = await axios.post(backendUrl + endpoint, payload);

    
    if(data.success){
          setIsLoggedin(true)
          getUserData()
          toast.success("Login successful! Redirecting to Power BI...");
          setTimeout(() => {
        window.location.href = POWER_BI_LINK;
      }, 500);
        }else{
          toast.error(data.message)
        }
      }catch (error){
      toast.error(error.response?.data?.message || "An unexpected error occurred.")
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0">
      <img
        onClick={() => navigate("/")}
        src={assets.pralaya_netra}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        style={{height : '66px', width : '105px', marginLeft : '-69px', marginTop : '-19px'}}
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "Sign Up" ? "Create account" : "Login"}
        </h2>
        <p className="text-center text-sm mb-6">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account!"}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="" />
              <input
                onChange={(e) => setName(e.target.value)} 
                value={name}
                type="text"
                placeholder="Full Name"
                required
                className="bg-transparent text-white focus:outline-none"
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" />
            <input
              onChange={(e) => setEmail(e.target.value)} 
              value={email}
              type="email"
              placeholder="Email id"
              required
              className="bg-transparent text-white focus:outline-none"
            />
          </div>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" />
            <input
              onChange={(e) => setPassword(e.target.value)} 
              value={password}
              type="password"
              placeholder="Password"
              required
              className="bg-transparent text-white focus:outline-none"
            />
          </div>

          <p onClick={()=>navigate('/reset-password')}className="mb-4 text-indigo-500 cursor-pointer">Forgot Password?</p>

          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">
            {state}
          </button>
        </form>

        {state === "Sign Up" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Already have an account?{" "}
            <span onClick={()=> setState('Login')} className="text-blue-400 cursor-pointer underline">
              Login here
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            Don't have an account?{" "}
            <span onClick={()=> setState('Sign Up')} className="text-blue-400 cursor-pointer underline">
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
