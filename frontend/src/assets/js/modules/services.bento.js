(function() {
    var fallbackImages = {
        'Branding': '../../../src/assets/images/project/portfolio-2-1.jpg',
        'Graphic Design': '../../../src/assets/images/project/portfolio-2-2.jpg',
        'Video Production': '../../../src/assets/images/project/portfolio-2-3.jpg',
        'Digital Marketing': '../../../src/assets/images/project/portfolio-2-4.jpg',
        'Printing Services': '../../../src/assets/images/project/portfolio-3-1.jpg',
        'Training & Digital Skills': '../../../src/assets/images/project/portfolio-3-2.jpg'
    };

    function init() {
        var grid = document.getElementById('servicesBentoGrid');
        if (!grid) return;
        fetchCards();
    }

    function fetchCards() {
        var api = window.homepageCmsApi;
        if (!api || !api.getServiceBentoCards) {
            applyFallbacks();
            return;
        }

        api.getServiceBentoCards().then(function(res) {
            if (res.ok && res.data) {
                var data = res.data.data || res.data;
                var cards = Array.isArray(data) ? data : data.results || [];
                if (cards.length) {
                    applyImages(cards);
                } else {
                    applyFallbacks();
                }
            } else {
                applyFallbacks();
            }
        }).catch(function() {
            applyFallbacks();
        });
    }

    function applyImages(cards) {
        if (!cards || !cards.length) return;
        var grid = document.getElementById('servicesBentoGrid');
        if (!grid) return;

        var cardEls = grid.querySelectorAll('[data-bento-title]');
        cardEls.forEach(function(el) {
            var title = el.getAttribute('data-bento-title');
            for (var i = 0; i < cards.length; i++) {
                if (cards[i].title === title && cards[i].image_url) {
                    var bg = el.querySelector('.bento-bg');
                    if (bg) bg.style.backgroundImage = "url('" + cards[i].image_url + "')";
                    return;
                }
            }
            // Try fallback if no API match
            applyFallback(el, title);
        });
    }

    function applyFallbacks() {
        var grid = document.getElementById('servicesBentoGrid');
        if (!grid) return;
        grid.querySelectorAll('[data-bento-title]').forEach(function(el) {
            var title = el.getAttribute('data-bento-title');
            applyFallback(el, title);
        });
    }

    function applyFallback(el, title) {
        if (fallbackImages[title]) {
            var bg = el.querySelector('.bento-bg');
            if (bg) bg.style.backgroundImage = "url('" + fallbackImages[title] + "')";
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();