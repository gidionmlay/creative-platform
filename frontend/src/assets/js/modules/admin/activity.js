(function() {
    function formatDate(dateStr) {
        if (!dateStr) return 'Unknown';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function getIcon(type) {
        switch(type) {
            case 'registration': return '<i class="fal fa-user-plus"></i>';
            case 'enrollment': return '<i class="fal fa-graduation-cap"></i>';
            case 'request': return '<i class="fal fa-inbox-in"></i>';
            default: return '<i class="fal fa-bell"></i>';
        }
    }

    window.adminActivity = {
        render: function(activities) {
            const container = document.getElementById('recentActivityFeed');
            if (!container) return;

            if (!activities || activities.length === 0) {
                container.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--admin-text-muted);">No recent activity available</div>';
                return;
            }

            let html = '<div class="activity-list">';
            var items = activities.slice(0, 5);
            items.forEach(function(item) {
                html +=
                    '<div class="activity-item">' +
                        '<div class="activity-icon">' + getIcon(item.type) + '</div>' +
                        '<div class="activity-details" style="flex: 1;">' +
                            '<p>' + item.message + '</p>' +
                            '<span class="activity-time">' + formatDate(item.created_at) + '</span>' +
                        '</div>' +
                    '</div>';
            });
            html += '</div>';

            container.innerHTML = html;
        },
        setLoading: function() {
            const container = document.getElementById('recentActivityFeed');
            if (container) {
                container.innerHTML = '<div style="padding: 30px; text-align: center;"><i class="fas fa-spinner fa-spin" style="color: var(--admin-text-muted);"></i></div>';
            }
        },
        renderError: function() {
            const container = document.getElementById('recentActivityFeed');
            if (container) {
                container.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--status-danger);"><i class="fal fa-exclamation-triangle" style="font-size:24px; margin-bottom:10px; display:block;"></i>Failed to load recent activity</div>';
            }
        }
    };
})();
