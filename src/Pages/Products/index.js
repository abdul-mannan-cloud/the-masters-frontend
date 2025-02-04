import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";

import plusIcon from '../../resources/Plus.png';
import deleteIcon from '../../resources/delete.png';
import Modal from 'react-modal';
import CrossIcon from "../../resources/cross.png";
import Add01 from "../../resources/item1.jpg";
import Search from "../../resources/Icons/search.png"

const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      outerHeight: '100px',
    },
  };


const Employees = () => {

    const navigate = useNavigate();
    useEffect(() => {
        if (localStorage.getItem('ciseauxtoken') === null) {
            navigate('/login')
        }
    }, []);

    const [item, setItem] = useState({
        name: "Cotton",
        type: "Cottom01",
        code: "12abs2",
        color: "Black",
        price: 1200,
        description: "Some random description",
        quantity: 0,
        coverImage: Add01,
        productType: 'coat',
    })
    const [update, setUpdate] = useState(false);
    const [types, setTypes] = useState([]);

    const [coatCloths, setCoatCloths] = useState([]);
    const [qameezCloths, setQameezCloths] = useState([]);
    const [shirtCloths, setShirtCloths] = useState([]);

    useEffect(() => {
        const getCloths = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/cloth/getallcloths`);
                const uniqueTypes = [...new Set(response.data.cloths.map(cloth => cloth.type))];
                const coat = response.data.cloths.filter((cloth) => { return cloth.productType == 'coat'})
                const qameez = response.data.cloths.filter((cloth) => { return cloth.productType == 'qameez suit'})
                const shirt = response.data.cloths.filter((cloth) => { return cloth.productType == 'shirt'})
                setCoatCloths(coat);
                setShirtCloths(shirt);
                setQameezCloths(qameez);
                setTypes(uniqueTypes);
              } catch (error) {
                console.error("Error fetching data:", error);
              }              
        };
        getCloths();
    }, [update]);

    const handleAddCloth = async () => {
        const formData = new FormData();
        formData.append('name', item.name);
        formData.append('type', item.type);
        formData.append('code', item.code);
        formData.append('quantity', item.quantity);
        formData.append('color', item.color);
        formData.append('price', item.price);
        formData.append('description', item.description);
        formData.append('coverImage', item.coverImage);
        formData.append('productType', item.productType);

        try {
          const response = await axios.post('http://localhost:3001/cloth/addcloth', formData);
          console.log(response);
          toast.success()
          setUpdate(!update);
        } catch (error) {
          console.error('Error adding post:', error);
        }
    };

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("All")

    const filteredCoatCloths = coatCloths.filter((cloth) => {
        const clothNameMatch = cloth.name.toLowerCase().includes(searchQuery.toLowerCase());
        const clothTypeMatch = cloth.type.toLowerCase().includes(searchQuery.toLowerCase());
        const clothCodeMatch = cloth.code.toLowerCase().includes(searchQuery.toLowerCase());
        const clothColorMatch = cloth.color.toLowerCase().includes(searchQuery.toLowerCase());

        const typeMatch = selectedType == "All" || cloth.type.toLowerCase() == (selectedType.toLowerCase());
      
        return (clothNameMatch || clothTypeMatch || clothCodeMatch || clothColorMatch) && typeMatch;
    });

    const filteredQameezCloths = qameezCloths.filter((cloth) => {
        const clothNameMatch = cloth.name.toLowerCase().includes(searchQuery.toLowerCase());
        const clothTypeMatch = cloth.type.toLowerCase().includes(searchQuery.toLowerCase());
        const clothCodeMatch = cloth.code.toLowerCase().includes(searchQuery.toLowerCase());
        const clothColorMatch = cloth.color.toLowerCase().includes(searchQuery.toLowerCase());

        const typeMatch = selectedType == "All" || cloth.type.toLowerCase() == (selectedType.toLowerCase());
      
        return (clothNameMatch || clothTypeMatch || clothCodeMatch || clothColorMatch) && typeMatch;
    });

    const filteredShirtCloths = shirtCloths.filter((cloth) => {
        const clothNameMatch = cloth.name.toLowerCase().includes(searchQuery.toLowerCase());
        const clothTypeMatch = cloth.type.toLowerCase().includes(searchQuery.toLowerCase());
        const clothCodeMatch = cloth.code.toLowerCase().includes(searchQuery.toLowerCase());
        const clothColorMatch = cloth.color.toLowerCase().includes(searchQuery.toLowerCase());

        const typeMatch = selectedType == "All" || cloth.type.toLowerCase() == (selectedType.toLowerCase());
      
        return (clothNameMatch || clothTypeMatch || clothCodeMatch || clothColorMatch) && typeMatch;
    });

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const deletePost = async (item) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/cloth/deletecloth/${item._id}`);
            if(response.status === 200){
                setUpdate(!update);
            }
        } catch (error) {
            console.error('Error deleting post:', error.message);
        }
    }

    const [modalIsOpen, setIsOpen] = React.useState(false);
    const [dlt, setDlt] = React.useState(false);
    function openModal() {
        setIsOpen(true);
    }
    function closeModal() {
        setIsOpen(false);
    }

    const handleImageChange = (e) => {
        setItem({ ...item, coverImage: e.target.files[0] });
    };

    return(
        <div className='flex h-screen bg-gray-100'>
            <div className='flex flex-col overflow-auto w-[95%] ml-20 mt-20'>
                <div className="flex items-center bg-gray-100 self-center justify-center align-middle w-[80%] rounded-xl">
                    <div className="flex flex-col w-full">
                        <div className='flex flex-row items-center justify-between w-full p-2 align-middle rounded'>
                            <div className='text-3xl font-bold'>ITEMS</div>
                            <div className='flex flex-row items-center w-[70%] gap-5 align-middle rounded-lg justify-end'>
                                <div className='flex flex-row bg-gray-300 w-[40%] rounded-lg p-3'>
                                    <input onChange={handleSearchChange} type='text' className='w-full h-full bg-gray-300 border-none rounded-lg outline-none' placeholder='search...' />
                                    <img src={Search} className='w-5 h-5' />
                                </div>
                                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className='bg-[#FAB005] p-2 bg-opacity-70 px-3 w-[180px] outline-none rounded'>
                                    <option className='bg-white'>All</option>
                                    {
                                        types && types.map((type, index) => (
                                            <option className='bg-white' key={index} value={type}>{type}</option>
                                        ))
                                    }
                                </select>
                                <div  onClick={() => openModal()} className='flex flex-row items-center h-12 gap-3 px-3 py-2 align-middle transition-all duration-200 bg-opacity-75 rounded-lg cursor-pointer bg-[#FAB005] hover:bg-opacity-100'>
                                    <img src={plusIcon} className='w-[25px] h-[25px]' />
                                    <span className='font-bold text-white'>Add Item</span>
                                </div>
                                <Modal
                                    isOpen={modalIsOpen}

                                    style={customStyles}
                                    contentLabel="Example Modal"
                                >
                                    <div className='flex justify-end w-full'>
                                        <img src={CrossIcon} alt='close' className='w-[30px] h-[30px] cursor-pointer' onClick={closeModal}/>
                                    </div>
                                    <form encType="multipart/form-data">
                                        <div className='flex flex-row justify-center gap-5 p-5 mt-5'>
                                            <div className='w-[250px] h-[250px] bg-gray-400 text-center rounded-xl'>
                                                <input type="file" required name="coverImage" onChange={handleImageChange} />
                                            </div>
                                            <div className='flex flex-col gap-3 w-[300px]'>
                                                <div className='flex flex-col w-full gap-2 p-1'>
                                                    <label>Name</label>
                                                    <input type='text' required onChange={(e) => setItem({ ...item, name: e.target.value })} className='p-1 rounded bg-white border-gray-300 border-[1px] w-full outline-[#FAB005]'/>
                                                </div>
                                                <div className='flex flex-col w-full gap-2 p-1'>
                                                    <label>Type</label>
                                                    <input type='text' required onChange={(e) => setItem({ ...item, type: e.target.value })} className='p-1 rounded bg-white border-gray-300 border-[1px] w-full outline-[#FAB005]'/>
                                                </div>
                                                <div className='flex flex-col w-full gap-2 p-1'>
                                                    <label>Code</label>
                                                    <input type='text' required onChange={(e) => setItem({ ...item, code: e.target.value })} className='p-1 rounded bg-white border-gray-300 border-[1px] w-full outline-[#FAB005]'/>
                                                </div>
                                                <div className='flex flex-col w-full gap-2 p-1'>
                                                    <label>Quantity</label>
                                                    <input type='Number' required onChange={(e) => setItem({ ...item, quantity: e.target.value })} className='p-1 rounded bg-white border-gray-300 border-[1px] w-full outline-[#FAB005]'/>
                                                    <label className={` text-sm text-red-600 ${item.quantity < 0 ? 'block' : 'hidden'}`}>Negative number is not allowed</label>
                                                </div>
                                            </div>
                                            <div className='flex flex-col gap-3 w-[300px]'>
                                                <div className='flex flex-col w-full gap-2 p-1'>
                                                    <label>Color</label>
                                                    <input type='text' required onChange={(e) => setItem({ ...item, color: e.target.value })} className='p-1 rounded bg-white border-gray-300 border-[1px] w-full outline-[#FAB005]'/>
                                                </div>
                                                <div className='flex flex-col w-full gap-2 p-1'>
                                                    <label>Price</label>
                                                    <input type='Number' required onChange={(e) => setItem({ ...item, price: e.target.value })} className='p-1 rounded bg-white border-gray-300 border-[1px] w-full outline-[#FAB005]'/>
                                                    <label className={` text-sm text-red-600 ${item.price < 0 ? 'block' : 'hidden'}`}>Negative number is not allowed</label>
                                                </div>
                                                <div className='flex flex-col w-full gap-2 p-1'>
                                                    <label>For Product Type</label>
                                                    <select type='text' required onChange={(e) => setItem({ ...item, productType: e.target.value })} className='p-1 rounded bg-white border-gray-300 border-[1px] w-full outline-[#FAB005]'>
                                                        <option value='coat'>Coat</option>
                                                        <option value='qameez suit'>Shalwar Qameez</option> 
                                                        <option value='shirt'>Shirt</option>
                                                    </select>
                                                </div>
                                                <div className='flex flex-col w-full gap-2 p-1'>
                                                    <label>Description</label>
                                                    <textarea type='text' required onChange={(e) => setItem({ ...item, description: e.target.value })} className='p-1 rounded bg-white border-gray-300 border-[1px] w-full outline-[#FAB005]'/>
                                                </div>
                                                
                                            </div>
                                        </div>
                                        <div className='w-full px-5 mt-5'>
                                            <button type='submit' onClick={() => {            
                                                if (item.price < 0 || item.quantity < 0 || !item.name || !item.color || !item.code || !item.coverImage || !item.price || !item.type) {
                                                    toast.error('Invalid Input!')
                                                } else {
                                                    handleAddCloth();
                                                    closeModal();
                                                }
                                                
                                            }}  className='w-full p-2 font-bold text-white transition-all duration-200 bg-opacity-75 rounded bg-[#FAB005] hover:bg-opacity-100'>Save</button>
                                        </div>

                                    </form>
                                    
                                </Modal>
                                <div onClick={() => setDlt(!dlt)} className='bg-red-500 p-[9px] cursor-pointer rounded'><img src={deleteIcon} className='w-[30px] h-[30px]' /></div>
                            </div>
                        </div>

                        <div className='flex flex-col w-full px-5 py-5 mt-5 align-middle bg-white rounded-xl'>
                            <h className='text-xl font-semibold'>Two Piece/Three Piece</h>
                            <div className='flex flex-row items-center w-full gap-5 py-5 overflow-auto '>
                                {filteredCoatCloths.map((item, index) => (
                                    <div key={index} className="relative flex flex-col items-center self-center justify-center w-full min-w-[250px] max-w-[250px] gap-2 p-2 align-middle border-2 rounded border-[#FAB005]">
                                        <img src={item.coverImage} alt='Category Image' className='w-full h-[150px] rounded' />
                                        <div className='flex flex-row justify-between w-full gap-10'>
                                            <div className='flex flex-col justify-start'>
                                                <h className="text-base font-semibold">Name</h>
                                                <p className="">{item.name}</p>
                                            </div>
                                            <div className='flex flex-col justify-end'>
                                                <h className="text-base font-semibold">Type</h>
                                                <p className="">{item.type}</p>
                                            </div>
                                        </div>
                                        <div onClick={() => deletePost(item)} className={`w-[40px] h-[40px] bg-red-500 hover:scale-110 duration-200 rounded-full absolute -top-4 -right-4 p-2 items-center flex align-middle justify-center cursor-pointer
                                            ${
                                                dlt === true ? "block" : "hidden"
                                            }
                                        `}>
                                            <img src={deleteIcon} alt='D' className='w-[20px] h-[20px]' />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='flex flex-col w-full px-5 py-5 mt-5 align-middle bg-white rounded-xl'>
                            <h className='text-xl font-semibold'>Qameez Shalwar</h>
                            <div className='flex flex-row items-center w-full gap-5 py-5 overflow-auto '>
                                {filteredQameezCloths.map((item, index) => (
                                    <div key={index} className="relative flex flex-col items-center self-center justify-center w-full min-w-[250px] max-w-[250px] gap-2 p-2 align-middle border-2 rounded border-[#FAB005]">
                                        <img src={item.coverImage} alt='Category Image' className='w-full h-[150px] rounded' />
                                        <div className='flex flex-row justify-between w-full gap-10'>
                                            <div className='flex flex-col justify-start'>
                                                <h className="text-base font-semibold">Name</h>
                                                <p className="">{item.name}</p>
                                            </div>
                                            <div className='flex flex-col justify-end'>
                                                <h className="text-base font-semibold">Type</h>
                                                <p className="">{item.type}</p>
                                            </div>
                                        </div>
                                        <div onClick={() => deletePost(item)} className={`w-[40px] h-[40px] bg-red-500 hover:scale-110 duration-200 rounded-full absolute -top-4 -right-4 p-2 items-center flex align-middle justify-center cursor-pointer
                                            ${
                                                dlt === true ? "block" : "hidden"
                                            }
                                        `}>
                                            <img src={deleteIcon} alt='D' className='w-[20px] h-[20px] z-50' />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='flex flex-col w-full px-5 py-5 mt-5 mb-10 align-middle bg-white rounded-xl'>
                            <h className='text-xl font-semibold'>Shirts</h>
                            <div className='flex flex-row items-center w-full gap-5 py-5 overflow-auto'>
                                {filteredShirtCloths.map((item, index) => (
                                    <div key={index} className="relative flex flex-col items-center self-center justify-center w-full min-w-[250px] max-w-[250px] gap-2 p-2 align-middle border-2 rounded border-[#FAB005]">
                                        <img src={item.coverImage} alt='Category Image' className='w-full h-[150px] rounded' />
                                        <div className='flex flex-row justify-between w-full gap-10'>
                                            <div className='flex flex-col justify-start'>
                                                <h className="text-base font-semibold">Name</h>
                                                <p className="">{item.name}</p>
                                            </div>
                                            <div className='flex flex-col justify-end'>
                                                <h className="text-base font-semibold">Type</h>
                                                <p className="">{item.type}</p>
                                            </div>
                                        </div>
                                        <div onClick={() => deletePost(item)} className={`w-[40px] h-[40px] bg-red-500 hover:scale-110 duration-200 rounded-full absolute -top-4 -right-4 p-2 items-center flex align-middle justify-center cursor-pointer
                                            ${
                                                dlt === true ? "block" : "hidden"
                                            }
                                        `}>
                                            <img src={deleteIcon} alt='D' className='w-[20px] h-[20px]' />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Employees;
