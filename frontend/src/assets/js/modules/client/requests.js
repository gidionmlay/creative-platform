/**
 * Client Request Module
 * Handles fetching, displaying, and creating service requests for the client.
 */

(function() {
    let myRequests = [];

    // UI Elements mapping (functions to get elements dynamically)
    const elements = {
        tableBody: () => document.getElementById('clientRequestsTable'),
        emptyState: () => document.getElementById('requestsEmptyState'),
        tableContainer: () => document.querySelector('.admin-table-container table'),
        kpiTotal: () => document.getElementById('kpiTotalRequests'),
        kpiPending: () => document.getElementById('kpiPendingRequests'),
        kpiApproved: () => document.getElementById('kpiApprovedRequests'),
        modalOverlay: () => document.getElementById('requestModalOverlay'),
        createForm: () => document.getElementById('createRequestForm'),
        submitBtn: () => document.getElementById('submitRequestBtn'),
    };

    /**
     * Helper to get status styling
     */
    const getStatusHTML = (status) => {
        const s = (status || 'pending').toLowerCase();
        if (s === 'approved') {
            return `<span style="display:inline-flex; align-items:center; gap:6px; color:var(--status-success); font-weight:500; font-size:13px;"><div style="width:8px; height:8px; border-radius:50%; background:var(--status-success);"></div> Approved</span>`;
        } else if (s === 'rejected') {
            return `<span style="display:inline-flex; align-items:center; gap:6px; color:var(--status-error); font-weight:500; font-size:13px;"><div style="width:8px; height:8px; border-radius:50%; background:var(--status-error);"></div> Rejected</span>`;
        }
        return `<span style="display:inline-flex; align-items:center; gap:6px; color:var(--status-warning); font-weight:500; font-size:13px;"><div style="width:8px; height:8px; border-radius:50%; background:var(--status-warning);"></div> Pending</span>`;
    };

    /**
     * Fetch requests from the API
     */
    const fetchRequests = async () => {
        const tbody = elements.tableBody();
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4" style="color: var(--admin-text-muted);">Loading requests...</td></tr>`;
        }

        const response = await window.api.getMyRequests();
        if (response.ok) {
            // Check if backend returns data.results (pagination) or array
            myRequests = response.data.results || response.data;
            if (!Array.isArray(myRequests)) {
                myRequests = [];
            }
        } else {
            console.error("Failed to fetch requests", response);
            if (response.data?.detail === "Unauthorized" || response.data?.code === "token_not_valid") {
                if (window.auth) window.auth.removeToken();
                window.location.href = (window.ROOT_PATH || '') + '/src/pages/auth/login.html';
                return;
            }
            if (window.showToast) window.showToast("error", "Failed to load requests.");
            myRequests = [];
        }

        renderRequests();
        renderKPIs();
    };

    /**
     * Render the requests list
     */
    const renderRequests = () => {
        const tbody = elements.tableBody();
        const emptyState = elements.emptyState();
        const table = elements.tableContainer();

        if (!tbody || !emptyState || !table) return;

        if (myRequests.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        table.style.display = 'table';
        emptyState.style.display = 'none';

        let html = '';
        myRequests.forEach(req => {
            const dateStr = req.created_at ? new Date(req.created_at).toLocaleDateString() : (req.date || 'Just now');
            const serviceName = req.service || req.service_type || 'Custom Service';
            const title = req.title || req.details || `Request #${req.id || ''}`;
            
            html += `
                <tr>
                    <td style="font-weight: 500;">${title}</td>
                    <td><span style="color: var(--admin-text-muted);">${serviceName}</span></td>
                    <td>${getStatusHTML(req.status)}</td>
                    <td><span style="color: var(--admin-text-muted); font-size: 13px;">${dateStr}</span></td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    };

    /**
     * Render KPI cards
     */
    const renderKPIs = () => {
        const kpiTotal = elements.kpiTotal();
        const kpiPending = elements.kpiPending();
        const kpiApproved = elements.kpiApproved();

        if (kpiTotal) kpiTotal.textContent = myRequests.length;
        
        let pending = 0, approved = 0;
        myRequests.forEach(req => {
            const s = (req.status || 'pending').toLowerCase();
            if (s === 'approved') approved++;
            else if (s === 'pending') pending++;
        });

        if (kpiPending) kpiPending.textContent = pending;
        if (kpiApproved) kpiApproved.textContent = approved;
    };

    /**
     * Modal management
     */
    const openModal = () => {
        const modal = elements.modalOverlay();
        if (modal) {
            $(modal).css('display', 'flex').hide().fadeIn(200);
        }
    };

    const closeModal = () => {
        const modal = elements.modalOverlay();
        const form = elements.createForm();
        if (modal) {
            $(modal).fadeOut(200);
        }
        if (form) {
            form.reset();
        }
    };

    const setupModalHandlers = () => {
        // Prevent duplicate bindings
        $(document).off('click', '#openRequestModalBtn').on('click', '#openRequestModalBtn', openModal);
        $(document).off('click', '#closeRequestModalBtn').on('click', '#closeRequestModalBtn', closeModal);
        $(document).off('click', '#requestModalOverlay').on('click', '#requestModalOverlay', function(e) {
            if ($(e.target).is('#requestModalOverlay')) closeModal();
        });
    };

    /**
     * Form submission
     */
    const setupFormHandler = () => {
        $(document).off('submit', '#createRequestForm').on('submit', '#createRequestForm', async function(e) {
            e.preventDefault();
            
            const form = e.target;
            const formData = new FormData(form);
            const btn = elements.submitBtn();
            const btnText = btn.querySelector('.btn-text');
            const btnSpinner = btn.querySelector('.btn-spinner');
            // Loading state
            btn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnSpinner) btnSpinner.style.display = 'inline-block';

            const response = await window.api.createServiceRequest(formData);

            // Reset state
            btn.disabled = false;
            if (btnText) btnText.style.display = 'inline-block';
            if (btnSpinner) btnSpinner.style.display = 'none';

            if (response.ok) {
                closeModal();
                if (window.showToast) {
                    window.showToast("success", "Request submitted successfully!");
                } else {
                    alert("Request submitted successfully!");
                }
                fetchRequests();
            } else {
                if (window.showToast) {
                    window.showToast("error", response.data?.detail || "Failed to submit request.");
                } else {
                    alert(response.data?.detail || "Failed to submit request.");
                }
            }
        });
    };

    /**
     * Initialize Module
     */
    const init = () => {
        setupModalHandlers();
        setupFormHandler();
        fetchRequests();
    };

    // Expose public API
    window.clientRequests = {
        init,
        fetchRequests
    };

})();
