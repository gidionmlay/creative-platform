(function() {
    var BASE_URL = window.api ? window.api.BASE_URL : "http://127.0.0.1:8000/api/v1";

    window.homepageCmsApi = {
        // Public
        getHomepage: function() {
            return window.api.handleRequest(BASE_URL + '/content/homepage/', { method: 'GET' });
        },
        getSection: function(sectionKey) {
            return window.api.handleRequest(BASE_URL + '/content/homepage/' + sectionKey + '/', { method: 'GET' });
        },

        // Admin - Sections
        getSections: function() {
            return window.api.handleRequest(BASE_URL + '/admin/content/homepage/sections/', {
                method: 'GET',
                headers: window.api.getAuthHeaders()
            });
        },
        getSectionDetail: function(id) {
            return window.api.handleRequest(BASE_URL + '/admin/content/homepage/sections/' + id + '/', {
                method: 'GET',
                headers: window.api.getAuthHeaders()
            });
        },

        // Admin - Media
        getMedia: function(params) {
            var url = BASE_URL + '/admin/content/homepage/media/';
            if (params) {
                var qs = [];
                if (params.section) qs.push('section=' + params.section);
                if (qs.length) url += '?' + qs.join('&');
            }
            return window.api.handleRequest(url, {
                method: 'GET',
                headers: window.api.getAuthHeaders()
            });
        },
        createMedia: function(formData) {
            return window.api.handleRequest(BASE_URL + '/admin/content/homepage/media/', {
                method: 'POST',
                headers: window.api.getAuthHeaders(true),
                body: formData
            });
        },
        updateMedia: function(id, formData) {
            return window.api.handleRequest(BASE_URL + '/admin/content/homepage/media/' + id + '/', {
                method: 'PATCH',
                headers: window.api.getAuthHeaders(true),
                body: formData
            });
        },
        deleteMedia: function(id) {
            return window.api.handleRequest(BASE_URL + '/admin/content/homepage/media/' + id + '/', {
                method: 'DELETE',
                headers: window.api.getAuthHeaders()
            });
        },

        // Admin - Team Members
        getTeamMembers: function() {
            return window.api.handleRequest(BASE_URL + '/admin/content/homepage/team/', {
                method: 'GET',
                headers: window.api.getAuthHeaders()
            });
        },
        createTeamMember: function(formData) {
            return window.api.handleRequest(BASE_URL + '/admin/content/homepage/team/', {
                method: 'POST',
                headers: window.api.getAuthHeaders(true),
                body: formData
            });
        },
        updateTeamMember: function(id, formData) {
            return window.api.handleRequest(BASE_URL + '/admin/content/homepage/team/' + id + '/', {
                method: 'PATCH',
                headers: window.api.getAuthHeaders(true),
                body: formData
            });
        },
        deleteTeamMember: function(id) {
            return window.api.handleRequest(BASE_URL + '/admin/content/homepage/team/' + id + '/', {
                method: 'DELETE',
                headers: window.api.getAuthHeaders()
            });
        },

        // Public - Service Bento Cards
        getServiceBentoCards: function() {
            return window.api.handleRequest(BASE_URL + '/content/homepage/services/bento/', {
                method: 'GET'
            });
        },

        // Admin - Service Bento Cards
        getAdminServiceBentoCards: function() {
            return window.api.handleRequest(BASE_URL + '/admin/content/homepage/services-bento/', {
                method: 'GET',
                headers: window.api.getAuthHeaders()
            });
        },
        createServiceBentoCard: function(formData) {
            return window.api.handleRequest(BASE_URL + '/admin/content/homepage/services-bento/', {
                method: 'POST',
                headers: window.api.getAuthHeaders(true),
                body: formData
            });
        },
        updateServiceBentoCard: function(id, formData) {
            return window.api.handleRequest(BASE_URL + '/admin/content/homepage/services-bento/' + id + '/', {
                method: 'PATCH',
                headers: window.api.getAuthHeaders(true),
                body: formData
            });
        },
        deleteServiceBentoCard: function(id) {
            return window.api.handleRequest(BASE_URL + '/admin/content/homepage/services-bento/' + id + '/', {
                method: 'DELETE',
                headers: window.api.getAuthHeaders()
            });
        },

        // Public - Contact Messages
        submitContactMessage: function(data) {
            return window.api.handleRequest(BASE_URL + '/content/contact-messages/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        },

        // Admin - Contact Messages
        getContactMessages: function() {
            return window.api.handleRequest(BASE_URL + '/admin/content/contact-messages/', {
                method: 'GET',
                headers: window.api.getAuthHeaders()
            });
        },
        markContactMessageRead: function(id) {
            return window.api.handleRequest(BASE_URL + '/admin/content/contact-messages/' + id + '/', {
                method: 'PATCH',
                headers: window.api.getAuthHeaders(),
                body: JSON.stringify({ is_read: true })
            });
        },
        deleteContactMessage: function(id) {
            return window.api.handleRequest(BASE_URL + '/admin/content/contact-messages/' + id + '/', {
                method: 'DELETE',
                headers: window.api.getAuthHeaders()
            });
        }
    };
})();
