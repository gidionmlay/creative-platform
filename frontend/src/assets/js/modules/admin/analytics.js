(function() {
    const BASE_URL = "http://127.0.0.1:8000/api/v1/admin/analytics";

    // Headers fetched globally
    async function fetchAPI(endpoint) {
        try {
            const res = await fetch(`${BASE_URL}${endpoint}`, { headers: window.api.getAuthHeaders() });
            let data = null;
            if (res.status !== 204) {
                data = await res.json();
            }
            return { ok: res.ok, data };
        } catch (error) {
            console.error(`API Error GET ${endpoint}`, error);
            return { ok: false, data: null };
        }
    }

    window.adminAnalyticsApi = {
        getOverview: () => fetchAPI('/overview/'),
        getUserGrowth: (range = 'monthly') => fetchAPI(`/user-growth/?range=${range}`),
        getRequestFlow: (range = 'monthly') => fetchAPI(`/request-flow/?range=${range}`),
        getRecentActivity: () => fetchAPI('/recent-activity/')
    };
})();
