/**
 * G Design API — Projects Module
 * ──────────────────────────────
 */
console.log("🔥 JS FILE LOADED:", "api/projects.js");

window.api = window.api || {};

window.api.projects = {
    /**
     * Get all projects for admin
     */
    getAdminProjects: async function(status = '') {
        var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return { ok: false, data: { detail: "Unauthorized" } };
        let url = `${window.api.BASE_URL}/admin/projects/`;
        if (status) url += `?status=${encodeURIComponent(status)}`;
        return await window.api.handleRequest(url, {
            method: "GET",
            headers: window.api.getAuthHeaders()
        });
    },

    /**
     * Get details of a single project for admin
     */
    getAdminProjectDetail: async function(id) {
        var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return { ok: false, data: { detail: "Unauthorized" } };
        return await window.api.handleRequest(`${window.api.BASE_URL}/admin/projects/${id}/`, {
            method: "GET",
            headers: window.api.getAuthHeaders()
        });
    },

    /**
     * Update project status
     */
    updateProjectStatus: async function(id, status) {
        var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return { ok: false, data: { detail: "Unauthorized" } };
        return await window.api.handleRequest(`${window.api.BASE_URL}/admin/projects/${id}/status/`, {
            method: "PATCH",
            headers: window.api.getAuthHeaders(),
            body: JSON.stringify({ status: status })
        });
    },

    /**
     * Update project progress (0-100)
     */
    updateProjectProgress: async function(id, progress) {
        var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return { ok: false, data: { detail: "Unauthorized" } };
        return await window.api.handleRequest(`${window.api.BASE_URL}/admin/projects/${id}/progress/`, {
            method: "PATCH",
            headers: window.api.getAuthHeaders(),
            body: JSON.stringify({ progress: progress })
        });
    },

    /**
     * Send a message to a project
     */
    sendProjectMessage: async function(id, message) {
        var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return { ok: false, data: { detail: "Unauthorized" } };
        return await window.api.handleRequest(`${window.api.BASE_URL}/admin/projects/${id}/messages/`, {
            method: "POST",
            headers: window.api.getAuthHeaders(),
            body: JSON.stringify({ message: message })
        });
    },

    /**
     * Upload a file to a project (supports FormData for multipart)
     */
    uploadProjectFile: async function(id, formData) {
        var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return { ok: false, data: { detail: "Unauthorized" } };
        return await window.api.handleRequest(`${window.api.BASE_URL}/admin/projects/${id}/files/`, {
            method: "POST",
            headers: window.api.getAuthHeaders(true), // pass true to omit content-type for multipart
            body: formData
        });
    },

    // ==========================================
    // CLIENT ENDPOINTS
    // ==========================================

    /**
     * Get all projects for the authenticated client
     */
    getMyProjects: async function() {
        var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return { ok: false, data: { detail: "Unauthorized" } };
        return await window.api.handleRequest(`${window.api.BASE_URL}/projects/my/`, {
            method: "GET",
            headers: window.api.getAuthHeaders()
        });
    },

    /**
     * Get details of a single project for client
     */
    getClientProjectDetail: async function(id) {
        var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return { ok: false, data: { detail: "Unauthorized" } };
        return await window.api.handleRequest(`${window.api.BASE_URL}/projects/${id}/`, {
            method: "GET",
            headers: window.api.getAuthHeaders()
        });
    },

    /**
     * Send a message to a project (Client)
     */
    sendClientProjectMessage: async function(id, message) {
        var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return { ok: false, data: { detail: "Unauthorized" } };
        return await window.api.handleRequest(`${window.api.BASE_URL}/projects/${id}/messages/`, {
            method: "POST",
            headers: window.api.getAuthHeaders(),
            body: JSON.stringify({ message: message })
        });
    },

    /**
     * Upload a file to a project (Client)
     */
    uploadClientProjectFile: async function(id, formData) {
        var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return { ok: false, data: { detail: "Unauthorized" } };
        return await window.api.handleRequest(`${window.api.BASE_URL}/projects/${id}/files/`, {
            method: "POST",
            headers: window.api.getAuthHeaders(true),
            body: formData
        });
    },

    /**
     * Request a revision (Client)
     */
    requestProjectRevision: async function(id, notes) {
        var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return { ok: false, data: { detail: "Unauthorized" } };
        return await window.api.handleRequest(`${window.api.BASE_URL}/projects/${id}/revision/`, {
            method: "POST",
            headers: window.api.getAuthHeaders(),
            body: JSON.stringify({ revision_notes: notes })
        });
    },

    /**
     * Approve project completion (Client)
     */
    approveProjectCompletion: async function(id) {
        var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return { ok: false, data: { detail: "Unauthorized" } };
        return await window.api.handleRequest(`${window.api.BASE_URL}/projects/${id}/approve/`, {
            method: "POST",
            headers: window.api.getAuthHeaders()
        });
    },

    /**
     * Get project timeline (Client)
     */
    getProjectTimeline: async function(id) {
        var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return { ok: false, data: { detail: "Unauthorized" } };
        return await window.api.handleRequest(`${window.api.BASE_URL}/projects/${id}/timeline/`, {
            method: "GET",
            headers: window.api.getAuthHeaders()
        });
    },

    /**
     * Get project by id — alias for getClientProjectDetail
     */
    getProject: async function(id) {
        return this.getClientProjectDetail(id);
    },

    /**
     * Get project messages — fetched via detail endpoint
     */
    getProjectMessages: async function(id) {
        var detail = await this.getClientProjectDetail(id);
        if (detail.ok && detail.data && detail.data.data) {
            return { ok: true, data: detail.data.data.messages || [] };
        }
        return { ok: false, data: [] };
    },

    /**
     * Get project files — fetched via detail endpoint
     */
    getProjectFiles: async function(id) {
        var detail = await this.getClientProjectDetail(id);
        if (detail.ok && detail.data && detail.data.data) {
            return { ok: true, data: detail.data.data.files || [] };
        }
        return { ok: false, data: [] };
    }
};
