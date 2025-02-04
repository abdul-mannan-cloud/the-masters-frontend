import {React, useEffect, useState} from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import Profile from '../../resources/profile.png'

const Shirt = ({measurements, setMeasurements, customer}) => {

    const getCustomer = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/customer/${customer}`);
            if (response.data.measurements) {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/measurement/getmeasurement/${response.data.measurements}`)
                setMeasurements(res.data.measurement)
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    }

    useEffect(() => {
        getCustomer();
    },[customer])

    return (
        <div className='flex flex-col gap-5'>
            <div className='flex w-full gap-10'>
                <div className='grid justify-start w-full grid-cols-2 gap-2 text-start'>
                    <div className='flex flex-col gap-1'>
                        <label>Chest</label>
                        <input value={measurements.chest} type='number' required onChange={(e) => setMeasurements({ ...measurements, chest: e.target.value })} className='border-[1px] border-gray-500 rounded' />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label>Shoulders</label>
                        <input value={measurements.shoulders} type='number' required onChange={(e) => setMeasurements({ ...measurements, shoulders: e.target.value })} className='border-[1px] border-gray-500 rounded' />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label>Neck</label>
                        <input value={measurements.neck} type='number' required onChange={(e) => setMeasurements({ ...measurements, neck: e.target.value })} className='border-[1px] border-gray-500 rounded' />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label>Sleeves</label>
                        <input value={measurements.sleeves} type='number' required onChange={(e) => setMeasurements({ ...measurements, sleeves: e.target.value })} className='border-[1px] border-gray-500 rounded' />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label>Waist</label>
                        <input value={measurements.waist} type='number' required onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })} className='border-[1px] border-gray-500 rounded' />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label>Top Lenght</label>
                        <input value={measurements.topLenght} type='number' required onChange={(e) => setMeasurements({ ...measurements, topLenght: e.target.value })} className='border-[1px] border-gray-500 rounded' />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label>Bottoms Lenght</label>
                        <input value={measurements.bottomLenght} type='number' required onChange={(e) => setMeasurements({ ...measurements, bottomLenght: e.target.value })} className='border-[1px] border-gray-500 rounded' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Shirt;