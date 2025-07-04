import React, { useState, useEffect } from 'react';
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryBlogCounts,
    getBlogsByCategory
} from '../api/categories';
import { useNavigate } from 'react-router-dom';

const CategoryManagementPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'main',
        parentCategory: '',
        description: ''
    });
    const [blogCounts, setBlogCounts] = useState({ main: [], sub: [] });
    const [showBlogModal, setShowBlogModal] = useState(false);
    const [modalBlogs, setModalBlogs] = useState([]);
    const [modalCategory, setModalCategory] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
        fetchBlogCounts();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await getAllCategories();
            console.log('Fetched categories:', res.data);
            setCategories(res.data);
        } catch (err) {
            setError('Error fetching categories');
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBlogCounts = async () => {
        try {
            const res = await getCategoryBlogCounts();
            console.log('Fetched blog counts:', res.data);
            setBlogCounts(res.data);
        } catch (err) {
            setBlogCounts({ main: [], sub: [] });
            console.error('Error fetching blog counts:', err);
        }
    };

    const getCountForCategory = (catId, type) => {
        if (!catId) return 0;
        const arr = type === 'main' ? blogCounts.main : blogCounts.sub;
        const catIdStr = catId.toString();
        const found = arr.find(c => c._id && c._id.toString() === catIdStr);
        return found ? found.count : 0;
    };

    const getTotalBlogCount = () => {
        const mainTotal = blogCounts.main.reduce((sum, c) => sum + (c.count || 0), 0);
        const subTotal = blogCounts.sub.reduce((sum, c) => sum + (c.count || 0), 0);
        return mainTotal + subTotal;
    };

    const handleShowBlogs = async (category) => {
        try {
            const res = await getBlogsByCategory(category._id);
            setModalBlogs(res.data);
            setModalCategory(category);
            setShowBlogModal(true);
        } catch (err) {
            setModalBlogs([]);
            setModalCategory(category);
            setShowBlogModal(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await updateCategory(editingCategory._id, formData);
            } else {
                await createCategory(formData);
            }
            setShowForm(false);
            setEditingCategory(null);
            setFormData({ name: '', type: 'main', parentCategory: '', description: '' });
            fetchCategories();
            fetchBlogCounts(); // Re-fetch counts after category change
        } catch (err) {
            setError(err?.response?.data?.message || 'Error saving category');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            type: category.type,
            parentCategory: category.parentCategory?._id || '',
            description: category.description || ''
        });
        setShowEditModal(true);
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await deleteCategory(categoryId);
            fetchCategories();
            fetchBlogCounts(); // Re-fetch counts after category change
        } catch (err) {
            setError(err?.response?.data?.message || 'Error deleting category');
        }
    };

    const mainCategories = categories.filter(cat => cat.type === 'main');

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto mt-8 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Category Management</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Add Category
                </button>
            </div>

            {error && <div className="text-red-600 mb-4">{error}</div>}

            {/* Category Form */}
            {showForm && (
                <div className="bg-white p-6 rounded shadow mb-6">
                    <h2 className="text-xl font-bold mb-4">
                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block font-medium">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border p-2 rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full border p-2 rounded"
                            >
                                <option value="main">Main Category</option>
                                <option value="sub">Subcategory</option>
                            </select>
                        </div>
                        {formData.type === 'sub' && (
                            <div>
                                <label className="block font-medium">Parent Category</label>
                                <select
                                    value={formData.parentCategory}
                                    onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
                                    className="w-full border p-2 rounded"
                                    required
                                >
                                    <option value="">Select Parent Category</option>
                                    {mainCategories.map(cat => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block font-medium">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border p-2 rounded"
                                rows="3"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                {editingCategory ? 'Update' : 'Create'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingCategory(null);
                                    setFormData({ name: '', type: 'main', parentCategory: '', description: '' });
                                }}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories List */}
            <div className="bg-white rounded shadow">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">All Categories</h2>
                    <p className="text-lg font-bold mb-4">Total Blogs: {getTotalBlogCount()}</p>
                    <div className="space-y-4">
                        {categories.map(category => (
                            <div key={category._id} className="border p-4 rounded">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{category.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            Type: {category.type}
                                            {category.parentCategory && ` | Parent: ${category.parentCategory.name}`}
                                        </p>
                                        {/* {category.description && (
                                            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                                        )} */}
                                        <p className="text-sm text-gray-600 mt-2">
                                            {/* Blogs: <span className="font-medium">{getCountForCategory(category._id, category.type)}</span> */}
                                            <span className="cursor-pointer text-blue-600 hover:underline" onClick={() => handleShowBlogs(category)}>
                                                View Blogs
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category._id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit Category Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Edit Category</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block font-medium">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border p-2 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-medium">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full border p-2 rounded"
                                >
                                    <option value="main">Main Category</option>
                                    <option value="sub">Subcategory</option>
                                </select>
                            </div>
                            {formData.type === 'sub' && (
                                <div>
                                    <label className="block font-medium">Parent Category</label>
                                    <select
                                        value={formData.parentCategory}
                                        onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
                                        className="w-full border p-2 rounded"
                                        required
                                    >
                                        <option value="">Select Parent Category</option>
                                        {mainCategories.map(cat => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block font-medium">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border p-2 rounded"
                                    rows="3"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Update
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingCategory(null);
                                        setFormData({ name: '', type: 'main', parentCategory: '', description: '' });
                                    }}
                                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Blog Modal */}
            {showBlogModal && modalCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-full">
                        {/* <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Blogs for {modalCategory.name}</h3>
                            <button
                                onClick={() => navigate('/blogs/create', { state: { mainCategory: modalCategory._id } })}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                Create Blog
                            </button>
                        </div> */}
                        <div className="overflow-y-auto max-h-full">
                            {modalBlogs.length === 0 ? (
                                <p>No blogs found for this category.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {modalBlogs.map(blog => (
                                        <li key={blog._id} className="border p-3 rounded">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-semibold">{blog.title}</h4>
                                                    <div className="text-sm text-gray-600">
                                                        Status: <span className={blog.status === 'published' ? 'text-green-600' : 'text-yellow-600'}>{blog.status}</span>
                                                        {' | '}Main: {blog.mainCategory?.name || blog.mainCategory}
                                                        {' | '}Subcategories: {Array.isArray(blog.subcategories) && blog.subcategories.length > 0 ? blog.subcategories.map(sub => sub.name || sub).join(', ') : 'None'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Published: {blog.publishedDate ? new Date(blog.publishedDate).toLocaleDateString() : ''}</div>
                                                    <div className="text-xs text-gray-400">ID: {blog._id}</div>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/blogs/edit/${blog._id}`)}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ml-2"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button
                            onClick={() => setShowBlogModal(false)}
                            className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagementPage; 