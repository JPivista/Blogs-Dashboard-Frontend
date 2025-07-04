import React, { useState, useEffect, useRef } from 'react';
import { getBlog, updateBlog, deleteBlog } from '../api/blogs';
import { getMainCategories, getSubcategories } from '../api/categories';
import { useNavigate, useParams } from 'react-router-dom';

function slugify(str) {
    return str
        .toLowerCase()
        .replace(/['’]/g, '') // remove apostrophes
        .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
        .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
        .replace(/--+/g, '-'); // collapse multiple hyphens
}

const EditBlogPage = () => {
    const [form, setForm] = useState({
        title: '',
        description: '',
        metaTitle: '',
        metaDescription: '',
        publishedDate: '',
        status: 'draft',
        banner: null,
        thumbnail: null,
        mobileBanner: null,
        mainCategory: '',
        subcategories: [],
        tags: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [original, setOriginal] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [successCountdown, setSuccessCountdown] = useState(0);
    const [prevSlug, setPrevSlug] = useState('');
    const [showAllUpdates, setShowAllUpdates] = useState(false);
    const [mainCategories, setMainCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const navigate = useNavigate();
    const { idOrSlug } = useParams();

    // Function to format relative date
    const formatRelativeDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInSeconds = Math.floor(diffInMs / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        const diffInWeeks = Math.floor(diffInDays / 7);
        const diffInMonths = Math.floor(diffInDays / 30);
        const diffInYears = Math.floor(diffInDays / 365);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return diffInMinutes === 1 ? '1 min ago' : `${diffInMinutes} mins ago`;
        } else if (diffInHours < 24) {
            return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
        } else if (diffInDays === 1) {
            return 'Yesterday';
        } else if (diffInDays < 7) {
            return `${diffInDays} days ago`;
        } else if (diffInWeeks === 1) {
            return '1 week ago';
        } else if (diffInWeeks < 4) {
            return `${diffInWeeks} weeks ago`;
        } else if (diffInMonths === 1) {
            return '1 month ago';
        } else if (diffInMonths < 12) {
            return `${diffInMonths} months ago`;
        } else if (diffInYears === 1) {
            return '1 year ago';
        } else {
            return `${diffInYears} years ago`;
        }
    };

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch subcategories when main category changes
    useEffect(() => {
        if (form.mainCategory) {
            fetchSubcategories(form.mainCategory);
        } else {
            setSubcategories([]);
        }
    }, [form.mainCategory]);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await getBlog(idOrSlug);
                const blogData = res.data;
                const normalized = {
                    ...blogData,
                    publishedDate: blogData.publishedDate ? new Date(blogData.publishedDate).toISOString().slice(0, 16) : '',
                    status: blogData.status || 'draft',
                    mainCategory: blogData.mainCategory?._id || blogData.mainCategory || '',
                    subcategories: blogData.subcategories?.map(sub => sub._id || sub) || [],
                    tags: Array.isArray(blogData.tags) ? blogData.tags.join(', ') : (blogData.tags || ''),
                };
                setForm(normalized);
                setOriginal(normalized);
                setPrevSlug(blogData.slug);
            } catch (err) {
                setError('Failed to fetch blog post');
            }
        };
        fetchBlog();
    }, [idOrSlug]);

    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);
            const res = await getMainCategories();
            setMainCategories(res.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const fetchSubcategories = async (mainCategoryId) => {
        try {
            const res = await getSubcategories(mainCategoryId);
            setSubcategories(res.data);
        } catch (err) {
            console.error('Error fetching subcategories:', err);
            setSubcategories([]);
        }
    };

    const handleChange = (e) => {
        const { name, value, files, type, checked } = e.target;
        if (files) {
            setForm((prev) => ({ ...prev, [name]: files[0] }));
        } else if (name === 'subcategories') {
            if (type === 'checkbox') {
                setForm((prev) => {
                    const newSubs = checked
                        ? [...prev.subcategories, value]
                        : prev.subcategories.filter((sub) => sub !== value);
                    return { ...prev, subcategories: newSubs };
                });
            } else {
                setForm((prev) => ({ ...prev, subcategories: value }));
            }
        } else if (name === 'slug') {
            setForm((prev) => ({ ...prev, slug: slugify(value) }));
        } else if (name === 'title') {
            setForm((prev) => {
                const newTitle = value;
                let newSlug = prev.slug;
                if (!prev.slug || prev.slug === slugify(original?.title || '')) {
                    newSlug = slugify(newTitle);
                }
                return { ...prev, title: newTitle, slug: newSlug };
            });
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Deep compare arrays (order-insensitive)
    function arraysEqual(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) return false;
        if (a.length !== b.length) return false;
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        return sortedA.every((v, i) => v === sortedB[i]);
    }

    // Check if form is dirty (has unsaved changes)
    const isDirty = original && (
        form.title !== original.title ||
        form.description !== original.description ||
        form.metaTitle !== original.metaTitle ||
        form.metaDescription !== original.metaDescription ||
        form.publishedDate !== original.publishedDate ||
        form.status !== original.status ||
        form.mainCategory !== original.mainCategory ||
        !arraysEqual(form.subcategories, original.subcategories) ||
        (Array.isArray(original.tags)
            ? form.tags.split(/[,#]/).map(t => t.trim()).filter(Boolean).join(',') !== original.tags.join(',')
            : form.tags !== original.tags)
        // Note: file fields (banner, thumbnail, mobileBanner) are not compared for dirty state
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = {
                ...form,
            };
            await updateBlog(idOrSlug, data);
            const res = await getBlog(form.slug);
            const blogData = res.data;
            const normalized = {
                ...blogData,
                publishedDate: blogData.publishedDate ? new Date(blogData.publishedDate).toISOString().slice(0, 16) : '',
                status: blogData.status || 'draft',
                mainCategory: blogData.mainCategory?._id || blogData.mainCategory || '',
                subcategories: blogData.subcategories?.map(sub => sub._id || sub) || [],
                tags: Array.isArray(blogData.tags) ? blogData.tags.join(', ') : (blogData.tags || ''),
            };
            setForm(normalized);
            setOriginal(normalized);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setSuccessMsg('Blog updated successfully');
            setSuccessCountdown(5);
            let countdown = 5;
            const interval = setInterval(() => {
                countdown -= 1;
                setSuccessCountdown(countdown);
                if (countdown <= 0) {
                    clearInterval(interval);
                    setSuccessMsg('');
                }
            }, 1000);
            if (form.slug !== prevSlug) {
                setPrevSlug(form.slug);
                navigate(`/blogs/edit/${form.slug}`, { replace: true });
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Error updating blog');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) return;
        setDeleteLoading(true);
        setError('');
        try {
            await deleteBlog(idOrSlug);
            navigate('/blogs');
        } catch (err) {
            setError(err?.response?.data?.message || 'Error deleting blog');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <>
            {/* Success Toast Popup */}
            {successMsg && (
                <div
                    className={`fixed top-6 right-6 z-50 flex items-center px-6 py-3 rounded shadow-lg bg-green-500 text-white font-semibold transition-transform duration-500 ease-in-out
                        ${successMsg ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
                    style={{ minWidth: '260px' }}
                >
                    <span className="mr-2">{successMsg}</span>
                    {successCountdown > 0 && (
                        <span className="ml-2 bg-green-700 rounded-full px-2 py-0.5 text-xs font-bold animate-pulse">
                            {successCountdown}
                        </span>
                    )}
                </div>
            )}
            <div className="w-full mx-auto mt-8 bg-white p-6 rounded shadow">
                <h1 className="text-2xl font-bold mb-4">Edit Blog</h1>
                {error && <div className="text-red-600 mb-2">{error}</div>}
                <form onSubmit={handleSubmit} className="grid grid-cols- md:grid-cols-3 gap-8">
                    {/* Left side: Text fields */}
                    <div className="space-y-4 col-span-2">
                        <div>
                            <label className="block font-medium">Title</label>
                            <input name="title" value={form.title} onChange={handleChange} className="w-full border p-2 rounded" required />
                        </div>
                        <div>
                            <label className="block font-medium">Slug</label>
                            <input name="slug" value={form.slug} onChange={handleChange} className="w-full border p-2 rounded" required />
                        </div>
                        <div>
                            <label className="block font-medium">Description (HTML allowed)</label>
                            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border p-2 rounded h-32" required />
                        </div>
                        <div>
                            <label className="block font-medium">Meta Title</label>
                            <input name="metaTitle" value={form.metaTitle} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block font-medium">Meta Description</label>
                            <input name="metaDescription" value={form.metaDescription} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block font-medium">Main Category</label>
                            <div className="flex items-center gap-2">
                                <select
                                    name="mainCategory"
                                    value={form.mainCategory}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded"
                                    required
                                    disabled={categoriesLoading}
                                >
                                    <option value="">Select Main Category</option>
                                    {mainCategories.map(cat => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={fetchCategories}
                                    className="ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
                                    title="Refresh categories"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block font-medium">Subcategories</label>
                            <div className="flex flex-wrap gap-2">
                                {subcategories.map(sub => (
                                    <label key={sub._id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name="subcategories"
                                            value={sub._id}
                                            checked={form.subcategories.includes(sub._id)}
                                            onChange={handleChange}
                                            className="form-checkbox"
                                        />
                                        <span>{sub.name}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="text-xs text-gray-500">Select one or more subcategories</div>
                        </div>
                        <div>
                            <label className="block font-medium">Tags (comma or # separated)</label>
                            <input name="tags" value={form.tags} onChange={handleChange} className="w-full border p-2 rounded" placeholder="#acne, #skin care, #scar treatment" />
                        </div>
                    </div>
                    {/* Right side: Responsive Images and Published Date */}
                    <div className="space-y-6 bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div>
                            <label className="block font-medium">Published Date</label>
                            <input name="publishedDate" type="datetime-local" value={form.publishedDate} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block font-medium">Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                        <h3 className="font-bold mb-4 text-lg text-gray-700">Responsive Images</h3>
                        {[
                            { key: 'banner', label: 'Desktop Image', required: true },
                            { key: 'thumbnail', label: 'Tablet Image' },
                            { key: 'mobileBanner', label: 'Mobile Image' },
                        ].map(({ key, label, required }) => (
                            <div key={key} className="mb-6">
                                <label className="block font-medium mb-2">
                                    {label} {required && <span className="text-red-500">*</span>}
                                </label>
                                <div className="flex flex-col items-start gap-2">
                                    <div className="w-full flex justify-start">
                                        <div className="w-40 h-28 flex items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-lg">
                                            {form[key] ? (
                                                <img
                                                    src={typeof form[key] === 'string' ? form[key] : URL.createObjectURL(form[key])}
                                                    alt={`${label} preview`}
                                                    className="max-h-24 max-w-full rounded"
                                                />
                                            ) : (
                                                <span className="text-gray-400 text-sm">No image selected</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id={`image-${key}`}
                                            style={{ display: 'none' }}
                                            name={key}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="border border-blue-500 text-blue-600 bg-blue-50 px-4 py-1 rounded hover:bg-blue-100 font-semibold transition"
                                            onClick={() => document.getElementById(`image-${key}`).click()}
                                        >
                                            {form[key] ? 'Change Image' : 'Add Image'}
                                        </button>
                                        {form[key] && (
                                            <button
                                                type="button"
                                                className="border border-red-400 text-red-600 bg-red-50 px-4 py-1 rounded hover:bg-red-100 font-semibold transition"
                                                onClick={() => setForm(prev => ({ ...prev, [key]: null }))}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="md:col-span-2 flex gap-4">
                        <button
                            type="submit"
                            className={`px-4 py-2 rounded text-white transition-colors
                                ${loading || !isDirty
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}
                            disabled={loading || !isDirty}
                            style={{ pointerEvents: loading || !isDirty ? 'auto' : undefined }}
                        >
                            {loading ? 'Updating...' : 'Update Blog'}
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className={`px-4 py-2 rounded text-white transition-colors
                                ${deleteLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 cursor-pointer'}`}
                            disabled={deleteLoading}
                            style={{ pointerEvents: deleteLoading ? 'auto' : undefined }}
                        >
                            {deleteLoading ? 'Deleting...' : 'Delete Blog'}
                        </button>
                    </div>
                </form>
            </div>
            {/* Update History */}
            {form.updates && Array.isArray(form.updates) && form.updates.length > 0 && (() => {
                // Sort updates in descending order by date
                const sortedUpdates = [...form.updates].sort((a, b) => new Date(b.date) - new Date(a.date));
                const updatesToShow = showAllUpdates ? sortedUpdates : sortedUpdates.slice(0, 20);
                return (
                    <div className="w-full mx-auto mt-8 bg-gray-50 p-4 rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">Update History</h2>
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                            {updatesToShow.map((update, idx) => (
                                <li key={idx}>
                                    <span className="font-mono text-xs text-gray-500 mr-2">{formatRelativeDate(update.date)}</span>
                                    {update.change}
                                </li>
                            ))}
                        </ul>
                        {form.updates.length > 20 && (
                            <button
                                className="mt-2 text-blue-600 text-xs underline hover:text-blue-800"
                                onClick={() => setShowAllUpdates(v => !v)}
                            >
                                {showAllUpdates ? 'Show Less' : 'View More'}
                            </button>
                        )}
                    </div>
                );
            })()}
        </>
    );
};

export default EditBlogPage; 