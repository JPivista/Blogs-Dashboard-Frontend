import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeadsListPage = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        const fetchLeads = async () => {
            setLoading(true);
            try {
                const res = await axios.get('https://blogs-dashboard-backend.vercel.app/leads');
                setLeads(res.data);
                setError('');
            } catch (err) {
                setError('Error fetching leads');
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, []);

    // Filtering
    const filteredLeads = Array.isArray(leads)
        ? leads.filter(lead => {
            const q = search.toLowerCase();
            return (
                (lead.name || "").toLowerCase().includes(q) ||
                (lead.phone_number || "").toLowerCase().includes(q) ||
                (lead.category || "").toLowerCase().includes(q)
            );
        })
        : [];



    // Pagination
    const safeFilteredLeads = filteredLeads || [];
    const totalPages = Math.ceil(safeFilteredLeads.length / perPage);
    const paginatedLeads = safeFilteredLeads.slice((page - 1) * perPage, page * perPage);

    // Selection
    const handleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };
    const handleSelectAll = () => {
        if (selected.length === paginatedLeads.length) setSelected([]);
        else setSelected(paginatedLeads.map((l) => l._id));
    };

    // Delete
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this lead?')) return;
        setDeletingId(id);
        try {
            await axios.delete(`/leads/${id}`);
            setLeads((prev) => prev.filter((l) => l._id !== id));
            setSelected((prev) => prev.filter((sid) => sid !== id));
        } catch (err) {
            setError('Error deleting lead');
        } finally {
            setDeletingId(null);
        }
    };
    const handleBulkDelete = async () => {
        if (selected.length === 0) return;
        if (!window.confirm('Delete selected leads?')) return;
        for (const id of selected) {
            await axios.delete(`/leads/${id}`);
        }
        setLeads((prev) => prev.filter((l) => !selected.includes(l._id)));
        setSelected([]);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto mt-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-2xl font-bold">All Leads</div>
                {/* No add button for leads */}
            </div>
            {/* Search and Bulk Actions */}
            <div className="flex flex-wrap gap-4 mb-4 items-end">
                <input
                    type="text"
                    placeholder="Search by name, phone, or category"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="border border-gray-300 rounded px-3 py-2"
                />
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                    onClick={handleBulkDelete}
                    disabled={selected.length === 0}
                >
                    Delete Selected
                </button>
            </div>
            {/* Table */}
            <div className="overflow-x-auto bg-white rounded shadow">
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border-b">
                                <input
                                    type="checkbox"
                                    checked={selected.length === paginatedLeads.length && paginatedLeads.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="px-4 py-2 border-b">Name</th>
                            <th className="px-4 py-2 border-b">Phone Number</th>
                            <th className="px-4 py-2 border-b">Category</th>
                            <th className="px-4 py-2 border-b">Created At</th>
                            <th className="px-4 py-2 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLeads.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-8">No leads found.</td></tr>
                        ) : paginatedLeads.map(lead => (
                            <tr key={lead._id} className={selected.includes(lead._id) ? 'bg-blue-50' : ''}>
                                <td className="px-4 py-2 border-b text-center">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(lead._id)}
                                        onChange={() => handleSelect(lead._id)}
                                    />
                                </td>
                                <td className="px-4 py-2 border-b">{lead.name}</td>
                                <td className="px-4 py-2 border-b">{lead.phone_number}</td>
                                <td className="px-4 py-2 border-b">{lead.category}</td>
                                <td className="px-4 py-2 border-b">{new Date(lead.createdAt).toLocaleString()}</td>
                                <td className="px-4 py-2 border-b">
                                    <button
                                        onClick={() => handleDelete(lead._id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                        disabled={deletingId === lead._id}
                                    >
                                        {deletingId === lead._id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                    Showing {filteredLeads.length === 0 ? 0 : (page - 1) * perPage + 1}
                    -{Math.min(page * perPage, filteredLeads.length)} of {filteredLeads.length}
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 rounded border disabled:opacity-50"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                    >
                        Prev
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        className="px-3 py-1 rounded border disabled:opacity-50"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeadsListPage; 