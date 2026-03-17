import React, {useContext} from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const { userData } = useContext(AppContext)

  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center mt-20 px-4 text-center text-gray-800">
      <img
        src={assets.header_img}
        alt=""
        className="w-36 h-36 rounded-full mb-6"
      />
      <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2 text-white">
        Hey {userData ? userData.name : 'Friend'}!
        <img className="w-8 aspect-square" src={assets.hand_wave} alt="" />
      </h1>
      <h2 className="text-3xl sm:text-5xl font-semibold mb-4 text-white">
        Welcome to Pralaya Netra
      </h2>
      <p className="mb-8 max-w-md text-white">Let's quickly see the analysis</p>
      <button onClick={()=>{
        if (userData && userData.isAccountVerified) {
          window.location.href = "https://app.powerbi.com/reportEmbed?reportId=a4e8a805-1b6a-4292-9ab9-d740a19a73cb&autoAuth=true&ctid=aa74b0a8-dc31-4e56-b78a-68531b73a97b";
        } else {
          navigate('/login')
        }
      }} className="border border-gray-500 text-white rounded-full px-8 py-2.5 hover:bg-gray-700 transition-all hover:cursor-pointer">
        Get Started
      </button>
    </div>
  );
};

export default Header;