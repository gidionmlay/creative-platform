/**
 * G Design API Connection Layer
 * ─────────────────────────────
 * All API methods return: { ok: boolean, data: object|null, status?: number }
 */
console.log("🔥 JS FILE LOADED:", "api.js");

const BASE_URL = "http://127.0.0.1:8000/api/v1";

/**
 * Core fetch wrapper.
 * Returns { ok: true, data } on success, { ok: false, data, status } on failure.
 */
async function handleRequest(url, options) {
    try {
        var res = await fetch(url, options);
        var data;
        try {
            data = await res.json();
        } catch(e) {
            data = null;
        }

        if (!res.ok) {
            if (res.status === 401) {
                console.warn("⚠️ 401 Unauthorized — token may be invalid or expired.");
                if (window.auth && typeof window.auth.logout === 'function') {
                    // Prevent redirect loops if already on login page
                    if (!window.location.pathname.includes('login.html')) {
                        window.auth.logout(true);
                    }
                }
            }
            return { ok: false, data: data || null, status: res.status };
        }

        return { ok: true, data: data };

    } catch (err) {
        console.error("API Error:", err.message);
        return { ok: false, data: null, error: err.message };
    }
}

/**
 * Helper: build auth headers from stored token.
 */
function getAuthHeaders(multipart = false) {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    var headers = {
        "Authorization": "Token " + (token || "")
    };
    if (!multipart) {
        headers["Content-Type"] = "application/json";
    }
    return headers;
}

/**
 * Format a numeric value as Tanzanian Shillings (TSh).
 */
function formatCurrencyTZS(value) {
    var num = Number(value);
    if (isNaN(num)) return 'TSh 0';
    return new Intl.NumberFormat('en-TZ', {
        style: 'currency',
        currency: 'TZS',
        maximumFractionDigits: 0
    }).format(num);
}

/* ── Auth ─────────────────────────────────────────────────────── */

async function login(data) {
    var res = await handleRequest(BASE_URL + "/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            identifier: data.identifier,
            password: data.password
        })
    });
    // Login returns raw token data on success — reshape for consistency
    if (res.ok && res.data) {
        return res.data; // { key, user_id, username, email, profile_role }
    }
    return res;
}

async function register(data) {
    return await handleRequest(BASE_URL + "/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

async function getUser() {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: null };
    return await handleRequest(BASE_URL + "/auth/me/", {
        method: "GET",
        headers: getAuthHeaders()
    });
}

function redirectByRole(role) {
    var root = window.ROOT_PATH || "";
    if (role === "admin" || role === "staff") {
        window.location.href = root + "/src/pages/dashboards/admin/index.html";
    } else if (role === "student") {
        window.location.href = root + "/src/pages/dashboards/student/index.html";
    } else {
        window.location.href = root + "/src/pages/dashboards/client/index.html";
    }
}

/* ── Client Requests ──────────────────────────────────────────── */

async function createRequest(dataObj) {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: { detail: "Unauthorized" } };
    return await handleRequest(BASE_URL + "/requests/", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(dataObj)
    });
}

/**
 * Create a service request with file attachments (multipart/form-data).
 * @param {FormData} formData - Must contain: service, title, description. Optional: budget, attachments (files).
 */
async function createServiceRequest(formData) {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: { detail: "Unauthorized" } };
    return await handleRequest(BASE_URL + "/requests/", {
        method: "POST",
        headers: getAuthHeaders(true),
        body: formData
    });
}

async function getMyRequests() {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: { detail: "Unauthorized" } };
    return await handleRequest(BASE_URL + "/requests/my/", {
        method: "GET",
        headers: getAuthHeaders()
    });
}

/* ── Admin Requests ───────────────────────────────────────────── */

async function getAdminRequests() {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: { detail: "Unauthorized" } };
    return await handleRequest(BASE_URL + "/admin/requests/", {
        method: "GET",
        headers: getAuthHeaders()
    });
}

async function approveRequest(id, note) {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: { detail: "Unauthorized" } };
    return await handleRequest(BASE_URL + "/admin/requests/" + id + "/approve/", {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ admin_note: note || "" })
    });
}

async function rejectRequest(id, reason) {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: { detail: "Unauthorized" } };
    return await handleRequest(BASE_URL + "/admin/requests/" + id + "/reject/", {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ admin_note: reason || "" })
    });
}

async function updateRequestStatus(id, status, note) {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: { detail: "Unauthorized" } };
    return await handleRequest(BASE_URL + "/admin/requests/" + id + "/status/", {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: status, admin_note: note || "" })
    });
}

async function addRequestNote(id, note) {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: { detail: "Unauthorized" } };
    return await handleRequest(BASE_URL + "/admin/requests/" + id + "/notes/", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ note: note })
    });
}

/* ── Admin Users ──────────────────────────────────────────────── */

async function getAdminUsers(page = 1, search = '', role = '', status = '') {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: { detail: "Unauthorized" } };
    let url = `${BASE_URL}/admin/users/?page=${page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (role) url += `&role=${encodeURIComponent(role)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    return await handleRequest(url, {
        method: "GET",
        headers: getAuthHeaders()
    });
}

async function getAdminUserDetail(id) {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: { detail: "Unauthorized" } };
    return await handleRequest(`${BASE_URL}/admin/users/${id}/`, {
        method: "GET",
        headers: getAuthHeaders()
    });
}

async function suspendAdminUser(id) {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: { detail: "Unauthorized" } };
    return await handleRequest(`${BASE_URL}/admin/users/${id}/suspend/`, {
        method: "PATCH",
        headers: getAuthHeaders()
    });
}

async function activateAdminUser(id) {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: { detail: "Unauthorized" } };
    return await handleRequest(`${BASE_URL}/admin/users/${id}/activate/`, {
        method: "PATCH",
        headers: getAuthHeaders()
    });
}

async function changeAdminUserRole(id, newRole) {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: { detail: "Unauthorized" } };
    return await handleRequest(`${BASE_URL}/admin/users/${id}/role/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole })
    });
}

async function deleteAdminUser(id) {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: { detail: "Unauthorized" } };
    return await handleRequest(`${BASE_URL}/admin/users/${id}/delete/`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });
}

async function resetAdminUserPassword(id, newPassword) {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: { detail: "Unauthorized" } };
    return await handleRequest(`${BASE_URL}/admin/users/${id}/reset-password/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ new_password: newPassword })
    });
}

async function getAdminUserAnalytics() {
    var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
    if (!token) return { ok: false, data: { detail: "Unauthorized" } };
    return await handleRequest(`${BASE_URL}/admin/users/analytics/`, {
        method: "GET",
        headers: getAuthHeaders()
    });
}

/* ── Global Exposure ──────────────────────────────────────────── */

window.api = {
    BASE_URL: BASE_URL,
    login: login,
    register: register,
    getUser: getUser,
    redirectByRole: redirectByRole,
    createRequest: createRequest,
    getMyRequests: getMyRequests,
    getAdminRequests: getAdminRequests,
    approveRequest: approveRequest,
    rejectRequest: rejectRequest,
    updateRequestStatus: updateRequestStatus,
    addRequestNote: addRequestNote,
    
    getAdminUsers: getAdminUsers,
    getAdminUserDetail: getAdminUserDetail,
    suspendAdminUser: suspendAdminUser,
    activateAdminUser: activateAdminUser,
    changeAdminUserRole: changeAdminUserRole,
    deleteAdminUser: deleteAdminUser,
    resetAdminUserPassword: resetAdminUserPassword,
    getAdminUserAnalytics: getAdminUserAnalytics,
    
    handleRequest: handleRequest,
    getAuthHeaders: getAuthHeaders,
    formatCurrencyTZS: formatCurrencyTZS,
    createServiceRequest: createServiceRequest
};
