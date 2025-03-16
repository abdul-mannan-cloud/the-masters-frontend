import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Upload, FileText, Camera, X, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const MeasurementDetails = ({ measurements, setMeasurements, customer,hasUploadedFile,setHasUploadedFile,uploadedFiles,setUploadedFiles,isUploading,setIsUploading,isLoading,setIsLoading }) => {
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    // Fetch customer's measurements and files when the component mounts or customer changes


    const handleMeasurementChange = (field, value) => {
        setMeasurements(prev => ({
            ...prev,
            [field]: Number(value)
        }));
    };

    const updateCustomerMeasurements = async () => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/customer/update/${customer}`, {
                measurements: measurements
            });
            toast.success('Measurements updated successfully');
        } catch (error) {
            console.error('Failed to update measurements:', error);
            toast.error('Failed to update measurements');
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);

        try {
            const formData = new FormData();

            files.forEach(file => {
                // Check file type
                if (!file.type.match('image.*') && !file.type.match('application/pdf')) {
                    toast.error('Only images and PDF files are allowed');
                    return;
                }

                // Check file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error('File size should be less than 5MB');
                    return;
                }

                formData.append('files', file);
            });

            formData.append('customerId', customer);

            // Upload to server
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/customer/upload-measurement-files`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (response.data.success) {
                // Merge new files with existing ones
                setUploadedFiles(prev => [...prev, ...response.data.files]);
                setHasUploadedFile(true);
                toast.success('Files uploaded successfully');

                // If you have OCR set up on the backend, measurements might be returned
                if (response.data.extractedMeasurements) {
                    setMeasurements(response.data.extractedMeasurements);
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload files');
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = async (fileId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/customer/remove-measurement-file/${fileId}`);

            setUploadedFiles(prev => prev.filter(file => file.id !== fileId));

            if (uploadedFiles.length <= 1) {
                setHasUploadedFile(false);
            }

            toast.success('File removed successfully');
        } catch (error) {
            toast.error('Failed to remove file');
        }
    };

    const takePhoto = () => {
        cameraInputRef.current.click();
    };

    // Handle viewing PDF files
    const viewFile = (file) => {
        if (file.mimeType.includes('pdf')) {
            // Open PDF in new tab
            window.open(file.url, '_blank');
        } else {
            // Open image in new tab
            window.open(file.url, '_blank');
        }
    };

    return (
        <div className="space-y-6">
            {isLoading && (
                <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-blue-500 animate-spin mr-2" />
                    <span>Loading measurement data...</span>
                </div>
            )}

            {/* File Upload Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Measurement Document</h3>

                <div className="flex flex-col space-y-4">
                    <div className="flex space-x-3">
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="flex-1 py-3 px-4 bg-yellow-400 text-white font-medium rounded-lg
                hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                            disabled={isUploading}
                        >
                            <Upload className="w-5 h-5" />
                            {isUploading ? 'Uploading...' : 'Upload Measurement Slip'}
                        </button>

                        <button
                            onClick={takePhoto}
                            className="py-3 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg
                hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                            disabled={isUploading}
                        >
                            <Camera className="w-5 h-5" />
                            Take Photo
                        </button>
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

                    {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-3">
                            <h4 className="font-medium">Uploaded Files:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {uploadedFiles.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                        <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => viewFile(file)}>
                                            {file.mimeType.includes('pdf') ? (
                                                <FileText className="w-5 h-5 text-red-500" />
                                            ) : (
                                                <img
                                                    src={file.url}
                                                    alt="Preview"
                                                    className="w-12 h-12 object-cover rounded-md"
                                                />
                                            )}
                                            <span className="text-sm truncate">{file.name}</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile(file.id)}
                                            className="p-1 hover:bg-gray-100 rounded-full"
                                        >
                                            <X className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Manual Measurements Section - always visible but with note if files uploaded */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Manual Measurements (inches)</h3>
                    <button
                        onClick={updateCustomerMeasurements}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Save Measurements
                    </button>
                </div>

                {hasUploadedFile && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                        <p className="text-sm text-blue-700">
                            Measurement files are uploaded. You can still edit measurements manually below if needed.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chest</label>
                        <input
                            type="number"
                            value={measurements.chest || ''}
                            onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shoulders</label>
                        <input
                            type="number"
                            value={measurements.shoulders || ''}
                            onChange={(e) => handleMeasurementChange('shoulders', e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Neck</label>
                        <input
                            type="number"
                            value={measurements.neck || ''}
                            onChange={(e) => handleMeasurementChange('neck', e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sleeves</label>
                        <input
                            type="number"
                            value={measurements.sleeves || ''}
                            onChange={(e) => handleMeasurementChange('sleeves', e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Top Length</label>
                        <input
                            type="number"
                            value={measurements.topLenght || ''}
                            onChange={(e) => handleMeasurementChange('topLenght', e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bottom Length</label>
                        <input
                            type="number"
                            value={measurements.bottomLenght || ''}
                            onChange={(e) => handleMeasurementChange('bottomLenght', e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Waist</label>
                        <input
                            type="number"
                            value={measurements.waist || ''}
                            onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeasurementDetails;