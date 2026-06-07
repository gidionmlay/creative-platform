/**
 * G Design Services API Layer
 * ───────────────────────────
 */
console.log("🔥 JS FILE LOADED:", "services.js (API)");

(function() {
    const BASE_URL = window.api ? window.api.BASE_URL : "http://127.0.0.1:8000/api/v1";

    // Uses window.api.getAuthHeaders() for auth

    async function getServices(filters = {}) {
        let url = `${BASE_URL}/services/`;
        let params = [];
        if (filters.category) params.push(`category=${encodeURIComponent(filters.category)}`);
        if (filters.featured !== undefined) params.push(`featured=${encodeURIComponent(filters.featured)}`);
        if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        return await window.api.handleRequest(url, {
            method: "GET"
        });
    }

    async function getServiceDetails(slug) {
        return await window.api.handleRequest(`${BASE_URL}/services/${slug}/`, {
            method: "GET"
        });
    }

    async function getCategories() {
        return await window.api.handleRequest(`${BASE_URL}/services/categories/`, {
            method: "GET"
        });
    }

    // Admin APIs
    async function createService(formData) {
        return await window.api.handleRequest(`${BASE_URL}/admin/services/`, {
            method: "POST",
            headers: window.api.getAuthHeaders(true),
            body: formData
        });
    }

    async function updateService(id, formData) {
        return await window.api.handleRequest(`${BASE_URL}/admin/services/${id}/`, {
            method: "PATCH",
            headers: window.api.getAuthHeaders(true),
            body: formData
        });
    }

    async function deleteService(id) {
        return await window.api.handleRequest(`${BASE_URL}/admin/services/${id}/`, {
            method: "DELETE",
            headers: window.api.getAuthHeaders()
        });
    }

    async function uploadGallery(id, formData) {
        return await window.api.handleRequest(`${BASE_URL}/admin/services/${id}/gallery/`, {
            method: "POST",
            headers: window.api.getAuthHeaders(true),
            body: formData
        });
    }

    async function addFeature(id, title) {
        return await window.api.handleRequest(`${BASE_URL}/admin/services/${id}/features/`, {
            method: "POST",
            headers: window.api.getAuthHeaders(),
            body: JSON.stringify({ title: title })
        });
    }

    async function deleteFeature(serviceId, featureId) {
        return await window.api.handleRequest(`${BASE_URL}/admin/services/${serviceId}/features/${featureId}/`, {
            method: "DELETE",
            headers: window.api.getAuthHeaders()
        });
    }

    async function deleteGallery(serviceId, galleryId) {
        return await window.api.handleRequest(`${BASE_URL}/admin/services/${serviceId}/gallery/${galleryId}/`, {
            method: "DELETE",
            headers: window.api.getAuthHeaders()
        });
    }

    async function getAdminCategories() {
        return await window.api.handleRequest(`${BASE_URL}/admin/services/categories/`, {
            method: "GET",
            headers: window.api.getAuthHeaders()
        });
    }

    async function createCategory(data) {
        return await window.api.handleRequest(`${BASE_URL}/admin/services/categories/`, {
            method: "POST",
            headers: window.api.getAuthHeaders(),
            body: JSON.stringify(data)
        });
    }

    async function linkGalleryAsset(id, assetId) {
        return await window.api.handleRequest(`${BASE_URL}/admin/services/${id}/gallery/`, {
            method: "POST",
            headers: window.api.getAuthHeaders(),
            body: JSON.stringify({ image_asset: assetId })
        });
    }

    window.servicesApi = {
        getServices,
        getServiceDetails,
        getCategories,
        createService,
        updateService,
        deleteService,
        uploadGallery,
        linkGalleryAsset,
        addFeature,
        deleteFeature,
        deleteGallery,
        getAdminCategories,
        createCategory
    };
})();
