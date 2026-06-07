/**
 * G Design Client Services Module
 * ───────────────────────────────
 * Dynamic service showcase with TSh pricing and request flow.
 */
console.log("🔥 JS FILE LOADED:", "client/services.js");

(function() {
    let activeServices = [];

    // TSh price formatting using global helper
    function formatPrice(basePrice, discountedPrice) {
        var fmt = window.api && window.api.formatCurrencyTZS ? window.api.formatCurrencyTZS : function(v) { return 'TSh ' + Number(v).toLocaleString(); };
        if (discountedPrice) {
            return '<span class="price-discounted" style="text-decoration: line-through; color: var(--admin-text-muted); font-size: 13px; margin-right: 6px;">' + fmt(basePrice) + '</span><span class="price-active" style="font-weight: 600; color: var(--admin-accent);">' + fmt(discountedPrice) + '</span>';
        }
        return '<span class="price-active" style="font-weight: 600; color: var(--admin-accent);">' + fmt(basePrice) + '</span>';
    }

    async function init() {
        const grid = document.getElementById('servicesGrid');
        if (!grid) return;

        grid.innerHTML = '<div class="col-12 text-center py-5"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top: 10px; color: var(--admin-text-muted);">Fetching premium services...</p></div>';

        try {
            const res = await window.servicesApi.getServices();
            if (res && res.ok) {
                activeServices = res.data.results || res.data;
                renderServices(activeServices);
            } else {
                grid.innerHTML = '<div class="col-12 text-center py-5"><i class="fal fa-exclamation-triangle fa-2x text-warning"></i><p style="margin-top: 10px; color: var(--admin-text-muted);">Failed to load services. Please try again later.</p></div>';
            }
        } catch (err) {
            console.error("Error fetching services:", err);
            grid.innerHTML = '<div class="col-12 text-center py-5"><i class="fal fa-exclamation-triangle fa-2x text-warning"></i><p style="margin-top: 10px; color: var(--admin-text-muted);">An error occurred.</p></div>';
        }
    }

    function renderServices(services) {
        const grid = document.getElementById('servicesGrid');
        if (!grid) return;

        if (services.length === 0) {
            grid.innerHTML = '\
                <div class="col-12 text-center py-5" style="color: var(--admin-text-muted);">\
                    <i class="fal fa-magic" style="font-size: 48px; margin-bottom: 15px; display: block; color: var(--admin-border);"></i>\
                    <h4 style="font-family: var(--nexin-font); font-weight: 600;">No services available</h4>\
                    <p>We are currently updating our service offerings. Check back soon!</p>\
                </div>';
            return;
        }

        let html = '';
        services.forEach(s => {
            const imgUrl = s.thumbnail_asset_details ? (s.thumbnail_asset_details.medium || s.thumbnail_asset_details.file) : (s.thumbnail || '../../../../src/assets/images/company-img/favicon.svg');
            const categoryName = s.category ? s.category.name : 'General';
            html += '\
                <div class="col-lg-4 col-md-6">\
                    <div class="admin-card service-card" style="display: flex; flex-direction: column; height: 100%; overflow: hidden; padding: 0; border: 1px solid var(--admin-border); transition: all 0.3s ease; border-radius: 12px;">\
                        <div class="service-thumb" style="height: 160px; overflow: hidden; position: relative; background: #f3f4f6;">\
                            <img src="' + imgUrl + '" alt="' + s.title + '" style="width: 100%; height: 100%; object-fit: cover;">\
                            <span style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.6); color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; backdrop-filter: blur(4px);">' + categoryName + '</span>\
                            ' + (s.featured ? '<span style="position: absolute; top: 12px; right: 12px; background: var(--admin-accent); color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 500;">Featured</span>' : '') + '\
                        </div>\
                        <div style="padding: 20px; display: flex; flex-direction: column; flex-grow: 1;">\
                            <h4 style="font-weight: 600; font-size: 17px; margin-bottom: 8px; color: var(--admin-text);">' + s.title + '</h4>\
                            <p style="color: var(--admin-text-muted); font-size: 13.5px; margin-bottom: 20px; flex-grow: 1; line-height: 1.5;">' + s.short_description + '</p>\
                            <div class="d-flex justify-content-between align-items-center mt-auto pt-3" style="border-top: 1px solid var(--admin-border);">\
                                <div style="display: flex; flex-direction: column;">\
                                    <span style="font-size: 11px; color: var(--admin-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Starting from</span>\
                                    <div style="display: flex; align-items: center; margin-top: 2px;">' + formatPrice(s.base_price, s.discounted_price) + '</div>\
                                </div>\
                                <div style="display: flex; gap: 8px;">\
                                    <button class="admin-btn secondary view-details-btn" style="padding: 8px 12px; font-size: 12px;" data-slug="' + s.slug + '">Details</button>\
                                    <button class="admin-btn request-service-btn" style="padding: 8px 12px; font-size: 12px;" data-id="' + s.id + '" data-slug="' + s.slug + '">Request</button>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>';
        });
        grid.innerHTML = html;

        // Bind detail clicks
        grid.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                showDetailsModal(e.target.closest('[data-slug]').dataset.slug);
            });
        });

        // Bind request clicks — opens premium request modal
        grid.querySelectorAll('.request-service-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const el = e.target.closest('[data-id]');
                const service = activeServices.find(s => String(s.id) === el.dataset.id);
                if (service && window.openRequestModal) {
                    window.openRequestModal(service);
                }
            });
        });
    }

    async function showDetailsModal(slug) {
        let modal = document.getElementById('serviceDetailsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'serviceDetailsModal';
            modal.className = 'custom-modal-overlay';
            modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1060; align-items: center; justify-content: center;';
            document.body.appendChild(modal);
        }

        modal.innerHTML = '<div class="custom-modal-content admin-card" style="width: 100%; max-width: 650px; margin: 20px; position: relative; animation: fadeIn 0.3s ease; max-height: 90vh; overflow-y: auto; padding: 25px;"><button id="closeDetailsModalBtn" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 20px; color: var(--admin-text-muted); cursor: pointer; z-index: 10;"><i class="fal fa-times"></i></button><div class="text-center py-4"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>';
        modal.style.display = 'flex';

        const closeBtn = modal.querySelector('#closeDetailsModalBtn');
        closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

        try {
            const res = await window.servicesApi.getServiceDetails(slug);
            if (res && res.ok) {
                const s = res.data;
                const imgUrl = s.thumbnail_asset_details ? (s.thumbnail_asset_details.medium || s.thumbnail_asset_details.file) : (s.thumbnail || '../../../../src/assets/images/company-img/favicon.svg');
                const categoryName = s.category ? s.category.name : 'General';

                let featuresHtml = '';
                if (s.features && s.features.length > 0) {
                    featuresHtml = '<div style="margin-top: 20px;"><h5 style="font-weight: 600; font-size: 15px; margin-bottom: 10px;">What\'s Included:</h5><ul style="list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">';
                    s.features.forEach(f => {
                        featuresHtml += '<li style="font-size: 13.5px; color: var(--admin-text); display: flex; align-items: center;"><i class="fal fa-check-circle text-success" style="margin-right: 8px; color: var(--status-success);"></i> ' + f.title + '</li>';
                    });
                    featuresHtml += '</ul></div>';
                }

                let galleryHtml = '';
                if (s.gallery && s.gallery.length > 0) {
                    galleryHtml = '<div style="margin-top: 20px;"><h5 style="font-weight: 600; font-size: 15px; margin-bottom: 10px;">Gallery:</h5><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px;">';
                    s.gallery.forEach(g => {
                        const galleryImgUrl = g.image_asset_details ? (g.image_asset_details.medium || g.image_asset_details.file) : g.image;
                        galleryHtml += '<div style="height: 90px; border-radius: 6px; overflow: hidden; background: #eee;"><img src="' + galleryImgUrl + '" alt="Gallery item" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" onclick="window.open(\'' + galleryImgUrl + '\', \'_blank\')"></div>';
                    });
                    galleryHtml += '</div></div>';
                }

                modal.innerHTML = '\
                    <div class="custom-modal-content admin-card" style="width: 100%; max-width: 650px; margin: 20px; position: relative; animation: fadeIn 0.3s ease; max-height: 90vh; overflow-y: auto; padding: 0; border: none; border-radius: 12px; overflow: hidden;">\
                        <button id="closeDetailsModalBtn" style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.5); border: none; font-size: 16px; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; backdrop-filter: blur(4px);"><i class="fal fa-times"></i></button>\
                        <div style="height: 240px; position: relative; background: #eee;">\
                            <img src="' + imgUrl + '" alt="' + s.title + '" style="width: 100%; height: 100%; object-fit: cover;">\
                            <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 60%; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); display: flex; align-items: flex-end; padding: 20px;">\
                                <div>\
                                    <span style="background: var(--admin-accent); color: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">' + categoryName + '</span>\
                                    <h3 style="color: white; font-weight: 600; margin: 8px 0 0 0; font-size: 22px;">' + s.title + '</h3>\
                                </div>\
                            </div>\
                        </div>\
                        <div style="padding: 25px;">\
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; flex-wrap: wrap;">\
                                <div style="flex: 1; min-width: 250px;">\
                                    <h5 style="font-weight: 600; font-size: 15px; margin-bottom: 8px;">Description:</h5>\
                                    <p style="color: var(--admin-text-muted); font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-line;">' + (s.full_description || s.short_description) + '</p>\
                                </div>\
                                <div style="background: #f8fafc; border: 1px solid var(--admin-border); border-radius: 8px; padding: 15px; width: 200px;">\
                                    <span style="font-size: 11px; color: var(--admin-text-muted); text-transform: uppercase; display: block; margin-bottom: 2px;">Investment</span>\
                                    <div style="margin-bottom: 12px;">' + formatPrice(s.base_price, s.discounted_price) + '</div>\
                                    <span style="font-size: 11px; color: var(--admin-text-muted); text-transform: uppercase; display: block; margin-bottom: 2px;">Delivery</span>\
                                    <span style="font-weight: 500; font-size: 13.5px; color: var(--admin-text); display: block; margin-bottom: 15px;"><i class="fal fa-clock" style="margin-right: 5px;"></i> ' + s.delivery_time + '</span>\
                                    <button class="admin-btn mt-2 request-now-btn" style="width: 100%; padding: 10px 12px; font-size: 13px;" data-service-id="' + s.id + '">Request Service</button>\
                                </div>\
                            </div>\
                            ' + featuresHtml + '\
                            ' + galleryHtml + '\
                        </div>\
                    </div>';

                modal.querySelector('#closeDetailsModalBtn').addEventListener('click', () => { modal.style.display = 'none'; });

                const reqBtn = modal.querySelector('.request-now-btn');
                reqBtn.addEventListener('click', () => {
                    modal.style.display = 'none';
                    if (window.openRequestModal) {
                        window.openRequestModal(s);
                    }
                });
            } else {
                modal.innerHTML = '<div class="custom-modal-content admin-card" style="width: 100%; max-width: 500px; margin: 20px; position: relative; padding: 25px; text-align: center;"><button id="closeDetailsModalBtn" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 20px; color: var(--admin-text-muted); cursor: pointer;"><i class="fal fa-times"></i></button><i class="fal fa-exclamation-circle fa-2x text-danger" style="margin-bottom: 15px;"></i><h4 style="font-weight:600;">Failed to load details</h4><p style="color: var(--admin-text-muted);">The service information could not be retrieved.</p></div>';
                modal.querySelector('#closeDetailsModalBtn').addEventListener('click', () => { modal.style.display = 'none'; });
            }
        } catch (err) {
            console.error(err);
        }
    }

    window.clientServicesLifecycle = {
        init: init,
        getActiveServices: function() { return activeServices; }
    };
})();
