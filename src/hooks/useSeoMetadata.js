import { useState, useEffect } from 'react';
import { seoMetadataAPI } from '../api/seoMetadata';

export const useSeoMetadata = (pageIdentifier) => {
    const [seoMetadata, setSeoMetadata] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (pageIdentifier) {
            fetchSeoMetadata();
        }
    }, [pageIdentifier]);

    const fetchSeoMetadata = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await seoMetadataAPI.getByPage(pageIdentifier);
            setSeoMetadata(response.data);
        } catch (error) {
            setError(error.message || 'Failed to fetch SEO metadata');
            setSeoMetadata(null);
        } finally {
            setLoading(false);
        }
    };

    const updateSeoMetadata = async (updates) => {
        try {
            setLoading(true);
            setError(null);

            if (seoMetadata) {
                const response = await seoMetadataAPI.update(seoMetadata._id, updates);
                setSeoMetadata(response.data);
                return response.data;
            } else {
                // Create new if doesn't exist
                const response = await seoMetadataAPI.create(updates);
                setSeoMetadata(response.data);
                return response.data;
            }
        } catch (error) {
            setError(error.message || 'Failed to update SEO metadata');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const refreshSeoMetadata = () => {
        if (pageIdentifier) {
            fetchSeoMetadata();
        }
    };

    return {
        seoMetadata,
        loading,
        error,
        updateSeoMetadata,
        refreshSeoMetadata
    };
};

export default useSeoMetadata;
