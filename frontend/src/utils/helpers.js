/**
 * G Design Frontend Helpers
 * ─────────────────────────
 * Provides: safe utilities, user profile management, component loading, auth guards
 */
console.log("🔥 JS FILE LOADED:", "helpers.js");

/* ── Safe Utility Functions ────────────────────────────────────── */

/**
 * Returns value as array, or empty array if falsy/invalid.
 */
function safeArray(val) {
    if (Array.isArray(val)) return val;
    if (val && val.results && Array.isArray(val.results)) return val.results;
    return [];
}

/**
 * Returns value as number, or fallback (default 0) if falsy/NaN.
 */
function safeNumber(val, fallback) {
    if (fallback === undefined) fallback = 0;
    const n = Number(val);
    return isNaN(n) ? fallback : n;
}

/**
 * Returns value as trimmed string, or fallback (default '') if falsy.
 */
function safeText(val, fallback) {
    if (fallback === undefined) fallback = '';
    return (val != null && String(val).trim()) ? String(val).trim() : fallback;
}

/**
 * Safely extract API response data into a standard shape.
 * @param {*} res - Raw API response
 * @returns {{ ok: boolean, data: *, items: Array }}
 */
function normalizeResponse(res) {
    if (!res) return { ok: false, data: null, items: [] };
    const ok = !!(res.ok || res.success);
    const data = res.data || res;
    const items = safeArray(data.results || data);
    return { ok: ok, data: data, items: items };
}


/* ── Component Loading ─────────────────────────────────────────── */

async function loadComponent(id, path) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
        const response = await fetch(path);
        if (response.ok) {
            let html = await response.text();
            html = html.replace(/\{ROOT\}/g, window.ROOT_PATH || '');
            el.innerHTML = html;
        } else {
            console.error('Error loading component:', path);
        }
    } catch (error) {
        console.error('Fetch error loading component:', path, error);
    }
}


/* ── Auth + User Management ────────────────────────────────────── */

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    const root = window.ROOT_PATH || '';
    window.location.href = root + '/src/pages/auth/login.html';
}

function getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Fetch the authenticated user's profile from the backend API.
 * Stores the result in localStorage for subsequent use.
 * @returns {Promise<Object|null>} user object or null
 */
async function fetchAndStoreUser() {
    if (!(window.api && window.api.getUser)) return null;
    try {
        const res = await window.api.getUser();
        if (res && res.ok && res.data) {
            localStorage.setItem("user", JSON.stringify(res.data));
            console.log("✅ User profile fetched and stored:", res.data.username);
            return res.data;
        }
        console.warn("⚠️ fetchAndStoreUser: API returned non-ok", res);
        return null;
    } catch (err) {
        console.error("❌ fetchAndStoreUser failed:", err);
        return null;
    }
}

/**
 * Render user profile data into the dashboard header.
 * If no user in localStorage, fetches from API first.
 */
async function renderUserProfile() {
    let user = getCurrentUser();

    // If no cached user data, fetch from API
    if (!user) {
        user = await fetchAndStoreUser();
    }

    if (!user) {
        console.warn("⚠️ renderUserProfile: No user data available");
        return;
    }

    const firstName = safeText(user.first_name, user.username || "User");
    const lastName = safeText(user.last_name, "");
    const fullName = lastName ? `${firstName} ${lastName}`.trim() : firstName;
    const role = safeText(user.role, "user");
    const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);

    // Update greeting
    const greetingEl = document.getElementById('welcomeGreeting');
    if (greetingEl) greetingEl.textContent = `Welcome back, ${firstName}!`;

    // Update profile name in header
    document.querySelectorAll('.profile-name').forEach(function(el) {
        el.textContent = fullName;
    });

    // Update profile role in header
    document.querySelectorAll('.profile-role').forEach(function(el) {
        el.textContent = roleDisplay;
    });

    // Update avatar initials
    const initials = (firstName.charAt(0) + (lastName ? lastName.charAt(0) : '')).toUpperCase() || 'U';
    document.querySelectorAll('.profile-avatar').forEach(function(el) {
        // Find inner span or set directly
        const span = el.querySelector('span');
        if (span) {
            span.textContent = initials;
        } else {
            el.textContent = initials;
        }
    });

    console.log("✅ Profile rendered:", fullName, `[${roleDisplay}]`);
}


/* ── Global Logout Click Handler ───────────────────────────────── */

document.addEventListener("click", function(e) {
    if (e.target.closest('[data-action="logout"]')) {
        e.preventDefault();
        logout();
    }
});


/* ── DOMContentLoaded: Auth Guard + Component Loading ──────────── */

document.addEventListener('DOMContentLoaded', function() {
    // Auth Guard for dashboard pages
    if (window.location.pathname.includes('/dashboards/')) {
        const token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) {
            logout();
            return;
        }
    }

    const root = window.ROOT_PATH || '';
    loadComponent("header", root + "/src/components/header/header.html");
    loadComponent("footer", root + "/src/components/footer/footer.html");
    loadComponent("sidebar", root + "/src/components/sidebar/sidebar.html");
});


/* ── Global Toast Notification ─────────────────────────────────── */

window.showToast = function(type, message) {
    // Remove existing toasts
    document.querySelectorAll('.g-toast').forEach(function(t) { t.remove(); });

    var iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    var colorMap = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };

    var toast = document.createElement('div');
    toast.className = 'g-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#111827;color:#fff;padding:16px 22px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.25);z-index:9999;transform:translateY(100px);opacity:0;transition:all .3s cubic-bezier(.4,0,.2,1);max-width:380px;display:flex;align-items:center;gap:12px;font-size:14px;';
    toast.innerHTML = '<i class="fas ' + (iconMap[type] || iconMap.info) + '" style="color:' + (colorMap[type] || colorMap.info) + ';font-size:18px;"></i><span>' + message + '</span>';

    document.body.appendChild(toast);
    requestAnimationFrame(function() {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });
    setTimeout(function() {
        toast.style.transform = 'translateY(20px)';
        toast.style.opacity = '0';
        setTimeout(function() { toast.remove(); }, 300);
    }, 4000);
};


/* ── Global Exposure ───────────────────────────────────────────── */

window.helpers = {
    logout: logout,
    getCurrentUser: getCurrentUser,
    fetchAndStoreUser: fetchAndStoreUser,
    renderUserProfile: renderUserProfile,
    safeArray: safeArray,
    safeNumber: safeNumber,
    safeText: safeText,
    normalizeResponse: normalizeResponse
};
