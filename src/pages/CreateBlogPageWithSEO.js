import React, { useState, useEffect } from 'react';
import { createBlog } from '../api/blogs';
import { getMainCategories, getSubcategories } from '../api/categories';
import { useNavigate } from 'react-router-dom';
import TinyMCEEditor from '../TinyMCEEditor';
import SeoMetadataForm from '../components/SeoMetadataForm';

function slugify(str) {
    return str
        .toLowerCase()
        .replace(/['']/g, '') // remove apostrophes
        .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
        .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
        .replace(/--+/g, '-'); // collapse multiple hyphens
}

const CreateBlogPageWithSEO = () => {
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
            setForm((prev) => ({ ...prev, title: value }));
            // Auto-generate slug if not manually edited
            if (!slugTouched) {
                setForm((prev) => ({ ...prev, slug: slugify(value) }));
            }
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.mainCategory) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('slug', form.slug);
            formData.append('description', form.description);
            formData.append('metaTitle', form.metaTitle);
            formData.append('metaDescription', form.metaDescription);
            formData.append('publishedDate', form.publishedDate);
            formData.append('status', form.status);
            formData.append('mainCategory', form.mainCategory);
            formData.append('tags', form.tags);

            if (form.banner) formData.append('banner', form.banner);
            if (form.thumbnail) formData.append('thumbnail', form.thumbnail);
            if (form.mobileBanner) formData.append('mobileBanner', form.mobileBanner);

            form.subcategories.forEach((sub) => {
                formData.append('subcategories', sub);
            });

            await createBlog(formData);
            navigate('/blogs');
        } catch (err) {
            setError(err.message || 'Failed to create blog');
        } finally {
            setLoading(false);
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

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Create New Blog Post
                    </h1>
                    <p className="text-gray-600">
                        Create a new blog post with comprehensive SEO optimization
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Blog Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Blog Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter blog title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={form.slug}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="blog-post-url"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Leave empty to auto-generate from title
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <TinyMCEEditor
                                value={form.description}
                                onChange={(content) => setForm(prev => ({ ...prev, description: content }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Main Category *
                                </label>
                                <select
                                    name="mainCategory"
                                    value={form.mainCategory}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select a category</option>
                                    {mainCategories.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tags
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={form.tags}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="tag1, tag2, tag3"
                            />
                        </div>
                    </div>

                    {/* SEO Metadata Section */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">SEO Optimization</h2>
                            <button
                                type="button"
                                onClick={() => setShowSeoForm(!showSeoForm)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {showSeoForm ? 'Hide SEO Form' : 'Configure SEO'}
                            </button>
                        </div>

                        {showSeoForm ? (
                            <SeoMetadataForm
                                pageIdentifier={generatePageIdentifier()}
                                pageName={form.title || 'New Blog Post'}
                                onSave={handleSeoSave}
                                onCancel={handleSeoCancel}
                                isInline={true}
                            />
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>Click "Configure SEO" to set up Meta Title, Meta Description,</p>
                                <p>OG Title, OG Description, and Social Media Image for this blog post.</p>
                            </div>
                        )}
                    </div>

                    {/* Media Upload Section */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Media</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Banner Image
                                </label>
                                <input
                                    type="file"
                                    name="banner"
                                    onChange={handleChange}
                                    accept="image/*"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thumbnail
                                </label>
                                <input
                                    type="file"
                                    name="thumbnail"
                                    onChange={handleChange}
                                    accept="image/*"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mobile Banner
                                </label>
                                <input
                                    type="file"
                                    name="mobileBanner"
                                    onChange={handleChange}
                                    accept="image/*"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Blog Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBlogPageWithSEO;
