(function() {
    function init() {
        var form = document.querySelector('#chat-popup .contact-form-validated');
        if (!form) return;
        hijackForm(form);
    }

    function hijackForm(form) {
        if (window.jQuery && window.jQuery.fn && window.jQuery.fn.validate) {
            var $form = window.jQuery(form);
            if ($form.data('validator')) {
                $form.validate().destroy();
            }
        }

        var newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        newForm.removeAttribute('action');

        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSubmit(newForm);
        });
    }

    function handleSubmit(form) {
        var name    = form.querySelector('input[name="name"]').value.trim();
        var phone   = form.querySelector('input[name="phone"]').value.trim();
        var email   = form.querySelector('input[name="email"]').value.trim();
        var message = form.querySelector('textarea[name="message"]').value.trim();
        var result  = form.querySelector('.result');

        if (!name || !phone || !message) {
            if (result) result.innerHTML = '<span style="color:#ef4444;">Please fill in name, phone & message.</span>';
            return;
        }

        var btn = form.querySelector('button[type="submit"]');
        var orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = 'Sending...';

        var api = window.homepageCmsApi;
        if (!api || !api.submitContactMessage) {
            if (result) result.innerHTML = '<span style="color:#ef4444;">Service unavailable. Please try again later.</span>';
            btn.disabled = false;
            btn.innerHTML = orig;
            return;
        }

        api.submitContactMessage({ name: name, phone: phone, email: email, message: message })
            .then(function(res) {
                if (res.ok) {
                    if (result) result.innerHTML = '<span style="color:#10b981;">Thank you! We\'ll get back to you soon.</span>';
                    form.querySelectorAll('input, textarea').forEach(function(el) { el.value = ''; });
                    setTimeout(function() { if (result) result.innerHTML = ''; }, 4000);
                } else {
                    if (result) result.innerHTML = '<span style="color:#ef4444;">Failed to send. Please try again.</span>';
                }
            })
            .catch(function() {
                if (result) result.innerHTML = '<span style="color:#ef4444;">Network error. Please try again.</span>';
            })
            .finally(function() {
                btn.disabled = false;
                btn.innerHTML = orig;
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();