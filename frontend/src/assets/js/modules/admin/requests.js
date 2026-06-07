/**
 * G Design Admin Request Management Module
 * Premium Workflow & Slide-over Panel Implementation
 */

let allRequests = [];
let filteredRequests = [];
let currentRequest = null;
let elements = {};

const initElements = () => {
    elements = {
        tableBody: $('#requestsTableBody'),
        totalCount: $('#kpiTotalRequests'),
        pendingCount: $('#kpiPendingRequests'),
        approvedCount: $('#kpiApprovedRequests'),
        rejectedCount: $('#kpiRejectedRequests'),
        searchInput: $('#searchRequests'),
        statusFilter: $('#filterRequestStatus'),
        serviceFilter: $('#filterRequestService')
    };

    // Inject Slide-Over Panel HTML into body if not exists
    if (!$('#premiumRequestSidePanel').length) {
        const panelHtml = `
        <div id="premiumRequestSidePanelOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); z-index:1040; backdrop-filter: blur(4px);"></div>
        <div id="premiumRequestSidePanel" style="position:fixed; top:0; right:-800px; width:100%; max-width:800px; height:100vh; background:#fff; z-index:1050; box-shadow:-5px 0 25px rgba(0,0,0,0.1); transition:right 0.3s cubic-bezier(0.4, 0, 0.2, 1); display:flex; flex-direction:column;">
            
            <!-- Panel Header -->
            <div style="padding:20px 30px; border-bottom:1px solid var(--admin-border); display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                <div>
                    <h3 id="panelReqTitle" style="margin:0; font-family:var(--nexin-font); font-weight:600; font-size:22px; color:var(--admin-text);">Request Details</h3>
                    <div id="panelReqId" style="font-size:13px; color:var(--admin-text-muted); margin-top:4px;"></div>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <div id="panelReqStatus"></div>
                    <button id="closeSidePanelBtn" style="background:none; border:none; font-size:24px; color:var(--admin-text-muted); cursor:pointer;"><i class="fal fa-times"></i></button>
                </div>
            </div>

            <!-- Panel Content -->
            <div style="flex-grow:1; overflow-y:auto; padding:30px; background:#f8fafc;">
                <div class="row">
                    <!-- Left Column: Details -->
                    <div class="col-lg-8">
                        
                        <!-- Client & Service Info -->
                        <div class="admin-card mb-4" style="padding:20px;">
                            <div class="row">
                                <div class="col-6">
                                    <p style="font-size:12px; text-transform:uppercase; color:var(--admin-text-muted); margin-bottom:5px; font-weight:600;">Client</p>
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <div style="width:40px; height:40px; background:var(--admin-accent); color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:16px;" id="panelClientInitials"></div>
                                        <div>
                                            <div id="panelClientName" style="font-weight:600; color:var(--admin-text);"></div>
                                            <div id="panelClientEmail" style="font-size:13px; color:var(--admin-text-muted);"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <p style="font-size:12px; text-transform:uppercase; color:var(--admin-text-muted); margin-bottom:5px; font-weight:600;">Service Requested</p>
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <img id="panelServiceThumb" src="" style="width:40px; height:40px; border-radius:6px; object-fit:cover; display:none;">
                                        <div>
                                            <div id="panelServiceName" style="font-weight:600; color:var(--admin-text);"></div>
                                            <div style="font-size:13px; color:var(--admin-text-muted);"><span id="panelServicePrice"></span> • <span id="panelServiceDelivery"></span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="admin-card mb-4" style="padding:20px;">
                            <h5 style="font-size:15px; font-weight:600; margin-bottom:15px; border-bottom:1px solid var(--admin-border); padding-bottom:10px;">Instructions & Brief</h5>
                            <div id="panelDescription" style="font-size:14px; line-height:1.6; color:var(--admin-text); white-space:pre-line;"></div>
                            <div style="margin-top:15px; padding-top:15px; border-top:1px dashed var(--admin-border);">
                                <span style="font-size:12px; color:var(--admin-text-muted);">Client Budget:</span>
                                <span id="panelBudget" style="font-weight:600; margin-left:5px;"></span>
                            </div>
                        </div>

                        <!-- Attachments -->
                        <div class="admin-card mb-4" style="padding:20px;" id="panelAttachmentsSection">
                            <h5 style="font-size:15px; font-weight:600; margin-bottom:15px; border-bottom:1px solid var(--admin-border); padding-bottom:10px;">Attachments</h5>
                            <div id="panelAttachmentsGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:15px;"></div>
                        </div>

                        <!-- Notes -->
                        <div class="admin-card" style="padding:20px;">
                            <h5 style="font-size:15px; font-weight:600; margin-bottom:15px; border-bottom:1px solid var(--admin-border); padding-bottom:10px;">Internal Notes</h5>
                            <div id="panelNotesList" style="display:flex; flex-direction:column; gap:10px; margin-bottom:15px; max-height:200px; overflow-y:auto;"></div>
                            <div style="display:flex; gap:10px;">
                                <input type="text" id="newNoteInput" class="admin-input" placeholder="Type an internal note..." style="flex-grow:1; font-size:13px;">
                                <button class="admin-btn" id="addNoteBtn" style="padding:8px 15px;">Add Note</button>
                            </div>
                        </div>

                    </div>

                    <!-- Right Column: Workflow & Timeline -->
                    <div class="col-lg-4">
                        
                        <!-- Actions -->
                        <div class="admin-card mb-4" style="padding:20px;">
                            <h5 style="font-size:15px; font-weight:600; margin-bottom:15px;">Workflow Actions</h5>
                            <div id="panelWorkflowActions" style="display:flex; flex-direction:column; gap:10px;"></div>
                        </div>

                        <!-- Timeline -->
                        <div class="admin-card" style="padding:20px;">
                            <h5 style="font-size:15px; font-weight:600; margin-bottom:15px;">Activity Timeline</h5>
                            <div id="panelTimeline" style="position:relative; padding-left:15px; border-left:2px solid var(--admin-border); margin-left:10px; display:flex; flex-direction:column; gap:15px;"></div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        `;
        $('body').append(panelHtml);
    }
};

const attachEventListeners = () => {
    elements.searchInput.on('input', handleFilter);
    elements.statusFilter.on('change', handleFilter);
    elements.serviceFilter.on('change', handleFilter);

    elements.tableBody.on('click', '.action-view, tr', function(e) {
        if ($(e.target).closest('a, button').length && !$(this).hasClass('action-view')) return;
        e.preventDefault();
        const id = $(this).closest('tr').data('id') || $(this).data('id');
        if (id) openSidePanel(id);
    });

    $('#closeSidePanelBtn, #premiumRequestSidePanelOverlay').on('click', closeSidePanel);

    $('#addNoteBtn').on('click', async function() {
        const note = $('#newNoteInput').val();
        if (!note.trim() || !currentRequest) return;
        
        const $btn = $(this);
        $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');
        
        const res = await window.api.addRequestNote(currentRequest.id, note);
        if (res && res.ok) {
            $('#newNoteInput').val('');
            // Optimistically add note
            currentRequest.notes.unshift({
                user_name: 'You',
                note: note,
                created_at: new Date().toISOString()
            });
            currentRequest.timeline.unshift({
                actor_name: 'You',
                action: 'note_added',
                message: 'An internal note was added.',
                created_at: new Date().toISOString()
            });
            renderNotes(currentRequest.notes);
            renderTimeline(currentRequest.timeline);
        } else {
            alert('Failed to add note');
        }
        $btn.prop('disabled', false).text('Add Note');
    });

    // Workflow actions delegated
    $('#panelWorkflowActions').on('click', 'button', async function() {
        const action = $(this).data('action');
        if (!action || !currentRequest) return;

        let status = '';
        let note = '';

        if (action === 'approve') status = 'approved';
        else if (action === 'reject') {
            note = prompt("Enter rejection reason:");
            if (note === null) return;
            status = 'rejected';
        }
        else if (action === 'start') status = 'in_progress';
        else if (action === 'wait_client') status = 'waiting_client';
        else if (action === 'request_revision') {
            note = prompt("Enter revision instructions:");
            if (note === null) return;
            status = 'revision';
        }
        else if (action === 'complete') status = 'completed';
        else if (action === 'cancel') {
            if(!confirm("Are you sure you want to cancel this request?")) return;
            status = 'cancelled';
        }

        if (!status) return;

        const $btn = $(this);
        const originalText = $btn.text();
        $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');

        const res = await window.api.updateRequestStatus(currentRequest.id, status, note);
        if (res && res.ok) {
            // Refresh single request or all
            await loadRequests();
            openSidePanel(currentRequest.id); // Reload panel with new data
        } else {
            alert('Failed to update status');
            $btn.prop('disabled', false).text(originalText);
        }
    });
};

const loadRequests = async () => {
    elements.tableBody.html(`
        <tr><td colspan="8" class="text-center py-5">
            <div style="display:flex; flex-direction:column; align-items:center; gap:15px;">
                <div class="skeleton-box" style="width:100%; height:40px; border-radius:8px;"></div>
                <div class="skeleton-box" style="width:100%; height:40px; border-radius:8px;"></div>
                <div class="skeleton-box" style="width:100%; height:40px; border-radius:8px;"></div>
            </div>
        </td></tr>
    `);

    const res = await window.api.getAdminRequests();
    
    if (res.ok && res.data && res.data.success) {
        let payload = res.data.data;
        allRequests = (payload && payload.results) ? payload.results : (Array.isArray(payload) ? payload : []);
        filteredRequests = [...allRequests];
        updateUI();
    } else {
        if (res.data && res.data.detail === "Admin access only.") {
            alert("Access Denied.");
            window.auth.logout();
        } else {
            elements.tableBody.html(`
                <tr><td colspan="8" class="text-center text-danger py-5">
                    <i class="fal fa-exclamation-triangle" style="font-size:32px; margin-bottom:10px; display:block;"></i>
                    <h4 style="font-family:var(--nexin-font); font-weight:600;">Unable to load requests</h4>
                    <p>Try refreshing the page.</p>
                </td></tr>
            `);
        }
    }
};

const updateUI = () => {
    renderKPIs();
    renderTable();
};

const renderKPIs = () => {
    const total = allRequests.length;
    const pending = allRequests.filter(r => r.status === 'pending' || r.status === 'under_review').length;
    const active = allRequests.filter(r => ['approved', 'in_progress', 'waiting_client', 'revision'].includes(r.status)).length;
    const rejected = allRequests.filter(r => r.status === 'rejected' || r.status === 'cancelled').length;

    if (elements.totalCount.length) elements.totalCount.text(total);
    if (elements.pendingCount.length) elements.pendingCount.text(pending);
    if (elements.approvedCount.length) elements.approvedCount.text(active);
    if (elements.rejectedCount.length) elements.rejectedCount.text(rejected);
};

const handleFilter = () => {
    const searchTerm = elements.searchInput.val().toLowerCase();
    const status = elements.statusFilter.val();
    const service = elements.serviceFilter.val();

    filteredRequests = allRequests.filter(req => {
        const clientName = (req.client_name || req.client_email || '').toLowerCase();
        const titleMatch = req.title.toLowerCase().includes(searchTerm);
        const matchSearch = titleMatch || clientName.includes(searchTerm);
        const matchStatus = status ? req.status === status : true;
        const matchService = service ? String(req.service) === service : true;
        return matchSearch && matchStatus && matchService;
    });

    renderTable();
};

const getStatusBadge = (status) => {
    const map = {
        'pending': { color: 'var(--status-warning)', bg: 'rgba(255, 193, 7, 0.1)', text: 'Pending' },
        'under_review': { color: '#0dcaf0', bg: 'rgba(13, 202, 240, 0.1)', text: 'Under Review' },
        'approved': { color: '#20c997', bg: 'rgba(32, 201, 151, 0.1)', text: 'Approved' },
        'in_progress': { color: '#6f42c1', bg: 'rgba(111, 66, 193, 0.1)', text: 'In Progress' },
        'waiting_client': { color: '#fd7e14', bg: 'rgba(253, 126, 20, 0.1)', text: 'Waiting Client' },
        'revision': { color: '#e83e8c', bg: 'rgba(232, 62, 140, 0.1)', text: 'Revision' },
        'completed': { color: 'var(--status-success)', bg: 'rgba(40, 167, 69, 0.1)', text: 'Completed' },
        'rejected': { color: 'var(--status-danger)', bg: 'rgba(220, 53, 69, 0.1)', text: 'Rejected' },
        'cancelled': { color: '#6c757d', bg: 'rgba(108, 117, 125, 0.1)', text: 'Cancelled' }
    };
    
    const info = map[status] || { color: '#6c757d', bg: '#f8f9fa', text: status };
    return `<span style="display:inline-block; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; color:${info.color}; background:${info.bg}; white-space:nowrap;">${info.text}</span>`;
};

const renderTable = () => {
    if (!elements.tableBody.length) return;

    if (filteredRequests.length === 0) {
        elements.tableBody.html(`
            <tr><td colspan="8" class="text-center py-5">
                <div style="color:var(--admin-text-muted);">
                    <i class="fal fa-inbox" style="font-size:48px; margin-bottom:15px; display:block; color:var(--admin-border);"></i>
                    <h4 style="font-family:var(--nexin-font); font-weight:600;">No requests available</h4>
                    <p>Client requests will appear here.</p>
                </div>
            </td></tr>
        `);
        return;
    }

    let html = '';
    const fmt = window.api && window.api.formatCurrencyTZS ? window.api.formatCurrencyTZS : function(v){ return "TSh " + v; };

    filteredRequests.forEach(req => {
        const date = new Date(req.updated_at || req.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric'});
        const budgetStr = req.budget ? fmt(req.budget) : '<span class="text-muted">N/A</span>';
        const serviceName = req.service_title || (req.service_details ? req.service_details.title : 'Service');
        const attachmentIcon = req.attachment_count > 0 ? `<span style="font-size:11px; margin-left:8px; color:var(--admin-text-muted);"><i class="fal fa-paperclip"></i> ${req.attachment_count}</span>` : '';
        const clientInitial = (req.client_name || req.client_email || 'U').charAt(0).toUpperCase();

        html += `
            <tr data-id="${req.id}" style="cursor:pointer; transition:background 0.2s ease;">
                <td style="font-size:13px; color:var(--admin-text-muted);">#${req.id}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:32px; height:32px; border-radius:50%; background:rgba(13, 110, 253, 0.1); color:var(--admin-accent); display:flex; align-items:center; justify-content:center; font-weight:600; font-size:13px;">${clientInitial}</div>
                        <div style="line-height:1.3;">
                            <strong style="color:var(--admin-text); font-size:14px;">${req.client_name || req.client_email}</strong>
                            <div style="font-size:12px; color:var(--admin-text-muted);">${req.client_email || ''}</div>
                        </div>
                    </div>
                </td>
                <td><span style="font-size:13px; color:var(--admin-text);">${serviceName}</span></td>
                <td><div style="font-size:14px; font-weight:500; color:var(--admin-text);">${req.title}${attachmentIcon}</div></td>
                <td style="font-size:13px;">${budgetStr}</td>
                <td>${getStatusBadge(req.status)}</td>
                <td style="font-size:13px; color:var(--admin-text-muted);">${date}</td>
                <td>
                    <button class="action-icon action-view" style="background:none; border:none; color:var(--admin-text-muted);" title="View Details"><i class="fal fa-chevron-right"></i></button>
                </td>
            </tr>
        `;
    });

    elements.tableBody.html(html);
};

// --- Panel Logic ---

const openSidePanel = (id) => {
    currentRequest = allRequests.find(r => r.id === id);
    if (!currentRequest) return;
    const req = currentRequest;

    $('#panelReqId').text(`ID: #${req.id} • Submitted: ${new Date(req.created_at).toLocaleString()}`);
    $('#panelReqTitle').text(req.title);
    $('#panelReqStatus').html(getStatusBadge(req.status));

    const clientName = req.client_name || req.client_email || 'Unknown';
    $('#panelClientName').text(clientName);
    $('#panelClientEmail').text(req.client_email || '');
    $('#panelClientInitials').text(clientName.charAt(0).toUpperCase());

    const serviceName = req.service_title || (req.service_details ? req.service_details.title : 'Custom Service');
    $('#panelServiceName').text(serviceName);
    if (req.service_details) {
        const fmt = window.api && window.api.formatCurrencyTZS ? window.api.formatCurrencyTZS : function(v){ return "TSh " + v; };
        $('#panelServicePrice').text(fmt(req.service_details.discounted_price || req.service_details.base_price));
        $('#panelServiceDelivery').text(req.service_details.delivery_time || 'TBD');
        const imgUrl = req.service_details.thumbnail;
        if(imgUrl) {
            $('#panelServiceThumb').attr('src', imgUrl).show();
        } else {
            $('#panelServiceThumb').hide();
        }
    } else {
        $('#panelServicePrice').text('');
        $('#panelServiceDelivery').text('');
        $('#panelServiceThumb').hide();
    }

    $('#panelDescription').text(req.description || 'No description provided.');
    const fmt = window.api && window.api.formatCurrencyTZS ? window.api.formatCurrencyTZS : function(v){ return "TSh " + v; };
    $('#panelBudget').text(req.budget ? fmt(req.budget) : 'Not specified');

    // Render attachments
    if (req.attachments && req.attachments.length > 0) {
        let attHtml = '';
        req.attachments.forEach(att => {
            if (att.file_type === 'image') {
                attHtml += `
                    <div style="border:1px solid var(--admin-border); border-radius:8px; overflow:hidden; position:relative; background:#000; group">
                        <img src="${att.file_url}" style="width:100%; height:100px; object-fit:cover; opacity:0.8; transition:opacity 0.2s;">
                        <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.7); padding:5px; color:#fff; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${att.filename}</div>
                        <a href="${att.file_url}" target="_blank" style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#fff; font-size:20px; opacity:0; transition:opacity 0.2s; background:rgba(0,0,0,0.3);" onmouseover="this.style.opacity=1; this.previousElementSibling.previousElementSibling.style.opacity=0.5;" onmouseout="this.style.opacity=0; this.previousElementSibling.previousElementSibling.style.opacity=0.8;"><i class="fal fa-expand"></i></a>
                    </div>
                `;
            } else {
                const icon = att.file_type === 'pdf' ? 'fa-file-pdf text-danger' : 'fa-file-word text-primary';
                attHtml += `
                    <a href="${att.file_url}" target="_blank" style="border:1px solid var(--admin-border); border-radius:8px; padding:15px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-decoration:none; background:#fff; transition:border-color 0.2s;">
                        <i class="fal ${icon}" style="font-size:32px; margin-bottom:10px;"></i>
                        <span style="font-size:12px; color:var(--admin-text); text-align:center; word-break:break-all; line-height:1.2;">${att.filename}</span>
                    </a>
                `;
            }
        });
        $('#panelAttachmentsGrid').html(attHtml);
        $('#panelAttachmentsSection').show();
    } else {
        $('#panelAttachmentsSection').hide();
    }

    renderNotes(req.notes);
    renderTimeline(req.timeline);
    renderWorkflowActions(req.status);

    $('#premiumRequestSidePanelOverlay').fadeIn(200);
    $('#premiumRequestSidePanel').css('right', '0');
};

const closeSidePanel = () => {
    $('#premiumRequestSidePanel').css('right', '-800px');
    $('#premiumRequestSidePanelOverlay').fadeOut(200);
    currentRequest = null;
};

const renderNotes = (notes) => {
    const list = $('#panelNotesList');
    if (!notes || notes.length === 0) {
        list.html('<div style="font-size:13px; color:var(--admin-text-muted); font-style:italic;">No notes yet.</div>');
        return;
    }
    let html = '';
    notes.forEach(n => {
        html += `
            <div style="background:#fff; border:1px solid var(--admin-border); border-radius:6px; padding:10px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px; align-items:center;">
                    <span style="font-size:12px; font-weight:600; color:var(--admin-text);">${n.user_name}</span>
                    <span style="font-size:11px; color:var(--admin-text-muted);">${new Date(n.created_at).toLocaleString()}</span>
                </div>
                <div style="font-size:13px; color:var(--admin-text);">${n.note}</div>
            </div>
        `;
    });
    list.html(html);
};

const renderTimeline = (timeline) => {
    const list = $('#panelTimeline');
    if (!timeline || timeline.length === 0) {
        list.html('<div style="font-size:13px; color:var(--admin-text-muted);">No activity recorded.</div>');
        return;
    }
    let html = '';
    timeline.forEach((t, index) => {
        const isLast = index === timeline.length - 1;
        html += `
            <div style="position:relative; padding-bottom:${isLast ? '0' : '15px'};">
                <div style="position:absolute; left:-21px; top:3px; width:10px; height:10px; border-radius:50%; background:var(--admin-accent); border:2px solid #fff; box-shadow:0 0 0 1px var(--admin-accent);"></div>
                <div style="font-size:12px; color:var(--admin-text-muted); margin-bottom:2px;">${new Date(t.created_at).toLocaleString()} • ${t.actor_name}</div>
                <div style="font-size:13px; color:var(--admin-text); font-weight:500;">${t.message}</div>
            </div>
        `;
    });
    list.html(html);
};

const renderWorkflowActions = (status) => {
    const container = $('#panelWorkflowActions');
    let buttons = '';

    if (status === 'pending') {
        buttons += `<button class="admin-btn" style="width:100%; background:#20c997;" data-action="approve"><i class="fal fa-check me-2"></i>Approve Request</button>`;
        buttons += `<button class="admin-btn secondary" style="width:100%; color:var(--status-danger); border-color:var(--status-danger);" data-action="reject"><i class="fal fa-times me-2"></i>Reject</button>`;
    } else if (status === 'under_review') {
        buttons += `<button class="admin-btn" style="width:100%; background:#20c997;" data-action="approve"><i class="fal fa-check me-2"></i>Approve Request</button>`;
        buttons += `<button class="admin-btn secondary" style="width:100%; color:var(--status-danger);" data-action="reject"><i class="fal fa-times me-2"></i>Reject</button>`;
    } else if (status === 'approved') {
        buttons += `<button class="admin-btn" style="width:100%; background:#6f42c1;" data-action="start"><i class="fal fa-play me-2"></i>Start Project</button>`;
        buttons += `<button class="admin-btn secondary" style="width:100%;" data-action="cancel"><i class="fal fa-ban me-2"></i>Cancel</button>`;
    } else if (status === 'in_progress' || status === 'revision') {
        buttons += `<button class="admin-btn" style="width:100%; background:#28a745;" data-action="complete"><i class="fal fa-check-double me-2"></i>Mark Completed</button>`;
        buttons += `<button class="admin-btn secondary" style="width:100%; color:#fd7e14; border-color:#fd7e14;" data-action="wait_client"><i class="fal fa-hourglass-half me-2"></i>Waiting on Client</button>`;
    } else if (status === 'waiting_client') {
        buttons += `<button class="admin-btn" style="width:100%; background:#6f42c1;" data-action="start"><i class="fal fa-play me-2"></i>Resume Project</button>`;
        buttons += `<button class="admin-btn secondary" style="width:100%; color:#e83e8c; border-color:#e83e8c;" data-action="request_revision"><i class="fal fa-pencil me-2"></i>Revision Requested</button>`;
        buttons += `<button class="admin-btn secondary" style="width:100%;" data-action="cancel"><i class="fal fa-ban me-2"></i>Cancel</button>`;
    }

    if (!buttons) {
        buttons = `<div style="font-size:13px; color:var(--admin-text-muted); text-align:center; padding:10px; background:#f8f9fa; border-radius:6px; border:1px dashed var(--admin-border);">No actions available for current status</div>`;
    }

    container.html(buttons);
};

const initRequestsView = () => {
    initElements();
    attachEventListeners();
    loadRequests();
};

window.adminRequests = {
    init: initRequestsView
};
