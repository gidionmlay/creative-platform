(function() {
    var members = [];
    var memberForm = { id: null, name: '', role: '', photo: null, facebook_url: '', twitter_url: '', instagram_url: '', linkedin_url: '' };

    function escapeHtml(text) {
        if (!text) return '';
        return String(text).replace(/[&<>"]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            return m;
        });
    }

    function init() {
        loadMembers();
    }

    function loadMembers() {
        var container = document.getElementById('adminTeamContainer');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--admin-text-muted);"><i class="fas fa-spinner fa-spin" style="font-size:28px;margin-bottom:16px;display:block;"></i>Loading team members...</div>';

        window.homepageCmsApi.getTeamMembers().then(function(res) {
            if (res.ok && res.data) {
                var d = res.data.data || res.data;
                members = Array.isArray(d) ? d : d.results || [];
                renderMembers();
            } else {
                container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--status-danger);"><i class="fal fa-exclamation-triangle" style="font-size:32px;margin-bottom:12px;display:block;"></i>Failed to load team members</div>';
            }
        }).catch(function() {
            var c = document.getElementById('adminTeamContainer');
            if (c) c.innerHTML = '<div style="text-align:center;padding:60px;color:var(--status-danger);"><i class="fal fa-exclamation-triangle" style="font-size:32px;margin-bottom:12px;display:block;"></i>Error loading team members</div>';
        });
    }

    function renderMembers() {
        var container = document.getElementById('adminTeamContainer');
        if (!container) return;

        var html = '<div style="display:flex;justify-content:flex-end;margin-bottom:20px;">' +
            '<button class="admin-btn" id="addMemberBtn"><i class="fal fa-plus" style="margin-right:6px;"></i>Add Team Member</button>' +
            '</div>';

        if (!members.length) {
            html += '<div style="text-align:center;padding:60px;color:var(--admin-text-muted);">' +
                '<i class="fal fa-users" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></i>' +
                'No team members yet. Click "Add Team Member" to create one.' +
                '</div>';
            container.innerHTML = html;
            bindAddButton(container);
            return;
        }

        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;">';
        members.forEach(function(m) {
            var photoHtml = m.photo_url
                ? '<img src="' + escapeHtml(m.photo_url) + '" alt="' + escapeHtml(m.name) + '" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">'
                : '<div style="width:80px;height:80px;border-radius:50%;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#cbd5e1;"><i class="fal fa-user" style="font-size:28px;"></i></div>';

            html +=
                '<div class="admin-card" style="padding:16px;border:none;box-shadow:0 2px 8px rgba(0,0,0,0.06);">' +
                    '<div style="display:flex;gap:16px;align-items:center;margin-bottom:12px;">' +
                        photoHtml +
                        '<div style="flex:1;min-width:0;">' +
                            '<h4 style="margin:0 0 2px;font-size:16px;font-weight:600;">' + escapeHtml(m.name) + '</h4>' +
                            '<p style="margin:0;font-size:13px;color:var(--admin-text-muted);">' + escapeHtml(m.role || 'No role') + '</p>' +
                        '</div>' +
                        '<span class="status-badge ' + (m.is_active ? 'status-active' : 'status-inactive') + '" style="font-size:11px;padding:2px 10px;">' + (m.is_active ? 'Active' : 'Inactive') + '</span>' +
                    '</div>' +
                    '<div style="display:flex;gap:6px;border-top:1px solid var(--admin-border);padding-top:12px;">' +
                        '<button class="admin-btn secondary edit-member-btn" data-member-id="' + m.id + '" style="flex:1;padding:6px 10px;font-size:12px;"><i class="fal fa-edit" style="margin-right:4px;"></i>Edit</button>' +
                        '<button class="admin-btn secondary toggle-member-btn" data-member-id="' + m.id + '" data-active="' + m.is_active + '" style="flex:1;padding:6px 10px;font-size:12px;">' + (m.is_active ? 'Deactivate' : 'Activate') + '</button>' +
                        '<button class="admin-btn secondary delete-member-btn" data-member-id="' + m.id + '" style="padding:6px 10px;font-size:12px;color:var(--status-danger);border-color:var(--status-danger);"><i class="fal fa-trash-alt"></i></button>' +
                    '</div>' +
                '</div>';
        });
        html += '</div>';

        container.innerHTML = html;
        bindAddButton(container);
        bindMemberEvents(container);
    }

    function bindAddButton(container) {
        var btn = container.querySelector('#addMemberBtn');
        if (btn) btn.addEventListener('click', function() { openFormModal(null); });
    }

    function bindMemberEvents(container) {
        container.querySelectorAll('.edit-member-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(this.dataset.memberId);
                var member = members.find(function(m) { return m.id === id; });
                if (member) openFormModal(member);
            });
        });

        container.querySelectorAll('.toggle-member-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(this.dataset.memberId);
                var active = this.dataset.active === 'true' ? false : true;
                var fd = new FormData();
                fd.append('is_active', active ? 'true' : 'false');
                window.homepageCmsApi.updateTeamMember(id, fd).then(function() {
                    loadMembers();
                    if (window.showToast) window.showToast('success', 'Team member updated');
                });
            });
        });

        container.querySelectorAll('.delete-member-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(this.dataset.memberId);
                if (!confirm('Delete this team member?')) return;
                window.homepageCmsApi.deleteTeamMember(id).then(function() {
                    loadMembers();
                    if (window.showToast) window.showToast('success', 'Team member deleted');
                });
            });
        });
    }

    /* ── Form Modal ──────────────────────────────────────────── */

    function openFormModal(member) {
        if (member) {
            memberForm.id = member.id;
            memberForm.name = member.name || '';
            memberForm.role = member.role || '';
            memberForm.photo = null;
            memberForm.facebook_url = member.facebook_url || '';
            memberForm.twitter_url = member.twitter_url || '';
            memberForm.instagram_url = member.instagram_url || '';
            memberForm.linkedin_url = member.linkedin_url || '';
        } else {
            memberForm.id = null;
            memberForm.name = '';
            memberForm.role = '';
            memberForm.photo = null;
            memberForm.facebook_url = '';
            memberForm.twitter_url = '';
            memberForm.instagram_url = '';
            memberForm.linkedin_url = '';
        }

        var overlay = document.getElementById('teamFormOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'teamFormOverlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
            document.body.appendChild(overlay);
        }

        var title = member ? 'Edit Team Member' : 'Add Team Member';
        var currentPhotoHtml = member && member.photo_url
            ? '<div style="margin-bottom:12px;text-align:center;"><img src="' + escapeHtml(member.photo_url) + '" alt="" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--admin-border);"></div>'
            : '';

        overlay.innerHTML =
            '<div class="admin-card" style="width:90%;max-width:520px;max-height:90vh;overflow-y:auto;padding:28px;position:relative;border:none;box-shadow:0 20px 60px rgba(0,0,0,0.15);">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
                    '<h3 style="margin:0;font-size:20px;font-weight:700;">' + title + '</h3>' +
                    '<button class="team-modal-close" style="background:none;border:none;font-size:24px;color:var(--admin-text-muted);cursor:pointer;padding:4px;line-height:1;"><i class="fal fa-times"></i></button>' +
                '</div>' +
                currentPhotoHtml +
                '<div style="display:flex;flex-direction:column;gap:14px;">' +
                    '<div>' +
                        '<label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:var(--admin-text);">Name <span style="color:var(--status-danger);">*</span></label>' +
                        '<input class="admin-input" type="text" id="memberName" value="' + escapeHtml(memberForm.name) + '" placeholder="Enter full name" style="width:100%;padding:10px 12px;box-sizing:border-box;">' +
                    '</div>' +
                    '<div>' +
                        '<label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:var(--admin-text);">Role / Title</label>' +
                        '<input class="admin-input" type="text" id="memberRole" value="' + escapeHtml(memberForm.role) + '" placeholder="e.g. Creative Director" style="width:100%;padding:10px 12px;box-sizing:border-box;">' +
                    '</div>' +
                    '<div>' +
                        '<label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:var(--admin-text);">Photo</label>' +
                        '<input type="file" id="memberPhoto" accept=".png,.jpeg,.jpg,.webp" style="display:block;width:100%;padding:8px 0;font-size:13px;">' +
                    '</div>' +
                    '<div style="border-top:1px solid var(--admin-border);padding-top:14px;">' +
                        '<p style="font-size:13px;font-weight:600;margin:0 0 10px;color:var(--admin-text);">Social Media Links</p>' +
                        '<div style="display:flex;flex-direction:column;gap:8px;">' +
                            '<input class="admin-input" type="url" id="memberFacebook" value="' + escapeHtml(memberForm.facebook_url) + '" placeholder="Facebook URL" style="width:100%;padding:8px 12px;box-sizing:border-box;">' +
                            '<input class="admin-input" type="url" id="memberTwitter" value="' + escapeHtml(memberForm.twitter_url) + '" placeholder="Twitter URL" style="width:100%;padding:8px 12px;box-sizing:border-box;">' +
                            '<input class="admin-input" type="url" id="memberInstagram" value="' + escapeHtml(memberForm.instagram_url) + '" placeholder="Instagram URL" style="width:100%;padding:8px 12px;box-sizing:border-box;">' +
                            '<input class="admin-input" type="url" id="memberLinkedin" value="' + escapeHtml(memberForm.linkedin_url) + '" placeholder="LinkedIn URL" style="width:100%;padding:8px 12px;box-sizing:border-box;">' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div style="display:flex;gap:10px;margin-top:20px;border-top:1px solid var(--admin-border);padding-top:16px;">' +
                    '<button class="admin-btn secondary" id="teamFormCancel" style="flex:1;padding:10px;font-size:14px;">Cancel</button>' +
                    '<button class="admin-btn" id="teamFormSave" style="flex:1;padding:10px;font-size:14px;"><i class="fal fa-check" style="margin-right:6px;"></i>Save</button>' +
                '</div>' +
            '</div>';

        overlay.style.display = 'flex';

        overlay.querySelector('.team-modal-close').addEventListener('click', function() { overlay.style.display = 'none'; });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.style.display = 'none'; });
        document.getElementById('teamFormCancel').addEventListener('click', function() { overlay.style.display = 'none'; });
        document.getElementById('teamFormSave').addEventListener('click', function() { saveMember(overlay); });

        // Handle Enter key
        overlay.querySelectorAll('input').forEach(function(inp) {
            inp.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') saveMember(overlay);
            });
        });
    }

    function saveMember(overlay) {
        var name = document.getElementById('memberName').value.trim();
        if (!name) {
            if (window.showToast) window.showToast('error', 'Name is required');
            return;
        }

        var fd = new FormData();
        fd.append('name', name);
        fd.append('role', document.getElementById('memberRole').value.trim());
        fd.append('facebook_url', document.getElementById('memberFacebook').value.trim());
        fd.append('twitter_url', document.getElementById('memberTwitter').value.trim());
        fd.append('instagram_url', document.getElementById('memberInstagram').value.trim());
        fd.append('linkedin_url', document.getElementById('memberLinkedin').value.trim());
        fd.append('is_active', 'true');

        var photoInput = document.getElementById('memberPhoto');
        if (photoInput && photoInput.files && photoInput.files[0]) {
            fd.append('photo', photoInput.files[0]);
        }

        var save = memberForm.id
            ? window.homepageCmsApi.updateTeamMember(memberForm.id, fd)
            : window.homepageCmsApi.createTeamMember(fd);

        save.then(function(res) {
            overlay.style.display = 'none';
            if (res.ok) {
                loadMembers();
                if (window.showToast) window.showToast('success', memberForm.id ? 'Team member updated' : 'Team member created');
            } else {
                if (window.showToast) window.showToast('error', 'Failed to save team member');
            }
        }).catch(function() {
            overlay.style.display = 'none';
            if (window.showToast) window.showToast('error', 'Save failed');
        });
    }

    window.adminTeamLifecycle = { init: init };
})();