(function() {
    let currentRange = 'monthly';

    async function loadOverview() {
        let loading = true;
        if (window.adminKpis) window.adminKpis.setLoading();
        try {
            const res = await window.adminAnalyticsApi.getOverview();
            if (res.ok && res.data) {
                const payload = res.data.data || res.data;
                if (window.adminKpis) window.adminKpis.render(payload);
            } else {
                console.error("Failed to load overview analytics");
            }
        } catch (e) {
            console.error("Overview error", e);
        } finally {
            loading = false;
            if (window.adminKpis && typeof window.adminKpis.clearLoading === 'function') window.adminKpis.clearLoading();
        }
    }

    async function loadGrowthChart() {
        let loading = true;
        if (window.adminCharts) window.adminCharts.setLoading('userGrowthChart');
        try {
            const res = await window.adminAnalyticsApi.getUserGrowth(currentRange);
            if (res.ok && res.data) {
                const payload = res.data.data || res.data;
                if (window.adminCharts) {
                    window.adminCharts.restoreCanvas('userGrowthChart');
                    window.adminCharts.renderGrowthChart(payload.labels, payload.data);
                }
            } else {
                if (window.adminCharts) window.adminCharts.restoreCanvas('userGrowthChart');
            }
        } catch (e) {
            console.error("Growth chart error", e);
            if (window.adminCharts) window.adminCharts.restoreCanvas('userGrowthChart');
        } finally {
            loading = false;
        }
    }

    async function loadRequestChart() {
        let loading = true;
        if (window.adminCharts) window.adminCharts.setLoading('requestFlowChart');
        try {
            const res = await window.adminAnalyticsApi.getRequestFlow(currentRange);
            if (res.ok && res.data) {
                const payload = res.data.data || res.data;
                if (window.adminCharts) {
                    window.adminCharts.restoreCanvas('requestFlowChart');
                    window.adminCharts.renderRequestChart(payload.labels, payload.data);
                }
            } else {
                if (window.adminCharts) window.adminCharts.restoreCanvas('requestFlowChart');
            }
        } catch (e) {
            console.error("Request chart error", e);
            if (window.adminCharts) window.adminCharts.restoreCanvas('requestFlowChart');
        } finally {
            loading = false;
        }
    }

    async function loadRecentActivity() {
        let loading = true;
        if (window.adminActivity) window.adminActivity.setLoading();
        try {
            const res = await window.adminAnalyticsApi.getRecentActivity();
            if (res.ok && res.data) {
                const payload = res.data.data || res.data;
                if (window.adminActivity) window.adminActivity.render(payload);
            } else {
                if (window.adminActivity && typeof window.adminActivity.renderError === 'function') {
                    window.adminActivity.renderError();
                } else if (window.adminActivity && typeof window.adminActivity.render === 'function') {
                    window.adminActivity.render([]);
                }
            }
        } catch (e) {
            console.error("Recent activity error", e);
            if (window.adminActivity && typeof window.adminActivity.renderError === 'function') {
                window.adminActivity.renderError();
            } else if (window.adminActivity && typeof window.adminActivity.render === 'function') {
                window.adminActivity.render([]);
            }
        } finally {
            loading = false;
        }
    }

    window.adminDashboardLifecycle = {
        init: function() {
            // Bind range filter
            const rangeFilter = document.getElementById('analyticsRangeFilter');
            if (rangeFilter) {
                // Remove existing listener to prevent duplicates
                const newFilter = rangeFilter.cloneNode(true);
                rangeFilter.parentNode.replaceChild(newFilter, rangeFilter);
                
                newFilter.addEventListener('change', function(e) {
                    currentRange = e.target.value;
                    loadGrowthChart();
                    loadRequestChart();
                });
                
                // Set initial value
                newFilter.value = currentRange;
            }

            // Load all parts
            loadOverview();
            loadGrowthChart();
            loadRequestChart();
            loadRecentActivity();
        }
    };
})();
