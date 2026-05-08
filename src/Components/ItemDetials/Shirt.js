import React, { useRef } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

const urduLabels = {
    chest: 'چھاتی',
    shoulders: 'کندھے',
    neck: 'گردن',
    sleeves: 'آستین',
    topLenght: 'قمیض',
    bottomLenght: 'پاجامہ',
    waist: 'کمر',
};

const englishLabels = {
    chest: 'Chest',
    shoulders: 'Shoulders',
    neck: 'Neck',
    sleeves: 'Sleeves',
    topLenght: 'Top Length',
    bottomLenght: 'Bottom Length',
    waist: 'Waist',
};

const measurementFields = ['chest', 'shoulders', 'neck', 'sleeves', 'topLenght', 'bottomLenght', 'waist'];

const MeasurementDetails = ({
    measurements, setMeasurements, customer,
    hasUploadedFile, setHasUploadedFile,
    uploadedFiles, setUploadedFiles,
    isUploading, setIsUploading,
    isLoading,
}) => {
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const handleMeasurementChange = (field, value) => {
        setMeasurements(prev => ({ ...prev, [field]: Number(value) }));
    };

    const handleStep = (field, delta) => {
        setMeasurements(prev => {
            const next = Number(((prev[field] || 0) + delta).toFixed(2));
            return { ...prev, [field]: Math.max(0, next) };
        });
    };

    const updateCustomerMeasurements = async () => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/customer/update/${customer}`, {
                measurements,
            });
            toast.success('Measurements updated successfully');
        } catch (error) {
            toast.error('Failed to update measurements');
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            for (const file of files) {
                if (!file.type.match('image.*') && !file.type.match('application/pdf')) {
                    toast.error('Only images and PDF files are allowed');
                    continue;
                }
                if (file.size > 5 * 1024 * 1024) {
                    toast.error('File size should be less than 5MB');
                    continue;
                }
                formData.append('files', file);
            }
            formData.append('customerId', customer);
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/customer/upload-measurement-files`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            if (response.data.success) {
                setUploadedFiles(prev => [...prev, ...response.data.files]);
                setHasUploadedFile(true);
                toast.success('Files uploaded successfully');
                if (response.data.extractedMeasurements) {
                    setMeasurements(response.data.extractedMeasurements);
                }
            }
        } catch {
            toast.error('Failed to upload files');
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = async (fileId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/customer/remove-measurement-file/${fileId}`);
            setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
            if (uploadedFiles.length <= 1) setHasUploadedFile(false);
            toast.success('File removed successfully');
        } catch {
            toast.error('Failed to remove file');
        }
    };

    return (
        <div className="space-y-8 font-body">
            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center gap-3 py-8">
                    <div className="w-6 h-6 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <span className="text-sm text-stone-400">Loading measurements…</span>
                </div>
            )}

            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
                <div>
                    <h2 className="text-2xl font-extrabold text-on-surface font-headline">Precision Measurements</h2>
                    <p className="text-sm text-stone-400 mt-1">All values in inches · step 0.25</p>
                </div>
                <button
                    onClick={updateCustomerMeasurements}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 transition-colors font-label"
                >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Save Measurements
                </button>
            </div>

            {/* Precision Measurement Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-5">
                {measurementFields.map((field) => (
                    <div key={field} className="group">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2 font-label">
                                {englishLabels[field]}
                                <span className="px-1.5 py-0.5 bg-surface-container-low rounded text-[10px] text-stone-400">
                                    INCHES
                                </span>
                            </label>
                            <span
                                className="text-2xl font-bold text-primary"
                                dir="rtl"
                                style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif" }}
                            >
                                {urduLabels[field]}
                            </span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={measurements[field] || ''}
                                onChange={(e) => handleMeasurementChange(field, e.target.value)}
                                placeholder="0.00"
                                step="0.25"
                                className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-xl font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:opacity-20 font-headline"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col">
                                <button
                                    type="button"
                                    onClick={() => handleStep(field, 0.25)}
                                    className="text-outline hover:text-primary transition-colors"
                                >
                                    <span className="material-symbols-outlined">expand_less</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStep(field, -0.25)}
                                    className="text-outline hover:text-primary transition-colors"
                                >
                                    <span className="material-symbols-outlined">expand_more</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Document Upload Section */}
            <div className="bg-surface-container-low rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant font-label">
                        Measurement Documents
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => fileInputRef.current.click()}
                            disabled={isUploading}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-bold rounded-full text-xs hover:bg-primary/90 transition-colors font-label disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[16px]">upload</span>
                            {isUploading ? 'Uploading…' : 'Upload Slip'}
                        </button>
                        <button
                            onClick={() => cameraInputRef.current.click()}
                            disabled={isUploading}
                            className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant/20 text-on-surface-variant font-bold rounded-full text-xs hover:bg-surface-container transition-colors font-label disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                            Take Photo
                        </button>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                />
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                />

                {hasUploadedFile && (
                    <div className="mb-4 p-3 bg-primary/5 rounded-xl flex items-start gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">info</span>
                        <p className="text-sm text-primary/80">
                            Measurement files uploaded. You can still edit measurements manually above.
                        </p>
                    </div>
                )}

                {uploadedFiles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {uploadedFiles.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10"
                            >
                                <div
                                    className="flex items-center gap-2 flex-1 cursor-pointer"
                                    onClick={() => window.open(file.url, '_blank')}
                                >
                                    {file.mimeType.includes('pdf') ? (
                                        <span className="material-symbols-outlined text-[20px] text-error">description</span>
                                    ) : (
                                        <img src={file.url} alt="Preview" className="w-10 h-10 object-cover rounded-lg" />
                                    )}
                                    <span className="text-sm truncate text-on-surface-variant">{file.name}</span>
                                </div>
                                <button
                                    onClick={() => removeFile(file.id)}
                                    className="p-1.5 rounded-lg hover:bg-error/5 hover:text-error transition-colors text-stone-400"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-6 flex flex-col items-center gap-2 text-stone-400">
                        <span className="material-symbols-outlined text-[40px] opacity-30">upload_file</span>
                        <p className="text-sm">No documents uploaded yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MeasurementDetails;
