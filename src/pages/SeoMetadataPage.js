import React, { useState, useEffect } from 'react';
import { seoMetadataAPI } from '../api/seoMetadata';
import { toast } from 'react-hot-toast';

const SeoMetadataPage = () => {
    const [seoMetadata, setSeoMetadata] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showBulkEdit, setShowBulkEdit] = useState(false);

    // Form state
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

    useEffect(() => {
        fetchSeoMetadata();
    }, [currentPage, searchTerm]);

    const fetchSeoMetadata = async () => {
        try {
            setLoading(true);
            const response = await seoMetadataAPI.getAll({
                page: currentPage,
                limit: 10,
                search: searchTerm
            });
            setSeoMetadata(response.data);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            console.error('SEO Metadata fetch error:', error);

            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
                // The auth interceptor will handle the logout
            } else {
                toast.error(error.message || 'Failed to fetch SEO metadata');
            }
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

            if (editingItem) {
                await seoMetadataAPI.update(editingItem._id, formDataToSend);
                toast.success('SEO metadata updated successfully');
            } else {
                await seoMetadataAPI.create(formDataToSend);
                toast.success('SEO metadata created successfully');
            }

            resetForm();
            fetchSeoMetadata();
        } catch (error) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            pageIdentifier: item.pageIdentifier,
            pageName: item.pageName,
            metaTitle: item.metaTitle,
            metaDescription: item.metaDescription,
            ogTitle: item.ogTitle || '',
            ogDescription: item.ogDescription || '',
            keywords: item.keywords?.join(', ') || '',
            canonicalUrl: item.canonicalUrl || '',
            socialMediaImage: null
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this SEO metadata?')) {
            try {
                await seoMetadataAPI.delete(id);
                toast.success('SEO metadata deleted successfully');
                fetchSeoMetadata();
            } catch (error) {
                toast.error(error.message || 'Delete failed');
            }
        }
    };

    const resetForm = () => {
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
        setEditingItem(null);
        setShowForm(false);
    };

    const handleBulkAction = async (action) => {
        if (selectedItems.length === 0) {
            toast.error('Please select items first');
            return;
        }

        try {
            setLoading(true);
            const updates = selectedItems.map(id => ({
                id,
                updates: { isActive: action === 'activate' }
            }));

            await seoMetadataAPI.bulkUpdate(updates);
            toast.success(`Bulk ${action} completed`);
            setSelectedItems([]);
            fetchSeoMetadata();
        } catch (error) {
            toast.error(error.message || 'Bulk operation failed');
        } finally {
            setLoading(false);
        }
    };

    const toggleItemSelection = (id) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === seoMetadata.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(seoMetadata.map(item => item._id));
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        SEO Metadata Management
                    </h1>
                    <p className="text-gray-600">
                        Manage Meta Title, Meta Description, OG Title, OG Description, and Social Media Images for all pages
                    </p>
                </div>

                {/* Search and Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search by page identifier, name, or title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowForm(true)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add New SEO
                            </button>
                            {selectedItems.length > 0 && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleBulkAction('activate')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Activate Selected
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('deactivate')}
                                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                                    >
                                        Deactivate Selected
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SEO Form */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                {editingItem ? 'Edit SEO Metadata' : 'Add New SEO Metadata'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Page Identifier *
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
                                        Page Name *
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
                                        OG Title (Max 60 chars)
                                    </label>
                                    <input
                                        type="text"
                                        name="ogTitle"
                                        value={formData.ogTitle}
                                        onChange={handleInputChange}
                                        maxLength={60}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Leave empty to use Meta Title"
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formData.ogTitle.length}/60 characters
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        OG Description (Max 160 chars)
                                    </label>
                                    <textarea
                                        name="ogDescription"
                                        value={formData.ogDescription}
                                        onChange={handleInputChange}
                                        maxLength={160}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Leave empty to use Meta Description"
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formData.ogDescription.length}/160 characters
                                    </div>
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
                                        Canonical URL
                                    </label>
                                    <input
                                        type="url"
                                        name="canonicalUrl"
                                        value={formData.canonicalUrl}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://example.com/page"
                                    />
                                </div>
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
                                <div className="text-xs text-gray-500 mt-1">
                                    Recommended size: 1200x630px, Max: 5MB
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* SEO Metadata List */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={selectedItems.length === seoMetadata.length && seoMetadata.length > 0}
                                onChange={toggleSelectAll}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Select All ({selectedItems.length} selected)
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading...</p>
                        </div>
                    ) : seoMetadata.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No SEO metadata found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Select
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Page Info
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Meta Title
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Meta Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {seoMetadata.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item._id)}
                                                    onChange={() => toggleItemSelection(item._id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.pageName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {item.pageIdentifier}
                                                    </div>
                                                    <div className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded mt-1">
                                                        ID: {item._id}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {item.metaTitle}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {item.metaDescription}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {item.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="text-red-600 hover:text-red-900 mr-3"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(item._id);
                                                        toast.success('ID copied to clipboard!');
                                                    }}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Copy ID"
                                                >
                                                    Copy ID
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeoMetadataPage;
