import React, { useState, useEffect } from 'react';
import axios from 'axios';
import plusIcon from '../../resources/Plus.png';
import EditIcon from '../../resources/Icons/edit.png';
import DeleteIcon from '../../resources/Icons/delete.png';
import { toast } from 'react-toastify';

const Items = () => {
    const [items, setItems] = useState([]);
    const [name, setName] = useState('');
    const [price,setPrice]  = useState(0)
    const [options, setOptions] = useState([{ name: '', customizations: [''] }]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/items/getallitems`);
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const handleAddItem = async () => {
        if (!name.trim()) {
            toast.error('Item name is required');
            return;
        }
        if(price <= 0){
            toast.error('Item price is required');
            return;
        }
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/items/additem`, { name,price, options });
            setItems([...items, response.data]);
            resetForm();
            toast.success('Item added successfully');
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    const handleEditItem = async (itemId) => {
        if (!name.trim()) {
            toast.error('Item name is required');
            return;
        }
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/items/edititem/${itemId}`, {
                name,
                price,
                options,
            });
            setItems(items.map((item) => (item._id === itemId ? response.data : item)));
            resetForm();
            setIsEditing(false);
            toast.success('Item updated successfully');
        } catch (error) {
            console.error('Error editing item:', error);
        }
    };

    const handleDeleteItem = async (itemId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/items/deleteitem/${itemId}`);
            setItems(items.filter((item) => item._id !== itemId));
            toast.success('Item deleted successfully');
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const resetForm = () => {
        setName('');
        setPrice(0);
        setOptions([{ name: '', customizations: [''] }]);
        setEditingItemId(null);
    };

    const handleOptionChange = (index, field, value) => {
        const updatedOptions = [...options];
        if (field === 'name') {
            updatedOptions[index].name = value;
        } else if (field === 'customizations') {
            updatedOptions[index].customizations = value;
        }
        setOptions(updatedOptions);
    };

    const handleCustomizationChange = (optionIndex, customizationIndex, value) => {
        const updatedOptions = [...options];
        updatedOptions[optionIndex].customizations[customizationIndex] = value;
        setOptions(updatedOptions);
    };

    const handleAddOption = () => {
        setOptions([...options, { name: '', customizations: [''] }]);
    };

    const handleAddCustomization = (optionIndex) => {
        const updatedOptions = [...options];
        updatedOptions[optionIndex].customizations.push('');
        setOptions(updatedOptions);
    };

    return (
        <div className="flex h-full bg-gray-100 pb-20">
            <div className="flex flex-col w-full ml-20">
                <div className="flex items-center justify-center w-full mt-20 bg-gray-100 sm:pl-40 sm:pr-40 rounded-xl">
                    <div className="flex flex-col w-full">
                        <div className="flex flex-row justify-between">
                            <h2 className="text-3xl font-bold">{isEditing ? 'Edit Item' : 'Add Item'}</h2>
                            <button
                                onClick={resetForm}
                                className="flex items-center gap-2 px-4 py-2 font-bold text-white transition-all duration-200 bg-opacity-75 rounded-md cursor-pointer bg-[#FAB005] hover:bg-opacity-100"
                            >
                                <img src={plusIcon} className="w-5 h-5" alt="Add" />
                                <span>{isEditing ? 'Cancel Editing' : 'Reset Form'}</span>
                            </button>
                        </div>
                        <div className="w-full p-5 mt-5 bg-white rounded-lg shadow-md">
                            <div className="mb-5">
                                <label className="block mb-2 font-semibold">Item Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter item name"
                                    className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-[#FAB005]"
                                />
                            </div>
                            <div className="mb-5">
                                <label className="block mb-2 font-semibold">Item Price</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="Enter item price"
                                    className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-[#FAB005]"
                                />
                            </div>
                            {options.map((option, index) => (
                                <div key={index} className="mb-5">
                                    <label className="block mb-2 font-semibold">Option {index + 1} Name</label>
                                    <input
                                        type="text"
                                        value={option.name}
                                        onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                                        placeholder="Enter option name (e.g., Customizations)"
                                        className="w-full p-2 mb-3 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-[#FAB005]"
                                    />
                                    {option.customizations.map((customization, subIndex) => (
                                        <div key={subIndex} className="flex items-center mb-2">
                                            <input
                                                type="text"
                                                value={customization}
                                                onChange={(e) => handleCustomizationChange(index, subIndex, e.target.value)}
                                                placeholder={`Sub Option ${subIndex + 1}`}
                                                className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-[#FAB005]"
                                            />
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => handleAddCustomization(index)}
                                        className="px-3 py-1 mt-2 text-sm font-semibold text-white transition-all duration-200 bg-opacity-75 rounded-md bg-[#FAB005] hover:bg-opacity-100"
                                    >
                                        Add Sub Option
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={handleAddOption}
                                className="px-4 py-2 mt-2 text-sm font-semibold text-white transition-all duration-200 bg-opacity-75 rounded-md bg-[#FAB005] hover:bg-opacity-100"
                            >
                                Add Option
                            </button>
                        </div>
                        <button
                            onClick={isEditing ? () => handleEditItem(editingItemId) : handleAddItem}
                            className="px-4 py-2 mt-5 font-bold text-white transition-all duration-200 bg-opacity-75 rounded-md bg-[#FAB005] hover:bg-opacity-100"
                        >
                            {isEditing ? 'Update Item' : 'Add Item'}
                        </button>

                        <div className="w-full mt-10">
                            <h2 className="mb-5 text-2xl font-bold">Items List</h2>
                            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                                <table className="min-w-full">
                                    <thead>
                                    <tr className="bg-gray-200">
                                        <th className="px-6 py-3 text-left">Item Name</th>
                                        <th className="px-6 py-3 text-left">Price</th>
                                        <th className="px-6 py-3 text-left">Options</th>
                                        <th className="px-6 py-3 text-center">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {items.map((item) => (
                                        <tr key={item._id} className="border-b hover:bg-gray-100">
                                            <td className="px-6 py-4">{item.name}</td>
                                            <td className="px-6 py-4">{item.price}</td>
                                            <td className="px-6 py-4">
                                                {item.options.map((option, index) => (
                                                    <div key={index} className="mb-2">
                                                        <div className="font-semibold">{option.name}</div>
                                                        <ul className="list-disc list-inside">
                                                            {option.customizations.map((customization, subIndex) => (
                                                                <li key={subIndex} className="text-sm">
                                                                    {customization}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        setName(item.name);
                                                        setPrice(item.price)
                                                        setOptions(item.options);
                                                        setIsEditing(true);
                                                        setEditingItemId(item._id);
                                                    }}
                                                    className="inline-flex items-center justify-center p-2 mr-2 transition-all duration-200 bg-opacity-75 rounded-md cursor-pointer bg-[#FAB005] hover:bg-opacity-100"
                                                >
                                                    <img src={EditIcon} className="w-5 h-5" alt="Edit"/>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item._id)}
                                                    className="inline-flex items-center justify-center p-2 transition-all duration-200 bg-red-500 rounded-md cursor-pointer hover:bg-red-600"
                                                >
                                                    <img src={DeleteIcon} className="w-5 h-5" alt="Delete"/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-4 text-center">
                                                No items found.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Items;
