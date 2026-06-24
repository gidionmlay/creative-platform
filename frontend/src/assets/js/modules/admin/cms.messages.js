(function() {
    var messages = [];

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
        loadMessages();
    }

    function loadMessages() {
        var container = document.getElementById('adminMessagesContainer');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--admin-text-muted);"><i class="fas fa-spinner fa-spin" style="font-size:28px;margin-bottom:16px;display:block;"></i>Loading messages...</div>';

        window.homepageCmsApi.getContactMessages().then(function(res) {
            if (res.ok && res.data) {
                var d = res.data.data || res.data;
                messages = Array.isArray(d) ? d : d.results || [];
                renderMessages();
            } else {
                container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--status-danger);"><i class="fal fa-exclamation-triangle" style="font-size:32px;margin-bottom:12px;display:block;"></i>Failed to load messages</div>';
            }
        }).catch(function() {
            var c = document.getElementById('adminMessagesContainer');
            if (c) c.innerHTML = '<div style="text-align:center;padding:60px;color:var(--status-danger);"><i class="fal fa-exclamation-triangle" style="font-size:32px;margin-bottom:12px;display:block;"></i>Error loading messages</div>';
        });
    }

    function renderMessages() {
        var container = document.getElementById('adminMessagesContainer');
        if (!container) return;

        var readCount = messages.filter(function(m) { return m.is_read; }).length;
        var unreadCount = messages.length - readCount;

        var html = '<div style="display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap;">' +
            '<div class="admin-card" style="flex:1;min-width:140px;padding:16px;text-align:center;border:none;"><span style="font-size:28px;font-weight:700;display:block;">' + messages.length + '</span><span style="font-size:12px;color:var(--admin-text-muted);">Total</span></div>' +
            '<div class="admin-card" style="flex:1;min-width:140px;padding:16px;text-align:center;border:none;"><span style="font-size:28px;font-weight:700;display:block;color:#fb8500;">' + unreadCount + '</span><span style="font-size:12px;color:var(--admin-text-muted);">Unread</span></div>' +
            '<div class="admin-card" style="flex:1;min-width:140px;padding:16px;text-align:center;border:none;"><span style="font-size:28px;font-weight:700;display:block;color:#10b981;">' + readCount + '</span><span style="font-size:12px;color:var(--admin-text-muted);">Read</span></div>' +
            '</div>';

        if (!messages.length) {
            html += '<div style="text-align:center;padding:60px;color:var(--admin-text-muted);">' +
                '<i class="fal fa-inbox" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></i>' +
                'No messages yet.' +
                '</div>';
            container.innerHTML = html;
            return;
        }

        messages.forEach(function(m) {
            var created = m.created_at ? new Date(m.created_at).toLocaleString() : '';
            var statusClass = m.is_read ? 'status-active' : 'status-inactive';
            var statusText = m.is_read ? 'Read' : 'Unread';
            var readBtnHtml = m.is_read
                ? ''
                : '<button class="admin-btn secondary mark-read-btn" data-msg-id="' + m.id + '" style="padding:6px 10px;font-size:12px;"><i class="fal fa-check" style="margin-right:4px;"></i>Mark Read</button>';

            html +=
                '<div class="admin-card" style="padding:16px;margin-bottom:12px;border:none;box-shadow:0 2px 8px rgba(0,0,0,0.06);' + (m.is_read ? '' : 'border-left:3px solid #fb8500;') + '">' +
                    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">' +
                        '<div style="flex:1;min-width:0;">' +
                            '<div style="display:flex;gap:10px;align-items:center;margin-bottom:6px;flex-wrap:wrap;">' +
                                '<strong style="font-size:15px;">' + escapeHtml(m.name) + '</strong>' +
                                '<span class="status-badge ' + statusClass + '" style="font-size:11px;padding:2px 10px;">' + statusText + '</span>' +
                            '</div>' +
                            '<div style="font-size:13px;color:var(--admin-text-muted);margin-bottom:8px;">' +
                                (m.phone ? '<span style="margin-right:16px;"><i class="fal fa-phone" style="margin-right:4px;"></i>' + escapeHtml(m.phone) + '</span>' : '') +
                                (m.email ? '<span><i class="fal fa-envelope" style="margin-right:4px;"></i>' + escapeHtml(m.email) + '</span>' : '') +
                            '</div>' +
                            '<p style="font-size:14px;margin:0 0 4px;color:var(--admin-text);white-space:pre-wrap;">' + escapeHtml(m.message) + '</p>' +
                            (created ? '<span style="font-size:11px;color:var(--admin-text-muted);"><i class="fal fa-clock" style="margin-right:4px;"></i>' + created + '</span>' : '') +
                        '</div>' +
                        '<div style="display:flex;gap:4px;flex-shrink:0;">' +
                            readBtnHtml +
                            '<button class="admin-btn secondary delete-msg-btn" data-msg-id="' + m.id + '" style="padding:6px 10px;font-size:12px;color:var(--status-danger);border-color:var(--status-danger);"><i class="fal fa-trash-alt"></i></button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        });

        container.innerHTML = html;
        bindMessageEvents();
    }

    function bindMessageEvents() {
        document.querySelectorAll('.mark-read-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(this.dataset.msgId);
                window.homepageCmsApi.markContactMessageRead(id).then(function(res) {
                    if (res.ok) {
                        loadMessages();
                        if (window.showToast) window.showToast('success', 'Message marked as read');
                    } else {
                        if (window.showToast) window.showToast('error', 'Failed to update');
                    }
                });
            });
        });

        document.querySelectorAll('.delete-msg-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(this.dataset.msgId);
                if (!confirm('Delete this message?')) return;
                window.homepageCmsApi.deleteContactMessage(id).then(function(res) {
                    if (res.ok) {
                        loadMessages();
                        if (window.showToast) window.showToast('success', 'Message deleted');
                    } else {
                        if (window.showToast) window.showToast('error', 'Failed to delete');
                    }
                });
            });
        });
    }

    window.adminMessagesLifecycle = { init: init };
})();