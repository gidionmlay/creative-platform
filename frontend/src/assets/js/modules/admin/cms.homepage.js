(function() {
    var sections = [];
    var currentSectionId = null;
    var pendingFile = null;

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
        loadSections();
    }

    /* ── Section Cards ──────────────────────────────────────── */

    function loadSections() {
        var container = document.getElementById('homepageCmsContainer');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--admin-text-muted);"><i class="fas fa-spinner fa-spin" style="font-size:28px;margin-bottom:16px;display:block;"></i>Loading sections...</div>';

        window.homepageCmsApi.getSections().then(function(res) {
            if (res.ok && res.data) {
                sections = res.data.results || res.data;
                if (!Array.isArray(sections)) sections = [sections];
                renderSections();
            } else {
                container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--status-danger);"><i class="fal fa-exclamation-triangle" style="font-size:32px;margin-bottom:12px;display:block;"></i>Failed to load sections</div>';
            }
        }).catch(function() {
            var c = document.getElementById('homepageCmsContainer');
            if (c) c.innerHTML = '<div style="text-align:center;padding:60px;color:var(--status-danger);"><i class="fal fa-exclamation-triangle" style="font-size:32px;margin-bottom:12px;display:block;"></i>Error loading sections</div>';
        });
    }

    function renderSections() {
        var container = document.getElementById('homepageCmsContainer');
        if (!container) return;

        if (!sections.length) {
            container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--admin-text-muted);">No sections found</div>';
            return;
        }

        var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;">';
        sections.forEach(function(s) {
            var imgUrl = s.latest_image || '';
            var imgHtml = imgUrl
                ? '<img src="' + escapeHtml(imgUrl) + '" alt="" style="width:100%;height:150px;object-fit:cover;border-radius:10px;display:block;">'
                : '<div style="width:100%;height:150px;background:#f1f5f9;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#cbd5e1;"><i class="fal fa-image" style="font-size:36px;"></i></div>';

            var updated = s.updated_at
                ? new Date(s.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Never';

            html +=
                '<div class="admin-card" style="padding:16px;display:flex;flex-direction:column;gap:10px;border:none;box-shadow:0 2px 8px rgba(0,0,0,0.06);">' +
                    imgHtml +
                    '<div>' +
                        '<h4 style="margin:0 0 4px 0;font-size:16px;font-weight:600;">' + escapeHtml(s.section_name) + '</h4>' +
                        '<div style="font-size:13px;color:var(--admin-text-muted);display:flex;gap:14px;">' +
                            '<span><i class="fal fa-image" style="margin-right:5px;"></i>' + (s.media_count || 0) + ' images</span>' +
                            '<span><i class="fal fa-clock" style="margin-right:5px;"></i>' + updated + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div style="display:flex;gap:8px;margin-top:4px;">' +
                        '<button class="admin-btn manage-section-btn" data-section-id="' + s.id + '" style="flex:1;padding:8px;font-size:13px;"><i class="fal fa-edit" style="margin-right:5px;"></i>Manage</button>' +
                        '<button class="admin-btn secondary upload-section-btn" data-section-id="' + s.id + '" style="flex:1;padding:8px;font-size:13px;"><i class="fal fa-upload" style="margin-right:5px;"></i>Upload</button>' +
                    '</div>' +
                '</div>';
        });
        html += '</div>';

        container.innerHTML = html;

        container.querySelectorAll('.manage-section-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                openManageModal(parseInt(this.dataset.sectionId));
            });
        });
        container.querySelectorAll('.upload-section-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                triggerUpload(parseInt(this.dataset.sectionId));
            });
        });
    }

    /* ── Upload with Confirmation ───────────────────────────── */

    function triggerUpload(sectionId) {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.png,.jpeg,.jpg,.svg,.webp,.gif';
        input.style.display = 'none';
        document.body.appendChild(input);

        input.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                pendingFile = this.files[0];
                var section = sections.find(function(s) { return s.id === sectionId; });
                showConfirmModal(sectionId, section ? section.section_name : 'this section', pendingFile);
            }
            document.body.removeChild(input);
        });

        input.click();
    }

    function showConfirmModal(sectionId, sectionName, file) {
        var overlay = document.getElementById('cmsConfirmOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'cmsConfirmOverlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.55);z-index:10001;display:flex;align-items:center;justify-content:center;';
            document.body.appendChild(overlay);
        }

        var reader = new FileReader();
        reader.onload = function(e) {
            var dataUrl = e.target.result;

            overlay.innerHTML =
                '<div class="admin-card" style="width:90%;max-width:440px;padding:28px;position:relative;text-align:center;border:none;box-shadow:0 20px 60px rgba(0,0,0,0.15);">' +
                    '<div style="font-size:48px;color:var(--status-warning);margin-bottom:12px;"><i class="fal fa-exclamation-circle"></i></div>' +
                    '<h3 style="margin:0 0 6px;font-size:18px;font-weight:700;">Confirm Upload</h3>' +
                    '<p style="color:var(--admin-text-muted);font-size:14px;margin:0 0 16px;line-height:1.5;">Are you sure you want to save this image?<br>It will be displayed in <strong>' + escapeHtml(sectionName) + '</strong>.</p>' +
                    '<div style="width:100%;height:140px;background:#f1f5f9;border-radius:8px;overflow:hidden;margin-bottom:16px;display:flex;align-items:center;justify-content:center;">' +
                        '<img src="' + dataUrl + '" alt="" style="max-width:100%;max-height:140px;object-fit:contain;">' +
                    '</div>' +
                    '<div style="font-size:12px;color:var(--admin-text-muted);margin-bottom:16px;">' +
                        escapeHtml(file.name) + ' (' + (file.size / 1024).toFixed(1) + ' KB)' +
                    '</div>' +
                    '<div style="display:flex;gap:10px;">' +
                        '<button class="admin-btn secondary" id="cmsConfirmCancel" style="flex:1;padding:10px;font-size:14px;">Cancel</button>' +
                        '<button class="admin-btn" id="cmsConfirmSave" style="flex:1;padding:10px;font-size:14px;"><i class="fal fa-check" style="margin-right:6px;"></i>Save</button>' +
                    '</div>' +
                '</div>';

            overlay.style.display = 'flex';

            document.getElementById('cmsConfirmCancel').addEventListener('click', function() {
                overlay.style.display = 'none';
                pendingFile = null;
            });

            document.getElementById('cmsConfirmSave').addEventListener('click', function() {
                doUpload(sectionId);
            });

            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    overlay.style.display = 'none';
                    pendingFile = null;
                }
            });
        };
        reader.readAsDataURL(file);
    }

    function doUpload(sectionId) {
        if (!pendingFile) return;

        var overlay = document.getElementById('cmsConfirmOverlay');
        if (overlay) {
            overlay.innerHTML =
                '<div class="admin-card" style="width:90%;max-width:400px;padding:40px;text-align:center;border:none;">' +
                    '<i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--admin-accent);margin-bottom:12px;display:block;"></i>' +
                    '<p style="color:var(--admin-text-muted);margin:0;">Uploading image...</p>' +
                '</div>';
        }

        var fd = new FormData();
        fd.append('section', sectionId);
        fd.append('image', pendingFile);
        fd.append('alt_text', pendingFile.name.replace(/\.[^.]+$/, ''));
        fd.append('is_active', 'true');

        window.homepageCmsApi.createMedia(fd).then(function(res) {
            if (overlay) overlay.style.display = 'none';
            pendingFile = null;

            if (res.ok) {
                // Refresh section cards to show new image
                loadSections();
                if (window.showToast) {
                    window.showToast('success', 'Image uploaded successfully');
                }
            } else {
                if (window.showToast) {
                    window.showToast('error', 'Failed to upload image');
                }
            }
        }).catch(function() {
            if (overlay) overlay.style.display = 'none';
            pendingFile = null;
            if (window.showToast) {
                window.showToast('error', 'Upload failed');
            }
        });
    }

    /* ── Manage Modal ───────────────────────────────────────── */

    function openManageModal(sectionId) {
        currentSectionId = sectionId;
        var section = sections.find(function(s) { return s.id === sectionId; });
        if (!section) return;

        var overlay = document.getElementById('cmsManageOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'cmsManageOverlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
            document.body.appendChild(overlay);
        }

        // Fetch full section detail to get all media
        window.homepageCmsApi.getSectionDetail(sectionId).then(function(res) {
            var mediaItems = [];
            if (res.ok && res.data) {
                var d = res.data.data || res.data;
                mediaItems = d.media || [];
            }

            overlay.innerHTML =
                '<div class="admin-card" style="width:90%;max-width:800px;max-height:85vh;overflow-y:auto;padding:24px;position:relative;border:none;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid var(--admin-border);padding-bottom:16px;">' +
                        '<div>' +
                            '<h3 style="margin:0;font-size:20px;font-weight:700;">' + escapeHtml(section.section_name) + '</h3>' +
                            '<p style="margin:4px 0 0;font-size:13px;color:var(--admin-text-muted);">' + mediaItems.length + ' image(s) in this section</p>' +
                        '</div>' +
                        '<button class="cms-modal-close" style="background:none;border:none;font-size:24px;color:var(--admin-text-muted);cursor:pointer;padding:4px;line-height:1;"><i class="fal fa-times"></i></button>' +
                    '</div>' +
                    '<div id="cmsManageContent">' + renderMediaListHtml(mediaItems) + '</div>' +
                    '<div style="text-align:center;border-top:1px solid var(--admin-border);padding-top:16px;margin-top:8px;">' +
                        '<input type="file" id="cmsFileInput" accept=".png,.jpeg,.jpg,.svg,.webp,.gif" style="display:none;">' +
                        '<button class="admin-btn" id="cmsUploadBtn"><i class="fal fa-upload" style="margin-right:6px;"></i>Upload New Image</button>' +
                    '</div>' +
                '</div>';

            overlay.style.display = 'flex';

            overlay.querySelector('.cms-modal-close').addEventListener('click', function() {
                overlay.style.display = 'none';
            });
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) overlay.style.display = 'none';
            });

            bindManageEvents(overlay, sectionId, mediaItems);
        });
    }

    function renderMediaListHtml(items) {
        if (!items || !items.length) {
            return '<div style="text-align:center;padding:30px;color:var(--admin-text-muted);">' +
                        '<i class="fal fa-image" style="font-size:40px;display:block;margin-bottom:10px;opacity:0.4;"></i>' +
                        'No images in this section yet.' +
                    '</div>';
        }

        var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;">';
        items.forEach(function(item) {
            var imgUrl = item.image_url || '';
            var activeStyle = item.is_active ? '' : ' style="opacity:0.5;"';
            html +=
                '<div class="admin-card" style="padding:12px;"' + activeStyle + '>' +
                    (imgUrl
                        ? '<img src="' + escapeHtml(imgUrl) + '" alt="' + escapeHtml(item.alt_text) + '" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;display:block;">'
                        : '<div style="width:100%;height:120px;background:#f1f5f9;border-radius:8px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:#cbd5e1;"><i class="fal fa-image" style="font-size:28px;"></i></div>') +
                    '<div style="font-size:12px;color:var(--admin-text-muted);margin-bottom:6px;display:flex;align-items:center;gap:6px;">' +
                        '<span class="status-badge ' + (item.is_active ? 'status-active' : 'status-inactive') + '" style="font-size:10px;padding:2px 8px;">' + (item.is_active ? 'Active' : 'Inactive') + '</span>' +
                        '<span>#' + (item.sort_order || 0) + '</span>' +
                    '</div>' +
                    '<input class="admin-input" type="text" value="' + escapeHtml(item.alt_text) + '" placeholder="Alt text" data-media-id="' + item.id + '" style="width:100%;padding:6px 8px;font-size:12px;margin-bottom:6px;box-sizing:border-box;">' +
                    '<div style="display:flex;gap:4px;">' +
                        '<button class="admin-btn secondary toggle-media-btn" data-media-id="' + item.id + '" data-active="' + item.is_active + '" style="flex:1;padding:5px 8px;font-size:11px;">' + (item.is_active ? 'Deactivate' : 'Activate') + '</button>' +
                        '<button class="admin-btn secondary delete-media-btn" data-media-id="' + item.id + '" style="padding:5px 8px;font-size:11px;color:var(--status-danger);border-color:var(--status-danger);"><i class="fal fa-trash-alt"></i></button>' +
                    '</div>' +
                '</div>';
        });
        html += '</div>';
        return html;
    }

    function bindManageEvents(overlay, sectionId, items) {
        // Alt text change
        overlay.querySelectorAll('.admin-input[data-media-id]').forEach(function(inp) {
            inp.addEventListener('change', function() {
                var id = parseInt(this.dataset.mediaId);
                var fd = new FormData();
                fd.append('alt_text', this.value);
                window.homepageCmsApi.updateMedia(id, fd).then(function() {
                    loadSections();
                });
            });
        });

        // Toggle active/inactive
        overlay.querySelectorAll('.toggle-media-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(this.dataset.mediaId);
                var active = this.dataset.active === 'true' ? false : true;
                var fd = new FormData();
                fd.append('is_active', active ? 'true' : 'false');
                window.homepageCmsApi.updateMedia(id, fd).then(function() {
                    openManageModal(sectionId);
                    loadSections();
                });
            });
        });

        // Delete
        overlay.querySelectorAll('.delete-media-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(this.dataset.mediaId);
                if (!confirm('Delete this image?')) return;
                window.homepageCmsApi.deleteMedia(id).then(function() {
                    openManageModal(sectionId);
                    loadSections();
                });
            });
        });

        // Upload
        var uploadBtn = overlay.querySelector('#cmsUploadBtn');
        var fileInput = overlay.querySelector('#cmsFileInput');
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', function() {
                pendingFile = null;
                fileInput.click();
            });

            fileInput.addEventListener('change', function() {
                if (this.files && this.files[0] && sectionId) {
                    pendingFile = this.files[0];
                    var section = sections.find(function(s) { return s.id === sectionId; });
                    var name = section ? section.section_name : 'this section';

                    // Close manage modal
                    overlay.style.display = 'none';

                    showConfirmModal(sectionId, name, pendingFile);
                }
            });
        }
    }

    /* ── Expose ─────────────────────────────────────────────── */

    window.adminHomepageCmsLifecycle = {
        init: init
    };
})();
