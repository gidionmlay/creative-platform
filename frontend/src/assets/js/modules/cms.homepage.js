(function() {
    // Maps section_keys to DOM selectors for image replacement
    // Each entry: { selectors: [...], mode: 'src' | 'background' | 'data-src' }
    var sectionMap = {
        'hero': {
            selectors: [
                '.banner-one__one-shape-bg',
                '.banner-one__shape-one',
                '.banner-one__review-img img'
            ]
        },
        'explore': {
            selectors: [
                '.company-img'
            ]
        },
        'about': {
            selectors: [
                '.about-one__image-box img',
                '.brand-one__slide img'
            ]
        },
        'services': {
            selectors: [
                '.services-one__shape img'
            ]
        },
        'video': {
            selectors: [
                '.video-one__bg'
            ]
        },
        'portfolio': {
            selectors: [
                '.portfolio-one__img img',
                '.portfolio-one__img-2 img'
            ]
        },
        'process': {
            selectors: [
                '.process-one__single-icon img',
                '.process-one__single-shape img'
            ]
        },
        'why-choose': {
            selectors: [
                '.why-choose-one__img-1 img',
                '.why-choose-one__img-2 img',
                '.why-choose-one__mission-img img'
            ]
        },
        'team': {
            selectors: [
                '.team-one__single-img img'
            ]
        },
        'team-members': {
            selectors: [
                '.team-one__single-img img'
            ]
        },
        'testimonials': {
            selectors: [
                '.testimonial-one__thumb img'
            ]
        },
        'contact': {
            selectors: [
                '.contact-one__bg'
            ]
        },
        'blog': {
            selectors: [
                '.blog-one__img img'
            ]
        }
    };

    var cachedData = null;
    var teamMembers = null;
    var BASE_URL = window.api ? window.api.BASE_URL : "http://127.0.0.1:8000/api/v1";

    function fetchHomepageContent() {
        return fetch(BASE_URL + '/content/homepage/')
            .then(function(r) { return r.json(); })
            .then(function(data) {
                cachedData = data;
                return data;
            })
            .catch(function(err) {
                console.warn('CMS homepage: API unavailable, using fallback images', err);
                return null;
            });
    }

    function fetchTeamMembers() {
        return fetch(BASE_URL + '/content/homepage/team/')
            .then(function(r) { return r.json(); })
            .then(function(data) {
                teamMembers = Array.isArray(data) ? data : data.results || [];
                return teamMembers;
            })
            .catch(function(err) {
                console.warn('CMS team: API unavailable, using fallback', err);
                teamMembers = null;
                return null;
            });
    }

    function renderTeamMembers() {
        var container = document.querySelector('.team-one .row');
        if (!container || !teamMembers || !teamMembers.length) return;

        var delays = ['100ms', '200ms', '300ms', '400ms'];
        var animations = ['fadeInLeft', 'fadeInLeft', 'fadeInRight', 'fadeInRight'];

        var html = '';
        teamMembers.forEach(function(member, index) {
            if (!member.is_active) return;
            var delay = delays[index % delays.length];
            var anim = animations[index % animations.length];
            var photoUrl = member.photo_url || '';

            var socialHtml = '';
            if (member.facebook_url) socialHtml += '<li><a href="' + member.facebook_url + '" target="_blank"><span class="icon-facebook"></span></a></li>';
            if (member.twitter_url) socialHtml += '<li><a href="' + member.twitter_url + '" target="_blank"><span class="icon-twitter"></span></a></li>';
            if (member.instagram_url) socialHtml += '<li><a href="' + member.instagram_url + '" target="_blank"><span class="icon-instagram"></span></a></li>';
            if (member.linkedin_url) socialHtml += '<li><a href="' + member.linkedin_url + '" target="_blank"><span class="icon-linkin"></span></a></li>';

            html +=
                '<div class="col-xl-3 col-lg-6 col-md-6 wow ' + anim + '" data-wow-delay="' + delay + '">' +
                    '<div class="team-one__single">' +
                        '<div class="team-one__img-box">' +
                            '<div class="team-one__img">' +
                                '<img src="' + (photoUrl || '../../../src/assets/images/team/team-1-1.jpg') + '" alt="' + member.name + '">' +
                            '</div>' +
                            (socialHtml ? '<div class="team-one__social-box"><ul class="team-one__social list-unstyled">' + socialHtml + '</ul></div>' : '') +
                        '</div>' +
                        '<div class="team-one__content">' +
                            '<h3 class="team-one__title"><a href="#team">' + member.name + '</a></h3>' +
                            '<p class="team-one__sub-title">' + (member.role || '') + '</p>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        });

        container.innerHTML = html;
    }

    function applySectionImages(sectionKey, images) {
        var config = sectionMap[sectionKey];
        if (!config || !images || !images.length) return;

        var activeImages = images.filter(function(img) { return img.is_active; });
        if (!activeImages.length) return;

        config.selectors.forEach(function(selector, index) {
            var elements = document.querySelectorAll(selector);
            if (!elements.length) return;

            var imgData = activeImages[index] || activeImages[activeImages.length - 1];
            if (!imgData || !imgData.image_url) return;

            elements.forEach(function(el) {
                if (el.tagName === 'IMG') {
                    el.setAttribute('src', imgData.image_url);
                    if (imgData.alt_text) el.setAttribute('alt', imgData.alt_text);
                } else if (el.style) {
                    el.style.backgroundImage = 'url(' + imgData.image_url + ')';
                }
            });
        });
    }

    function init() {
        if (cachedData) {
            apply(cachedData);
            renderTeamMembers();
            return;
        }

        Promise.all([
            fetchHomepageContent(),
            fetchTeamMembers()
        ]).then(function(results) {
            var data = results[0];
            if (data && Array.isArray(data)) {
                apply(data);
            }
            renderTeamMembers();
        });
    }

    function apply(sections) {
        sections.forEach(function(section) {
            if (section.media && section.media.length) {
                applySectionImages(section.section_key, section.media);
            }
        });
    }

    // Auto-init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for manual reload
    window.homepageCms = {
        init: init,
        refresh: function() {
            cachedData = null;
            init();
        }
    };
})();
