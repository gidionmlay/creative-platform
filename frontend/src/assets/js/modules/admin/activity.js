(function() {
    function formatDate(dateStr) {
        if (!dateStr) return 'Unknown';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function getIcon(type) {
        switch(type) {
            case 'registration': return '<i class="fal fa-user-plus" style="color: var(--admin-accent);"></i>';
            case 'enrollment': return '<i class="fal fa-graduation-cap" style="color: var(--status-success);"></i>';
            case 'request': return '<i class="fal fa-inbox-in" style="color: var(--status-warning);"></i>';
            default: return '<i class="fal fa-bell" style="color: var(--admin-text-muted);"></i>';
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

            let html = '<div class="activity-timeline" style="display: flex; flex-direction: column; gap: 15px;">';
            activities.forEach(item => {
                html += `
                    <div class="activity-item" style="display: flex; gap: 15px; align-items: flex-start; padding-bottom: 15px; border-bottom: 1px solid var(--admin-border);">
                        <div class="activity-icon" style="background: transparent; border: 1px solid var(--admin-border); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            ${getIcon(item.type)}
                        </div>
                        <div class="activity-content" style="flex: 1;">
                            <div style="font-size: 14px; color: var(--admin-text);">${item.message}</div>
                            <div style="font-size: 12px; color: var(--admin-text-muted); margin-top: 4px;">${formatDate(item.created_at)}</div>
                        </div>
                    </div>
                `;
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
