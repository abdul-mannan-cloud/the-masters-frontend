import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useEffect} from 'react';
import axios from 'axios';

import Back from '../../resources/Icons/back.png'
import {toast} from 'react-toastify';

const Employee = ({types}) => {

    const [employeeData, setEmployeeData] = useState({
        name: '',
        cnic: '',
        phone: '',
        password: '',
        role: '',
    });

    const navigate = useNavigate();
    useEffect(() => {
        if (localStorage.getItem('ciseauxtoken') === null) {
            navigate('/login')
        }
    }, []);

    const formatCNIC = (event) => {
        let value = event.target.value.replace(/\D/g, "");  // Remove non-numeric characters

        if (value.length > 5) value = `${value.slice(0, 5)}-${value.slice(5)}`;
        if (value.length > 13) value = `${value.slice(0, 13)}-${value.slice(13, 14)}`;

        event.target.value = value;
    };

    const formatPhoneNumber = (event) => {
        let value = event.target.value.replace(/\D/g, "");  // Remove non-numeric characters

        // Format as "03XX-XXXXXXX"
        if (value.length > 4) value = `${value.slice(0, 4)}-${value.slice(4)}`;
        if (value.length > 11) value = value.slice(0, 12); // Restrict length to 11 digits + 1 dash

        event.target.value = value;
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setEmployeeData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };


    const handleAddEmployee = async () => {
        try {

            if (employeeData.cnic.length !== 15) {
                toast.error('CNIC must be 15 characters long');
                return
            }

            if (employeeData.phone.length !== 12) {
                toast.error('Phone number must be 12 characters long');
                return
            }

            console.log("Adding an employee...");
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/employee/addemployee`, employeeData);
            console.log('Employee added successfully:', response.data);
            navigate('/employees');
        } catch (error) {
            console.error('Error adding employee:', error.message);
        }
    };

    return (
        <div className='flex h-screen pl-16 pr-1 bg-gray-100 sm:pl-0 sm:pr-0'>
            <div className='flex flex-col w-full ml-20 overflow-auto'>
                <div
                    className={`mt-20 sm:w-[50%] sm:self-center sm:mx-auto items-start justify-start flex flex-row gap-5`}>
                    <img onClick={() => navigate('/employees')} src={Back}
                         className='w-10 h-10 cursor-pointer hover:scale-105'/>
                    <h className='text-3xl font-bold'>ADD EMPLOYEE</h>
                </div>
                <div
                    className="flex flex-col items-center self-center justify-center w-full py-5 mt-10 align-middle bg-white sm:w-1/2 rounded-xl sm:py-10 sm:px-20">
                    <span className='text-xl font-bold'>Employee Details</span>
                    <div className='self-center w-full p-10 bg-white rounded-xl'>
                        <div className='flex flex-col w-full gap-5 font-bold'>
                            <div className='flex flex-col w-full gap-2'>
                                <label>Name</label>
                                <input type='text' required
                                       className='w-full px-3 py-2 border border-gray-400 rounded-lg shadow-lg'
                                       name='name' id='name' onChange={handleInputChange}></input>
                            </div>
                            <div className='flex flex-col w-full gap-2'>
                                <label>CNIC</label>
                                <input onInput={formatCNIC} maxLength={15} required
                                       className='w-full px-3 py-2 border border-gray-400 rounded-lg shadow-lg '
                                       name='cnic' id='cnic' placeholder="#####-#######-#"
                                       onChange={handleInputChange}></input>
                            </div>
                            <div className='flex flex-col w-full gap-2'>
                                <label>Phone</label>
                                <input maxLength={12} placeholder="03XX-XXXXXXX" onInput={formatPhoneNumber} required
                                       className='w-full px-3 py-2 border border-gray-400 rounded-lg shadow-lg'
                                       name='phone' id='phone' onChange={handleInputChange}></input>
                            </div>
                            <div className='flex flex-col w-full gap-2'>
                                <label>Password</label>
                                <input type='text' required
                                       className='w-full px-3 py-2 border border-gray-400 rounded-lg shadow-lg'
                                       name='password' id='password' onChange={handleInputChange}></input>
                            </div>
                            <div className='flex flex-col w-full gap-2'>
                                <label>Type</label>
                                <select required
                                        className='w-full px-3 py-3 border border-gray-400 rounded-lg shadow-lg'
                                        name='type' id='type' onChange={(e)=>{
                                            setEmployeeData((prevData) => ({
                                                ...prevData,
                                                role: e.target.value,
                                            }));
                                }}>
                                    <option value=''>Select Type</option>
                                    {types.map((type) => (
                                        <option value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className='w-full px-10'>
                        <button onClick={() => {
                            if (employeeData.name == "" || employeeData.cnic == "" || employeeData.password == "" || employeeData.phone == "" || employeeData.type == "") {
                                toast.error('All the fields are required')
                            } else {
                                handleAddEmployee();
                            }
                        }
                        }
                                className='w-full py-2 font-bold text-white transition-all duration-200 bg-opacity-75 rounded-lg shadow-lg bg-[#FAB005] hover:bg-opacity-100'>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Employee;