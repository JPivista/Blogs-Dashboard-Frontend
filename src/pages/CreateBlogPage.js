import React, { useState, useEffect } from 'react';
import { createBlog } from '../api/blogs';
import { getMainCategories, getSubcategories } from '../api/categories';
import { useNavigate } from 'react-router-dom';
import TinyMCEEditor from '../TinyMCEEditor';
import SimpleSeoForm from '../components/SimpleSeoForm';

function slugify(str) {
    return str
        .toLowerCase()
        .replace(/['’]/g, '') // remove apostrophes
        .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
        .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
        .replace(/--+/g, '-'); // collapse multiple hyphens
}

const CreateBlogPage = () => {
    const [form, setForm] = useState({
        title: '',
        slug: '',
        description: '',
        metaTitle: '',
        metaDescription: '',
        publishedDate: new Date().toISOString().slice(0, 16),
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
    const [mainCategories, setMainCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [showSeoForm, setShowSeoForm] = useState(false);
    const navigate = useNavigate();
    const [slugTouched, setSlugTouched] = useState(false);

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
        if (form.slug === '') {
            setSlugTouched(false);
        }
    }, [form.slug]);

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

    const handleSeoSave = () => {
        setShowSeoForm(false);
        // You can add a success message or other actions here
    };

    const handleSeoCancel = () => {
        setShowSeoForm(false);
    };

    // Generate a unique page identifier for this blog
    const generatePageIdentifier = () => {
        if (form.slug) {
            return `blog-${form.slug}`;
        }
        return `blog-${slugify(form.title)}`;
    };

    const handleChange = (e) => {
        const { name, value, files, options, type, checked } = e.target;
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
            setSlugTouched(true);
        } else if (name === 'title') {
            setForm((prev) => {
                const newTitle = value;
                let newSlug = prev.slug;
                if (!slugTouched && !newSlug) {
                    newSlug = slugify(newTitle);
                }
                return { ...prev, title: newTitle, slug: newSlug };
            });
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = {
                ...form,
                tags: form.tags.split(/[,#]/).map(t => t.trim()).filter(Boolean),
            };
            const res = await createBlog(data);
            const blog = res.data;
            // Redirect to edit page for the new blog
            navigate(`/blogs/edit/${blog.slug || blog._id}`);
        } catch (err) {
            setError(err?.response?.data?.message || 'Error creating blog');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full mx-auto mt-8 bg-white p-6 rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Create Blog</h1>
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
                        <TinyMCEEditor
                            value={form.description}
                            onChange={desc => setForm(prev => ({ ...prev, description: desc }))}
                        />
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
                {/* Right side: Published Date, Status, and Responsive Images */}
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
                            className={`w-full border p-2 rounded font-semibold ${form.status === 'published' ? 'text-green-600' : 'text-red-600'}`}
                        >
                            <option value="draft" className="text-red-600">Draft</option>
                            <option value="published" className="text-green-600">Published</option>
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
                                    <div className="w-40 h-12 flex items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-lg">
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

                {/* SEO Section */}
                <div className="md:col-span-3">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">SEO Optimization</h3>
                            <button
                                type="button"
                                onClick={() => setShowSeoForm(!showSeoForm)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {showSeoForm ? 'Hide SEO Form' : 'Configure Advanced SEO'}
                            </button>
                        </div>

                        {showSeoForm ? (
                            <SimpleSeoForm
                                pageIdentifier={generatePageIdentifier()}
                                pageName={form.title || 'New Blog Post'}
                                onSave={handleSeoSave}
                                onCancel={handleSeoCancel}
                                isInline={true}
                            />
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>Click "Configure Advanced SEO" to set up comprehensive SEO metadata</p>
                                <p className="text-sm mt-2">Includes Meta Title, Meta Description, Keywords, and Social Media Image</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Blog'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateBlogPage; 