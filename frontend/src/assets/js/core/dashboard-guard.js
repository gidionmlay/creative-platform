/**
 * G Design — Dashboard Stability Guard
 * ─────────────────────────────────────
 * PHASE 1 : DOMContentLoaded wrapper (called per-dashboard via initDashboardSafe)
 * PHASE 7 : Global uncaught error / promise catchers
 * PHASE 3 : Safe DOM query helpers  → window.safeEl(), window.safeEls()
 *
 * Load this script BEFORE any dashboard module script.
 */
console.log("🔥 JS FILE LOADED:", "dashboard-guard.js");

/* ── PHASE 7 ─ Global error catchers ───────────────────────────── */
window.addEventListener("error", (e) => {
    console.error("💥 GLOBAL ERROR:", e.message, "\n  at:", e.filename, "line", e.lineno);
});

window.addEventListener("unhandledrejection", (e) => {
    console.error("💥 PROMISE ERROR:", e.reason);
});

/* ── PHASE 3 ─ Null-safe DOM helpers ───────────────────────────── */

/**
 * Safe querySelector — returns the element or null with a warning.
 * @param {string} selector
 * @param {Document|Element} [root=document]
 */
window.safeEl = function (selector, root) {
    const el = (root || document).querySelector(selector);
    if (!el) {
        console.warn("⚠️ عنصر مفقود:", selector);
    }
    return el;
};

/**
 * Safe querySelectorAll — returns a (possibly empty) NodeList with a warning.
 */
window.safeEls = function (selector, root) {
    const els = (root || document).querySelectorAll(selector);
    if (!els.length) {
        console.warn("⚠️ عناصر مفقودة:", selector);
    }
    return els;
};

/* ── PHASE 1 ─ Safe initialisation wrapper ──────────────────────── */

/**
 * Wraps a dashboard boot function with DOMContentLoaded + try/catch.
 * Usage: initDashboardSafe("Admin", initializeDashboard)
 *
 * @param {string}   name   — Label shown in console (e.g. "Admin")
 * @param {Function} bootFn — Async or sync function that boots the dashboard
 */
window.initDashboardSafe = function (name, bootFn) {
    document.addEventListener("DOMContentLoaded", async () => {
        console.log(`✅ DOM READY [${name}]`);
        try {
            await bootFn();
            console.log(`✅ INIT SUCCESS [${name}]`);
        } catch (error) {
            console.error(`❌ INIT FAILED [${name}]:`, error);

            // PHASE 8 — Fallback UI so the page is never blank
            const content = document.querySelector("#adminContent");
            if (content && !content.innerHTML.trim()) {
                content.innerHTML = `
                    <div style="padding:40px;text-align:center;">
                        <i class="fal fa-exclamation-triangle"
                           style="font-size:48px;color:var(--status-danger,#dc3545);margin-bottom:16px;"></i>
                        <h3 style="font-weight:600;">Something went wrong</h3>
                        <p style="color:var(--admin-text-muted,#6c757d);margin-bottom:24px;">
                            The dashboard could not be initialised. Please refresh the page.<br>
                            <small style="font-family:monospace;">${error && error.message ? error.message : 'Unknown error'}</small>
                        </p>
                        <button onclick="location.reload()"
                                style="padding:10px 24px;background:var(--admin-accent,#0d6efd);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:15px;">
                            Reload
                        </button>
                    </div>`;
            }
        }
    });
};
