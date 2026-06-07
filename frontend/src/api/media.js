/**
 * G Design Media Library API Layer
 * ───────────────────────────────
 */
console.log("🔥 JS FILE LOADED:", "media.js (API)");

(function() {
    const BASE_URL = window.api ? window.api.BASE_URL : "http://127.0.0.1:8000/api/v1";

    // Auth headers are now fetched globally via window.api.getAuthHeaders()

    async function getMediaAssets(filters = {}) {
        let url = `${BASE_URL}/admin/media/`;
        let params = [];
        if (filters.page) params.push(`page=${encodeURIComponent(filters.page)}`);
        if (filters.folder) params.push(`folder=${encodeURIComponent(filters.folder)}`);
        if (filters.file_type) params.push(`file_type=${encodeURIComponent(filters.file_type)}`);
        if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        return await window.api.handleRequest(url, {
            method: "GET",
            headers: window.api.getAuthHeaders()
        });
    }

    async function getMediaDetails(id) {
        return await window.api.handleRequest(`${BASE_URL}/admin/media/${id}/`, {
            method: "GET",
            headers: window.api.getAuthHeaders()
        });
    }

    async function uploadMedia(formData) {
        return await window.api.handleRequest(`${BASE_URL}/admin/media/`, {
            method: "POST",
            headers: window.api.getAuthHeaders(true),
            body: formData
        });
    }

    async function deleteMedia(id) {
        return await window.api.handleRequest(`${BASE_URL}/admin/media/${id}/`, {
            method: "DELETE",
            headers: window.api.getAuthHeaders()
        });
    }

    window.mediaApi = {
        getMediaAssets,
        getMediaDetails,
        uploadMedia,
        deleteMedia
    };
})();
