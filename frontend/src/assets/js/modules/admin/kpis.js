(function() {
    function animateValue(obj, start, end, duration, isPercentage = false) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const val = Math.floor(progress * (end - start) + start);
            obj.innerText = val + (isPercentage ? '%' : '');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerText = end + (isPercentage ? '%' : '');
            }
        };
        window.requestAnimationFrame(step);
    }

    window.adminKpis = {
        render: function(data) {
            if (!data) return;

            const map = {
                'kpiTotalUsers': { val: data.total_users, pct: false },
                'kpiTotalEnrollments': { val: data.total_enrollments, pct: false },
                'kpiTotalRequests': { val: data.total_requests, pct: false },
                'kpiPendingRequests': { val: data.pending_requests, pct: false },
                'kpiActiveStudents': { val: data.active_students, pct: false },
                'kpiPublishedCourses': { val: data.published_courses, pct: false },
                'kpiCompletionRate': { val: data.completion_rate, pct: true },
                'kpiMonthlyGrowth': { val: data.monthly_growth, pct: true }
            };

            for (let id in map) {
                const el = document.getElementById(id);
                if (el) {
                    const target = map[id].val || 0;
                    animateValue(el, 0, target, 1000, map[id].pct);
                    
                    // Monthly growth indicator
                    if (id === 'kpiMonthlyGrowth') {
                        const trendEl = document.getElementById('kpiMonthlyGrowthTrend');
                        if (trendEl) {
                            if (target >= 0) {
                                trendEl.innerHTML = `↑ +${target}%`;
                                trendEl.className = 'status-badge status-success';
                            } else {
                                trendEl.innerHTML = `↓ ${target}%`;
                                trendEl.className = 'status-badge status-danger';
                            }
                        }
                    }
                }
            }
        },
        setLoading: function() {
            const ids = [
                'kpiTotalUsers', 'kpiTotalEnrollments', 'kpiTotalRequests', 'kpiPendingRequests',
                'kpiActiveStudents', 'kpiPublishedCourses', 'kpiCompletionRate', 'kpiMonthlyGrowth'
            ];
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size: 14px;"></i>';
            });
        }
    };
})();
