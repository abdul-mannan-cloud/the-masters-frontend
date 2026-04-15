import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Items = () => {
    const [items, setItems] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [options, setOptions] = useState([{ name: '', customizations: [''] }]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [expandedCard, setExpandedCard] = useState(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/items/getallitems`);
            setItems(response.data);
        } catch {
            toast.error('Failed to fetch items');
        }
    };

    const handleAddItem = async () => {
        if (!name.trim()) { toast.error('Item name is required'); return; }
        if (!price || price <= 0) { toast.error('Please enter a valid price'); return; }
        if (options.some((opt) => !opt.name.trim() || opt.customizations.some((c) => !c.trim()))) {
            toast.error('Please fill in all option fields'); return;
        }
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/items/additem`, {
                name, price: Number(price), options,
            });
            setItems([...items, response.data]);
            resetForm();
            toast.success('Item added successfully');
        } catch {
            toast.error('Failed to add item');
        }
    };

    const handleEditItem = async (itemId) => {
        if (!name.trim()) { toast.error('Item name is required'); return; }
        if (!price || price <= 0) { toast.error('Please enter a valid price'); return; }
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/items/edititem/${itemId}`, {
                name, price: Number(price), options,
            });
            setItems(items.map((item) => (item._id === itemId ? response.data : item)));
            resetForm();
            toast.success('Item updated successfully');
        } catch {
            toast.error('Failed to update item');
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/items/deleteitem/${itemId}`);
            setItems(items.filter((item) => item._id !== itemId));
            toast.success('Item deleted successfully');
        } catch {
            toast.error('Failed to delete item');
        }
    };

    const resetForm = () => {
        setName('');
        setPrice('');
        setOptions([{ name: '', customizations: [''] }]);
        setEditingItemId(null);
        setIsEditing(false);
        setShowForm(false);
    };

    const handleOptionChange = (index, field, value) => {
        const updated = [...options];
        updated[index][field] = value;
        setOptions(updated);
    };

    const handleCustomizationChange = (optionIndex, custIndex, value) => {
        const updated = [...options];
        updated[optionIndex].customizations[custIndex] = value;
        setOptions(updated);
    };

    const handleDeleteOption = (optionIndex) => {
        const updated = [...options];
        updated.splice(optionIndex, 1);
        setOptions(updated);
    };

    const handleDeleteCustomization = (optionIndex, custIndex) => {
        const updated = [...options];
        updated[optionIndex].customizations.splice(custIndex, 1);
        setOptions(updated);
    };

    const handleAddCustomization = (optionIndex) => {
        const updated = [...options];
        updated[optionIndex].customizations.push('');
        setOptions(updated);
    };

    const startEdit = (item) => {
        setName(item.name);
        setPrice(item.price);
        setOptions(item.options);
        setIsEditing(true);
        setEditingItemId(item._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Garment category icons
    const getItemIcon = (itemName) => {
        const name = (itemName || '').toLowerCase();
        if (name.includes('pant') || name.includes('trouser')) return 'apparel';
        if (name.includes('suit')) return 'dry_cleaning';
        if (name.includes('kurta') || name.includes('kameez')) return 'styler';
        return 'content_cut';
    };

    const cardColors = [
        'from-primary/5 to-primary/10',
        'from-secondary-container/30 to-secondary-container/50',
        'from-tertiary-fixed/20 to-tertiary-fixed/40',
        'from-primary-fixed/20 to-primary-fixed/40',
    ];

    return (
        <div className="font-body">
            {/* Hero Banner */}
            <div className="relative bg-primary overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-white/[0.08] pointer-events-none" />

                <div className="relative z-10 px-8 py-14">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <p className="text-on-primary/60 text-xs font-bold uppercase tracking-widest mb-2 font-label">The Masters Atelier</p>
                            <h1 className="text-5xl font-extrabold text-on-primary tracking-tight font-headline leading-tight">
                                The Masters<br />Collection
                            </h1>
                            <p className="text-on-primary/70 mt-3 max-w-md">
                                Curate your atelier's catalog — define garment types, pricing tiers, and customization options.
                            </p>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            <button
                                onClick={() => { resetForm(); setShowForm(true); }}
                                className="flex items-center gap-2 px-6 py-3 bg-on-primary text-primary font-bold rounded-full text-sm hover:bg-on-primary/90 transition-colors font-label"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Add New Item
                            </button>
                        </div>
                    </div>

                    {/* Stats strip */}
                    <div className="flex gap-8 mt-8 pt-6 border-t border-white/10">
                        <div>
                            <p className="text-3xl font-extrabold text-on-primary font-headline">{items.length}</p>
                            <p className="text-on-primary/60 text-xs font-label mt-0.5">Garment Types</p>
                        </div>
                        <div>
                            <p className="text-3xl font-extrabold text-on-primary font-headline">
                                {items.reduce((sum, i) => sum + (i.options?.length || 0), 0)}
                            </p>
                            <p className="text-on-primary/60 text-xs font-label mt-0.5">Customization Options</p>
                        </div>
                        <div>
                            <p className="text-3xl font-extrabold text-on-primary font-headline">
                                Rs. {items.length > 0 ? Math.min(...items.map(i => i.price)).toLocaleString() : '—'}
                            </p>
                            <p className="text-on-primary/60 text-xs font-label mt-0.5">Starting Price</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8">
                {/* Add / Edit Form */}
                {showForm && (
                    <div className="bg-surface-container-lowest rounded-2xl p-8 mb-8" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.06)' }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 font-headline">
                                {isEditing ? 'Edit Item' : 'New Item'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="p-2 rounded-lg text-stone-400 hover:text-on-surface hover:bg-surface-container-low transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">Item Name</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">content_cut</span>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g., Shalwar Kameez"
                                            className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">Base Price (Rs.)</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">payments</span>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder="Enter base price"
                                            className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 font-headline">Customization Options</h3>
                                    <button
                                        onClick={() => setOptions([...options, { name: '', customizations: [''] }])}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors font-label"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">add</span>
                                        Add Option
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {options.map((option, optionIndex) => (
                                        <div key={optionIndex} className="p-5 bg-surface-container-low rounded-xl">
                                            <div className="flex items-center gap-3 mb-4">
                                                <input
                                                    type="text"
                                                    value={option.name}
                                                    onChange={(e) => handleOptionChange(optionIndex, 'name', e.target.value)}
                                                    placeholder="Option name (e.g., Size, Color)"
                                                    className="flex-1 px-4 py-2.5 bg-surface-container-lowest rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
                                                />
                                                {options.length > 1 && (
                                                    <button
                                                        onClick={() => handleDeleteOption(optionIndex)}
                                                        className="p-2 rounded-lg text-stone-400 hover:text-error hover:bg-error/5 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-2 pl-2">
                                                {option.customizations.map((cust, custIndex) => (
                                                    <div key={custIndex} className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={cust}
                                                            onChange={(e) => handleCustomizationChange(optionIndex, custIndex, e.target.value)}
                                                            placeholder={`Value ${custIndex + 1}`}
                                                            className="flex-1 px-4 py-2 bg-surface-container-lowest rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
                                                        />
                                                        {option.customizations.length > 1 && (
                                                            <button
                                                                onClick={() => handleDeleteCustomization(optionIndex, custIndex)}
                                                                className="p-1.5 rounded-lg text-stone-400 hover:text-error hover:bg-error/5 transition-colors"
                                                            >
                                                                <span className="material-symbols-outlined text-[16px]">close</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => handleAddCustomization(optionIndex)}
                                                    className="flex items-center gap-1 text-xs text-primary font-bold hover:underline mt-1 font-label"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">add</span>
                                                    Add value
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={isEditing ? () => handleEditItem(editingItemId) : handleAddItem}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 transition-colors font-label"
                                >
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    {isEditing ? 'Update Item' : 'Save Item'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search + count */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 font-headline">
                        Catalog · {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                    </h2>
                    <div className="relative sm:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder="Search items…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-full border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-body"
                        />
                    </div>
                </div>

                {/* Card Grid */}
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-20 h-20 rounded-3xl bg-surface-container-low flex items-center justify-center">
                            <span className="material-symbols-outlined text-[40px] text-stone-300">content_cut</span>
                        </div>
                        <div className="text-center">
                            <p className="text-base font-bold text-stone-400 font-headline">
                                {searchQuery ? 'No items match your search' : 'Your catalog is empty'}
                            </p>
                            <p className="text-sm text-stone-300 mt-1">
                                {searchQuery ? 'Try a different keyword' : 'Add your first garment type to get started'}
                            </p>
                        </div>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 transition-colors font-label"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Add First Item
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map((item, index) => (
                            <div
                                key={item._id}
                                className="bg-surface-container-lowest rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
                                style={{ boxShadow: '0 4px 20px rgba(25,28,27,0.06)' }}
                            >
                                {/* Card image area */}
                                <div className={`aspect-[3/2] bg-gradient-to-br ${cardColors[index % cardColors.length]} flex flex-col items-center justify-center relative`}>
                                    <span className="material-symbols-outlined text-[56px] text-primary/30 group-hover:text-primary/50 transition-colors">
                                        {getItemIcon(item.name)}
                                    </span>
                                    {/* Price badge */}
                                    <div className="absolute top-3 right-3 bg-primary text-on-primary text-xs font-bold px-2.5 py-1 rounded-full font-label">
                                        Rs. {item.price.toLocaleString()}
                                    </div>
                                    {/* Options count badge */}
                                    <div className="absolute top-3 left-3 bg-surface-container-lowest/80 backdrop-blur-sm text-on-surface-variant text-xs font-bold px-2.5 py-1 rounded-full font-label">
                                        {item.options.length} option{item.options.length !== 1 ? 's' : ''}
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="p-5">
                                    <h3 className="font-extrabold text-on-surface font-headline text-lg leading-tight mb-1">{item.name}</h3>
                                    <p className="text-xs text-stone-400 mb-4">
                                        {item.options.map(o => o.name).filter(Boolean).join(' · ') || 'No customizations'}
                                    </p>

                                    {/* Expandable options */}
                                    {expandedCard === item._id && (
                                        <div className="mb-4 space-y-3">
                                            {item.options.map((option, i) => (
                                                <div key={i}>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5 font-label">{option.name}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {option.customizations.map((cust, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2.5 py-0.5 bg-surface-container-low rounded-full text-xs font-medium text-on-surface-variant border border-outline-variant/10"
                                                            >
                                                                {cust}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setExpandedCard(expandedCard === item._id ? null : item._id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-outline-variant/20 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors font-label"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">
                                                {expandedCard === item._id ? 'expand_less' : 'expand_more'}
                                            </span>
                                            {expandedCard === item._id ? 'Hide' : 'Options'}
                                        </button>
                                        <button
                                            onClick={() => startEdit(item)}
                                            className="p-2 rounded-xl text-stone-400 hover:text-primary hover:bg-primary/5 transition-colors"
                                            title="Edit"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item._id)}
                                            className="p-2 rounded-xl text-stone-400 hover:text-error hover:bg-error/5 transition-colors"
                                            title="Delete"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add new card */}
                        <button
                            onClick={() => { resetForm(); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/30 hover:border-primary/30 hover:bg-primary/[0.03] flex flex-col items-center justify-center gap-3 p-8 min-h-[240px] transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <span className="material-symbols-outlined text-[24px] text-primary">add</span>
                            </div>
                            <span className="text-sm font-bold text-stone-400 group-hover:text-primary transition-colors font-label">Add New Item</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Items;
