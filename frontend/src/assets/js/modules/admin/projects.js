/**
 * G Design Admin Project Management Module
 * Phase C3.2 - Project Workspace Integration
 */

let allProjects = [];
let filteredProjects = [];
let currentProject = null;
let projectElements = {};

const initProjectElements = () => {
    projectElements = {
        tableBody: $('#projectsTableBody'),
        totalCount: $('#kpiTotalProjects'),
        activeCount: $('#kpiActiveProjects'),
        completedCount: $('#kpiCompletedProjects'),
        delayedCount: $('#kpiDelayedProjects'),
        searchInput: $('#projectSearchInput'),
        statusFilter: $('#projectStatusFilter'),
        sortFilter: $('#projectSortFilter')
    };

    // Inject Slide-Over Panel HTML into body if not exists
    if (!$('#premiumProjectSidePanel').length) {
        const panelHtml = `
        <div id="premiumProjectSidePanelOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); z-index:1040; backdrop-filter: blur(4px);"></div>
        <div id="premiumProjectSidePanel" style="position:fixed; top:0; right:-1000px; width:100%; max-width:1000px; height:100vh; background:#fff; z-index:1050; box-shadow:-5px 0 25px rgba(0,0,0,0.1); transition:right 0.3s cubic-bezier(0.4, 0, 0.2, 1); display:flex; flex-direction:column;">
            
            <!-- Panel Header -->
            <div style="padding:20px 30px; border-bottom:1px solid var(--admin-border); display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                <div>
                    <h3 id="panelProjectTitle" style="margin:0; font-family:var(--nexin-font); font-weight:600; font-size:22px; color:var(--admin-text);">Project Details</h3>
                    <div id="panelProjectId" style="font-size:13px; color:var(--admin-text-muted); margin-top:4px;"></div>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <div id="panelProjectStatusBadge"></div>
                    <button id="closeProjectPanelBtn" style="background:none; border:none; font-size:24px; color:var(--admin-text-muted); cursor:pointer;"><i class="fal fa-times"></i></button>
                </div>
            </div>

            <!-- Panel Content -->
            <div style="flex-grow:1; overflow-y:hidden; display:flex;">
                
                <!-- LEFT SIDE: Project Information -->
                <div style="width: 35%; border-right:1px solid var(--admin-border); background:#f8fafc; padding:30px; overflow-y:auto; display:flex; flex-direction:column; gap:20px;">
                    
                    <div class="admin-card" style="padding:20px;">
                        <div style="font-size:12px; text-transform:uppercase; color:var(--admin-text-muted); margin-bottom:5px; font-weight:600;">Client</div>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="width:40px; height:40px; background:var(--admin-accent); color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:16px;" id="panelProjClientInitials"></div>
                            <div>
                                <div id="panelProjClientName" style="font-weight:600; color:var(--admin-text);"></div>
                                <div id="panelProjClientEmail" style="font-size:13px; color:var(--admin-text-muted);"></div>
                            </div>
                        </div>
                    </div>

                    <div class="admin-card" style="padding:20px;">
                        <div style="font-size:12px; text-transform:uppercase; color:var(--admin-text-muted); margin-bottom:5px; font-weight:600;">Service</div>
                        <div id="panelProjServiceName" style="font-weight:600; color:var(--admin-text);"></div>
                        <div style="font-size:13px; color:var(--admin-text-muted); margin-top:5px;">Due: <span id="panelProjDueDate" style="font-weight:600; color:var(--admin-text);"></span></div>
                    </div>

                    <div class="admin-card" style="padding:20px;">
                        <div style="font-size:12px; text-transform:uppercase; color:var(--admin-text-muted); margin-bottom:15px; font-weight:600;">Admin Controls</div>
                        
                        <label class="form-label" style="font-size:13px;">Update Status</label>
                        <select id="panelProjStatusSelect" class="admin-input mb-3" style="font-size:13px; padding:8px;">
                            <option value="PENDING">Pending</option>
                            <option value="REVIEWED">Reviewed</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="CLIENT_REVIEW">Client Review</option>
                            <option value="REVISION_REQUESTED">Revision Requested</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>

                        <label class="form-label" style="font-size:13px;">Update Progress (<span id="panelProjProgressLabel">0</span>%)</label>
                        <input type="range" id="panelProjProgressSlider" class="form-range mb-3" min="0" max="100" step="5">
                        
                        <button class="admin-btn w-100" id="panelProjSaveBtn" style="padding:8px; font-size:13px;">Save Changes</button>
                    </div>

                    <div class="admin-card" style="padding:20px;">
                        <div style="font-size:12px; text-transform:uppercase; color:var(--admin-text-muted); margin-bottom:5px; font-weight:600;">Description</div>
                        <div id="panelProjDescription" style="font-size:13px; color:var(--admin-text); white-space:pre-line; line-height:1.5;"></div>
                    </div>

                </div>

                <!-- RIGHT SIDE: Project Activity -->
                <div style="width: 65%; display:flex; flex-direction:column; background:#fff;">
                    
                    <!-- Tabs -->
                    <div style="display:flex; border-bottom:1px solid var(--admin-border); padding:0 30px; background:#fafafa;">
                        <div class="proj-tab active" data-tab="conversation" style="padding:15px 20px; cursor:pointer; font-weight:600; color:var(--admin-accent); border-bottom:2px solid var(--admin-accent);">Conversation</div>
                        <div class="proj-tab" data-tab="files" style="padding:15px 20px; cursor:pointer; font-weight:500; color:var(--admin-text-muted);">Files</div>
                        <div class="proj-tab" data-tab="timeline" style="padding:15px 20px; cursor:pointer; font-weight:500; color:var(--admin-text-muted);">Timeline</div>
                        <div class="proj-tab" data-tab="overview" style="padding:15px 20px; cursor:pointer; font-weight:500; color:var(--admin-text-muted);">Overview</div>
                    </div>

                    <!-- Tab Contents -->
                    <div style="flex-grow:1; overflow-y:auto; padding:30px; position:relative;">
                        
                        <!-- Conversation Tab -->
                        <div id="tab-conversation" class="proj-tab-content" style="height:100%; display:flex; flex-direction:column;">
                            <div id="projMessageList" style="flex-grow:1; overflow-y:auto; display:flex; flex-direction:column; gap:15px; padding-bottom:20px;">
                                <!-- Messages injected here -->
                            </div>
                            <div style="display:flex; gap:10px; margin-top:auto; padding-top:15px; border-top:1px solid var(--admin-border); background:#fff;">
                                <input type="text" id="projMessageInput" class="admin-input" placeholder="Type a message to the client..." style="flex-grow:1;">
                                <button class="admin-btn" id="projSendMessageBtn"><i class="fal fa-paper-plane me-2"></i>Send</button>
                            </div>
                        </div>

                        <!-- Files Tab -->
                        <div id="tab-files" class="proj-tab-content" style="display:none; flex-direction:column;">
                            
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                                <h5 style="margin:0; font-weight:600;">Project Files</h5>
                                <button class="admin-btn secondary" id="projUploadFileTrigger"><i class="fal fa-upload me-2"></i>Upload File</button>
                            </div>

                            <div id="projUploadFileBox" class="admin-card mb-4" style="display:none; padding:20px; border:1px dashed var(--admin-accent); background:rgba(59,130,246,0.05);">
                                <h6 style="margin-bottom:15px; font-weight:600;">Upload New File</h6>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label" style="font-size:12px;">File Type</label>
                                        <select id="projUploadType" class="admin-input">
                                            <option value="DELIVERABLE">Deliverable (Final/Draft)</option>
                                            <option value="WORK_FILE">Work File (Source)</option>
                                            <option value="REFERENCE">Reference</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label" style="font-size:12px;">File</label>
                                        <input type="file" id="projUploadInput" class="admin-input">
                                    </div>
                                    <div class="col-12" style="display:flex; gap:10px; justify-content:flex-end; margin-top:10px;">
                                        <button class="admin-btn secondary" id="projUploadCancelBtn">Cancel</button>
                                        <button class="admin-btn" id="projUploadSubmitBtn">Upload</button>
                                    </div>
                                </div>
                            </div>

                            <div id="projFilesGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:15px;">
                                <!-- Files injected here -->
                            </div>
                        </div>

                        <!-- Timeline Tab -->
                        <div id="tab-timeline" class="proj-tab-content" style="display:none;">
                            <div id="projTimelineList" style="position:relative; padding-left:20px; border-left:2px solid var(--admin-border); margin-left:10px; display:flex; flex-direction:column; gap:20px;">
                                <!-- Timeline injected here -->
                            </div>
                        </div>

                        <!-- Overview Tab -->
                        <div id="tab-overview" class="proj-tab-content" style="display:none;">
                            <div class="row g-4">
                                <div class="col-md-6">
                                    <div class="admin-card" style="padding:20px; text-align:center;">
                                        <i class="fal fa-comments text-primary" style="font-size:32px; margin-bottom:10px;"></i>
                                        <h3 id="projStatMessages" style="margin:0;">0</h3>
                                        <p style="color:var(--admin-text-muted); font-size:13px; margin:0;">Total Messages</p>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="admin-card" style="padding:20px; text-align:center;">
                                        <i class="fal fa-file-archive text-success" style="font-size:32px; margin-bottom:10px;"></i>
                                        <h3 id="projStatFiles" style="margin:0;">0</h3>
                                        <p style="color:var(--admin-text-muted); font-size:13px; margin:0;">Files Uploaded</p>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="admin-card" style="padding:20px; text-align:center;">
                                        <i class="fal fa-heartbeat text-warning" style="font-size:32px; margin-bottom:10px;"></i>
                                        <h3 id="projStatHealth" style="margin:0;">On Track</h3>
                                        <p style="color:var(--admin-text-muted); font-size:13px; margin:0;">Project Health</p>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="admin-card" style="padding:20px; text-align:center;">
                                        <i class="fal fa-calendar-check text-info" style="font-size:32px; margin-bottom:10px;"></i>
                                        <h3 id="projStatDays" style="margin:0;">-</h3>
                                        <p style="color:var(--admin-text-muted); font-size:13px; margin:0;">Days Remaining</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        `;
        $('body').append(panelHtml);
    }
};

const attachProjectEventListeners = () => {
    projectElements.searchInput.on('input', handleProjectFilter);
    projectElements.statusFilter.on('change', handleProjectFilter);
    projectElements.sortFilter.on('change', handleProjectFilter);

    projectElements.tableBody.on('click', '.action-view, tr', function(e) {
        if ($(e.target).closest('a, button, input').length && !$(this).hasClass('action-view')) return;
        e.preventDefault();
        const id = $(this).closest('tr').data('id') || $(this).data('id');
        if (id) openProjectPanel(id);
    });

    $('#closeProjectPanelBtn, #premiumProjectSidePanelOverlay').on('click', closeProjectPanel);

    // Tabs
    $('.proj-tab').on('click', function() {
        $('.proj-tab').removeClass('active').css({ 'font-weight':'500', 'color':'var(--admin-text-muted)', 'border-bottom':'none' });
        $(this).addClass('active').css({ 'font-weight':'600', 'color':'var(--admin-accent)', 'border-bottom':'2px solid var(--admin-accent)' });
        
        $('.proj-tab-content').hide();
        $(`#tab-${$(this).data('tab')}`).css('display', $(this).data('tab') === 'files' || $(this).data('tab') === 'conversation' ? 'flex' : 'block');
    });

    // Admin Controls
    $('#panelProjProgressSlider').on('input', function() {
        $('#panelProjProgressLabel').text($(this).val());
    });

    $('#panelProjSaveBtn').on('click', async function() {
        if (!currentProject) return;
        const $btn = $(this);
        $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');

        const newStatus = $('#panelProjStatusSelect').val();
        const newProgress = $('#panelProjProgressSlider').val();

        let success = true;

        if (newStatus !== currentProject.status) {
            const res = await window.api.projects.updateProjectStatus(currentProject.id, newStatus);
            if (!res.ok) success = false;
        }

        if (newProgress != currentProject.progress) {
            const res = await window.api.projects.updateProjectProgress(currentProject.id, newProgress);
            if (!res.ok) success = false;
        }

        if (success) {
            if(window.showToast) window.showToast('success', 'Project updated successfully');
            await loadProjects();
            openProjectPanel(currentProject.id); // Refresh data
        } else {
            alert("Failed to update project.");
        }
        $btn.prop('disabled', false).text('Save Changes');
    });

    // Messaging
    $('#projSendMessageBtn').on('click', async function() {
        const input = $('#projMessageInput');
        const text = input.val().trim();
        if (!text || !currentProject) return;

        const $btn = $(this);
        $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');

        const res = await window.api.projects.sendProjectMessage(currentProject.id, text);
        if (res && res.ok) {
            input.val('');
            // optimistically add
            currentProject.messages.push(res.data.data || res.data);
            renderProjectMessages(currentProject.messages);
            scrollToBottomMessages();
        } else {
            alert("Failed to send message.");
        }
        $btn.prop('disabled', false).html('<i class="fal fa-paper-plane me-2"></i>Send');
    });

    $('#projMessageInput').on('keypress', function(e) {
        if (e.which === 13) $('#projSendMessageBtn').click();
    });

    // File Uploads
    $('#projUploadFileTrigger').on('click', () => $('#projUploadFileBox').slideDown());
    $('#projUploadCancelBtn').on('click', () => $('#projUploadFileBox').slideUp());

    $('#projUploadSubmitBtn').on('click', async function() {
        if (!currentProject) return;
        const fileInput = document.getElementById('projUploadInput');
        if (!fileInput.files || fileInput.files.length === 0) {
            alert("Please select a file.");
            return;
        }

        const type = $('#projUploadType').val();
        const file = fileInput.files[0];
        const isDeliverable = (type === 'DELIVERABLE');

        const fd = new FormData();
        fd.append('file', file);
        fd.append('file_type', type);
        fd.append('is_deliverable', isDeliverable);

        const $btn = $(this);
        $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Uploading...');

        const res = await window.api.projects.uploadProjectFile(currentProject.id, fd);
        if (res && res.ok) {
            $('#projUploadInput').val('');
            $('#projUploadFileBox').slideUp();
            if(window.showToast) window.showToast('success', 'File uploaded successfully.');
            // Reload project to get new file and timeline
            openProjectPanel(currentProject.id);
        } else {
            alert("Upload failed: " + (res.data ? JSON.stringify(res.data) : 'Unknown error'));
        }
        $btn.prop('disabled', false).text('Upload');
    });
};

const loadProjects = async () => {
    projectElements.tableBody.html(`
        <tr><td colspan="8" class="text-center py-5">
            <div style="display:flex; flex-direction:column; align-items:center; gap:15px;">
                <div class="skeleton-box" style="width:100%; height:40px; border-radius:8px;"></div>
                <div class="skeleton-box" style="width:100%; height:40px; border-radius:8px;"></div>
            </div>
        </td></tr>
    `);

    const res = await window.api.projects.getAdminProjects();
    
    if (res.ok && res.data && res.data.success) {
        let payload = res.data.data;
        allProjects = (payload && payload.results) ? payload.results : (Array.isArray(payload) ? payload : []);
        filteredProjects = [...allProjects];
        updateProjectUI();
    } else {
        projectElements.tableBody.html(`
            <tr><td colspan="8" class="text-center text-danger py-5">
                <i class="fal fa-exclamation-triangle" style="font-size:32px; margin-bottom:10px; display:block;"></i>
                <h4 style="font-family:var(--nexin-font); font-weight:600;">Unable to load projects</h4>
                <p>Try refreshing the page.</p>
            </td></tr>
        `);
    }
};

const updateProjectUI = () => {
    renderProjectKPIs();
    renderProjectTable();
};

const renderProjectKPIs = () => {
    const total = allProjects.length;
    const active = allProjects.filter(p => ['IN_PROGRESS', 'CLIENT_REVIEW', 'REVISION_REQUESTED'].includes(p.status)).length;
    const completed = allProjects.filter(p => p.status === 'COMPLETED').length;
    
    const today = new Date();
    const delayed = allProjects.filter(p => {
        if (p.status === 'COMPLETED' || !p.due_date) return false;
        return new Date(p.due_date) < today;
    }).length;

    if (projectElements.totalCount.length) projectElements.totalCount.text(total);
    if (projectElements.activeCount.length) projectElements.activeCount.text(active);
    if (projectElements.completedCount.length) projectElements.completedCount.text(completed);
    if (projectElements.delayedCount.length) projectElements.delayedCount.text(delayed);
};

const handleProjectFilter = () => {
    const searchTerm = projectElements.searchInput.val().toLowerCase();
    const status = projectElements.statusFilter.val();
    const sort = projectElements.sortFilter.val();

    filteredProjects = allProjects.filter(proj => {
        const clientName = (proj.client_name || '').toLowerCase();
        const titleMatch = (proj.title || '').toLowerCase().includes(searchTerm);
        const matchSearch = titleMatch || clientName.includes(searchTerm);
        const matchStatus = status ? proj.status === status : true;
        return matchSearch && matchStatus;
    });

    if (sort === 'newest') {
        filteredProjects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sort === 'oldest') {
        filteredProjects.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    renderProjectTable();
};

const getProjectStatusBadge = (status) => {
    const map = {
        'PENDING': { color: '#6c757d', bg: 'rgba(108, 117, 125, 0.1)', text: 'Pending' },
        'REVIEWED': { color: '#0dcaf0', bg: 'rgba(13, 202, 240, 0.1)', text: 'Reviewed' },
        'IN_PROGRESS': { color: '#6f42c1', bg: 'rgba(111, 66, 193, 0.1)', text: 'In Progress' },
        'CLIENT_REVIEW': { color: '#fd7e14', bg: 'rgba(253, 126, 20, 0.1)', text: 'Client Review' },
        'REVISION_REQUESTED': { color: '#e83e8c', bg: 'rgba(232, 62, 140, 0.1)', text: 'Revision' },
        'COMPLETED': { color: 'var(--status-success)', bg: 'rgba(40, 167, 69, 0.1)', text: 'Completed' },
        'ARCHIVED': { color: '#6c757d', bg: 'rgba(108, 117, 125, 0.1)', text: 'Archived' }
    };
    
    const info = map[status] || { color: '#6c757d', bg: '#f8f9fa', text: status };
    return `<span style="display:inline-block; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; color:${info.color}; background:${info.bg}; white-space:nowrap;">${info.text}</span>`;
};

const renderProjectTable = () => {
    if (!projectElements.tableBody.length) return;

    if (filteredProjects.length === 0) {
        projectElements.tableBody.html(`
            <tr><td colspan="8" class="text-center py-5">
                <div style="color:var(--admin-text-muted);">
                    <i class="fal fa-folder-open" style="font-size:48px; margin-bottom:15px; display:block; color:var(--admin-border);"></i>
                    <h4 style="font-family:var(--nexin-font); font-weight:600;">No projects found</h4>
                    <p>Try adjusting your filters or search.</p>
                </div>
            </td></tr>
        `);
        return;
    }

    let html = '';
    filteredProjects.forEach(proj => {
        const updatedDate = new Date(proj.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric'});
        const dueDate = proj.due_date ? new Date(proj.due_date).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : '<span class="text-muted">N/A</span>';
        const clientInitial = (proj.client_name || 'U').charAt(0).toUpperCase();

        const progressBg = proj.progress === 100 ? 'var(--status-success)' : 'var(--admin-accent)';

        html += `
            <tr data-id="${proj.id}" style="cursor:pointer; transition:background 0.2s ease;">
                <td>
                    <div style="font-size:14px; font-weight:600; color:var(--admin-text);">${proj.title}</div>
                    <div style="font-size:12px; color:var(--admin-text-muted);">#${proj.id}</div>
                </td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:30px; height:30px; border-radius:50%; background:rgba(13, 110, 253, 0.1); color:var(--admin-accent); display:flex; align-items:center; justify-content:center; font-weight:600; font-size:12px;">${clientInitial}</div>
                        <div style="font-size:13px; font-weight:500;">${proj.client_name}</div>
                    </div>
                </td>
                <td><span style="font-size:13px; color:var(--admin-text-muted);">${proj.service_title || 'Custom'}</span></td>
                <td>${getProjectStatusBadge(proj.status)}</td>
                <td style="width:150px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="flex-grow:1; height:6px; background:#e9ecef; border-radius:3px; overflow:hidden;">
                            <div style="height:100%; width:${proj.progress}%; background:${progressBg}; transition:width 0.3s ease;"></div>
                        </div>
                        <span style="font-size:12px; font-weight:600; color:var(--admin-text-muted); width:30px;">${proj.progress}%</span>
                    </div>
                </td>
                <td style="font-size:13px;">${dueDate}</td>
                <td style="font-size:13px; color:var(--admin-text-muted);">${updatedDate}</td>
                <td>
                    <button class="action-icon action-view" style="background:none; border:none; color:var(--admin-text-muted);" title="Workspace"><i class="fal fa-chevron-right"></i></button>
                </td>
            </tr>
        `;
    });

    projectElements.tableBody.html(html);
};

// --- Panel Logic ---

const openProjectPanel = async (id) => {
    // Show skeleton overlay logic if needed, but we can just fetch and open
    const res = await window.api.projects.getAdminProjectDetail(id);
    if (!res.ok || !res.data || !res.data.success) {
        alert("Failed to load project details.");
        return;
    }

    currentProject = res.data.data;
    const proj = currentProject;

    $('#panelProjectId').text(`ID: #${proj.id} • Created: ${new Date(proj.created_at).toLocaleString()}`);
    $('#panelProjectTitle').text(proj.title);
    $('#panelProjectStatusBadge').html(getProjectStatusBadge(proj.status));

    const clientName = proj.client_details ? (proj.client_details.first_name || proj.client_details.username) : 'Unknown';
    $('#panelProjClientName').text(clientName);
    $('#panelProjClientEmail').text(proj.client_details ? proj.client_details.email : '');
    $('#panelProjClientInitials').text(clientName.charAt(0).toUpperCase());

    $('#panelProjServiceName').text(proj.service_title || 'Custom Service');
    $('#panelProjDueDate').text(proj.due_date || 'Not set');

    $('#panelProjDescription').text(proj.description || 'No description.');

    // Admin Controls Set
    $('#panelProjStatusSelect').val(proj.status);
    $('#panelProjProgressSlider').val(proj.progress);
    $('#panelProjProgressLabel').text(proj.progress);

    // Right Side Tabs
    renderProjectMessages(proj.messages || []);
    renderProjectFiles(proj.files || []);
    renderProjectTimeline(proj.timeline || []);
    renderProjectOverview(proj);

    $('#premiumProjectSidePanelOverlay').fadeIn(200);
    $('#premiumProjectSidePanel').css('right', '0');
    
    // Switch to default tab (conversation)
    $('.proj-tab[data-tab="conversation"]').click();
};

const closeProjectPanel = () => {
    $('#premiumProjectSidePanel').css('right', '-1000px');
    $('#premiumProjectSidePanelOverlay').fadeOut(200);
    currentProject = null;
};

const renderProjectMessages = (messages) => {
    const list = $('#projMessageList');
    if (!messages || messages.length === 0) {
        list.html('<div style="text-align:center; padding:40px 20px; color:var(--admin-text-muted);"><i class="fal fa-comments" style="font-size:32px; margin-bottom:10px;"></i><p>No messages yet. Start the conversation!</p></div>');
        return;
    }

    let html = '';
    // Assuming admin is viewing, if sender is admin, it's 'sent', otherwise 'received'
    // For now we check if sender_details role or username. In backend sender_details has email/username.
    // Hack: if sender_details.id == window.auth... but we might not have it. Let's just style them all nicely.
    
    messages.forEach(m => {
        const senderName = m.sender_details ? (m.sender_details.first_name || m.sender_details.username) : 'Unknown';
        const isAdmin = m.sender_details && window.auth && m.sender_details.username === window.auth.getUser().username; // Approximation
        
        const align = isAdmin ? 'flex-end' : 'flex-start';
        const bg = isAdmin ? 'var(--admin-accent)' : '#f1f5f9';
        const color = isAdmin ? '#fff' : 'var(--admin-text)';
        const textRight = isAdmin ? 'text-align:right;' : '';

        html += `
            <div style="display:flex; flex-direction:column; align-items:${align}; margin-bottom:10px;">
                <span style="font-size:11px; color:var(--admin-text-muted); margin-bottom:4px; ${textRight}">${senderName} • ${new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <div style="background:${bg}; color:${color}; padding:10px 15px; border-radius:12px; max-width:80%; font-size:13px; line-height:1.5;">
                    ${m.message}
                </div>
            </div>
        `;
    });
    list.html(html);
};

const scrollToBottomMessages = () => {
    const el = document.getElementById('projMessageList');
    if(el) el.scrollTop = el.scrollHeight;
}

const renderProjectFiles = (files) => {
    const grid = $('#projFilesGrid');
    if (!files || files.length === 0) {
        grid.html('<div style="grid-column:1/-1; text-align:center; padding:40px 20px; color:var(--admin-text-muted);"><i class="fal fa-folder-open" style="font-size:32px; margin-bottom:10px;"></i><p>No files uploaded to this project yet.</p></div>');
        return;
    }

    let html = '';
    files.forEach(f => {
        const uploader = f.uploaded_by_details ? f.uploaded_by_details.username : 'System';
        let icon = 'fa-file';
        let iconColor = 'var(--admin-text-muted)';
        
        const ext = f.filename ? f.filename.split('.').pop().toLowerCase() : '';
        if (['png','jpg','jpeg','svg'].includes(ext)) { icon = 'fa-image'; iconColor = 'var(--admin-accent)'; }
        else if (ext === 'pdf') { icon = 'fa-file-pdf'; iconColor = 'var(--status-danger)'; }
        else if (['zip','rar'].includes(ext)) { icon = 'fa-file-archive'; iconColor = 'var(--status-warning)'; }

        const badgeText = f.is_deliverable ? 'Deliverable' : f.file_type.replace('_', ' ');
        const badgeColor = f.is_deliverable ? 'var(--status-success)' : 'var(--admin-text-muted)';

        html += `
            <div class="admin-card" style="padding:15px; display:flex; flex-direction:column; border:1px solid var(--admin-border); box-shadow:none;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                    <i class="fal ${icon}" style="font-size:24px; color:${iconColor};"></i>
                    <span style="font-size:10px; font-weight:600; text-transform:uppercase; border:1px solid ${badgeColor}; color:${badgeColor}; padding:2px 6px; border-radius:4px;">${badgeText}</span>
                </div>
                <div style="font-size:13px; font-weight:600; color:var(--admin-text); word-break:break-all; margin-bottom:5px;">${f.filename || 'File'}</div>
                <div style="font-size:11px; color:var(--admin-text-muted); margin-bottom:15px;">By ${uploader} • ${new Date(f.created_at).toLocaleDateString()}</div>
                <div style="margin-top:auto;">
                    <a href="${f.file}" target="_blank" class="admin-btn secondary w-100" style="padding:6px; font-size:12px; text-align:center;"><i class="fal fa-download me-2"></i>Download</a>
                </div>
            </div>
        `;
    });
    grid.html(html);
};

const renderProjectTimeline = (timeline) => {
    const list = $('#projTimelineList');
    if (!timeline || timeline.length === 0) {
        list.html('<div style="font-size:13px; color:var(--admin-text-muted);">No activity recorded.</div>');
        return;
    }
    let html = '';
    timeline.forEach((t, index) => {
        const isLast = index === timeline.length - 1;
        const actorName = t.actor_details ? t.actor_details.username : 'System';
        html += `
            <div style="position:relative; padding-bottom:${isLast ? '0' : '5px'};">
                <div style="position:absolute; left:-25px; top:3px; width:10px; height:10px; border-radius:50%; background:var(--admin-accent); border:2px solid #fff; box-shadow:0 0 0 1px var(--admin-accent);"></div>
                <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:var(--admin-text-muted); margin-bottom:4px;">${new Date(t.created_at).toLocaleString()} • ${actorName}</div>
                <div style="font-size:14px; color:var(--admin-text); font-weight:500;">${t.action}</div>
            </div>
        `;
    });
    list.html(html);
};

const renderProjectOverview = (proj) => {
    $('#projStatMessages').text(proj.messages ? proj.messages.length : 0);
    $('#projStatFiles').text(proj.files ? proj.files.length : 0);
    
    let health = 'On Track';
    let healthColor = 'var(--status-success)';
    
    const today = new Date();
    let daysRemaining = '-';
    
    if (proj.status === 'COMPLETED') {
        health = 'Completed';
        healthColor = 'var(--admin-accent)';
    } else if (proj.due_date) {
        const due = new Date(proj.due_date);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysRemaining = diffDays;
        
        if (diffDays < 0) {
            health = 'Overdue';
            healthColor = 'var(--status-danger)';
        } else if (diffDays <= 2) {
            health = 'Needs Attention';
            healthColor = 'var(--status-warning)';
        }
    }

    $('#projStatHealth').text(health).css('color', healthColor);
    $('#projStatDays').text(daysRemaining);
};

const initProjectsView = () => {
    initProjectElements();
    attachProjectEventListeners();
    loadProjects();
};

window.adminProjectsLifecycle = {
    init: initProjectsView
};
