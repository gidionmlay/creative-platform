(function() {
    var cards = [];
    var cardForm = { id: null, title: '', description: '', link_anchor: '', image: null };

    function escapeHtml(text) {
        if (!text) return '';
        return String(text).replace(/[&<>"]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            return m;
        });
    }

    function init() {
        loadCards();
    }

    function loadCards() {
        var container = document.getElementById('adminServicesBentoContainer');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--admin-text-muted);"><i class="fas fa-spinner fa-spin" style="font-size:28px;margin-bottom:16px;display:block;"></i>Loading bento cards...</div>';

        window.homepageCmsApi.getAdminServiceBentoCards().then(function(res) {
            if (res.ok && res.data) {
                var d = res.data.data || res.data;
                cards = Array.isArray(d) ? d : d.results || [];
                renderCards();
            } else {
                container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--status-danger);"><i class="fal fa-exclamation-triangle" style="font-size:32px;margin-bottom:12px;display:block;"></i>Failed to load bento cards</div>';
            }
        }).catch(function() {
            var c = document.getElementById('adminServicesBentoContainer');
            if (c) c.innerHTML = '<div style="text-align:center;padding:60px;color:var(--status-danger);"><i class="fal fa-exclamation-triangle" style="font-size:32px;margin-bottom:12px;display:block;"></i>Error loading bento cards</div>';
        });
    }

    function renderCards() {
        var container = document.getElementById('adminServicesBentoContainer');
        if (!container) return;

        var html = '<div style="display:flex;justify-content:flex-end;margin-bottom:20px;">' +
            '<button class="admin-btn" id="addBentoCardBtn"><i class="fal fa-plus" style="margin-right:6px;"></i>Add Card</button>' +
            '</div>';

        if (!cards.length) {
            html += '<div style="text-align:center;padding:60px;color:var(--admin-text-muted);">' +
                '<i class="fal fa-th-large" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.3;"></i>' +
                'No bento cards yet. Click "Add Card" to create one.' +
                '</div>';
            container.innerHTML = html;
            bindAddButton(container);
            return;
        }

        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;">';
        cards.forEach(function(c) {
            var imgHtml = c.image_url
                ? '<img src="' + escapeHtml(c.image_url) + '" alt="' + escapeHtml(c.title) + '" style="width:100%;height:160px;object-fit:cover;border-radius:12px;">'
                : '<div style="width:100%;height:160px;border-radius:12px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#cbd5e1;"><i class="fal fa-image" style="font-size:32px;"></i></div>';

            html +=
                '<div class="admin-card" style="padding:16px;border:none;box-shadow:0 2px 8px rgba(0,0,0,0.06);">' +
                    imgHtml +
                    '<div style="padding-top:12px;">' +
                        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
                            '<h4 style="margin:0;font-size:16px;font-weight:600;">' + escapeHtml(c.title) + '</h4>' +
                            '<span class="status-badge ' + (c.is_active ? 'status-active' : 'status-inactive') + '" style="font-size:11px;padding:2px 10px;">' + (c.is_active ? 'Active' : 'Inactive') + '</span>' +
                        '</div>' +
                        '<p style="margin:0;font-size:13px;color:var(--admin-text-muted);">' + escapeHtml(c.description || 'No description') + '</p>' +
                    '</div>' +
                    '<div style="display:flex;gap:6px;border-top:1px solid var(--admin-border);margin-top:12px;padding-top:12px;">' +
                        '<button class="admin-btn secondary edit-card-btn" data-card-id="' + c.id + '" style="flex:1;padding:6px 10px;font-size:12px;"><i class="fal fa-edit" style="margin-right:4px;"></i>Edit</button>' +
                        '<button class="admin-btn secondary toggle-card-btn" data-card-id="' + c.id + '" data-active="' + c.is_active + '" style="flex:1;padding:6px 10px;font-size:12px;">' + (c.is_active ? 'Deactivate' : 'Activate') + '</button>' +
                        '<button class="admin-btn secondary delete-card-btn" data-card-id="' + c.id + '" style="padding:6px 10px;font-size:12px;color:var(--status-danger);border-color:var(--status-danger);"><i class="fal fa-trash-alt"></i></button>' +
                    '</div>' +
                '</div>';
        });
        html += '</div>';

        container.innerHTML = html;
        bindAddButton(container);
        bindCardEvents(container);
    }

    function bindAddButton(container) {
        var btn = container.querySelector('#addBentoCardBtn');
        if (btn) btn.addEventListener('click', function() { openFormModal(null); });
    }

    function bindCardEvents(container) {
        container.querySelectorAll('.edit-card-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(this.dataset.cardId);
                var card = cards.find(function(c) { return c.id === id; });
                if (card) openFormModal(card);
            });
        });

        container.querySelectorAll('.toggle-card-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(this.dataset.cardId);
                var active = this.dataset.active === 'true' ? false : true;
                var fd = new FormData();
                fd.append('is_active', active ? 'true' : 'false');
                window.homepageCmsApi.updateServiceBentoCard(id, fd).then(function() {
                    loadCards();
                    if (window.showToast) window.showToast('success', 'Card updated');
                });
            });
        });

        container.querySelectorAll('.delete-card-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(this.dataset.cardId);
                if (!confirm('Delete this bento card?')) return;
                window.homepageCmsApi.deleteServiceBentoCard(id).then(function() {
                    loadCards();
                    if (window.showToast) window.showToast('success', 'Card deleted');
                });
            });
        });
    }

    /* ── Form Modal ──────────────────────────────────────────── */

    function openFormModal(card) {
        if (card) {
            cardForm.id = card.id;
            cardForm.title = card.title || '';
            cardForm.description = card.description || '';
            cardForm.link_anchor = card.link_anchor || '';
            cardForm.image = null;
        } else {
            cardForm.id = null;
            cardForm.title = '';
            cardForm.description = '';
            cardForm.link_anchor = '';
            cardForm.image = null;
        }

        var overlay = document.getElementById('bentoFormOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'bentoFormOverlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
            document.body.appendChild(overlay);
        }

        var title = card ? 'Edit Bento Card' : 'Add Bento Card';
        var currentImgHtml = card && card.image_url
            ? '<div style="margin-bottom:12px;text-align:center;"><img src="' + escapeHtml(card.image_url) + '" alt="" style="width:100%;max-height:140px;object-fit:cover;border-radius:10px;border:2px solid var(--admin-border);"></div>'
            : '';

        overlay.innerHTML =
            '<div class="admin-card" style="width:90%;max-width:500px;max-height:90vh;overflow-y:auto;padding:28px;position:relative;border:none;box-shadow:0 20px 60px rgba(0,0,0,0.15);">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
                    '<h3 style="margin:0;font-size:20px;font-weight:700;">' + title + '</h3>' +
                    '<button class="bento-modal-close" style="background:none;border:none;font-size:24px;color:var(--admin-text-muted);cursor:pointer;padding:4px;line-height:1;"><i class="fal fa-times"></i></button>' +
                '</div>' +
                currentImgHtml +
                '<div style="display:flex;flex-direction:column;gap:14px;">' +
                    '<div>' +
                        '<label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:var(--admin-text);">Title <span style="color:var(--status-danger);">*</span></label>' +
                        '<input class="admin-input" type="text" id="bentoCardTitle" value="' + escapeHtml(cardForm.title) + '" placeholder="e.g. Branding" style="width:100%;padding:10px 12px;box-sizing:border-box;">' +
                    '</div>' +
                    '<div>' +
                        '<label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:var(--admin-text);">Description</label>' +
                        '<input class="admin-input" type="text" id="bentoCardDescription" value="' + escapeHtml(cardForm.description) + '" placeholder="e.g. Strategic brand identity" style="width:100%;padding:10px 12px;box-sizing:border-box;">' +
                    '</div>' +
                    '<div>' +
                        '<label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:var(--admin-text);">Link Anchor</label>' +
                        '<input class="admin-input" type="text" id="bentoCardAnchor" value="' + escapeHtml(cardForm.link_anchor) + '" placeholder="e.g. #branding" style="width:100%;padding:10px 12px;box-sizing:border-box;">' +
                    '</div>' +
                    '<div>' +
                        '<label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:var(--admin-text);">Background Image</label>' +
                        '<input type="file" id="bentoCardImage" accept=".png,.jpeg,.jpg,.webp" style="display:block;width:100%;padding:8px 0;font-size:13px;">' +
                    '</div>' +
                '</div>' +
                '<div style="display:flex;gap:10px;margin-top:20px;border-top:1px solid var(--admin-border);padding-top:16px;">' +
                    '<button class="admin-btn secondary" id="bentoFormCancel" style="flex:1;padding:10px;font-size:14px;">Cancel</button>' +
                    '<button class="admin-btn" id="bentoFormSave" style="flex:1;padding:10px;font-size:14px;"><i class="fal fa-check" style="margin-right:6px;"></i>Save</button>' +
                '</div>' +
            '</div>';

        overlay.style.display = 'flex';

        overlay.querySelector('.bento-modal-close').addEventListener('click', function() { overlay.style.display = 'none'; });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.style.display = 'none'; });
        document.getElementById('bentoFormCancel').addEventListener('click', function() { overlay.style.display = 'none'; });
        document.getElementById('bentoFormSave').addEventListener('click', function() { saveCard(overlay); });

        overlay.querySelectorAll('input').forEach(function(inp) {
            inp.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') saveCard(overlay);
            });
        });
    }

    function saveCard(overlay) {
        var title = document.getElementById('bentoCardTitle').value.trim();
        if (!title) {
            if (window.showToast) window.showToast('error', 'Title is required');
            return;
        }

        var fd = new FormData();
        fd.append('title', title);
        fd.append('description', document.getElementById('bentoCardDescription').value.trim());
        fd.append('link_anchor', document.getElementById('bentoCardAnchor').value.trim());
        fd.append('is_active', 'true');

        var imgInput = document.getElementById('bentoCardImage');
        if (imgInput && imgInput.files && imgInput.files[0]) {
            fd.append('image', imgInput.files[0]);
        }

        var save = cardForm.id
            ? window.homepageCmsApi.updateServiceBentoCard(cardForm.id, fd)
            : window.homepageCmsApi.createServiceBentoCard(fd);

        save.then(function(res) {
            overlay.style.display = 'none';
            if (res.ok) {
                loadCards();
                if (window.showToast) window.showToast('success', cardForm.id ? 'Card updated' : 'Card created');
            } else {
                if (window.showToast) window.showToast('error', 'Failed to save card');
            }
        }).catch(function() {
            overlay.style.display = 'none';
            if (window.showToast) window.showToast('error', 'Save failed');
        });
    }

    window.adminServicesBentoLifecycle = { init: init };
})();