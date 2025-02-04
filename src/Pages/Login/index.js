import {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';

import MobileIcon from '../../resources/MobileIcon.png';
import lockIcon from '../../resources/EOS_LOCK_OPEN_OUTLINED.png';
import eyeIcon from '../../resources/eye_icon.png'
import axios from "axios";
import { toast } from "react-toastify";

export default function Login () {

    const [userName,setUsername] = useState('');
    const [password,setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('userName', userName);
        formData.append('password', password);

        try {
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/admin/login`, {
                params: {
                    userName: userName,
                    password: password,
                }
            });
            localStorage.setItem('ciseauxtoken', res.data.token);
            toast.success('You are logged in');
            navigate('/home')
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong');
        }
    };

    useEffect(() => {
        localStorage.clear();
    },[]) 
    
    
  return (
    <div>
        <div className="flex items-center justify-center w-full h-screen gap-32 p-24 py-0 align-middle bg-gray-100">
            <div className="flex flex-wrap items-center justify-center w-full h-screen gap-10 align-middle bg-gray-100">
                <form className="flex flex-col w-4/12 gap-3 p-10 bg-white border-2 rounded-2xl max-w-8/12 h-fit border-[#FAB005]">
                    <h className="self-center text-2xl font-bold">Login</h>
                    <label className="flex gap-3"><img src={MobileIcon} className="w-5 h-5"/>Username</label>
                    <input value={userName} onChange={e=>setUsername(e.target.value)} type="text" className="w-full p-1 border-2 border-[#FAB005] rounded-lg"></input>
                    <label  className="flex gap-3"><img src={lockIcon} className="w-5 h-5"/>Password</label>
                    <div className="relative">
                        <input value={password} onChange={e=>setPassword(e.target.value)} type={isPasswordVisible ? 'text' : 'password'} className="w-full p-1 border-2 border-[#FAB005] rounded-lg"></input>
                        <img src={eyeIcon} onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute w-5 h-5 transform -translate-y-1/2 cursor-pointer right-3 top-1/2"/>
                    </div>
                    
                    <button type="button" onClick={handleSubmit} className="w-full p-3 mt-10 font-bold text-center text-white transition-all duration-300 bg-[#FAB005] bg-opacity-75 rounded-lg hover:bg-opacity-100">Login</button>
                    {/*<Link href="/signup" className="w-full p-3 font-bold text-center text-white transition-all duration-300 bg-gray-400 rounded-lg hover:bg-gray-500">Krijo një Llogari</Link>*/}
                </form>
                
            </div>
        </div>
    </div>
   )
}

