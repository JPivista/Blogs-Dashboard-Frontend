import React, { useState, useEffect } from 'react';
import { seoMetadataAPI } from '../api/seoMetadata';
import { toast } from 'react-hot-toast';

const SeoEditorById = ({ seoId, onSave, onCancel, showForm = true }) => {
    const [seoData, setSeoData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        pageIdentifier: '',
        pageName: '',
        metaTitle: '',
        metaDescription: '',
        ogTitle: '',
        ogDescription: '',
        keywords: '',
        canonicalUrl: '',
        socialMediaImage: null
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (seoId) {
            fetchSeoDataById();
        }
    }, [seoId]);

    const fetchSeoDataById = async () => {
        try {
            setLoading(true);
            const response = await seoMetadataAPI.getById(seoId);

            if (response.data) {
                setSeoData(response.data);
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
            } else {
                toast.error('SEO metadata not found with this ID');
            }
        } catch (error) {
            toast.error('Failed to fetch SEO data');
        } finally {
            setLoading(false);
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

            if (seoData) {
                await seoMetadataAPI.update(seoId, formDataToSend);
                toast.success('SEO metadata updated successfully');
                setIsEditing(false);
                await fetchSeoDataById(); // Refresh data
            } else {
                toast.error('No SEO data to update');
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

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (seoData) {
            // Reset to original data
            setFormData({
                pageIdentifier: seoData.pageIdentifier,
                pageName: seoData.pageName,
                metaTitle: seoData.metaTitle,
                metaDescription: seoData.metaDescription,
                ogTitle: seoData.ogTitle || '',
                ogDescription: seoData.ogDescription || '',
                keywords: seoData.keywords?.join(', ') || '',
                canonicalUrl: seoData.canonicalUrl || '',
                socialMediaImage: null
            });
        }
        if (onCancel) {
            onCancel();
        }
    };

    const handleDelete = async () => {
        if (!seoData) return;

        if (window.confirm('Are you sure you want to delete this SEO metadata?')) {
            try {
                await seoMetadataAPI.delete(seoId);
                toast.success('SEO metadata deleted successfully');
                setSeoData(null);
                setFormData({
                    pageIdentifier: '',
                    pageName: '',
                    metaTitle: '',
                    metaDescription: '',
                    ogTitle: '',
                    ogDescription: '',
                    keywords: '',
                    canonicalUrl: '',
                    socialMediaImage: null
                });
            } catch (error) {
                toast.error(error.message || 'Delete failed');
            }
        }
    };

    if (loading) {
        return (
            <div className="p-4 bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-center mt-2 text-gray-600">Loading SEO data...</p>
            </div>
        );
    }

    if (!seoData) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-center">SEO metadata not found with ID: {seoId}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            SEO Editor by ID
                        </h3>
                        <p className="text-sm text-gray-600">
                            Page: {seoData.pageName} ({seoData.pageIdentifier})
                        </p>
                        <p className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded mt-1">
                            ID: {seoId}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {!isEditing && (
                            <>
                                <button
                                    onClick={handleEdit}
                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* SEO Data Display */}
            {!isEditing && (
                <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                            <p className="text-sm text-gray-900">{seoData.metaTitle}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                            <p className="text-sm text-gray-900">{seoData.metaDescription}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Keywords</label>
                            <p className="text-sm text-gray-900">{seoData.keywords?.join(', ') || 'None'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Canonical URL</label>
                            <p className="text-sm text-gray-900">{seoData.canonicalUrl || 'None'}</p>
                        </div>
                    </div>
                    {seoData.socialMediaImage && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Social Media Image</label>
                            <img
                                src={seoData.socialMediaImage}
                                alt="Social Media"
                                className="w-32 h-32 object-cover rounded mt-1"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* SEO Form */}
            {isEditing && (
                <div className="p-4">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Social Media Image
                                </label>
                                <input
                                    type="file"
                                    name="socialMediaImage"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save SEO'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SeoEditorById;
