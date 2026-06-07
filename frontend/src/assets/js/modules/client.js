/**
 * G Design — Client Dashboard
 * ────────────────────────────
 * Fully stabilized: dynamic profile, real API data, proper states, event rebinding
 */
console.log("🔥 JS FILE LOADED:", "client.js");

/* ── Global event delegation ─────────────────────────────────── */
document.addEventListener("click", function(e) {
    var menuItem = e.target.closest(".menu-item[data-view]");
    if (menuItem) {
        e.preventDefault();
        var v = menuItem.dataset.view;
        if (v && typeof window._clientLoadView === "function") window._clientLoadView(v);
        return;
    }

    var trigger = e.target.closest("[data-view-trigger]");
    if (trigger) {
        e.preventDefault();
        var v = trigger.dataset.viewTrigger;
        if (v && typeof window._clientLoadView === "function") window._clientLoadView(v);
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

    if (!e.target.closest(".profile-box")) {
        var dd = document.getElementById("profileDropdown");
        if (dd) dd.classList.remove("active");
    }
});

$(document).ready(function () {
    console.log("🔥 client.js — $(document).ready FIRED");

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
            '<div class="mb-4"><h3 style="font-family:var(--nexin-font);font-weight:600" id="welcomeGreeting">Welcome back!</h3><p style="color:var(--admin-text-muted)">Here\'s an overview of your requests</p></div>' +
            '<div class="kpi-grid">' +
                '<div class="admin-card kpi-card"><div class="kpi-icon orders"><i class="fal fa-clock"></i></div><div class="kpi-info"><span class="kpi-value" id="dashPendingReq">0</span><span class="kpi-label">Pending Requests</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon courses"><i class="fal fa-check-circle"></i></div><div class="kpi-info"><span class="kpi-value" id="dashApprovedReq">0</span><span class="kpi-label">Approved Requests</span></div></div>' +
            '</div>' +
            '<div class="row gutter-y-30">' +
                '<div class="col-lg-8"><div class="admin-card"><div class="card-header"><h3 class="card-title">Recent Requests</h3></div><div class="admin-table-container"><table class="admin-table"><thead><tr><th>Title</th><th>Service</th><th>Status</th></tr></thead><tbody id="dashRequestsTableBody"></tbody></table></div></div></div>' +
                '<div class="col-lg-4"><div class="admin-card mb-4"><div class="card-header"><h3 class="card-title">Quick Actions</h3></div><div style="display:flex;flex-direction:column;gap:15px"><button class="admin-btn" style="width:100%" data-view-trigger="requests"><i class="fal fa-plus" style="margin-right:8px"></i>Manage Requests</button><button class="admin-btn secondary" style="width:100%" data-view-trigger="services"><i class="fal fa-magic" style="margin-right:8px"></i>Explore Services</button></div></div></div>' +
            '</div></div>',

        projects: '<div class="view-container"><div class="admin-card" style="padding:60px;text-align:center"><i class="fal fa-folder-open" style="font-size:48px;color:var(--admin-border);margin-bottom:20px;display:block"></i><h3 class="card-title" style="margin-bottom:10px">My Projects</h3><p style="color:var(--admin-text-muted)">No active projects yet. Once your service requests are approved, your projects will appear here.</p></div></div>',

        requests: '<div class="view-container">' +
            '<div class="mb-4 d-flex justify-content-between align-items-center"><div><h3 style="font-family:var(--nexin-font);font-weight:600">My Requests</h3><p style="color:var(--admin-text-muted)">Track and manage your service requests</p></div><button class="admin-btn" id="openRequestModalBtn" data-view-trigger="services"><i class="fal fa-plus" style="margin-right:8px"></i>New Request</button></div>' +
            '<div class="kpi-grid mb-4">' +
                '<div class="admin-card kpi-card"><div class="kpi-icon projects"><i class="fal fa-list-alt"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiTotalRequests">0</span><span class="kpi-label">Total Requests</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon orders" style="color:var(--status-warning);background:rgba(255,193,7,.1)"><i class="fal fa-clock"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiPendingRequests">0</span><span class="kpi-label">Pending</span></div></div>' +
                '<div class="admin-card kpi-card"><div class="kpi-icon courses" style="color:var(--status-success);background:rgba(40,167,69,.1)"><i class="fal fa-check-circle"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiApprovedRequests">0</span><span class="kpi-label">Approved</span></div></div>' +
            '</div>' +
            '<div class="admin-card"><div class="admin-table-container"><table class="admin-table"><thead><tr><th>Title</th><th>Service</th><th>Budget</th><th>Status</th><th>Date</th></tr></thead><tbody id="clientRequestsTable"></tbody></table>' +
                '<div id="requestsEmptyState" style="display:none;padding:40px;text-align:center"><div style="font-size:40px;color:var(--admin-border);margin-bottom:15px"><i class="fal fa-folder-open"></i></div><h4 style="font-family:var(--nexin-font);font-weight:600">No requests yet</h4><p style="color:var(--admin-text-muted);margin-bottom:20px">Explore our services to create your first request.</p><button class="admin-btn secondary" id="emptyStateNewRequestBtn" data-view-trigger="services">Explore Services</button></div>' +
            '</div></div></div>',

        services: '<div class="view-container"><div class="mb-4"><h3 style="font-family:var(--nexin-font);font-weight:600">Creative Services</h3><p style="color:var(--admin-text-muted)">Explore our premium design offerings.</p></div><div class="row gutter-y-30" id="servicesGrid"></div></div>',

        settings: '<div class="view-container"><div class="admin-card" style="padding:60px;text-align:center"><i class="fal fa-cog" style="font-size:48px;color:var(--admin-border);margin-bottom:20px;display:block"></i><h3 class="card-title" style="margin-bottom:10px">Settings</h3><p style="color:var(--admin-text-muted)">Account settings and preferences will be available here in a future update.</p></div></div>'
    };

    /* ── Data Loading ─────────────────────────────────────────── */
    var loadData = async function() {
        if (window.helpers && window.helpers.renderUserProfile) {
            try { await window.helpers.renderUserProfile(); } catch(e) { console.warn("renderUserProfile:", e.message); }
        }

        if (window.api && window.api.getMyRequests) {
            state.loading = true;
            try {
                var res = await window.api.getMyRequests();
                console.log("📡 API client requests:", res ? "received" : "null");
                if (res && res.ok) {
                    var payload = res.data.data || res.data;
                    state.requests = sa(payload.results || payload);
                } else {
                    state.requests = [];
                }
            } catch (err) {
                console.error("❌ API client requests failed:", err.message);
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

        $('#dashPendingReq').text(pending);
        $('#dashApprovedReq').text(approved);
        $('#kpiTotalRequests').text(total);
        $('#kpiPendingRequests').text(pending);
        $('#kpiApprovedRequests').text(approved);
    };

    /* ── Rendering ────────────────────────────────────────────── */
    var renderDashboard = function() {
        var tbody = $('#dashRequestsTableBody');
        if (!tbody.length) return;

        if (state.loading) {
            tbody.html('<tr><td colspan="3" class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>');
            return;
        }
        if (state.requests.length === 0) {
            tbody.html('<tr><td colspan="3" class="text-center py-5" style="color:var(--admin-text-muted)"><i class="fal fa-inbox" style="font-size:28px;display:block;margin-bottom:10px"></i>No requests yet. Create one to get started!</td></tr>');
            return;
        }

        var html = '';
        state.requests.slice(0, 5).forEach(function(r) {
            var serviceName = r.service_title || (r.service_details ? r.service_details.title : 'Custom Service');
            html += '<tr><td><strong>' + st(r.title, '-') + '</strong></td><td>' + st(serviceName, '-') + '</td><td>' + getStatusBadge(st(r.status)) + '</td></tr>';
        });
        tbody.html(html);
    };

    var renderRequests = function() {
        var tbody = $('#clientRequestsTable');
        var emptyState = $('#requestsEmptyState');
        if (!tbody.length) return;

        if (state.loading) {
            tbody.html('<tr><td colspan="5" class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> Loading requests...</td></tr>');
            if (emptyState.length) emptyState.hide();
            tbody.parent().show();
            return;
        }
        if (state.requests.length === 0) {
            tbody.html('');
            if (emptyState.length) emptyState.show();
            tbody.closest('.admin-table-container').find('table').hide();
            return;
        }

        if (emptyState.length) emptyState.hide();
        tbody.closest('.admin-table-container').find('table').show();

        var html = '';
        state.requests.forEach(function(r) {
            var fmt = window.api && window.api.formatCurrencyTZS ? window.api.formatCurrencyTZS : function(v){ return "TSh " + v; };
            var budgetStr = r.budget ? fmt(r.budget) : '<span style="color:var(--admin-text-muted)">Not specified</span>';
            var serviceName = r.service_title || (r.service_details ? r.service_details.title : 'Custom Service');
            html += '<tr><td><strong>' + st(r.title, '-') + '</strong></td><td><span style="color:var(--admin-text-muted)">' + st(serviceName, '-') + '</span></td><td>' + budgetStr + '</td><td>' + getStatusBadge(st(r.status)) + '</td><td><span style="color:var(--admin-text-muted);font-size:13px">' + formatDate(r.created_at || r.date) + '</span></td></tr>';
        });
        tbody.html(html);
    };


    /* ── View Switching ───────────────────────────────────────── */
    var loadView = function(viewName) {
        console.log("📌 loadView:", viewName);

        var titleMap = { projects: "My Projects", requests: "Service Requests", services: "Creative Services" };
        var title = titleMap[viewName] || (viewName.charAt(0).toUpperCase() + viewName.slice(1));
        var pt = document.getElementById('pageTitle');
        if (pt) pt.textContent = title;

        var content = document.getElementById('adminContent');
        if (!content) { console.warn("⚠️ Missing: #adminContent"); return; }
        content.innerHTML = views[viewName] || views['dashboard'];

        if (viewName === 'dashboard') { updateKPIs(); renderDashboard(); }
        if (viewName === 'requests')  { updateKPIs(); renderRequests(); }
        if (viewName === 'services')  {
            if (window.clientServicesLifecycle) {
                window.clientServicesLifecycle.init();
            }
        }

        document.querySelectorAll('.menu-item').forEach(function(el) { el.classList.remove('active'); });
        var active = document.querySelector('.menu-item[data-view="' + viewName + '"]');
        if (active) active.classList.add('active');

        if (window.innerWidth < 992) {
            var sb = document.getElementById('adminSidebar');
            var ov = document.querySelector('.sidebar-overlay');
            if (sb) sb.classList.remove('show');
            if (ov) ov.classList.remove('show');
        }

        if (viewName === 'dashboard' && window.helpers && window.helpers.renderUserProfile) {
            window.helpers.renderUserProfile();
        }
    };

    window._clientLoadView = loadView;

    
    /* ── Request Modal Injection ──────────────────────────────── */
    // Inject the global request modal into the body
    var requestModalHTML = '\
        <div class="custom-modal-overlay" id="premiumRequestModalOverlay" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.6);z-index:1100;align-items:center;justify-content:center;backdrop-filter:blur(5px);">\
            <div class="custom-modal-content admin-card" style="width:100%;max-width:700px;margin:20px;position:relative;animation:fadeIn .3s ease;padding:0;overflow:hidden;border-radius:12px;display:flex;flex-direction:column;max-height:90vh;">\
                <div style="padding:20px 25px;background:#f8fafc;border-bottom:1px solid var(--admin-border);display:flex;justify-content:space-between;align-items:center;">\
                    <h3 class="card-title m-0" style="font-size:18px;">Request Service</h3>\
                    <button id="closePremiumRequestModal" style="background:none;border:none;font-size:20px;color:var(--admin-text-muted);cursor:pointer;"><i class="fal fa-times"></i></button>\
                </div>\
                <div style="padding:25px;overflow-y:auto;flex-grow:1;">\
                    <div id="premiumRequestServiceInfo" style="display:flex;gap:15px;align-items:center;padding:15px;background:var(--admin-bg);border:1px solid var(--admin-border);border-radius:8px;margin-bottom:25px;">\
                        <img id="premiumRequestServiceThumb" src="" alt="Service" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">\
                        <div>\
                            <h4 id="premiumRequestServiceTitle" style="font-size:16px;font-weight:600;margin-bottom:4px;">Service Name</h4>\
                            <div style="font-size:13px;color:var(--admin-text-muted);display:flex;gap:15px;">\
                                <span id="premiumRequestServicePrice"><i class="fal fa-tag" style="margin-right:5px;"></i>Price</span>\
                                <span id="premiumRequestServiceDelivery"><i class="fal fa-clock" style="margin-right:5px;"></i>Delivery</span>\
                            </div>\
                        </div>\
                    </div>\
                    <form class="admin-form" id="premiumCreateRequestForm">\
                        <input type="hidden" name="service_id" id="premiumRequestServiceId">\
                        <div class="form-group">\
                            <label>Project Title <span class="text-danger">*</span></label>\
                            <input type="text" name="title" placeholder="e.g. Summer Campaign Posters" required>\
                        </div>\
                        <div class="form-group">\
                            <label>Detailed Instructions / Creative Brief <span class="text-danger">*</span></label>\
                            <textarea name="description" rows="5" style="width:100%;padding:12px;border:1px solid var(--admin-border);border-radius:8px;font-family:inherit;font-size:14px;outline:none;resize:vertical;" placeholder="Describe your vision, requirements, colors, text content, etc..." required></textarea>\
                        </div>\
                        <div class="form-group">\
                             <label>Quantity <span class="text-danger">*</span></label>\
                             <input type="number" name="quantity" placeholder="e.g. 1" step="1" min="1" value="1" required>\
                             <small style="color:var(--admin-text-muted);font-size:12px;margin-top:4px;display:block;">Number of units / copies needed</small>\
                         </div>\
                        <div class="form-group">\
                            <label>Reference Materials & Assets</label>\
                            <div class="file-upload-zone" id="premiumFileUploadZone" style="border:2px dashed var(--admin-border);border-radius:8px;padding:30px;text-align:center;cursor:pointer;background:#f8fafc;transition:all .2s ease;">\
                                <i class="fal fa-cloud-upload" style="font-size:32px;color:var(--admin-accent);margin-bottom:10px;"></i>\
                                <p style="margin:0;font-weight:500;color:var(--admin-text);">Click to browse or drag & drop files</p>\
                                <p style="margin:5px 0 0 0;font-size:12px;color:var(--admin-text-muted);">PNG, JPG, SVG, PDF, DOCX (Max 10MB)</p>\
                                <input type="file" id="premiumFileInput" name="attachments" multiple accept=".png,.jpg,.jpeg,.svg,.pdf,.docx" style="display:none;">\
                            </div>\
                            <div id="premiumFilePreviewContainer" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:15px;"></div>\
                        </div>\
                        <div style="margin-top:30px;display:flex;justify-content:flex-end;gap:10px;">\
                            <button type="button" class="admin-btn secondary" id="premiumCancelRequestBtn">Cancel</button>\
                            <button type="submit" id="premiumSubmitRequestBtn" class="admin-btn">\
                                <span class="btn-text">Submit Request</span>\
                                <span class="btn-spinner" style="display:none;margin-left:8px"><i class="fas fa-spinner fa-spin"></i></span>\
                            </button>\
                        </div>\
                    </form>\
                </div>\
            </div>\
        </div>';
    
    document.body.insertAdjacentHTML('beforeend', requestModalHTML);

    window.openRequestModal = function(service) {
        if (!service) return;
        var modal = document.getElementById('premiumRequestModalOverlay');
        var form = document.getElementById('premiumCreateRequestForm');
        var previewContainer = document.getElementById('premiumFilePreviewContainer');
        var fileInput = document.getElementById('premiumFileInput');
        
        // Reset form and files
        if (form) form.reset();
        if (previewContainer) previewContainer.innerHTML = '';
        if (fileInput) fileInput.value = '';
        if (window._premiumSelectedFiles) window._premiumSelectedFiles = [];
        
        // Fill service info
        document.getElementById('premiumRequestServiceId').value = service.id;
        document.getElementById('premiumRequestServiceTitle').textContent = service.title;
        var fmt = window.api && window.api.formatCurrencyTZS ? window.api.formatCurrencyTZS : function(v){ return "TSh " + v; };
        document.getElementById('premiumRequestServicePrice').innerHTML = '<i class="fal fa-tag" style="margin-right:5px;"></i>' + fmt(service.discounted_price || service.base_price);
        document.getElementById('premiumRequestServiceDelivery').innerHTML = '<i class="fal fa-clock" style="margin-right:5px;"></i>' + (service.delivery_time || 'N/A');
        
        var imgUrl = service.thumbnail_asset_details ? (service.thumbnail_asset_details.medium || service.thumbnail_asset_details.file) : (service.thumbnail || '../../../../src/assets/images/company-img/favicon.svg');
        document.getElementById('premiumRequestServiceThumb').src = imgUrl;

        // Show modal
        if (modal) {
            $(modal).css('display', 'flex').hide().fadeIn(200);
        }
    };

    // Close modal handlers
    var closePremiumModal = function() {
        var modal = document.getElementById('premiumRequestModalOverlay');
        if (modal) $(modal).fadeOut(200);
    };
    $('#closePremiumRequestModal, #premiumCancelRequestBtn').on('click', function(e) {
        e.preventDefault();
        closePremiumModal();
    });
    $('#premiumRequestModalOverlay').on('click', function(e) {
        if (e.target === this) closePremiumModal();
    });

    // File Upload Handlers
    window._premiumSelectedFiles = [];
    var fileZone = document.getElementById('premiumFileUploadZone');
    var fileInput = document.getElementById('premiumFileInput');
    var previewContainer = document.getElementById('premiumFilePreviewContainer');

    if (fileZone && fileInput && previewContainer) {
        fileZone.addEventListener('click', function() { fileInput.click(); });
        
        fileZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            fileZone.style.borderColor = 'var(--admin-accent)';
            fileZone.style.background = 'rgba(13, 110, 253, 0.05)';
        });
        
        fileZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            fileZone.style.borderColor = 'var(--admin-border)';
            fileZone.style.background = '#f8fafc';
        });
        
        fileZone.addEventListener('drop', function(e) {
            e.preventDefault();
            fileZone.style.borderColor = 'var(--admin-border)';
            fileZone.style.background = '#f8fafc';
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFilesSelected(e.dataTransfer.files);
            }
        });
        
        fileInput.addEventListener('change', function(e) {
            if (this.files && this.files.length > 0) {
                handleFilesSelected(this.files);
            }
        });

        function handleFilesSelected(files) {
            Array.from(files).forEach(file => {
                if (file.size > 10 * 1024 * 1024) {
                    if (window.showToast) window.showToast('error', file.name + ' is too large (Max 10MB)');
                    return;
                }
                window._premiumSelectedFiles.push(file);
                
                var ext = file.name.split('.').pop().toLowerCase();
                var icon = 'fa-file';
                if (['png','jpg','jpeg','svg'].includes(ext)) icon = 'fa-image';
                else if (ext === 'pdf') icon = 'fa-file-pdf';
                else if (['doc','docx'].includes(ext)) icon = 'fa-file-word';
                
                var fileId = 'file_' + Math.random().toString(36).substr(2, 9);
                
                var html = '\
                    <div id="' + fileId + '" style="display:flex;align-items:center;background:#fff;border:1px solid var(--admin-border);padding:8px 12px;border-radius:6px;min-width:200px;max-width:300px;">\
                        <i class="fal ' + icon + '" style="color:var(--admin-accent);font-size:18px;margin-right:10px;"></i>\
                        <div style="flex-grow:1;overflow:hidden;">\
                            <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + file.name + '</div>\
                            <div style="font-size:11px;color:var(--admin-text-muted);">' + (file.size / 1024 / 1024).toFixed(2) + ' MB</div>\
                        </div>\
                        <button type="button" class="remove-file-btn" data-target="' + fileId + '" style="background:none;border:none;color:var(--status-danger);cursor:pointer;margin-left:10px;padding:5px;"><i class="fal fa-times"></i></button>\
                    </div>';
                
                previewContainer.insertAdjacentHTML('beforeend', html);
            });
            
            // Rebind remove buttons
            document.querySelectorAll('.remove-file-btn').forEach(btn => {
                btn.onclick = function() {
                    var targetId = this.dataset.target;
                    var el = document.getElementById(targetId);
                    if (el) {
                        var index = Array.from(previewContainer.children).indexOf(el);
                        if (index > -1) {
                            window._premiumSelectedFiles.splice(index, 1);
                        }
                        el.remove();
                    }
                };
            });
            
            // Clear input so same file can be selected again
            fileInput.value = '';
        }
    }

    // Form submission
    $('#premiumCreateRequestForm').on('submit', async function(e) {
        e.preventDefault();
        var form = e.target;
        var btn = document.getElementById('premiumSubmitRequestBtn');
        var btnText = btn.querySelector('.btn-text');
        var btnSpin = btn.querySelector('.btn-spinner');
        
        btn.disabled = true;
        btnText.style.display = 'none';
        btnSpin.style.display = 'inline-block';
        
        var formData = new FormData();
        formData.append('service', form.service_id.value);
        formData.append('title', form.title.value);
        formData.append('description', form.description.value);
        formData.append('quantity', form.quantity.value || 1);
        
        if (window._premiumSelectedFiles && window._premiumSelectedFiles.length > 0) {
            window._premiumSelectedFiles.forEach(f => {
                formData.append('attachments', f);
            });
        }
        
        try {
            var res = await window.api.createServiceRequest(formData);
            if (res && res.ok) {
                if (window.showToast) window.showToast('success', 'Request submitted successfully!');
                closePremiumModal();
                await loadData();
                loadView('requests');
            } else {
                var errorMsg = "Failed to submit request.";
                if (res && res.data && typeof res.data === 'object') {
                    var firstKey = Object.keys(res.data)[0];
                    if (firstKey && res.data[firstKey][0]) {
                        errorMsg = res.data[firstKey][0];
                    }
                }
                if (window.showToast) window.showToast('error', errorMsg);
            }
        } catch (err) {
            console.error("Submission error:", err);
            if (window.showToast) window.showToast('error', 'Network error occurred.');
        } finally {
            btn.disabled = false;
            btnText.style.display = 'inline-block';
            btnSpin.style.display = 'none';
        }
    });


    /* ── UI Initialization ────────────────────────────────────── */
    function initUI() {
        if (!document.querySelector('.sidebar-overlay')) {
            var ov = document.createElement('div');
            ov.className = 'sidebar-overlay';
            document.body.appendChild(ov);
        }

        // Profile dropdown toggle - use cloneNode to prevent stale listeners
        var trigger = document.getElementById('profileDropdownTrigger');
        var dropdown = document.getElementById('profileDropdown');
        if (trigger && dropdown) {
            var newTrigger = trigger.cloneNode(true);
            trigger.parentNode.replaceChild(newTrigger, trigger);
            newTrigger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });
        }

        $('#sidebarToggle').off('click').on('click', function() { $('#adminSidebar').addClass('show'); $('.sidebar-overlay').addClass('show'); });
        $('#sidebarClose, .sidebar-overlay').off('click').on('click', function() { $('#adminSidebar').removeClass('show'); $('.sidebar-overlay').removeClass('show'); });

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

        console.log("✅ Client dashboard fully initialized");
    };

    initializeDashboard().catch(function(err) { console.error("❌ CLIENT INIT FAILED:", err); });
});
