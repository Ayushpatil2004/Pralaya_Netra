import { createContext, useEffect, useState} from "react";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = (props) => {

    // Remove withCredentials since we are using headers now
    // axios.defaults.withCredentials = true;

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const[isLoggedin, setIsLoggedin] = useState(false);
    const[userData, setUserData] = useState(false);

    // Setup axios interceptor to always attach token if it exists
    useEffect(() => {
        const interceptor = axios.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`; // Use standard Authorization header
            }
            return config;
        });

        return () => {
            axios.interceptors.request.eject(interceptor);
        };
    }, []);

    const getAuthState = async () => {
        try{
            const {data} = await axios.get(backendUrl + '/api/auth/is-auth')
            if(data.success){
                setIsLoggedin(true)
                getUserData()
            }
        } catch (error){
            toast.error(error.message)
        }
    }

    const getUserData = async () => {
        try{
            const {data} = await axios.get(backendUrl + '/api/user/data') 
            data.success ? setUserData(data.userData) : toast.error(data.message)
        } catch (error){
            toast.error(error.message)
        }
    }

    useEffect(() => {
        getAuthState();
    }, [])

    const value = {
        backendUrl,
        isLoggedin, setIsLoggedin,
        userData, setUserData,
        getUserData
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}