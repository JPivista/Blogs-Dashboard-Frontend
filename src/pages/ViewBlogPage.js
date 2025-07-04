import React, { useState, useEffect } from 'react';
import { getBlog } from '../api/blogs';
import { useParams } from 'react-router-dom';

function formatRelativeDate(dateString) {
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
}

const ViewBlogPage = () => {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const { idOrSlug } = useParams();
    const [showAllUpdates, setShowAllUpdates] = useState(false);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await getBlog(idOrSlug);
                setBlog(res.data);
            } catch (err) {
                console.error("Failed to fetch blog", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [idOrSlug]);

    if (loading) return <div>Loading...</div>;
    if (!blog) return <div>Blog not found.</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'published':
                return 'text-green-600';
            case 'draft':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 bg-white p-8 rounded shadow">
            <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
            <div className="text-sm text-gray-500 mb-4">Slug: {blog.slug}</div>

            <div className="flex flex-wrap gap-4 my-4">
                {blog.banner && <img src={blog.banner} alt="Banner" className="w-full h-auto object-cover rounded" />}
                {blog.thumbnail && <img src={blog.thumbnail} alt="Thumbnail" className="w-32 h-32 object-cover rounded" />}
                {blog.mobileBanner && <img src={blog.mobileBanner} alt="Mobile Banner" className="w-32 h-32 object-cover rounded" />}
            </div>

            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.description }} />

            <div className="mt-6">
                <h3 className="font-bold">Details</h3>
                <div className="text-sm">Main Category: {blog.mainCategory?.name || 'N/A'}</div>
                {blog.subcategories && blog.subcategories.length > 0 && (
                    <div className="text-sm">Subcategories: {blog.subcategories.map(sub => sub.name).join(', ')}</div>
                )}
                <div className="text-sm">Status: <span className={`font-medium ${getStatusColor(blog.status)}`}>{blog.status}</span></div>
                <div className="text-sm">Meta Title: {blog.metaTitle}</div>
                <div className="text-sm">Meta Description: {blog.metaDescription}</div>
                <div className="text-sm">Published: {new Date(blog.publishedDate).toLocaleString()}</div>
            </div>

            {/* Update History */}
            {blog.updates && Array.isArray(blog.updates) && blog.updates.length > 0 && (() => {
                // Sort updates in descending order by date
                const sortedUpdates = [...blog.updates].sort((a, b) => new Date(b.date) - new Date(a.date));
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
                        {blog.updates.length > 20 && (
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
        </div>
    );
};

export default ViewBlogPage; 