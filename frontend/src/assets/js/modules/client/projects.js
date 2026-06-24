(function() {
    var allProjects = [];
    var currentProject = null;

    var statusMap = {
        'PENDING': { label: 'Pending', color: '#6c757d', bg: 'rgba(108,117,125,0.1)' },
        'REVIEWED': { label: 'Reviewed', color: '#0dcaf0', bg: 'rgba(13,202,240,0.1)' },
        'IN_PROGRESS': { label: 'In Progress', color: '#6f42c1', bg: 'rgba(111,66,193,0.1)' },
        'CLIENT_REVIEW': { label: 'Waiting For Client', color: '#fd7e14', bg: 'rgba(253,126,20,0.1)' },
        'REVISION_REQUESTED': { label: 'Revision Requested', color: '#e83e8c', bg: 'rgba(232,62,140,0.1)' },
        'COMPLETED': { label: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        'ARCHIVED': { label: 'Archived', color: '#6c757d', bg: 'rgba(108,117,125,0.1)' }
    };

    function getStatusBadge(status) {
        var info = statusMap[status] || { label: status || 'Unknown', color: '#6c757d', bg: '#f8f9fa' };
        return '<span style="display:inline-block;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;color:' + info.color + ';background:' + info.bg + ';white-space:nowrap;">' + info.label + '</span>';
    }

    function formatDate(d) {
        if (!d) return 'N/A';
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function formatDateTime(d) {
        if (!d) return '';
        var date = new Date(d);
        var today = new Date();
        var yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        var timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (date.toDateString() === today.toDateString()) return 'Today ' + timeStr;
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday ' + timeStr;
        return formatDate(d) + ' ' + timeStr;
    }

    function timeAgo(d) {
        if (!d) return '';
        var now = new Date();
        var date = new Date(d);
        var diffMs = now - date;
        var diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return diffMins + ' min ago';
        var diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return diffHours + 'h ago';
        var diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return diffDays + 'd ago';
        return formatDate(d);
    }

    function getFileIcon(filename) {
        var ext = filename ? filename.split('.').pop().toLowerCase() : '';
        var iconMap = {
            'png': 'fa-image', 'jpg': 'fa-image', 'jpeg': 'fa-image', 'svg': 'fa-image', 'gif': 'fa-image', 'webp': 'fa-image',
            'pdf': 'fa-file-pdf',
            'doc': 'fa-file-word', 'docx': 'fa-file-word',
            'zip': 'fa-file-archive', 'rar': 'fa-file-archive', '7z': 'fa-file-archive',
            'mp4': 'fa-video', 'mov': 'fa-video',
            'mp3': 'fa-music', 'wav': 'fa-music'
        };
        return iconMap[ext] || 'fa-file';
    }

    function isImageFile(filename) {
        var ext = filename ? filename.split('.').pop().toLowerCase() : '';
        return ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'].includes(ext);
    }

    function isPdfFile(filename) {
        var ext = filename ? filename.split('.').pop().toLowerCase() : '';
        return ext === 'pdf';
    }

    function formatFileSize(bytes) {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    // ===================== PROJECT LIST VIEW =====================

    function getListViewHTML() {
        return '<div class="view-container">' +
            '<div class="mb-4"><h3 style="font-family:var(--nexin-font);font-weight:600">My Projects</h3><p style="color:var(--admin-text-muted)">Track and review your project deliverables</p></div>' +
            '<div id="projectsListView"></div>' +
        '</div>';
    }

    function renderProjectsList() {
        var container = document.getElementById('projectsListView');
        if (!container) return;

        if (allProjects.length === 0) {
            container.innerHTML = '<div class="admin-card" style="padding:60px;text-align:center"><i class="fal fa-folder-open" style="font-size:48px;color:var(--admin-border);margin-bottom:20px;display:block"></i><h3 class="card-title" style="margin-bottom:10px">No active projects yet</h3><p style="color:var(--admin-text-muted)">Once your service requests are approved, your projects will appear here.</p></div>';
            return;
        }

        var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px;">';
        allProjects.forEach(function(p) {
            var statusInfo = statusMap[p.status] || { label: p.status || 'Unknown', color: '#6c757d', bg: '#f8f9fa' };
            var progressColor = p.progress === 100 ? 'var(--status-success)' : 'var(--admin-accent)';
            html += '' +
                '<div class="admin-card project-card" data-id="' + p.id + '" style="cursor:pointer;padding:24px;border:1px solid var(--admin-border);border-radius:12px;transition:all 0.2s ease;overflow:hidden;position:relative;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">' +
                        '<div style="flex:1;min-width:0;">' +
                            '<h4 style="font-size:16px;font-weight:600;margin:0 0 4px 0;color:var(--admin-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (p.title || 'Untitled') + '</h4>' +
                            '<span style="font-size:12px;color:var(--admin-text-muted);">' + (p.service_title || 'Custom Service') + '</span>' +
                        '</div>' +
                        '<div>' + getStatusBadge(p.status) + '</div>' +
                    '</div>' +
                    '<div style="margin-bottom:16px;">' +
                        '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--admin-text-muted);margin-bottom:6px;">' +
                            '<span>Progress</span>' +
                            '<span style="font-weight:600;color:var(--admin-text);">' + (p.progress || 0) + '%</span>' +
                        '</div>' +
                        '<div style="height:6px;background:#e9ecef;border-radius:3px;overflow:hidden;">' +
                            '<div style="height:100%;width:' + (p.progress || 0) + '%;background:' + progressColor + ';border-radius:3px;transition:width 0.4s ease;"></div>' +
                        '</div>' +
                    '</div>' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--admin-text-muted);">' +
                        '<span><i class="fal fa-calendar" style="margin-right:4px;"></i>' + formatDate(p.created_at) + '</span>' +
                        '<div style="display:flex;align-items:center;gap:6px;">' +
                            '<span><i class="fal fa-clock" style="margin-right:4px;"></i>' + timeAgo(p.updated_at) + '</span>' +
                            '<span style="color:var(--admin-accent);font-weight:500;">Open <i class="fal fa-arrow-right" style="margin-left:4px;font-size:10px;"></i></span>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        });
        html += '</div>';
        container.innerHTML = html;

        container.querySelectorAll('.project-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var id = this.dataset.id;
                if (id) openProjectWorkspace(parseInt(id));
            });
        });
    }

    // ===================== PROJECT WORKSPACE VIEW =====================

    function getWorkspaceViewHTML() {
        return '<div class="view-container" style="padding:0;">' +
            '<div style="display:flex;align-items:center;gap:15px;padding:15px 0;border-bottom:1px solid var(--admin-border);margin-bottom:0;">' +
                '<button id="workspaceBackBtn" style="background:none;border:none;font-size:18px;color:var(--admin-text-muted);cursor:pointer;padding:8px;border-radius:8px;transition:all 0.2s;"><i class="fal fa-arrow-left"></i></button>' +
                '<div style="flex:1;min-width:0;">' +
                    '<h3 id="workspaceTitle" style="margin:0;font-size:18px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></h3>' +
                    '<div style="display:flex;gap:12px;font-size:12px;color:var(--admin-text-muted);margin-top:2px;">' +
                        '<span id="workspaceService"></span>' +
                        '<span id="workspaceStatus"></span>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div style="display:flex;gap:0;height:calc(100vh - 280px);min-height:500px;margin:0 -30px -30px;">' +

                /* LEFT PANEL */
                '<div style="width:260px;border-right:1px solid var(--admin-border);background:var(--admin-bg);padding:20px;overflow-y:auto;flex-shrink:0;">' +
                    '<div style="margin-bottom:20px;">' +
                        '<div style="font-size:11px;text-transform:uppercase;color:var(--admin-text-muted);font-weight:600;margin-bottom:8px;">Progress</div>' +
                        '<div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:6px;">' +
                            '<span id="wsProgressLabel" style="color:var(--admin-text);">0%</span>' +
                        '</div>' +
                        '<div style="height:8px;background:#e9ecef;border-radius:4px;overflow:hidden;">' +
                            '<div id="wsProgressBar" style="height:100%;width:0%;background:var(--admin-accent);border-radius:4px;transition:width 0.4s ease;"></div>' +
                        '</div>' +
                    '</div>' +

                    '<div class="admin-card" style="padding:16px;margin-bottom:12px;">' +
                        '<div style="font-size:11px;text-transform:uppercase;color:var(--admin-text-muted);font-weight:600;margin-bottom:8px;">Project Info</div>' +
                        '<div style="display:flex;flex-direction:column;gap:8px;font-size:13px;">' +
                            '<div><span style="color:var(--admin-text-muted);">Service:</span><br><span id="wsInfoService" style="font-weight:500;"></span></div>' +
                            '<div><span style="color:var(--admin-text-muted);">Status:</span><br><span id="wsInfoStatus"></span></div>' +
                            '<div><span style="color:var(--admin-text-muted);">Deadline:</span><br><span id="wsInfoDeadline" style="font-weight:500;"></span></div>' +
                            '<div><span style="color:var(--admin-text-muted);">Created:</span><br><span id="wsInfoCreated" style="font-weight:500;"></span></div>' +
                        '</div>' +
                    '</div>' +

                    '<div id="workspaceActions" style="display:flex;flex-direction:column;gap:10px;margin-top:20px;"></div>' +
                '</div>' +

                /* CENTER PANEL - Conversation */
                '<div style="flex:1;display:flex;flex-direction:column;background:#fff;min-width:0;">' +
                    '<div style="display:flex;border-bottom:1px solid var(--admin-border);padding:0 20px;background:#fafafa;flex-shrink:0;">' +
                        '<div class="ws-tab active" data-tab="conversation" style="padding:12px 16px;cursor:pointer;font-weight:600;color:var(--admin-accent);border-bottom:2px solid var(--admin-accent);font-size:13px;">Conversation</div>' +
                        '<div class="ws-tab" data-tab="files" style="padding:12px 16px;cursor:pointer;font-weight:500;color:var(--admin-text-muted);border-bottom:2px solid transparent;font-size:13px;">Files</div>' +
                        '<div class="ws-tab" data-tab="timeline" style="padding:12px 16px;cursor:pointer;font-weight:500;color:var(--admin-text-muted);border-bottom:2px solid transparent;font-size:13px;">Timeline</div>' +
                    '</div>' +

                    '<div id="wsTabContent" style="flex:1;overflow:hidden;position:relative;">' +

                        /* Conversation Tab */
                        '<div id="ws-tab-conversation" class="ws-tab-content" style="height:100%;display:flex;flex-direction:column;">' +
                            '<div id="wsMessageList" style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px;"></div>' +
                            '<div style="padding:15px 20px;border-top:1px solid var(--admin-border);background:#fff;flex-shrink:0;">' +
                                '<form id="wsMessageForm">' +
                                    '<div style="display:flex;gap:10px;align-items:flex-end;">' +
                                        '<div style="flex:1;">' +
                                            '<textarea id="wsMessageInput" rows="2" placeholder="Type your message..." style="width:100%;padding:10px 14px;border:1px solid var(--admin-border);border-radius:8px;font-family:inherit;font-size:13px;resize:none;outline:none;transition:border-color 0.2s;" required></textarea>' +
                                        '</div>' +
                                        '<div style="display:flex;gap:8px;flex-shrink:0;">' +
                                            '<button type="button" id="wsAttachBtn" title="Attach file" style="background:none;border:1px solid var(--admin-border);border-radius:8px;width:40px;height:40px;color:var(--admin-text-muted);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;"><i class="fal fa-paperclip"></i></button>' +
                                            '<input type="file" id="wsAttachInput" style="display:none;" accept=".jpg,.jpeg,.png,.pdf,.docx,.zip">' +
                                            '<button type="submit" id="wsSendBtn" style="background:var(--admin-accent);border:none;border-radius:8px;width:40px;height:40px;color:#fff;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;"><i class="fal fa-paper-plane"></i></button>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div id="wsAttachPreview" style="display:none;margin-top:8px;padding:8px 12px;background:#f8f9fa;border:1px solid var(--admin-border);border-radius:6px;font-size:12px;color:var(--admin-text-muted);"></div>' +
                                '</form>' +
                            '</div>' +
                        '</div>' +

                        /* Files Tab */
                        '<div id="ws-tab-files" class="ws-tab-content" style="display:none;height:100%;overflow-y:auto;padding:20px;">' +
                            '<div id="wsFilesContent"></div>' +
                        '</div>' +

                        /* Timeline Tab */
                        '<div id="ws-tab-timeline" class="ws-tab-content" style="display:none;height:100%;overflow-y:auto;padding:20px;">' +
                            '<div id="wsTimelineContent"></div>' +
                        '</div>' +

                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    // ===================== WORKSPACE LOGIC =====================

    function openProjectWorkspace(id) {
        currentProject = null;
        var content = document.getElementById('adminContent');
        if (!content) return;

        content.innerHTML = getWorkspaceViewHTML();
        content.style.padding = '0';

        var pt = document.getElementById('pageTitle');
        if (pt) pt.textContent = 'Project Workspace';

        setupWorkspaceTabs();
        setupWorkspaceBackButton();
        setupRevisionModal();
        setupImagePreviewModal();
        loadProjectDetail(id);
    }

    function setupWorkspaceTabs() {
        document.querySelectorAll('.ws-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.ws-tab').forEach(function(t) {
                    t.style.fontWeight = '500';
                    t.style.color = 'var(--admin-text-muted)';
                    t.style.borderBottom = '2px solid transparent';
                });
                this.style.fontWeight = '600';
                this.style.color = 'var(--admin-accent)';
                this.style.borderBottom = '2px solid var(--admin-accent)';

                document.querySelectorAll('.ws-tab-content').forEach(function(c) {
                    c.style.display = 'none';
                });
                var tabContent = document.getElementById('ws-tab-' + this.dataset.tab);
                if (tabContent) tabContent.style.display = 'flex';
            });
        });
    }

    function setupWorkspaceBackButton() {
        var backBtn = document.getElementById('workspaceBackBtn');
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                var content = document.getElementById('adminContent');
                if (content) content.style.padding = '';
                exitWorkspace();
            });
        }
    }

    function exitWorkspace() {
        var pt = document.getElementById('pageTitle');
        if (pt) pt.textContent = 'My Projects';
        if (typeof window._clientLoadView === 'function') {
            window._clientLoadView('projects');
        }
    }

    function loadProjectDetail(id) {
        var wsTitle = document.getElementById('workspaceTitle');
        var wsService = document.getElementById('workspaceService');
        var wsStatus = document.getElementById('workspaceStatus');
        var wsInfoService = document.getElementById('wsInfoService');
        var wsInfoStatus = document.getElementById('wsInfoStatus');
        var wsInfoDeadline = document.getElementById('wsInfoDeadline');
        var wsInfoCreated = document.getElementById('wsInfoCreated');
        var wsProgressLabel = document.getElementById('wsProgressLabel');
        var wsProgressBar = document.getElementById('wsProgressBar');

        if (wsTitle) wsTitle.textContent = 'Loading...';
        var wsMsgList = document.getElementById('wsMessageList');
        if (wsMsgList) wsMsgList.innerHTML = '<div style="text-align:center;padding:40px;color:var(--admin-text-muted);"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

        window.api.projects.getClientProjectDetail(id).then(function(res) {
            if (!res.ok || !res.data) {
                if (wsTitle) wsTitle.textContent = 'Failed to load project';
                return;
            }
            var payload = res.data;
            var data = (payload && payload.data) ? payload.data : payload;
            currentProject = data;

            if (wsTitle) wsTitle.textContent = data.title || 'Untitled';
            if (wsService) wsService.innerHTML = '<i class="fal fa-briefcase" style="margin-right:4px;"></i>' + (data.service_title || 'Custom Service');
            if (wsStatus) wsStatus.innerHTML = getStatusBadge(data.status);

            if (wsInfoService) wsInfoService.textContent = data.service_title || 'Custom Service';
            if (wsInfoStatus) wsInfoStatus.innerHTML = getStatusBadge(data.status);
            if (wsInfoDeadline) wsInfoDeadline.textContent = data.due_date ? formatDate(data.due_date) : 'Not set';
            if (wsInfoCreated) wsInfoCreated.textContent = formatDate(data.created_at);

            var progress = data.progress || 0;
            if (wsProgressLabel) wsProgressLabel.textContent = progress + '%';
            if (wsProgressBar) {
                wsProgressBar.style.width = progress + '%';
                wsProgressBar.style.background = progress === 100 ? 'var(--status-success)' : 'var(--admin-accent)';
            }

            renderWorkspaceMessages(data.messages || []);
            renderWorkspaceFiles(data.files || []);
            renderWorkspaceTimeline(data.timeline || []);
            renderWorkspaceActions(data);
        }).catch(function(err) {
            console.error('Failed to load project:', err);
            if (wsTitle) wsTitle.textContent = 'Error loading project';
        });
    }

    // ===================== MESSAGES =====================

    function renderWorkspaceMessages(messages) {
        var list = document.getElementById('wsMessageList');
        if (!list) return;

        if (!messages || messages.length === 0) {
            list.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--admin-text-muted);margin-top:auto;margin-bottom:auto;"><i class="fal fa-comments" style="font-size:36px;margin-bottom:12px;display:block;"></i><p style="margin:0;font-size:14px;">No messages yet. Start the conversation!</p></div>';
            return;
        }

        var html = '';
        messages.forEach(function(m) {
            var senderName = m.sender_details ? (m.sender_details.first_name || m.sender_details.username || 'User') : 'Unknown';
            var isClient = m.sender_details && currentProject && m.sender === currentProject.client;
            var align = isClient ? 'flex-end' : 'flex-start';
            var bg = isClient ? 'var(--admin-accent)' : '#f1f5f9';
            var color = isClient ? '#fff' : 'var(--admin-text)';
            var borderRadius = isClient ? '12px 12px 4px 12px' : '12px 12px 12px 4px';

            var attachmentHtml = '';
            if (m.attachment_url) {
                var icon = getFileIcon(m.attachment_name || m.attachment_url);
                attachmentHtml = '<div style="margin-top:8px;padding:8px 12px;background:rgba(255,255,255,0.1);border-radius:6px;display:flex;align-items:center;gap:8px;font-size:12px;"><i class="fal ' + icon + '"></i><a href="' + m.attachment_url + '" target="_blank" style="color:inherit;text-decoration:underline;">' + (m.attachment_name || 'Attachment') + '</a></div>';
            }

            html += '' +
                '<div style="display:flex;flex-direction:column;align-items:' + align + ';max-width:80%;align-self:' + align + ';">' +
                    '<span style="font-size:10px;color:var(--admin-text-muted);margin-bottom:4px;' + (isClient ? 'text-align:right;' : '') + '">' + senderName + ' \u2022 ' + formatDateTime(m.created_at) + '</span>' +
                    '<div style="background:' + bg + ';color:' + color + ';padding:10px 14px;border-radius:' + borderRadius + ';font-size:13px;line-height:1.5;word-wrap:break-word;">' +
                        m.message +
                        attachmentHtml +
                    '</div>' +
                '</div>';
        });
        list.innerHTML = html;
        list.scrollTop = list.scrollHeight;

        setupMessageForm();
    }

    function setupMessageForm() {
        var form = document.getElementById('wsMessageForm');
        var input = document.getElementById('wsMessageInput');
        var attachBtn = document.getElementById('wsAttachBtn');
        var attachInput = document.getElementById('wsAttachInput');
        var attachPreview = document.getElementById('wsAttachPreview');
        var sendBtn = document.getElementById('wsSendBtn');

        if (!form || !input) return;

        // Remove old listeners via clone
        var newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        var newInput = document.getElementById('wsMessageInput');
        var newAttachBtn = document.getElementById('wsAttachBtn');
        var newAttachInput = document.getElementById('wsAttachInput');
        var newAttachPreview = document.getElementById('wsAttachPreview');
        var newSendBtn = document.getElementById('wsSendBtn');

        if (newAttachBtn && newAttachInput) {
            newAttachBtn.addEventListener('click', function() { newAttachInput.click(); });
            newAttachInput.addEventListener('change', function() {
                if (this.files && this.files.length > 0) {
                    var file = this.files[0];
                    if (newAttachPreview) {
                        newAttachPreview.style.display = 'block';
                        newAttachPreview.innerHTML = '<i class="fal ' + getFileIcon(file.name) + '" style="margin-right:6px;"></i> ' + file.name + ' <span style="color:var(--admin-text-muted);">(' + formatFileSize(file.size) + ')</span> <button type="button" id="clearAttachFile" style="background:none;border:none;color:var(--status-danger);cursor:pointer;margin-left:8px;padding:2px;"><i class="fal fa-times"></i></button>';
                        document.getElementById('clearAttachFile').addEventListener('click', function() {
                            newAttachInput.value = '';
                            newAttachPreview.style.display = 'none';
                        });
                    }
                }
            });
        }

        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var text = newInput.value.trim();
            if (!text && (!newAttachInput || !newAttachInput.files || !newAttachInput.files.length)) return;

            var $btn = $(newSendBtn);
            $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');

            var hasFile = newAttachInput && newAttachInput.files && newAttachInput.files.length > 0;

            if (hasFile) {
                var fd = new FormData();
                fd.append('message', text || '');
                fd.append('file', newAttachInput.files[0]);
                window.api.projects.uploadClientProjectFile(currentProject.id, fd).then(function(res) {
                    if (res && res.ok) {
                        newInput.value = '';
                        newAttachInput.value = '';
                        if (newAttachPreview) newAttachPreview.style.display = 'none';
                        loadProjectDetail(currentProject.id);
                    } else {
                        if (window.showToast) window.showToast('error', 'Failed to send message with attachment.');
                    }
                    $btn.prop('disabled', false).html('<i class="fal fa-paper-plane"></i>');
                });
            } else {
                window.api.projects.sendClientProjectMessage(currentProject.id, text).then(function(res) {
                    if (res && res.ok) {
                        newInput.value = '';
                        var msgData = res.data.data || res.data;
                        if (currentProject.messages) {
                            currentProject.messages.push(msgData);
                        } else {
                            currentProject.messages = [msgData];
                        }
                        renderWorkspaceMessages(currentProject.messages);
                    } else {
                        if (window.showToast) window.showToast('error', 'Failed to send message.');
                    }
                    $btn.prop('disabled', false).html('<i class="fal fa-paper-plane"></i>');
                });
            }
        });

        if (newInput) {
            newInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    newForm.dispatchEvent(new Event('submit'));
                }
            });
        }
    }

    // ===================== FILES =====================

    function renderWorkspaceFiles(files) {
        var container = document.getElementById('wsFilesContent');
        if (!container) return;

        if (!files || files.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--admin-text-muted);"><i class="fal fa-folder-open" style="font-size:48px;margin-bottom:15px;display:block;"></i><h4 style="font-weight:600;margin-bottom:8px;">No files yet</h4><p style="margin:0;font-size:13px;">Deliverables and project files will appear here.</p></div>';
            return;
        }

        var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:15px;">';
        files.forEach(function(f) {
            var filename = f.filename || f.file_name || 'File';
            var icon = getFileIcon(filename);
            var iconColor = isImageFile(filename) ? 'var(--admin-accent)' : (isPdfFile(filename) ? 'var(--status-danger)' : 'var(--admin-text-muted)');
            var uploader = f.uploaded_by_details ? (f.uploaded_by_details.first_name || f.uploaded_by_details.username) : 'System';
            var fileLabel = f.is_deliverable ? 'Deliverable' : (f.file_type ? f.file_type.replace(/_/g, ' ') : 'File');

            html += '' +
                '<div class="admin-card" style="padding:16px;display:flex;flex-direction:column;border:1px solid var(--admin-border);transition:all 0.2s;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">' +
                        '<i class="fal ' + icon + '" style="font-size:28px;color:' + iconColor + ';"></i>' +
                        '<span style="font-size:9px;font-weight:600;text-transform:uppercase;padding:2px 6px;border-radius:4px;border:1px solid var(--status-success);color:var(--status-success);">' + fileLabel + '</span>' +
                    '</div>' +
                    '<div style="font-size:13px;font-weight:600;color:var(--admin-text);word-break:break-all;margin-bottom:4px;" title="' + filename + '">' + filename + '</div>' +
                    '<div style="font-size:11px;color:var(--admin-text-muted);margin-bottom:4px;">' + formatFileSize(f.file_size) + '</div>' +
                    '<div style="font-size:11px;color:var(--admin-text-muted);margin-bottom:12px;">By ' + uploader + ' \u2022 ' + formatDate(f.created_at) + '</div>' +
                    '<div style="margin-top:auto;display:flex;gap:6px;">' +
                        (isImageFile(filename) ? '<button class="admin-btn secondary ws-file-preview" data-url="' + f.file + '" style="padding:5px 8px;font-size:11px;flex:1;"><i class="fal fa-eye" style="margin-right:4px;"></i>Preview</button>' : '') +
                        (isPdfFile(filename) ? '<a href="' + f.file + '" target="_blank" class="admin-btn secondary" style="padding:5px 8px;font-size:11px;flex:1;text-align:center;text-decoration:none;"><i class="fal fa-eye" style="margin-right:4px;"></i>Preview</a>' : '') +
                        '<a href="' + f.file + '" download class="admin-btn" style="padding:5px 8px;font-size:11px;flex:1;text-align:center;text-decoration:none;"><i class="fal fa-download" style="margin-right:4px;"></i>Download</a>' +
                    '</div>' +
                '</div>';
        });
        html += '</div>';
        container.innerHTML = html;

        container.querySelectorAll('.ws-file-preview').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var url = this.dataset.url;
                if (url) openImagePreview(url);
            });
        });
    }

    function openImagePreview(url) {
        var overlay = document.getElementById('imgPreviewModalOverlay');
        var img = document.getElementById('imgPreviewFullGlobal');
        if (overlay && img) {
            img.src = url;
            $(overlay).css('display', 'flex').hide().fadeIn(200);
        }
    }

    function setupImagePreviewModal() {
        // Global modal is injected by client.js - no local setup needed
    }

    // ===================== TIMELINE =====================

    function renderWorkspaceTimeline(timeline) {
        var container = document.getElementById('wsTimelineContent');
        if (!container) return;

        if (!timeline || timeline.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--admin-text-muted);"><i class="fal fa-history" style="font-size:48px;margin-bottom:15px;display:block;"></i><h4 style="font-weight:600;margin-bottom:8px;">No activity yet</h4><p style="margin:0;font-size:13px;">Project timeline will appear here as work progresses.</p></div>';
            return;
        }

        var html = '<div style="position:relative;padding-left:20px;border-left:2px solid var(--admin-border);margin-left:10px;display:flex;flex-direction:column;gap:20px;">';
        timeline.forEach(function(t) {
            var actorName = t.actor_details ? (t.actor_details.first_name || t.actor_details.username || 'System') : 'System';
            html += '' +
                '<div style="position:relative;padding-left:0;">' +
                    '<div style="position:absolute;left:-26px;top:4px;width:10px;height:10px;border-radius:50%;background:var(--admin-accent);border:2px solid #fff;box-shadow:0 0 0 1px var(--admin-accent);"></div>' +
                    '<div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--admin-text-muted);margin-bottom:4px;">' + formatDateTime(t.created_at) + ' \u2022 ' + actorName + '</div>' +
                    '<div style="font-size:13px;color:var(--admin-text);font-weight:500;">' + (t.action || '') + '</div>' +
                '</div>';
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // ===================== ACTIONS =====================

    function renderWorkspaceActions(project) {
        var container = document.getElementById('workspaceActions');
        if (!container) return;

        if (!project) {
            container.innerHTML = '';
            return;
        }

        var actions = '';
        var status = project.status;

        // Revision button - always visible unless completed/archived
        if (status !== 'COMPLETED' && status !== 'ARCHIVED') {
            actions += '<button id="btnRequestRevision" class="admin-btn" style="background:var(--status-warning);border-color:var(--status-warning);"><i class="fal fa-pencil" style="margin-right:8px;"></i>Request Revision</button>';
        }

        // Approve button - only when status is CLIENT_REVIEW (Waiting For Client)
        if (status === 'CLIENT_REVIEW') {
            actions += '<button id="btnApproveProject" class="admin-btn" style="background:var(--status-success);border-color:var(--status-success);"><i class="fal fa-check-circle" style="margin-right:8px;"></i>Approve Project</button>';
        }

        if (!actions) {
            if (status === 'COMPLETED') {
                actions = '<div style="text-align:center;padding:16px;background:var(--status-success-bg);border:1px solid var(--status-success);border-radius:8px;color:var(--status-success);font-size:13px;font-weight:500;"><i class="fal fa-check-circle" style="margin-right:6px;"></i>Project Completed</div>';
            } else {
                actions = '<div style="text-align:center;padding:16px;background:#f8f9fa;border:1px dashed var(--admin-border);border-radius:8px;color:var(--admin-text-muted);font-size:13px;">No actions available</div>';
            }
        }

        container.innerHTML = actions;
        bindWorkspaceActions(project);
    }

    function bindWorkspaceActions(project) {
        var revisionBtn = document.getElementById('btnRequestRevision');
        if (revisionBtn) {
            revisionBtn.addEventListener('click', function() {
                openRevisionModal();
            });
        }

        var approveBtn = document.getElementById('btnApproveProject');
        if (approveBtn) {
            approveBtn.addEventListener('click', function() {
                if (!confirm('Are you sure you want to approve this project? This will mark it as completed.')) return;
                var $btn = $(this);
                $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Approving...');
                window.api.projects.approveProjectCompletion(project.id).then(function(res) {
                    if (res && res.ok) {
                        if (window.showToast) window.showToast('success', 'Project approved! Thank you.');
                        loadProjectDetail(project.id);
                    } else {
                        if (window.showToast) window.showToast('error', 'Failed to approve project.');
                        $btn.prop('disabled', false).html('<i class="fal fa-check-circle" style="margin-right:8px;"></i>Approve Project');
                    }
                });
            });
        }
    }

    // ===================== REVISION MODAL LOGIC =====================

    function setupRevisionModal() {
        // Global modal is injected by client.js
        // Handlers are bound globally via document-level event delegation
    }

    function openRevisionModal() {
        var overlay = document.getElementById('revisionModalOverlay');
        var textarea = document.getElementById('revisionNotesGlobal');
        if (overlay) {
            if (textarea) textarea.value = '';
            $(overlay).css('display', 'flex').hide().fadeIn(200);
        }
    }

    function closeRevisionModal() {
        var overlay = document.getElementById('revisionModalOverlay');
        if (overlay) $(overlay).fadeOut(200);
    }

    // ===================== PUBLIC API =====================

    function loadMyProjects() {
        var container = document.getElementById('projectsListView');
        if (container) {
            container.innerHTML = '<div style="text-align:center;padding:60px;"><i class="fas fa-spinner fa-spin fa-2x" style="color:var(--admin-accent);"></i><p style="color:var(--admin-text-muted);margin-top:12px;">Loading your projects...</p></div>';
        }

        window.api.projects.getMyProjects().then(function(res) {
            if (res && res.ok) {
                var payload = res.data;
                if (payload && payload.data) payload = payload.data;
                allProjects = Array.isArray(payload) ? payload : (payload && payload.results ? payload.results : []);
            } else {
                allProjects = [];
                if (window.showToast) window.showToast('error', 'Failed to load projects.');
            }
            renderProjectsList();
        }).catch(function(err) {
            console.error('Failed to load projects:', err);
            allProjects = [];
            renderProjectsList();
        });
    }

    function init() {
        // nothing to do on load — called when view is shown
    }

    window.clientProjects = {
        init: init,
        loadMyProjects: loadMyProjects,
        openProjectWorkspace: openProjectWorkspace,
        getCurrentProject: function() { return currentProject; }
    };
})();
