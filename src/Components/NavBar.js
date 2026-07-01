import React, {useEffect} from 'react';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

const NavBar = () => {

    const navigate = useNavigate();

    const login = false;
    const [name, setName] = useState(null);
    const [role, setRole] = useState(null);
    const [dropdown, setDropdown] = useState(false);


    useEffect(() => {
        setName(localStorage.getItem('name'));
        setRole(localStorage.getItem('role'));
    }, []);

return (
<div className='fixed top-0 left-0 z-50 flex flex-row items-center justify-between w-screen gap-20 align-middle border-b-2 bg-cyan-900 bg-opacity-[80%]'>
    <div className='px-5 py-2'>
        <img
            src=''
            alt="Logo"
        />
    </div>
    <div className='flex flex-row gap-10 '>
        <span className='font-bold cursor-pointer hover:text-[#986960] hover:text-lg hover:font-extrabold' onClick={() => navigate('/orders')}>Orders</span>

    </div>
    <div className='flex flex-row gap-10 p-2 px-5 '>
        <div>
            {
                login
                ?
                <div>

                </div>

                :
                <div className='flex flex-row items-center gap-5 px-5 py-1 w-[300px] justify-between'>
                    <div className='flex flex-col justify-between py-1 h-[50px]'>
                        <span className='font-bold text-md'>{name?name:""}</span>
                        <span className='text-xs font-bold text-white'>{role?role:''}</span>
                    </div>
                    <div className="flex flex-col">
                        {dropdown && <div id='dropdown' className="absolute flex flex-col gap-2 mt-10 bg-white shadow-lg right-10 w-60">
                            <div className="flex flex-row items-center gap-2 p-2">
                                <div className='flex flex-col justify-between py-1'>
                                    <span className='font-bold text-md'>{name ? name : "GolBaazar Admin"}</span>
                                </div>
                            </div>
                            <div className="border-b-2 border-gray-300"></div>
                            <div className={`flex flex-col gap-2 p-2
                                ${localStorage.getItem("token")===null?'block':'hidden'}
                            `}>
                                <span onClick={()=>{
                                    localStorage.clear();
                                    window.location.href = '/login'
                                }} className='font-bold cursor-pointer text-md logout-btn'>Login</span>
                            </div>
                            <div className={`flex flex-col gap-2 p-2
                                ${localStorage.getItem("token")===null?'hidden':'block'}
                            `}>                                <span onClick={()=>{
                                    localStorage.clear();
                                    window.location.href = '/login'
                                }} className='font-bold cursor-pointer text-md logout-btn'>Logout</span>
                            </div>
                        </div>}
                    </div>
                </div>
            }
        </div>
    </div>
</div>
);
}

export default NavBar;
