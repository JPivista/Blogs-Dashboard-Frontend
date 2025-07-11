import React, { useEffect, useState } from 'react';
import { listBlogs, deleteBlog, updateBlog } from '../api/blogs';
import { getMainCategories } from '../api/categories';
import { useNavigate } from 'react-router-dom';

const mockUserId = 'me'; // Replace with real user id from auth if available

const StatusDropdown = ({ value, onChange }) => (
    <div className="flex flex-col items-start">
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`font-semibold px-2 py-1 rounded border focus:outline-none ${value === 'published' ? 'text-green-600' : 'text-red-600'
                }`}
        >
            <option value="published" className="text-green-600">Published</option>
            <option value="draft" className="text-red-600">Draft</option>
        </select>
        {/* <div className="text-xs mt-1 font-semibold">
            {value === 'published' ? (
                <span className="text-green-600">Published</span>
            ) : (
                <span className="text-red-600">Draft</span>
            )}
        </div> */}
    </div>
);

const getMonthYearOptions = (blogs) => {
    const options = new Set();
    blogs.forEach(blog => {
        if (blog.publishedDate) {
            const d = new Date(blog.publishedDate);
            options.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
    });
    return Array.from(options).sort((a, b) => b.localeCompare(a));
};

const BlogsListPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [mainCategories, setMainCategories] = useState([]);
    const [dateFilter, setDateFilter] = useState('all');
    const [tab, setTab] = useState('all');
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const navigate = useNavigate();

    // For demo, mock current user id as 'me'. Replace with real user id from auth.
    const currentUserId = mockUserId;

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const res = await listBlogs();
                setBlogs(res.data.blogs || res.data);
            } catch (err) {
                setBlogs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getMainCategories();
                setMainCategories(res.data);
            } catch (err) {
                setMainCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Tabs logic
    const getTabCounts = () => {
        let mine = 0, published = 0, draft = 0;
        blogs.forEach(blog => {
            if (blog.createdBy?._id === currentUserId || blog.createdBy === currentUserId) mine++;
            if (blog.status === 'published') published++;
            if (blog.status === 'draft') draft++;
        });
        return {
            all: blogs.length,
            mine,
            published,
            draft
        };
    };
    const tabCounts = getTabCounts();

    // Filtering logic
    const filteredBlogs = blogs.filter(blog => {
        // Tabs
        if (tab === 'mine' && !(blog.createdBy?._id === currentUserId || blog.createdBy === currentUserId)) return false;
        if (tab === 'published' && blog.status !== 'published') return false;
        if (tab === 'draft' && blog.status !== 'draft') return false;
        // Search
        const matchesSearch = blog.title.toLowerCase().includes(search.toLowerCase());
        // Status filter
        const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
        // Category filter
        const matchesCategory = categoryFilter === 'all' || (blog.mainCategory && (blog.mainCategory._id === categoryFilter || blog.mainCategory === categoryFilter));
        // Date filter
        const matchesDate = dateFilter === 'all' || (blog.publishedDate && (() => {
            const d = new Date(blog.publishedDate);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === dateFilter;
        })());
        return matchesSearch && matchesStatus && matchesCategory && matchesDate;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredBlogs.length / perPage);
    const paginatedBlogs = filteredBlogs.slice((page - 1) * perPage, page * perPage);

    const handleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selected.length === paginatedBlogs.length) setSelected([]);
        else setSelected(paginatedBlogs.map((b) => b._id));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this blog?')) return;
        try {
            await deleteBlog(id);
            setBlogs((prev) => prev.filter((b) => b._id !== id));
        } catch (err) {
            alert('Error deleting blog');
        }
    };

    const handleBulkAction = async (action) => {
        if (selected.length === 0) return;
        if (action === 'delete') {
            if (!window.confirm('Delete selected blogs?')) return;
            for (const id of selected) {
                await deleteBlog(id);
            }
            setBlogs((prev) => prev.filter((b) => !selected.includes(b._id)));
            setSelected([]);
        }
        // Add more actions as needed
    };

    const handleStatusChange = async (blogId, newStatus) => {
        try {
            await updateBlog(blogId, { status: newStatus });
            setBlogs((prev) => prev.map(b => b._id === blogId ? { ...b, status: newStatus } : b));
        } catch (err) {
            alert('Error updating blog status');
        }
    };

    if (loading) return <div>Loading...</div>;

    // Date filter options
    const dateOptions = getMonthYearOptions(blogs);

    return (
        <div className="max-w-6xl mx-auto mt-8">
            {/* Header with Create Blog button */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-2xl font-bold">All Blogs</div>
                <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => navigate('/blogs/create')}
                >
                    Create Blog
                </button>
            </div>
            {/* Tabs */}
            <div className="flex gap-4 mb-4 text-sm font-semibold">
                <button className={tab === 'all' ? 'text-blue-700 underline' : 'text-gray-700'} onClick={() => { setTab('all'); setPage(1); }}>All ({tabCounts.all})</button>
                <button className={tab === 'mine' ? 'text-blue-700 underline' : 'text-gray-700'} onClick={() => { setTab('mine'); setPage(1); }}>Mine ({tabCounts.mine})</button>
                <button className={tab === 'published' ? 'text-blue-700 underline' : 'text-gray-700'} onClick={() => { setTab('published'); setPage(1); }}>Published ({tabCounts.published})</button>
                <button className={tab === 'draft' ? 'text-blue-700 underline' : 'text-gray-700'} onClick={() => { setTab('draft'); setPage(1); }}>Draft ({tabCounts.draft})</button>
            </div>
            {/* Bulk actions and filters */}
            <div className="flex flex-wrap gap-4 mb-4 items-end">
                <div>
                    <select id="bulk-action" className="border border-gray-300 rounded px-3 py-2" defaultValue="">
                        <option value="">Bulk actions</option>
                        <option value="delete">Delete</option>
                        {/* Add more actions as needed */}
                    </select>
                    <button
                        className="ml-2 px-3 py-2 bg-gray-200 rounded border hover:bg-gray-300"
                        onClick={() => handleBulkAction(document.getElementById('bulk-action').value)}
                    >Apply</button>
                </div>
                <div>
                    <select
                        value={dateFilter}
                        onChange={e => { setDateFilter(e.target.value); setPage(1); }}
                        className="border border-gray-300 rounded px-3 py-2"
                    >
                        <option value="all">All dates</option>
                        {dateOptions.map(opt => {
                            const [year, month] = opt.split('-');
                            return <option key={opt} value={opt}>{`${year}/${month}`}</option>;
                        })}
                    </select>
                </div>
                <div>
                    <select
                        value={categoryFilter}
                        onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                        className="border border-gray-300 rounded px-3 py-2"
                    >
                        <option value="all">All Categories</option>
                        {mainCategories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                    <button
                        className="ml-2 px-3 py-2 bg-gray-200 rounded border hover:bg-gray-300"
                        onClick={() => setPage(1)}
                    >Filter</button>
                </div>
                <div className="flex-1"></div>
                <div>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="border border-gray-300 rounded px-3 py-2 w-64"
                    />
                    <button
                        className="ml-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => setPage(1)}
                    >Search Posts</button>
                </div>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr>
                            <th className="px-2 py-2 border">
                                <input
                                    type="checkbox"
                                    checked={selected.length === paginatedBlogs.length && paginatedBlogs.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="px-4 py-2 border text-left">Title</th>
                            <th className="px-4 py-2 border text-left">Author</th>
                            <th className="px-4 py-2 border text-left w-64">Categories</th>
                            <th className="px-4 py-2 border text-left w-28">Tags</th>
                            <th className="px-4 py-2 border text-left w-24">Status</th>
                            <th className="px-4 py-2 border w-36">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedBlogs.map((blog) => (
                            <tr key={blog._id}>
                                <td className="px-2 py-2 border">
                                    <div className='flex flex-col items-center justify-center'>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(blog._id)}
                                            onChange={() => handleSelect(blog._id)}
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-2 border">
                                    <div className="font-semibold cursor-pointer" onClick={() => navigate(`/blogs/${blog.slug || blog._id}`)}>
                                        {blog.title}
                                    </div>
                                    <div className="text-xs text-gray-500 space-x-2">
                                        <button onClick={() => navigate(`/blogs/edit/${blog.slug || blog._id}`)} className="text-blue-600 hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(blog._id)} className="text-red-600 hover:underline">Delete</button>
                                        <button onClick={() => navigate(`/blogs/${blog.slug || blog._id}`)} className="text-green-600 hover:underline">View</button>
                                    </div>
                                </td>
                                <td className="px-4 py-2 border text-sm">{blog.createdBy?.name || '—'}</td>
                                <td className="px-4 py-2 border w-32">
                                    {blog.mainCategory?.name || blog.mainCategory}
                                    {blog.subcategories && blog.subcategories.length > 0 && (
                                        <>
                                            <br />
                                            <span className="text-xs text-gray-500">
                                                {blog.subcategories.map((sub) => sub.name || sub).join(', ')}
                                            </span>
                                        </>
                                    )}
                                </td>
                                <td className="px-4 py-2 border w-28">
                                    {Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags || '—'}
                                </td>
                                <td className="px-4 py-2 border w-24 text-xs">
                                    <StatusDropdown
                                        value={blog.status}
                                        onChange={(newStatus) => handleStatusChange(blog._id, newStatus)}
                                    />
                                </td>
                                <td className="px-4 py-2 border w-36 text-sm">
                                    {blog.publishedDate ? new Date(blog.publishedDate).toLocaleString() : ''}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                    {filteredBlogs.length} items | Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-2 py-1 border rounded disabled:opacity-50"
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                    >&laquo;</button>
                    <button
                        className="px-2 py-1 border rounded disabled:opacity-50"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                    >&lsaquo;</button>
                    <button
                        className="px-2 py-1 border rounded disabled:opacity-50"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                    >&rsaquo;</button>
                    <button
                        className="px-2 py-1 border rounded disabled:opacity-50"
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                    >&raquo;</button>
                </div>
            </div>
        </div>
    );
};

export default BlogsListPage;