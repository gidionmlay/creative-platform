(function() {
    let currentPage = 1;
    let currentSearch = '';
    let currentRole = '';
    let currentStatus = '';

    function getStatusBadge(status) {
        if (!status) return '';
        const lower = status.toLowerCase();
        let colorClass = 'status-info';
        if (lower === 'active') colorClass = 'status-success';
        if (lower === 'suspended' || lower === 'blocked') colorClass = 'status-danger';
        if (lower === 'pending') colorClass = 'status-warning';
        return `<span class="status-badge ${colorClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
    }

    function formatDate(d) {
        return d ? new Date(d).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : 'N/A';
    }

    async function loadUsersKPIs() {
        if (!window.api.getAdminUserAnalytics) return;
        const res = await window.api.getAdminUserAnalytics();
        if (res.ok && res.data) {
            const payload = res.data.data || res.data;
            const kpis = payload.kpis || payload || {};
            $('#usersTotal').text(kpis.total_users || 0);
            $('#usersActive').text(kpis.active_users || 0);
            $('#usersSuspended').text(kpis.suspended || 0);
            $('#usersNewWeek').text(kpis.new_this_week || 0);
        }
    }

    async function loadUsersTable() {
        const tbody = $('#usersTableBody');
        if (!tbody.length) return;

        tbody.html('<tr><td colspan="6" class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> Loading users...</td></tr>');

        const res = await window.api.getAdminUsers(currentPage, currentSearch, currentRole, currentStatus);
        if (res.ok && res.data) {
            const payload = res.data.data || res.data;
            const users = payload.results || (Array.isArray(payload) ? payload : []);
            
            if (users.length === 0) {
                tbody.html('<tr><td colspan="6" class="text-center py-5" style="color:var(--admin-text-muted)"><i class="fal fa-users" style="font-size:28px;display:block;margin-bottom:10px"></i>No users found</td></tr>');
            } else {
                let html = '';
                users.forEach(u => {
                    const avatarStr = u.avatar ? `<img src="${u.avatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">` : `<div style="width:32px;height:32px;border-radius:50%;background:var(--admin-accent-light);color:var(--admin-accent);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;">${(u.first_name?u.first_name.charAt(0):u.username.charAt(0)).toUpperCase()}</div>`;
                    
                    html += `
                        <tr>
                            <td>
                                <div style="display:flex;align-items:center;gap:12px;">
                                    ${avatarStr}
                                    <div>
                                        <div style="font-weight:600;">${u.full_name}</div>
                                        <div style="font-size:12px;color:var(--admin-text-muted);">${u.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td><span style="text-transform:capitalize;font-size:13px;">${u.role}</span></td>
                            <td>${getStatusBadge(u.status)}</td>
                            <td>${formatDate(u.date_joined)}</td>
                            <td>${formatDate(u.last_seen || u.last_login)}</td>
                            <td>
                                <div class="table-actions">
                                    <button class="action-icon" onclick="window.adminUsers.openProfile(${u.id})" title="View Profile"><i class="fal fa-eye"></i></button>
                                    ${u.status === 'active' ? 
                                        `<button class="action-icon" style="color:var(--status-danger);border-color:var(--status-danger-bg);" onclick="window.adminUsers.suspendUser(${u.id})" title="Suspend"><i class="fal fa-ban"></i></button>` : 
                                        `<button class="action-icon" style="color:var(--status-success);border-color:var(--status-success-bg);" onclick="window.adminUsers.activateUser(${u.id})" title="Activate"><i class="fal fa-check"></i></button>`
                                    }
                                </div>
                            </td>
                        </tr>
                    `;
                });
                tbody.html(html);
            }

            // Pagination UI update could go here if implemented
        } else {
            tbody.html('<tr><td colspan="6" class="text-center py-4 text-danger"><i class="fas fa-exclamation-triangle"></i> Failed to load users</td></tr>');
        }
    }

    window.adminUsersLifecycle = {
        init: function() {
            loadUsersKPIs();
            loadUsersTable();

            // Bind filters
            const searchInput = document.getElementById('userSearchInput');
            const roleFilter = document.getElementById('userRoleFilter');
            const statusFilter = document.getElementById('userStatusFilter');

            if (searchInput) {
                searchInput.addEventListener('input', function(e) {
                    clearTimeout(window.userSearchTimeout);
                    window.userSearchTimeout = setTimeout(() => {
                        currentSearch = e.target.value;
                        currentPage = 1;
                        loadUsersTable();
                    }, 500);
                });
            }

            if (roleFilter) {
                roleFilter.addEventListener('change', function(e) {
                    currentRole = e.target.value;
                    currentPage = 1;
                    loadUsersTable();
                });
            }

            if (statusFilter) {
                statusFilter.addEventListener('change', function(e) {
                    currentStatus = e.target.value;
                    currentPage = 1;
                    loadUsersTable();
                });
            }
        }
    };

    window.adminUsers = {
        openProfile: async function(id) {
            if (window.showToast) window.showToast('info', 'Loading profile...');
            const res = await window.api.getAdminUserDetail(id);
            if (res.ok && res.data) {
                const u = res.data;
                const avatarStr = u.avatar ? `<img src="${u.avatar}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">` : `<div style="width:80px;height:80px;border-radius:50%;background:var(--admin-accent-light);color:var(--admin-accent);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:32px;margin:auto;">${(u.first_name?u.first_name.charAt(0):u.username.charAt(0)).toUpperCase()}</div>`;
                
                let enrollmentsHtml = '';
                if (u.enrollments && u.enrollments.length > 0) {
                    enrollmentsHtml = `<h6>Recent Enrollments</h6><ul class="activity-list">`;
                    u.enrollments.forEach(e => {
                        enrollmentsHtml += `<li class="activity-item" style="padding:8px 0;font-size:14px;"><i class="fal fa-book" style="margin-right:8px;color:var(--admin-text-muted);"></i> ${e.course} - <strong>${e.progress}%</strong></li>`;
                    });
                    enrollmentsHtml += `</ul>`;
                }

                let requestsHtml = '';
                if (u.requests && u.requests.length > 0) {
                    requestsHtml = `<h6 style="margin-top:15px;">Recent Requests</h6><ul class="activity-list">`;
                    u.requests.forEach(r => {
                        requestsHtml += `<li class="activity-item" style="padding:8px 0;font-size:14px;"><i class="fal fa-inbox-in" style="margin-right:8px;color:var(--admin-text-muted);"></i> ${r.title} [${r.status}]</li>`;
                    });
                    requestsHtml += `</ul>`;
                }

                const modalBody = `
                    <div style="text-align:center; margin-bottom: 20px;">
                        ${avatarStr}
                        <h4 style="margin-top:15px; margin-bottom: 5px;">${u.full_name}</h4>
                        <div style="color:var(--admin-text-muted); margin-bottom: 10px;">${u.email}</div>
                        ${getStatusBadge(u.status)} <span class="status-badge status-info" style="margin-left:5px;text-transform:capitalize;">${u.role}</span>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <p style="font-size:14px;"><strong>Joined:</strong> ${formatDate(u.date_joined)}</p>
                            <p style="font-size:14px;"><strong>Last Seen:</strong> ${formatDate(u.last_seen || u.last_login)}</p>
                        </div>
                        <div class="col-md-6">
                            <p style="font-size:14px;"><strong>Phone:</strong> ${u.phone || 'N/A'}</p>
                        </div>
                    </div>
                    <div style="margin-top:20px;">
                        ${enrollmentsHtml}
                        ${requestsHtml}
                    </div>
                    <hr>
                    <div style="display:flex;gap:10px;justify-content:center;">
                        <select class="admin-input" id="modalRoleSelect" style="width:auto;padding:6px 12px;height:auto;font-size:13px;">
                            <option value="client" ${u.role==='client'?'selected':''}>Client</option>
                            <option value="student" ${u.role==='student'?'selected':''}>Student</option>
                            <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
                        </select>
                        <button class="admin-btn secondary" style="padding:6px 12px;font-size:13px;" onclick="window.adminUsers.changeRole(${u.id})">Change Role</button>
                    </div>
                `;

                $('#userProfileModalBody').html(modalBody);
                const modal = new bootstrap.Modal(document.getElementById('userProfileModal'));
                modal.show();
            } else {
                if (window.showToast) window.showToast('error', 'Failed to load user profile.');
            }
        },
        suspendUser: async function(id) {
            if (!confirm('Are you sure you want to suspend this user?')) return;
            const res = await window.api.suspendAdminUser(id);
            if (res.ok) {
                if (window.showToast) window.showToast('success', 'User suspended successfully.');
                loadUsersTable();
                loadUsersKPIs();
            } else {
                if (window.showToast) window.showToast('error', res.data?.errors || 'Failed to suspend user.');
            }
        },
        activateUser: async function(id) {
            const res = await window.api.activateAdminUser(id);
            if (res.ok) {
                if (window.showToast) window.showToast('success', 'User activated successfully.');
                loadUsersTable();
                loadUsersKPIs();
            } else {
                if (window.showToast) window.showToast('error', res.data?.errors || 'Failed to activate user.');
            }
        },
        changeRole: async function(id) {
            const newRole = $('#modalRoleSelect').val();
            if (!confirm(`Change user role to ${newRole}?`)) return;
            const res = await window.api.changeAdminUserRole(id, newRole);
            if (res.ok) {
                if (window.showToast) window.showToast('success', 'User role updated.');
                $('#userProfileModal').modal('hide');
                loadUsersTable();
            } else {
                if (window.showToast) window.showToast('error', res.data?.errors || 'Failed to change role.');
            }
        }
    };
})();
