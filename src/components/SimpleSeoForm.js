import React, { useState, useEffect } from 'react';
import { seoMetadataAPI } from '../api/seoMetadata';
import { toast } from 'react-hot-toast';

const SimpleSeoForm = ({
    pageIdentifier,
    pageName,
    onSave,
    onCancel,
    initialData = null,
    isInline = false
}) => {
    const [formData, setFormData] = useState({
        pageIdentifier: pageIdentifier || '',
        pageName: pageName || '',
        metaTitle: '',
        metaDescription: '',
        ogTitle: '',
        ogDescription: '',
        keywords: '',
        canonicalUrl: '',
        socialMediaImage: null
    });
    const [loading, setLoading] = useState(false);
    const [existingMetadata, setExistingMetadata] = useState(null);

    useEffect(() => {
        if (pageIdentifier) {
            fetchExistingMetadata();
        }
    }, [pageIdentifier]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                pageIdentifier: initialData.pageIdentifier || pageIdentifier || '',
                pageName: initialData.pageName || pageName || '',
                metaTitle: initialData.metaTitle || '',
                metaDescription: initialData.metaDescription || '',
                ogTitle: initialData.ogTitle || '',
                ogDescription: initialData.ogDescription || '',
                keywords: initialData.keywords?.join(', ') || '',
                canonicalUrl: initialData.canonicalUrl || '',
                socialMediaImage: null
            });
        }
    }, [initialData, pageIdentifier, pageName]);

    const fetchExistingMetadata = async () => {
        try {
            const response = await seoMetadataAPI.getByPage(pageIdentifier);
            setExistingMetadata(response.data);
            setFormData({
                pageIdentifier: response.data.pageIdentifier,
                pageName: response.data.pageName,
                metaTitle: response.data.metaTitle,
                metaDescription: response.data.metaDescription,
                ogTitle: response.data.ogTitle || '',
                ogDescription: response.data.ogDescription || '',
                keywords: response.data.keywords?.join(', ') || '',
                canonicalUrl: response.data.canonicalUrl || '',
                socialMediaImage: null
            });
        } catch (error) {
            // If no existing metadata, use defaults
            setFormData(prev => ({
                ...prev,
                pageIdentifier: pageIdentifier || '',
                pageName: pageName || ''
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            socialMediaImage: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'keywords') {
                    formDataToSend.append(key, formData[key].split(',').map(k => k.trim()));
                } else if (formData[key] !== null && formData[key] !== '') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            if (existingMetadata) {
                await seoMetadataAPI.update(existingMetadata._id, formDataToSend);
                toast.success('SEO metadata updated successfully');
            } else {
                await seoMetadataAPI.create(formDataToSend);
                toast.success('SEO metadata created successfully');
            }

            if (onSave) {
                onSave();
            }
        } catch (error) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    const containerClasses = isInline
        ? "bg-white rounded-lg shadow-sm p-4 border border-gray-200"
        : "bg-white rounded-lg shadow-sm p-6";

    return (
        <div className={containerClasses}>
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    SEO Settings
                </h3>
                <p className="text-sm text-gray-600">
                    Configure search engine optimization for this page
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Page Identifier
                        </label>
                        <input
                            type="text"
                            name="pageIdentifier"
                            value={formData.pageIdentifier}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., home, about, contact"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Page Name
                        </label>
                        <input
                            type="text"
                            name="pageName"
                            value={formData.pageName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Home Page, About Us"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Title * (Max 60 chars)
                    </label>
                    <input
                        type="text"
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleInputChange}
                        required
                        maxLength={60}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter meta title"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        {formData.metaTitle.length}/60 characters
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Description * (Max 160 chars)
                    </label>
                    <textarea
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleInputChange}
                        required
                        maxLength={160}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter meta description"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        {formData.metaDescription.length}/160 characters
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Keywords
                        </label>
                        <input
                            type="text"
                            name="keywords"
                            value={formData.keywords}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="keyword1, keyword2, keyword3"
                        />
                    </div>
                    <div>
                        <label className="label">
                            <span className="label-text">Social Media Image</span>
                        </label>
                        <input
                            type="file"
                            name="socialMediaImage"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="file-input file-input-bordered w-full"
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? 'Saving...' : (existingMetadata ? 'Update' : 'Create')}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-ghost"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default SimpleSeoForm;
