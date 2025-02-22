import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Plus, X, Edit2, Trash2, Search,
    Save, RotateCcw, ChevronDown, ChevronUp,
    Package, Settings, ListPlus, DollarSign
} from 'lucide-react';

const Items = () => {
    const [items, setItems] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [options, setOptions] = useState([{ name: '', customizations: [''] }]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedItems, setExpandedItems] = useState([]);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/items/getallitems`);
            setItems(response.data);
        } catch (error) {
            toast.error('Failed to fetch items');
        }
    };

    const handleAddItem = async () => {
        if (!name.trim()) {
            toast.error('Item name is required');
            return;
        }
        if (!price || price <= 0) {
            toast.error('Please enter a valid price');
            return;
        }

        // Validate options
        const invalidOptions = options.some(opt => !opt.name.trim() || opt.customizations.some(c => !c.trim()));
        if (invalidOptions) {
            toast.error('Please fill in all option and customization fields');
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/items/additem`, {
                name,
                price: Number(price),
                options
            });
            setItems([...items, response.data]);
            resetForm();
            toast.success('Item added successfully');
        } catch (error) {
            toast.error('Failed to add item');
        }
    };

    const handleEditItem = async (itemId) => {
        if (!name.trim()) {
            toast.error('Item name is required');
            return;
        }
        if (!price || price <= 0) {
            toast.error('Please enter a valid price');
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/items/edititem/${itemId}`, {
                name,
                price: Number(price),
                options,
            });
            setItems(items.map((item) => (item._id === itemId ? response.data : item)));
            resetForm();
            setIsEditing(false);
            toast.success('Item updated successfully');
        } catch (error) {
            toast.error('Failed to update item');
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/items/deleteitem/${itemId}`);
            setItems(items.filter((item) => item._id !== itemId));
            toast.success('Item deleted successfully');
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const resetForm = () => {
        setName('');
        setPrice('');
        setOptions([{ name: '', customizations: [''] }]);
        setEditingItemId(null);
        setIsEditing(false);
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

    const handleDeleteOption = (optionIndex) => {
        const updatedOptions = [...options];
        updatedOptions.splice(optionIndex, 1);
        setOptions(updatedOptions);
    };

    const handleDeleteCustomization = (optionIndex, customizationIndex) => {
        const updatedOptions = [...options];
        updatedOptions[optionIndex].customizations.splice(customizationIndex, 1);
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

    const toggleItemExpansion = (itemId) => {
        setExpandedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div className="bg-white rounded-xl shadow-sm">
                    {/* Header - Made responsive */}
                    <div className="border-b border-gray-200">
                        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Package className="w-6 h-6" />
                                Items Management
                            </h1>
                            <button
                                onClick={resetForm}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2
                                    bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                            >
                                {isEditing ? (
                                    <>
                                        <RotateCcw className="w-5 h-5" />
                                        Cancel Editing
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        New Item
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Form Section - Made responsive */}
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="max-w-4xl mx-auto">
                            <div className="space-y-6">
                                {/* Basic Info - Responsive grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Item Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter item name"
                                            className="w-full p-2 border border-gray-200 rounded-lg
                                                focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Price (Rs.)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                placeholder="Enter price"
                                                className="w-full pl-2 pr-4 py-2 border border-gray-200 rounded-lg
                                                    focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Options Section */}
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                        <h3 className="text-lg font-medium flex items-center gap-2">
                                            <Settings className="w-5 h-5" />
                                            Customization Options
                                        </h3>
                                        <button
                                            onClick={handleAddOption}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2
                                                px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200
                                                transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Option
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {options.map((option, optionIndex) => (
                                            <div
                                                key={optionIndex}
                                                className="p-4 border border-gray-200 rounded-lg"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                                                    <div className="flex-1">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Option Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={option.name}
                                                            onChange={(e) => handleOptionChange(optionIndex, 'name', e.target.value)}
                                                            placeholder="e.g., Size, Color, Style"
                                                            className="w-full p-2 border border-gray-200 rounded-lg
                                                                focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                        />
                                                    </div>
                                                    {options.length > 1 && (
                                                        <button
                                                            onClick={() => handleDeleteOption(optionIndex)}
                                                            className="self-end sm:self-center p-2 text-red-500
                                                                hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    {option.customizations.map((customization, customizationIndex) => (
                                                        <div key={customizationIndex} className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={customization}
                                                                onChange={(e) => handleCustomizationChange(
                                                                    optionIndex,
                                                                    customizationIndex,
                                                                    e.target.value
                                                                )}
                                                                placeholder={`Value ${customizationIndex + 1}`}
                                                                className="flex-1 p-2 border border-gray-200 rounded-lg
                                                                    focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                            />
                                                            {option.customizations.length > 1 && (
                                                                <button
                                                                    onClick={() => handleDeleteCustomization(
                                                                        optionIndex,
                                                                        customizationIndex
                                                                    )}
                                                                    className="p-2 text-red-500 hover:bg-red-50
                                                                        rounded-lg transition-colors"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => handleAddCustomization(optionIndex)}
                                                        className="w-full sm:w-auto inline-flex items-center justify-center
                                                            gap-1 px-3 py-1.5 mt-2 text-sm text-gray-700 bg-gray-100
                                                            rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Add Value
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={isEditing ? () => handleEditItem(editingItemId) : handleAddItem}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2
                                            px-6 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500
                                            transition-colors"
                                    >
                                        <Save className="w-5 h-5" />
                                        {isEditing ? 'Update Item' : 'Save Item'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items List Section */}
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ListPlus className="w-5 h-5" />
                                Items List
                            </h2>
                            <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg
                                        focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                        </div>

                        {/* Mobile Item Cards */}
                        <div className="block sm:hidden space-y-4">
                            {filteredItems.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    No items found
                                </div>
                            ) : (
                                filteredItems.map((item) => (
                                    <div key={item._id} className="bg-white border border-gray-200 rounded-lg">
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                                                    <p className="text-yellow-600 font-medium">
                                                        Rs. {item.price.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setName(item.name);
                                                            setPrice(item.price);
                                                            setOptions(item.options);
                                                            setIsEditing(true);
                                                            setEditingItemId(item._id);
                                                        }}
                                                        className="p-2 text-yellow-600 hover:bg-yellow-50
                                                            rounded-lg transition-colors"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item._id)}
                                                        className="p-2 text-red-500 hover:bg-red-50
                                                            rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleItemExpansion(item._id)}
                                                className="flex items-center gap-2 text-gray-600"
                                            >
                                                {item.options.length} options
                                                {expandedItems.includes(item._id) ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>
                                            {expandedItems.includes(item._id) && (
                                                <div className="mt-4 pl-4 border-l-2 border-yellow-400">
                                                    {item.options.map((option, index) => (
                                                        <div key={index} className="mb-4 last:mb-0">
                                                            <h4 className="font-medium text-gray-900 mb-2">
                                                                {option.name}
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {option.customizations.map((customization, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="px-3 py-1 bg-gray-50 border
                                                                            border-gray-200 rounded-full text-sm
                                                                            text-gray-600"
                                                                    >
                                                                        {customization}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-hidden border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Item Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Price
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Options
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            No items found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <React.Fragment key={item._id}>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{item.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-yellow-600 font-medium">
                                                        Rs. {item.price.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => toggleItemExpansion(item._id)}
                                                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                                                    >
                                                        {item.options.length} options
                                                        {expandedItems.includes(item._id) ? (
                                                            <ChevronUp className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setName(item.name);
                                                                setPrice(item.price);
                                                                setOptions(item.options);
                                                                setIsEditing(true);
                                                                setEditingItemId(item._id);
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }}
                                                            className="p-2 text-yellow-600 hover:bg-yellow-50
                                                                    rounded-lg transition-colors"
                                                            title="Edit Item"
                                                        >
                                                            <Edit2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteItem(item._id)}
                                                            className="p-2 text-red-500 hover:bg-red-50
                                                                    rounded-lg transition-colors"
                                                            title="Delete Item"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedItems.includes(item._id) && (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-4 bg-gray-50">
                                                        <div className="pl-4 border-l-2 border-yellow-400">
                                                            {item.options.map((option, index) => (
                                                                <div key={index} className="mb-4 last:mb-0">
                                                                    <h4 className="font-medium text-gray-900 mb-2">
                                                                        {option.name}
                                                                    </h4>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {option.customizations.map((customization, idx) => (
                                                                            <span
                                                                                key={idx}
                                                                                className="px-3 py-1 bg-white border
                                                                                        border-gray-200 rounded-full text-sm
                                                                                        text-gray-600"
                                                                            >
                                                                                    {customization}
                                                                                </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Items;