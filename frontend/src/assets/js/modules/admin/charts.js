(function() {
    let growthChartInstance = null;
    let requestChartInstance = null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { beginAtZero: true, grid: { borderDash: [2, 2], color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
        },
        animation: { duration: 1000, easing: 'easeOutQuart' }
    };

    function showEmptyChart(chartId) {
        var container = document.getElementById(chartId + 'Container');
        if (container) {
            container.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--admin-text-muted);gap:8px;">' +
                '<i class="fal fa-chart-line" style="font-size:28px;opacity:0.4;"></i>' +
                '<span style="font-size:14px;">No activity data available yet</span>' +
            '</div>';
        }
    }

    window.adminCharts = {
        renderGrowthChart: function(labels, data) {
            var hasData = data && data.length > 0 && data.some(function(v) { return v > 0; });
            if (!hasData) {
                if (growthChartInstance) { growthChartInstance.destroy(); growthChartInstance = null; }
                showEmptyChart('userGrowthChart');
                return;
            }

            const ctx = document.getElementById('userGrowthChart');
            if (!ctx) return;

            if (growthChartInstance) {
                growthChartInstance.destroy();
            }

            growthChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Registrations',
                        data: data,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: chartOptions
            });
        },
        renderRequestChart: function(labels, data) {
            var hasData = data && data.length > 0 && data.some(function(v) { return v > 0; });
            if (!hasData) {
                if (requestChartInstance) { requestChartInstance.destroy(); requestChartInstance = null; }
                showEmptyChart('requestFlowChart');
                return;
            }

            const ctx = document.getElementById('requestFlowChart');
            if (!ctx) return;

            if (requestChartInstance) {
                requestChartInstance.destroy();
            }

            requestChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Requests',
                        data: data,
                        backgroundColor: '#10b981',
                        borderRadius: 4
                    }]
                },
                options: chartOptions
            });
        },
        setLoading: function(chartId) {
            const container = document.getElementById(chartId + 'Container');
            if (container) {
                container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;"><i class="fas fa-spinner fa-spin" style="font-size:24px;color:var(--admin-text-muted);"></i></div>';
            }
        },
        restoreCanvas: function(chartId) {
            const container = document.getElementById(chartId + 'Container');
            if (container) {
                container.innerHTML = `<canvas id="${chartId}"></canvas>`;
            }
        }
    };
})();
