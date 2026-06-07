/**
 * G Design — Admin Dashboard
 * ──────────────────────────
 * Fully stabilized: dynamic profile, real API data, proper states, event rebinding
 */
console.log("🔥 JS FILE LOADED:", "admin.js");

/* ── Global event delegation (uses window._adminLoadView) ────── */
document.addEventListener("click", function(e) {
    var menuItem = e.target.closest(".menu-item[data-view]");
    if (menuItem) {
        e.preventDefault();
        var v = menuItem.dataset.view;
        if (v && typeof window._adminLoadView === "function") window._adminLoadView(v);
        return;
    }

    var trigger = e.target.closest("[data-view-trigger]");
    if (trigger) {
        e.preventDefault();
        var v = trigger.dataset.viewTrigger;
        if (v && typeof window._adminLoadView === "function") window._adminLoadView(v);
        var dd = document.getElementById("profileDropdown");
        if (dd) dd.classList.remove("active");
        return;
    }

    var logoutBtn = e.target.closest('[data-action="logout"]');
    if (logoutBtn) {
        e.preventDefault();
        if (window.helpers && window.helpers.logout) window.helpers.logout();
        else if (window.auth && window.auth.logout) window.auth.logout();
        return;
    }

    // Close profile dropdown on outside click
    if (!e.target.closest(".profile-box")) {
        var dd = document.getElementById("profileDropdown");
        if (dd) dd.classList.remove("active");
    }
});

$(document).ready(function () {
    console.log("🔥 admin.js — $(document).ready FIRED");

    /* ── Helpers ──────────────────────────────────────────────── */
    var sa = (window.helpers && window.helpers.safeArray) ? window.helpers.safeArray : function(v) { return Array.isArray(v) ? v : []; };
    var sn = (window.helpers && window.helpers.safeNumber) ? window.helpers.safeNumber : function(v) { return isNaN(Number(v)) ? 0 : Number(v); };
    var st = (window.helpers && window.helpers.safeText) ? window.helpers.safeText : function(v, fb) { return (v != null && String(v).trim()) ? String(v).trim() : (fb || ''); };

    var getStatusBadge = function(s) {
        if (!s) return '';
        var lc = s.toLowerCase();
        return '<span class="status-badge status-' + lc + '">' + s.charAt(0).toUpperCase() + s.slice(1) + '</span>';
    };
    var formatDate = function(d) {
        return d ? new Date(d).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : 'N/A';
    };

    /* ── State ────────────────────────────────────────────────── */
    var state = { user: null, requests: [], loading: false };

    /* ── View Templates ───────────────────────────────────────── */
    var views = {
        dashboard: '<div class="view-container">' +
            '<div class="d-flex justify-content-between align-items-center mb-4 flex-wrap" style="gap:15px">' +
                '<div><h3 style="font-family:var(--nexin-font);font-weight:600" id="welcomeGreeting">Analytics Control Center</h3><p style="color:var(--admin-text-muted);margin:0;">Overview of LMS performance and platform growth</p></div>' +
                '<select id="analyticsRangeFilter" class="admin-input" style="width: auto; padding: 6px 12px; height: auto;">' +
                    '<option value="weekly">Weekly</option>' +
                    '<option value="monthly" selected>Monthly</option>' +
                    '<option value="quarterly">Quarterly</option>' +
                    '<option value="yearly">Yearly</option>' +
                '</select>' +
            '</div>' +
            
            '<!-- ROW 1 KPIs -->' +
            '<div class="kpi-grid mb-4">' +
                '<div class="admin-card kpi-card"><div class="kpi-icon" style="color:var(--admin-accent);background:rgba(59,130,246,.1)"><i class="fal fa-users"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiTotalUsers">0</span><span class="kpi-label">Total Users</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon" style="color:var(--status-success);background:rgba(40,167,69,.1)"><i class="fal fa-graduation-cap"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiTotalEnrollments">0</span><span class="kpi-label">Total Enrollments</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon" style="color:var(--status-warning);background:rgba(255,193,7,.1)"><i class="fal fa-inbox-in"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiTotalRequests">0</span><span class="kpi-label">Total Requests</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon projects"><i class="fal fa-clock"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiPendingRequests">0</span><span class="kpi-label">Pending Requests</span></div></div>' +
            '</div>' +
            
            '<!-- ROW 2 KPIs -->' +
            '<div class="kpi-grid mb-4">' +
                '<div class="admin-card kpi-card"><div class="kpi-icon" style="color:var(--status-success);background:rgba(40,167,69,.1)"><i class="fal fa-fire"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiActiveStudents">0</span><span class="kpi-label">Active Students</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon" style="color:var(--admin-accent);background:rgba(59,130,246,.1)"><i class="fal fa-books"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiPublishedCourses">0</span><span class="kpi-label">Published Courses</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon" style="color:var(--status-warning);background:rgba(255,193,7,.1)"><i class="fal fa-check-circle"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiCompletionRate">0%</span><span class="kpi-label">Completion Rate</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon projects"><i class="fal fa-chart-line"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiMonthlyGrowth">0%</span><span class="kpi-label">Monthly Growth</span><span id="kpiMonthlyGrowthTrend" style="margin-top: 4px; display: inline-block;"></span></div></div>' +
            '</div>' +
            
            '<!-- CHARTS & ACTIVITY -->' +
            '<div class="row gutter-y-30">' +
                '<div class="col-lg-8">' +
                    '<div class="admin-card mb-4" style="height: 350px; display: flex; flex-direction: column;">' +
                        '<div class="card-header"><h3 class="card-title">User Growth Trend</h3></div>' +
                        '<div id="userGrowthChartContainer" style="flex: 1; min-height: 0; padding: 15px;"><canvas id="userGrowthChart"></canvas></div>' +
                    '</div>' +
                    '<div class="admin-card" style="height: 350px; display: flex; flex-direction: column;">' +
                        '<div class="card-header"><h3 class="card-title">Request Activity Flow</h3></div>' +
                        '<div id="requestFlowChartContainer" style="flex: 1; min-height: 0; padding: 15px;"><canvas id="requestFlowChart"></canvas></div>' +
                    '</div>' +
                '</div>' +
                '<div class="col-lg-4">' +
                    '<div class="admin-card" style="height: 100%; min-height: 730px; display: flex; flex-direction: column;">' +
                        '<div class="card-header"><h3 class="card-title">Recent Activity</h3></div>' +
                        '<div id="recentActivityFeed" style="flex: 1; overflow-y: auto; padding: 15px;"></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '</div>',
        requests: '<div class="view-container">' +
            '<div class="kpi-grid mb-4">' +
                '<div class="admin-card kpi-card"><div class="kpi-icon projects"><i class="fal fa-inbox-in"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiTotalRequests">0</span><span class="kpi-label">Total Requests</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon" style="color:var(--status-warning);background:rgba(255,193,7,.1)"><i class="fal fa-clock"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiPendingRequests">0</span><span class="kpi-label">Pending</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon" style="color:var(--status-success);background:rgba(40,167,69,.1)"><i class="fal fa-check-circle"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiApprovedRequests">0</span><span class="kpi-label">Approved</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon" style="color:var(--status-danger);background:rgba(220,53,69,.1)"><i class="fal fa-times-circle"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiRejectedRequests">0</span><span class="kpi-label">Rejected</span></div></div>' +
            '</div>' +
            '<div class="admin-card"><div class="admin-table-container"><table class="admin-table"><thead><tr><th>Client</th><th>Service</th><th>Project Title</th><th>Qty</th><th>Brief</th><th>Attachments</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody id="requestsTableBody"></tbody></table></div></div>' +
            '</div>',
        users: '<div class="view-container">' +
            '<div class="kpi-grid mb-4">' +
                '<div class="admin-card kpi-card"><div class="kpi-icon" style="color:var(--admin-accent);background:rgba(59,130,246,.1)"><i class="fal fa-users"></i></div><div class="kpi-info"><span class="kpi-value" id="usersTotal">0</span><span class="kpi-label">Total Users</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon" style="color:var(--status-success);background:rgba(16,185,129,.1)"><i class="fal fa-user-check"></i></div><div class="kpi-info"><span class="kpi-value" id="usersActive">0</span><span class="kpi-label">Active Users</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon" style="color:var(--status-danger);background:rgba(239,68,68,.1)"><i class="fal fa-user-lock"></i></div><div class="kpi-info"><span class="kpi-value" id="usersSuspended">0</span><span class="kpi-label">Suspended</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon" style="color:var(--status-info);background:rgba(59,130,246,.1)"><i class="fal fa-user-plus"></i></div><div class="kpi-info"><span class="kpi-value" id="usersNewWeek">0</span><span class="kpi-label">New This Week</span></div></div>' +
            '</div>' +
            '<div class="admin-card">' +
                '<div class="table-toolbar">' +
                    '<div class="search-box"><i class="fal fa-search"></i><input type="text" id="userSearchInput" placeholder="Search users..."></div>' +
                    '<div class="filter-box">' +
                        '<select class="filter-select" id="userRoleFilter">' +
                            '<option value="">All Roles</option>' +
                            '<option value="client">Client</option>' +
                            '<option value="student">Student</option>' +
                            '<option value="admin">Admin</option>' +
                        '</select>' +
                        '<select class="filter-select" id="userStatusFilter">' +
                            '<option value="">All Statuses</option>' +
                            '<option value="active">Active</option>' +
                            '<option value="pending">Pending</option>' +
                            '<option value="suspended">Suspended</option>' +
                        '</select>' +
                    '</div>' +
                '</div>' +
                '<div class="admin-table-container">' +
                    '<table class="admin-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Last Seen</th><th>Actions</th></tr></thead><tbody id="usersTableBody"></tbody></table>' +
                '</div>' +
            '</div>' +
            '</div>',
        projects: '<div class="view-container">' +
            '<div class="kpi-grid mb-4">' +
                '<div class="admin-card kpi-card"><div class="kpi-icon projects"><i class="fal fa-folder-open"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiTotalProjects">0</span><span class="kpi-label">Total Projects</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon" style="color:var(--status-warning);background:rgba(255,193,7,.1)"><i class="fal fa-clock"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiActiveProjects">0</span><span class="kpi-label">Active Projects</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon" style="color:var(--status-success);background:rgba(40,167,69,.1)"><i class="fal fa-check-circle"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiCompletedProjects">0</span><span class="kpi-label">Completed</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon" style="color:var(--status-danger);background:rgba(220,53,69,.1)"><i class="fal fa-exclamation-triangle"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiDelayedProjects">0</span><span class="kpi-label">Delayed</span></div></div>' +
            '</div>' +
            '<div class="admin-card">' +
                '<div class="table-toolbar">' +
                    '<div class="search-box"><i class="fal fa-search"></i><input type="text" id="projectSearchInput" placeholder="Search projects..."></div>' +
                    '<div class="filter-box">' +
                        '<select class="filter-select" id="projectStatusFilter">' +
                            '<option value="">All Statuses</option>' +
                            '<option value="PENDING">Pending</option>' +
                            '<option value="REVIEWED">Reviewed</option>' +
                            '<option value="IN_PROGRESS">In Progress</option>' +
                            '<option value="CLIENT_REVIEW">Client Review</option>' +
                            '<option value="REVISION_REQUESTED">Revision</option>' +
                            '<option value="COMPLETED">Completed</option>' +
                            '<option value="ARCHIVED">Archived</option>' +
                        '</select>' +
                        '<select class="filter-select" id="projectSortFilter">' +
                            '<option value="newest">Newest</option>' +
                            '<option value="oldest">Oldest</option>' +
                        '</select>' +
                    '</div>' +
                '</div>' +
                '<div class="admin-table-container">' +
                    '<table class="admin-table"><thead><tr><th>Project</th><th>Client</th><th>Service</th><th>Status</th><th>Progress</th><th>Due Date</th><th>Updated</th><th>Actions</th></tr></thead><tbody id="projectsTableBody"></tbody></table>' +
                '</div>' +
            '</div>' +
            '</div>',
        orders:    '<div class="view-container"><div class="admin-card" style="padding:60px;text-align:center"><i class="fal fa-shopping-cart" style="font-size:48px;color:var(--admin-border);margin-bottom:20px;display:block"></i><h3 class="card-title" style="margin-bottom:10px">Orders</h3><p style="color:var(--admin-text-muted)">No orders to display. Order tracking will be available once the e-commerce module is activated.</p></div></div>',
        training:  '<div class="view-container"><div class="admin-card" style="padding:60px;text-align:center"><i class="fal fa-graduation-cap" style="font-size:48px;color:var(--admin-border);margin-bottom:20px;display:block"></i><h3 class="card-title" style="margin-bottom:10px">Training Overview</h3><p style="color:var(--admin-text-muted)">Course management is available in the dedicated Course Builder. Navigate there to create and manage training content.</p><button class="admin-btn secondary" style="margin-top:15px" onclick="window.location.href=\'courses.html\'"><i class="fal fa-arrow-right" style="margin-right:8px"></i>Go to Course Builder</button></div></div>',
        analytics: '<div class="view-container"><div class="admin-card" style="padding:60px;text-align:center"><i class="fal fa-chart-line" style="font-size:48px;color:var(--admin-border);margin-bottom:20px;display:block"></i><h3 class="card-title" style="margin-bottom:10px">Analytics Legacy</h3><p style="color:var(--admin-text-muted)">Analytics have been moved to the main Dashboard view.</p></div></div>',
        settings:  '<div class="view-container"><div class="admin-card" style="padding:60px;text-align:center"><i class="fal fa-cog" style="font-size:48px;color:var(--admin-border);margin-bottom:20px;display:block"></i><h3 class="card-title" style="margin-bottom:10px">Settings</h3><p style="color:var(--admin-text-muted)">Account settings and platform configuration will be available here in a future update.</p></div></div>',
        services: '<div class="view-container">' +
            '<div class="d-flex justify-content-between align-items-center mb-4 flex-wrap" style="gap:15px">' +
                '<div><h3 style="font-family:var(--nexin-font);font-weight:600">Services CMS</h3><p style="color:var(--admin-text-muted);margin:0;">Manage platform offerings, descriptions, pricing, and showcase galleries.</p></div>' +
                '<div style="display:flex;gap:10px;"><button class="admin-btn secondary" id="manageCategoriesBtn"><i class="fal fa-tags" style="margin-right:8px"></i>Categories</button><button class="admin-btn" id="addServiceBtn"><i class="fal fa-plus" style="margin-right:8px"></i>Add Service</button></div>' +
            '</div>' +
            '<div class="admin-card">' +
                '<div class="table-toolbar">' +
                    '<div class="search-box"><i class="fal fa-search"></i><input type="text" id="serviceSearchInput" placeholder="Search services..."></div>' +
                    '<div class="filter-box">' +
                        '<select class="filter-select" id="serviceCategoryFilter"><option value="">All Categories</option></select>' +
                        '<select class="filter-select" id="serviceFeaturedFilter"><option value="">All Featured</option><option value="true">Featured Only</option><option value="false">Non-Featured</option></select>' +
                    '</div>' +
                '</div>' +
                '<div class="admin-table-container">' +
                    '<table class="admin-table" id="servicesTable"><thead><tr><th>Thumbnail</th><th>Title</th><th>Category</th><th>Price</th><th>Featured</th><th>Status</th><th>Actions</th></tr></thead><tbody id="servicesTableBody"></tbody></table>' +
                    '<div id="servicesEmptyState" style="display:none;padding:60px;text-align:center">' +
                        '<i class="fal fa-magic" style="font-size:48px;color:var(--admin-border);margin-bottom:20px;display:block"></i>' +
                        '<h3 class="card-title" style="margin-bottom:10px">No services found</h3>' +
                        '<p style="color:var(--admin-text-muted)">Create your services catalog to showcase them dynamically on the client portal.</p>' +
                        '<button class="admin-btn mt-3" id="emptyStateAddServiceBtn"><i class="fal fa-plus" style="margin-right:8px"></i>Add Service</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '</div>',
        media: '<div class="view-container">' +
            '<div class="d-flex justify-content-between align-items-center mb-4 flex-wrap" style="gap:15px">' +
                '<div><h3 style="font-family:var(--nexin-font);font-weight:600">Media Library</h3><p style="color:var(--admin-text-muted);margin:0;">Manage and reuse all platform images, videos, documents, and media uploads.</p></div>' +
                '<div style="display:flex;gap:10px;"><button class="admin-btn" id="uploadMediaBtn"><i class="fal fa-upload" style="margin-right:8px"></i>Upload Asset</button></div>' +
            '</div>' +
            '<div class="admin-card">' +
                '<div class="table-toolbar">' +
                    '<div class="search-box"><i class="fal fa-search"></i><input type="text" id="mediaSearchInput" placeholder="Search assets..."></div>' +
                    '<div class="filter-box">' +
                        '<select class="filter-select" id="mediaTypeFilter"><option value="">All Types</option><option value="image">Images</option><option value="video">Videos</option><option value="pdf">PDFs</option></select>' +
                        '<select class="filter-select" id="mediaFolderFilter"><option value="">All Folders</option><option value="general">General</option><option value="services">Services</option><option value="courses">Courses</option></select>' +
                    '</div>' +
                '</div>' +
                '<div id="mediaGrid" class="media-grid-layout mb-4"></div>' +
                '<div id="mediaPagination" class="d-flex justify-content-between align-items-center mt-3 flex-wrap" style="gap:10px;"></div>' +
                '<div id="mediaEmptyState" style="display:none;padding:60px;text-align:center">' +
                    '<i class="fal fa-images" style="font-size:48px;color:var(--admin-border);margin-bottom:20px;display:block"></i>' +
                    '<h3 class="card-title" style="margin-bottom:10px">No assets found</h3>' +
                    '<p style="color:var(--admin-text-muted)">Upload images, videos, or PDFs to centralize your design assets.</p>' +
                '</div>' +
            '</div>' +
            '</div>'
    };

    /* ── Data Loading ─────────────────────────────────────────── */
    var loadData = async function() {
        // Render user profile dynamically
        if (window.helpers && window.helpers.renderUserProfile) {
            try { await window.helpers.renderUserProfile(); } catch(e) { console.warn("renderUserProfile:", e.message); }
        }

        if (window.api && window.api.getAdminRequests) {
            state.loading = true;
            try {
                var res = await window.api.getAdminRequests();
                console.log("📡 API admin requests:", res ? "received" : "null");
                if (res && res.ok) {
                    var payload = res.data.data || res.data;
                    state.requests = sa(payload.results || payload);
                } else {
                    state.requests = [];
                }
            } catch (err) {
                console.error("❌ API admin requests failed:", err.message);
                state.requests = [];
            } finally {
                state.loading = false;
            }
        } else {
            state.requests = [];
            state.loading = false;
        }
        updateKPIs();
    };

    var updateKPIs = function() {
        var total    = state.requests.length;
        var pending  = state.requests.filter(function(r) { return r.status === 'pending'; }).length;
        var approved = state.requests.filter(function(r) { return r.status === 'approved'; }).length;
        var rejected = state.requests.filter(function(r) { return r.status === 'rejected'; }).length;

        $('#dashTotalReq').text(total);
        $('#dashPendingReq').text(pending);
        $('#kpiTotalRequests').text(total);
        $('#kpiPendingRequests').text(pending);
        $('#kpiApprovedRequests').text(approved);
        $('#kpiRejectedRequests').text(rejected);
    };

    /* ── Rendering ────────────────────────────────────────────── */
    var renderDashboard = function() {
        if (window.adminDashboardLifecycle) {
            window.adminDashboardLifecycle.init();
        }
    };

    var renderRequests = function() {
        var tbody = $('#requestsTableBody');
        if (!tbody.length) return;

        if (state.loading) {
            tbody.html('<tr><td colspan="9" class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> Loading requests...</td></tr>');
            return;
        }
        if (state.requests.length === 0) {
            tbody.html('<tr><td colspan="9" class="text-center py-5" style="color:var(--admin-text-muted)"><i class="fal fa-inbox" style="font-size:28px;display:block;margin-bottom:10px"></i>No requests available</td></tr>');
            return;
        }

        var html = '';
        state.requests.forEach(function(r) {
            var cn = r.client_name ? st(r.client_name, 'Unknown') : (r.client ? st(r.client.first_name || r.client.username, 'Unknown') : 'Unknown');
            var ce = r.client_email ? st(r.client_email, '') : (r.client ? st(r.client.email, '') : '');
            var serviceName = r.service_title || (r.service_details ? r.service_details.title : st(r.service, '-'));
            var qty = r.quantity || 1;
            var brief = r.description ? (r.description.length > 60 ? r.description.substring(0, 60) + '...' : r.description) : '-';
            var attCount = r.attachment_count || (r.attachments ? r.attachments.length : 0);
            var attBadge = attCount > 0
                ? '<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(59,130,246,.1);color:var(--admin-accent);padding:2px 8px;border-radius:10px;font-size:12px;font-weight:500;"><i class="fal fa-paperclip"></i>' + attCount + '</span>'
                : '<span style="color:var(--admin-text-muted);font-size:12px;">None</span>';
            var actions = '<button class="admin-btn secondary" style="padding:4px 10px;font-size:12px;margin-right:4px;" onclick="adminViewRequestDetail(\'' + r.id + '\');">'
                + '<i class="fal fa-eye" style="margin-right:4px;"></i>Details</button>';
            if (r.status === 'pending') {
                actions += '<button class="admin-btn" style="padding:4px 9px;font-size:12px;margin-right:4px;" onclick="handleRequestAction(\'' + r.id + '\',\'approve\',this)">Approve</button>' +
                           '<button class="admin-btn" style="padding:4px 9px;font-size:12px;background:var(--status-danger);border-color:var(--status-danger);" onclick="handleRequestAction(\'' + r.id + '\',\'reject\',this)">Reject</button>';
            } else {
                actions += '<span style="color:var(--admin-text-muted);font-size:12px;">Processed</span>';
            }
            html += '<tr>' +
                '<td><strong>' + cn + '</strong>' + (ce ? '<br><span style="font-size:11px;color:var(--admin-text-muted);">' + ce + '</span>' : '') + '</td>' +
                '<td><span style="color:var(--admin-text-muted);font-size:13px;">' + st(serviceName, '-') + '</span></td>' +
                '<td><strong>' + st(r.title, '-') + '</strong></td>' +
                '<td><span style="display:inline-flex;align-items:center;justify-content:center;background:rgba(13,110,253,.1);color:var(--admin-accent);border-radius:6px;padding:3px 10px;font-weight:600;font-size:13px;">' + qty + '</span></td>' +
                '<td><span style="color:var(--admin-text-muted);font-size:12px;font-style:italic;">' + brief + '</span></td>' +
                '<td>' + attBadge + '</td>' +
                '<td>' + getStatusBadge(st(r.status)) + '</td>' +
                '<td><span style="color:var(--admin-text-muted);font-size:13px;">' + formatDate(r.created_at || r.date) + '</span></td>' +
                '<td style="white-space:nowrap;">' + actions + '</td>' +
            '</tr>';
        });
        tbody.html(html);
    };

    /* ── Request Detail Modal ─────────────────────────────────── */
    window.adminViewRequestDetail = function(requestId) {
        var r = state.requests.find(function(req) { return String(req.id) === String(requestId); });
        if (!r) return;

        // Remove any existing modal
        var existing = document.getElementById('adminRequestDetailModal');
        if (existing) existing.remove();

        var cn = r.client_name ? st(r.client_name, 'Unknown') : 'Unknown';
        var ce = r.client_email ? st(r.client_email, '') : '';
        var serviceName = r.service_title || (r.service_details ? r.service_details.title : '-');
        var servicePrice = r.service_details ? (r.service_details.discounted_price || r.service_details.base_price) : null;
        var fmt = window.api && window.api.formatCurrencyTZS ? window.api.formatCurrencyTZS : function(v){ return 'TSh ' + v; };
        var qty = r.quantity || 1;
        var statusLc = (r.status || 'pending').toLowerCase();

        // Attachments HTML
        var attHtml = '';
        if (r.attachments && r.attachments.length > 0) {
            attHtml = '<div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:8px;">';
            r.attachments.forEach(function(a) {
                var icon = 'fa-file';
                var ft = a.file_type || '';
                if (ft === 'image') icon = 'fa-image';
                else if (ft === 'pdf') icon = 'fa-file-pdf';
                else if (ft === 'document') icon = 'fa-file-word';
                var url = a.file_url || a.file || '#';
                attHtml += '<a href="' + url + '" target="_blank" style="display:inline-flex;align-items:center;gap:6px;background:#f1f5f9;border:1px solid var(--admin-border);padding:6px 12px;border-radius:6px;font-size:12px;text-decoration:none;color:var(--admin-text);transition:all .2s;">'
                    + '<i class="fal ' + icon + '" style="color:var(--admin-accent);"></i>' + (a.filename || 'Attachment') + '</a>';
            });
            attHtml += '</div>';
        } else {
            attHtml = '<span style="color:var(--admin-text-muted);font-size:13px;">No attachments</span>';
        }

        var modalHtml = '<div id="adminRequestDetailModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.55);z-index:2000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);animation:fadeIn .25s ease;">'
            + '<div style="width:100%;max-width:680px;margin:20px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,.18);max-height:90vh;display:flex;flex-direction:column;">'

            // Header
            + '<div style="padding:18px 24px;background:#f8fafc;border-bottom:1px solid var(--admin-border);display:flex;justify-content:space-between;align-items:center;">'
            +   '<div><h3 style="margin:0;font-size:17px;font-weight:700;font-family:var(--nexin-font);">Request Details</h3>'
            +   '<span style="font-size:12px;color:var(--admin-text-muted);">ID: #' + st(r.id,'—').substring(0,8) + '</span></div>'
            +   '<button onclick="document.getElementById(\'adminRequestDetailModal\').remove();" style="background:none;border:none;font-size:20px;color:var(--admin-text-muted);cursor:pointer;"><i class="fal fa-times"></i></button>'
            + '</div>'

            // Body
            + '<div style="padding:24px;overflow-y:auto;flex:1;">'

            // Client + Service row
            + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">'
            +   '<div style="background:#f8fafc;border:1px solid var(--admin-border);border-radius:8px;padding:14px;">'
            +     '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--admin-text-muted);margin-bottom:4px;">Client</div>'
            +     '<div style="font-weight:600;font-size:15px;">' + cn + '</div>'
            +     (ce ? '<div style="font-size:12px;color:var(--admin-text-muted);margin-top:2px;">' + ce + '</div>' : '')
            +   '</div>'
            +   '<div style="background:#f8fafc;border:1px solid var(--admin-border);border-radius:8px;padding:14px;">'
            +     '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--admin-text-muted);margin-bottom:4px;">Service Requested</div>'
            +     '<div style="font-weight:600;font-size:15px;">' + st(serviceName, '-') + '</div>'
            +     (servicePrice ? '<div style="font-size:12px;color:var(--admin-accent);margin-top:2px;">' + fmt(servicePrice) + '</div>' : '')
            +   '</div>'
            + '</div>'

            // Project Title + Quantity row
            + '<div style="display:grid;grid-template-columns:1fr auto;gap:16px;margin-bottom:20px;align-items:start;">'
            +   '<div>'
            +     '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--admin-text-muted);margin-bottom:4px;">Project Title</div>'
            +     '<div style="font-weight:600;font-size:16px;color:var(--admin-text);">' + st(r.title, '-') + '</div>'
            +   '</div>'
            +   '<div style="text-align:center;">'
            +     '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--admin-text-muted);margin-bottom:4px;">Quantity</div>'
            +     '<div style="background:rgba(13,110,253,.1);color:var(--admin-accent);border-radius:8px;padding:6px 20px;font-weight:700;font-size:22px;">' + qty + '</div>'
            +   '</div>'
            + '</div>'

            // Status + Date row
            + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">'
            +   '<div>'
            +     '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--admin-text-muted);margin-bottom:6px;">Status</div>'
            +     getStatusBadge(st(r.status))
            +   '</div>'
            +   '<div>'
            +     '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--admin-text-muted);margin-bottom:4px;">Submitted</div>'
            +     '<div style="font-size:13px;color:var(--admin-text);">' + formatDate(r.created_at) + '</div>'
            +   '</div>'
            + '</div>'

            // Creative Brief
            + '<div style="margin-bottom:20px;">'
            +   '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--admin-text-muted);margin-bottom:8px;">Creative Brief / Instructions</div>'
            +   '<div style="background:#f8fafc;border:1px solid var(--admin-border);border-radius:8px;padding:14px;font-size:13.5px;color:var(--admin-text);line-height:1.7;white-space:pre-line;">' + st(r.description, 'No description provided.') + '</div>'
            + '</div>'

            // Attachments
            + '<div>'
            +   '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--admin-text-muted);margin-bottom:8px;"><i class="fal fa-paperclip" style="margin-right:5px;"></i>Reference Materials &amp; Attachments</div>'
            +   attHtml
            + '</div>'

            // Admin note if present
            + (r.admin_note ? '<div style="margin-top:20px;background:rgba(255,193,7,.08);border:1px solid rgba(255,193,7,.3);border-radius:8px;padding:14px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--status-warning);margin-bottom:6px;"><i class="fal fa-sticky-note" style="margin-right:5px;"></i>Admin Note</div><div style="font-size:13.5px;color:var(--admin-text);">' + r.admin_note + '</div></div>' : '')

            + '</div>'

            // Footer actions
            + '<div style="padding:16px 24px;background:#f8fafc;border-top:1px solid var(--admin-border);display:flex;justify-content:flex-end;gap:10px;">'
            + (r.status === 'pending'
                ? '<button class="admin-btn" style="font-size:13px;" onclick="handleRequestAction(\'' + r.id + '\',\'approve\',this);document.getElementById(\'adminRequestDetailModal\').remove();">Approve</button>'
                + '<button class="admin-btn" style="font-size:13px;background:var(--status-danger);border-color:var(--status-danger);" onclick="handleRequestAction(\'' + r.id + '\',\'reject\',this);document.getElementById(\'adminRequestDetailModal\').remove();">Reject</button>'
                : '<span style="font-size:13px;color:var(--admin-text-muted);align-self:center;">Already processed</span>')
            + '<button class="admin-btn secondary" style="font-size:13px;" onclick="document.getElementById(\'adminRequestDetailModal\').remove();">Close</button>'
            + '</div>'

            + '</div></div>';

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        // Close on backdrop click
        document.getElementById('adminRequestDetailModal').addEventListener('click', function(e) {
            if (e.target === this) this.remove();
        });
    };

    var renderAnalytics = function() {
        if (window.adminDashboardLifecycle) {
            window.adminDashboardLifecycle.init();
        }
    };

    /* ── Request Actions ──────────────────────────────────────── */
    window.handleRequestAction = async function(id, action, btnEl) {
        var btn = $(btnEl);
        var orig = btn.text();
        btn.html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);
        try {
            var res = action === 'approve' ? await window.api.approveRequest(id) : await window.api.rejectRequest(id);
            if (res && res.ok) {
                if (window.showToast) window.showToast('success', 'Request ' + action + 'd successfully.');
                await loadData();
                renderRequests();
            } else {
                if (window.showToast) window.showToast('error', 'Failed to ' + action + ' request.');
                btn.text(orig).prop('disabled', false);
            }
        } catch (err) {
            console.error('API FAILED (' + action + '):', err);
            if (window.showToast) window.showToast('error', 'Error: ' + err.message);
            btn.text(orig).prop('disabled', false);
        }
    };

    /* ── View Switching ───────────────────────────────────────── */
    var loadView = function(viewName) {
        console.log("📌 loadView:", viewName);

        var pt = document.getElementById('pageTitle');
        if (pt) pt.textContent = viewName.charAt(0).toUpperCase() + viewName.slice(1);

        var content = document.getElementById('adminContent');
        if (!content) { console.warn("⚠️ Missing: #adminContent"); return; }
        content.innerHTML = views[viewName] || views['dashboard'];

        // Render view-specific content
        if (viewName === 'dashboard') { updateKPIs(); renderDashboard(); }
        if (viewName === 'requests') {
            if (window.adminRequests && typeof window.adminRequests.init === 'function') {
                window.adminRequests.init();
            } else {
                updateKPIs(); renderRequests();
            }
        }
        if (viewName === 'analytics') { renderAnalytics(); }
        if (viewName === 'users' && window.adminUsersLifecycle) { window.adminUsersLifecycle.init(); }
        if (viewName === 'services' && window.adminServicesLifecycle) { window.adminServicesLifecycle.init(); }
        if (viewName === 'projects' && window.adminProjectsLifecycle) { window.adminProjectsLifecycle.init(); }
        if (viewName === 'media' && window.adminMediaLifecycle) { window.adminMediaLifecycle.init(); }

        // Update active menu state
        document.querySelectorAll('.menu-item').forEach(function(el) { el.classList.remove('active'); });
        var active = document.querySelector('.menu-item[data-view="' + viewName + '"]');
        if (active) active.classList.add('active');

        // Close mobile sidebar
        if (window.innerWidth < 992) {
            var sb = document.getElementById('adminSidebar');
            var ov = document.querySelector('.sidebar-overlay');
            if (sb) sb.classList.remove('show');
            if (ov) ov.classList.remove('show');
        }

        // Re-render greeting if on dashboard
        if (viewName === 'dashboard' && window.helpers && window.helpers.renderUserProfile) {
            window.helpers.renderUserProfile();
        }
    };

    // Expose to global scope for event delegation
    window._adminLoadView = loadView;

    /* ── UI Initialization ────────────────────────────────────── */
    function initUI() {
        // Create sidebar overlay if needed
        if (!document.querySelector('.sidebar-overlay')) {
            var ov = document.createElement('div');
            ov.className = 'sidebar-overlay';
            document.body.appendChild(ov);
        }

        // Profile dropdown toggle
        var trigger = document.getElementById('profileDropdownTrigger');
        var dropdown = document.getElementById('profileDropdown');

        if (trigger && dropdown) {
            // Remove any stale listeners by cloning
            var newTrigger = trigger.cloneNode(true);
            trigger.parentNode.replaceChild(newTrigger, trigger);

            newTrigger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.toggle('active');
                console.log("📌 Profile dropdown toggled:", dropdown.classList.contains('active'));
            });
        } else {
            console.warn("⚠️ Profile dropdown elements not found");
        }

        // Sidebar toggle (mobile)
        $('#sidebarToggle').off('click').on('click', function() {
            $('#adminSidebar').addClass('show');
            $('.sidebar-overlay').addClass('show');
        });
        $('#sidebarClose, .sidebar-overlay').off('click').on('click', function() {
            $('#adminSidebar').removeClass('show');
            $('.sidebar-overlay').removeClass('show');
        });

        console.log("✅ UI components initialized");
    }

    /* ── Dashboard Boot ───────────────────────────────────────── */
    var initializeDashboard = async function() {
        console.log("STEP 1: Load data");
        await loadData();

        console.log("STEP 2: Render default view");
        loadView('dashboard');

        console.log("STEP 3: Init UI components");
        initUI();

        console.log("✅ Admin dashboard fully initialized");
    };

    initializeDashboard().catch(function(err) {
        console.error("❌ ADMIN INIT FAILED:", err);
    });
});
