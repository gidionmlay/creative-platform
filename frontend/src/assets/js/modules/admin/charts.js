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

    window.adminCharts = {
        renderGrowthChart: function(labels, data) {
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
                        borderColor: '#2563eb', // primary blue
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
                        backgroundColor: '#10b981', // success green
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
