import {React, useEffect, useState} from 'react';
import axios from 'axios';
import icon from '../../resources/Icons/delete.png'
import Pending from '../../resources/Icons/pending.png'
import Process from '../../resources/Icons/process.png'
import Complete from '../../resources/Icons/complete.png'
import { toast } from 'react-toastify';

const Shirt = ({item, model, setModel}) => {

    const [cutters, setCutters] = useState([]);
    const [tailors, setTailors] = useState([]);
    const [measurements, setMeasurements] = useState({
        chest: 0,
        shoulders: 0,
        neck: 0,
        waist: 0,
        sleeves: 0,
        topLenght: 0,
        bottomLenght: 0
    })

    const getEmployees = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/employee/getallemployee`);
            const cutters = response.data.filter((employee) => { return employee.role == 'cutter'})
            const tailors = response.data.filter((employee) => { return employee.role == 'tailor'})
            console.log(cutters);
            console.log(tailors);
            setCutters(cutters);
            setTailors(tailors);
        } catch (error) {
            console.log('Error Fetching emlpyess: ', error)
        }
    }

    const getMeasurements = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/measurement/getmeasurement/${item.measurements}`);
            console.log(response.data);
            setMeasurements(response.data.measurement)
        } catch (error) {
            console.log('Error Fetching emlpyess: ', error)
        }
    }

    const [cutter, setCutter] = useState();
    const [tailor, setTailor] = useState();

    const handleEmployeeAssignment = async () => {
        try {
            if(!tailor || !cutter) {
                toast.error('Select Tailor and Cutter first')
            } else {
                const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/product/assignemployees`, {cutter, tailor, item});
                toast.success('Employees Assigned Successfully!')
                setModel(false)
            }
        } catch (error) {
            console.log('Error assigning employees:', error)
        }
    }

    useEffect(() => {
        getEmployees();
        getMeasurements();
    }, [])

    return (
        <div className='flex flex-col gap-10 p-10'>
            <h className='justify-center w-full text-2xl font-bold text-center'>Item Details</h>
            <div className='flex flex-row justify-between w-full gap-10'>
                <div className='flex flex-row gap-10 w-[70%] justify-start text-start'>
                    <div className='flex flex-col gap-5 font-semibold'>
                        <label className='h-2'>Type: {item.type}</label>
                        <label className='h-2'>Price: {item.price}</label>
                        <label className='h-2'>Instructions: {item.instructions}</label>
                    </div>
                </div>
                <img src={item.image} className='w-[30%] h-full rounded-2xl'/>
            </div>
            <div className='flex flex-row justify-between w-full gap-10'>
                <div className='flex flex-col gap-3 w-[100%]'>
                    <h className='text-xl font-bold'>Measurements</h>
                    <div className='grid grid-cols-3 gap-5'>
                        <label>Neck: {measurements.neck}</label>
                        <label>Chest: {measurements.chest}</label>
                        <label>Shoulders: {measurements.shoulders}</label>
                        <label>Waist: {measurements.waist}</label>
                        <label>Sleeves: {measurements.sleeves}</label>
                        <label>Bottom: {measurements.bottomLength}</label>
                        <label>Length: {measurements.topLength}</label>
                    </div>
                </div>
                
            </div>
            <div className={` flex-row gap-5 w-[100%] ${item.status == 'pending' ? 'flex' : 'hidden'}`}>
                <select onClick={(e) => setCutter(e.target.value)}  className='p-2 border-2 border-gray-300 w-[50%]'>
                    <option>Select Cutter</option>
                    {
                        cutters.map((cutter) => 
                            <option value={cutter._id} >{cutter.name}</option>
                        )
                    }
                </select>
                <select onClick={(e) => setTailor(e.target.value)} className='p-2 border-2 border-gray-300 w-[50%]'>
                    <option>Select Tailor</option>
                    {
                        tailors.map((tailor) => 
                            <option value={tailor._id}>{tailor.name}</option>
                        )
                    }
                </select>
            </div>
            <div className='flex flex-col items-end justify-end w-full gap-5'>
                <button onClick={() => {handleEmployeeAssignment(); }} className={`p-2 px-10 w-full font-bold text-white bg-[#FAB005] bg-opacity-80 hover:bg-opacity-90 rounded-lg ${item.status == 'pending' ? 'block' : 'hidden'}`}>Save</button>
                <button onClick={() => {setModel(false)}} className={`p-2 px-10 w-full font-bold text-white bg-[#FAB005] bg-opacity-80 hover:bg-opacity-90 rounded-lg `}>Close</button>
            </div>
        </div>
    )
}

export default Shirt;