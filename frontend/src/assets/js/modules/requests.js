/**
 * G Design Client Request Module
 */

document.addEventListener('DOMContentLoaded', () => {
    const requestForm = document.getElementById('requestForm');
    
    if (requestForm) {
        requestForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnIcon = submitBtn.querySelector('.btn-icon');
            const resultDiv = document.getElementById('formResult');
            
            // Extract data
            const formData = new FormData(requestForm);
            const data = Object.fromEntries(formData.entries());
            
            // Validation
            if (!data.service || !data.title || !data.description) {
                resultDiv.style.color = 'var(--nexin-base)'; // use brand color for error or red
                resultDiv.innerText = 'Please fill out all required fields.';
                return;
            }

            // Loading state
            submitBtn.disabled = true;
            btnText.innerText = 'Submitting...';
            btnIcon.className = 'fas fa-spinner fa-spin btn-icon';
            resultDiv.innerText = '';

            // Call API
            const response = await window.api.createRequest(data);
            
            // Reset UI state
            submitBtn.disabled = false;
            btnText.innerText = 'Submit Request';
            btnIcon.className = 'fas fa-arrow-right btn-icon';

            if (response.ok) {
                // Success message
                resultDiv.style.color = '#2ecc71'; // Green success
                resultDiv.innerText = 'Request submitted successfully! Redirecting to dashboard...';
                requestForm.reset();
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    const root = window.ROOT_PATH || '';
                    window.location.href = root + '/src/pages/dashboards/client/index.html';
                }, 2000);
            } else {
                // Error message
                resultDiv.style.color = '#e74c3c'; // Red error
                resultDiv.innerText = response.data.detail || 'Failed to submit request. Please try again.';
            }
        });
    }
});
