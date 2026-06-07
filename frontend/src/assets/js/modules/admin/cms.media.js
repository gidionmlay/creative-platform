/**
 * G Design — Media Library Manager
 * ───────────────────────────────
 */
console.log("🔥 JS FILE LOADED:", "cms.media.js");

(function() {
    let currentPage = 1;
    let totalPages = 1;
    let activeFilters = { page: 1, search: '', file_type: '', folder: '' };

    // Inject modals to body dynamically if they do not exist
    function ensureModals() {
        if (!document.getElementById('uploadMediaModal')) {
            const uploadModalHtml = `
            <div class="modal fade" id="uploadMediaModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Upload Asset</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group mb-3">
                                <label for="uploadFolderSelect" class="form-label">Destination Folder</label>
                                <select id="uploadFolderSelect" class="filter-select w-100">
                                    <option value="general">General</option>
                                    <option value="services">Services</option>
                                    <option value="courses">Courses</option>
                                    <option value="portfolio">Portfolio</option>
                                </select>
                            </div>
                            <div id="mediaUploadDropzone" class="upload-dropzone">
                                <i class="fal fa-cloud-upload"></i>
                                <p>Drag and drop your file here, or <strong>browse</strong></p>
                                <div class="text-muted">Images up to 10MB, Videos up to 100MB, PDFs up to 25MB</div>
                                <input type="file" id="mediaUploadInput" class="d-none" />
                            </div>
                            <div id="uploadProgressContainer" class="d-none mt-3">
                                <div class="progress" style="height: 6px;">
                                    <div id="uploadProgressBar" class="progress-bar bg-warning" role="progressbar" style="width: 0%"></div>
                                </div>
                                <div id="uploadProgressText" class="text-muted text-center mt-2" style="font-size: 12px;">Uploading...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', uploadModalHtml);
        }

        if (!document.getElementById('mediaDetailModal')) {
            const detailModalHtml = `
            <div class="modal fade" id="mediaDetailModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Asset Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="media-detail-layout">
                                <div class="media-detail-preview" id="mediaDetailPreview">
                                    <!-- Dynamic Preview -->
                                </div>
                                <div class="media-detail-sidebar">
                                    <div class="form-group">
                                        <label class="form-label">Title</label>
                                        <input type="text" id="mediaDetailTitle" class="admin-input w-100" readonly />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Alt Text</label>
                                        <input type="text" id="mediaDetailAltText" class="admin-input w-100" />
                                    </div>
                                    <div class="media-meta">
                                        <div class="media-meta-item"><strong>MIME Type:</strong> <span id="metaMime">—</span></div>
                                        <div class="media-meta-item"><strong>File Size:</strong> <span id="metaSize">—</span></div>
                                        <div class="media-meta-item"><strong>Dimensions:</strong> <span id="metaDimensions">—</span></div>
                                        <div class="media-meta-item"><strong>Uploaded By:</strong> <span id="metaUploadedBy">—</span></div>
                                        <div class="media-meta-item"><strong>Date:</strong> <span id="metaDate">—</span></div>
                                    </div>
                                    <div class="form-group mt-3">
                                        <label class="form-label">Copy URL</label>
                                        <div class="input-group">
                                            <input type="text" id="mediaDetailUrl" class="admin-input flex-grow-1" style="font-size:12px;" readonly />
                                            <button class="admin-btn secondary" id="copyMediaUrlBtn" style="padding: 10px 15px;"><i class="fal fa-copy"></i></button>
                                        </div>
                                    </div>
                                    <div class="d-flex gap-2 mt-4">
                                        <button class="admin-btn" id="saveMediaMetaBtn" style="flex:1;">Save Alt Text</button>
                                        <button class="admin-btn text-danger" id="deleteMediaAssetBtn" style="background:var(--status-danger-bg);border:none;"><i class="fal fa-trash-alt"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', detailModalHtml);
        }

        if (!document.getElementById('mediaPickerModal')) {
            const pickerModalHtml = `
            <div class="modal fade" id="mediaPickerModal" tabindex="-1" style="z-index: 1060;" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-centered">
                    <div class="modal-content" style="background:#f8f9fa;">
                        <div class="modal-header bg-white">
                            <h5 class="modal-title">Select Media Asset</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-0">
                            <!-- Nav tabs -->
                            <ul class="nav nav-tabs px-3 pt-3 bg-white border-bottom-0" role="tablist">
                                <li class="nav-item">
                                    <button class="nav-link active" id="picker-browse-tab" data-bs-toggle="tab" data-bs-target="#pickerBrowsePane" type="button" role="tab">Browse Library</button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link" id="picker-upload-tab" data-bs-toggle="tab" data-bs-target="#pickerUploadPane" type="button" role="tab">Upload New</button>
                                </li>
                            </ul>
                            
                            <div class="tab-content">
                                <div class="tab-pane fade show active p-4" id="pickerBrowsePane" role="tabpanel">
                                    <div class="table-toolbar bg-white p-3 rounded mb-4" style="border: 1px solid var(--admin-border);">
                                        <div class="search-box"><i class="fal fa-search"></i><input type="text" id="pickerSearchInput" placeholder="Search assets..."></div>
                                        <div class="filter-box">
                                            <select class="filter-select" id="pickerTypeFilter"><option value="">All Types</option><option value="image">Images</option><option value="video">Videos</option><option value="pdf">PDFs</option></select>
                                            <select class="filter-select" id="pickerFolderFilter"><option value="">All Folders</option><option value="general">General</option><option value="services">Services</option><option value="courses">Courses</option></select>
                                        </div>
                                    </div>
                                    <div id="pickerGrid" class="media-grid-layout mb-4" style="max-height: 400px; overflow-y: auto;"></div>
                                    <div id="pickerPagination" class="d-flex justify-content-between align-items-center mt-3 flex-wrap" style="gap:10px;"></div>
                                </div>
                                <div class="tab-pane fade p-4" id="pickerUploadPane" role="tabpanel">
                                    <div class="bg-white p-4 rounded" style="border: 1px solid var(--admin-border);">
                                        <div class="form-group mb-3">
                                            <label for="pickerUploadFolderSelect" class="form-label">Destination Folder</label>
                                            <select id="pickerUploadFolderSelect" class="filter-select w-100">
                                                <option value="general">General</option>
                                                <option value="services" selected>Services</option>
                                                <option value="courses">Courses</option>
                                            </select>
                                        </div>
                                        <div id="pickerMediaUploadDropzone" class="upload-dropzone">
                                            <i class="fal fa-cloud-upload"></i>
                                            <p>Drag and drop your file here, or <strong>browse</strong></p>
                                            <input type="file" id="pickerMediaUploadInput" class="d-none" />
                                        </div>
                                        <div id="pickerUploadProgressContainer" class="d-none mt-3">
                                            <div class="progress" style="height: 6px;">
                                                <div id="pickerUploadProgressBar" class="progress-bar bg-warning" role="progressbar" style="width: 0%"></div>
                                            </div>
                                            <div id="pickerUploadProgressText" class="text-muted text-center mt-2" style="font-size: 12px;">Uploading...</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer bg-white border-top">
                            <button type="button" class="admin-btn secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="admin-btn" id="pickerConfirmSelectBtn" disabled>Select Asset</button>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', pickerModalHtml);
        }
    }

    // Helper: parse human readable size
    function formatBytes(bytes) {
        if (!bytes) return '—';
        if (bytes < 1024) return bytes + ' Bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }

    // Load assets from server
    async function loadAssets(filters = {}, isPicker = false) {
        const grid = document.getElementById(isPicker ? 'pickerGrid' : 'mediaGrid');
        const emptyState = document.getElementById('mediaEmptyState');
        
        if (!grid) return;
        grid.innerHTML = '<div class="text-center py-5 w-100"><i class="fas fa-spinner fa-spin fa-2x" style="color:var(--admin-accent)"></i><p class="mt-2 text-muted">Loading assets...</p></div>';
        
        if (emptyState) emptyState.style.display = 'none';

        try {
            const res = await window.mediaApi.getMediaAssets(filters);
            if (res && res.ok && res.data) {
                const results = res.data.results || [];
                if (results.length === 0) {
                    grid.innerHTML = '';
                    if (!isPicker && emptyState) emptyState.style.display = 'block';
                    else if (isPicker) {
                        grid.innerHTML = '<div class="text-center py-5 w-100" style="color:var(--admin-text-muted)"><i class="fal fa-folder-open fa-2x mb-2 d-block"></i>No assets match your filter.</div>';
                    }
                    renderPagination(res.data.count, filters.page, isPicker);
                    return;
                }

                let html = '';
                results.forEach(asset => {
                    let previewHtml = '';
                    if (asset.file_type === 'image') {
                        previewHtml = `<img src="${asset.thumbnail || asset.file}" alt="${asset.alt_text}" />`;
                    } else if (asset.file_type === 'video') {
                        previewHtml = `<i class="fal fa-file-video"></i>`;
                    } else if (asset.file_type === 'pdf') {
                        previewHtml = `<i class="fal fa-file-pdf" style="color:#dc3545;"></i>`;
                    } else {
                        previewHtml = `<i class="fal fa-file"></i>`;
                    }

                    html += `
                    <div class="media-item-card" data-id="${asset.id}">
                        <div class="media-preview-container">
                            ${previewHtml}
                        </div>
                        <div class="media-item-info">
                            <div class="media-item-title">${asset.title || 'Untitled'}</div>
                            <div class="media-item-meta">
                                <span>${asset.file_type.toUpperCase()}</span>
                                <span>${asset.file_size_kb ? asset.file_size_kb + ' KB' : '—'}</span>
                            </div>
                        </div>
                    </div>`;
                });
                grid.innerHTML = html;
                renderPagination(res.data.count, filters.page, isPicker);
            } else {
                grid.innerHTML = '<div class="text-center py-5 w-100 text-danger">Failed to load media assets.</div>';
            }
        } catch (err) {
            console.error(err);
            grid.innerHTML = '<div class="text-center py-5 w-100 text-danger">Error fetching media assets.</div>';
        }
    }

    function renderPagination(totalCount, page, isPicker = false) {
        const pagContainer = document.getElementById(isPicker ? 'pickerPagination' : 'mediaPagination');
        if (!pagContainer) return;

        const pageSize = 24;
        totalPages = Math.ceil(totalCount / pageSize) || 1;
        currentPage = page || 1;

        if (totalPages <= 1) {
            pagContainer.innerHTML = `<span class="text-muted" style="font-size:13px;">Showing ${totalCount} assets</span>`;
            return;
        }

        let html = `<span class="text-muted" style="font-size:13px;">Showing page ${currentPage} of ${totalPages} (${totalCount} assets)</span>`;
        html += '<div style="display:flex;gap:5px;">';
        html += `<button class="admin-btn secondary pag-btn" style="padding: 6px 12px; font-size:13px;" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}><i class="fal fa-chevron-left"></i></button>`;
        html += `<button class="admin-btn secondary pag-btn" style="padding: 6px 12px; font-size:13px;" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}><i class="fal fa-chevron-right"></i></button>`;
        html += '</div>';

        pagContainer.innerHTML = html;
    }

    // Drag-and-Drop Setup
    function setupDragAndDrop(dropzoneEl, inputEl, progressContainerEl, progressBarEl, progressTextEl, folderSelectEl, callback) {
        if (!dropzoneEl || !inputEl) return;

        // Click to browse
        dropzoneEl.addEventListener('click', () => inputEl.click());

        // File Selection
        inputEl.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleUpload(e.target.files[0], progressContainerEl, progressBarEl, progressTextEl, folderSelectEl, callback);
            }
        });

        // Drag events
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzoneEl.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropzoneEl.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzoneEl.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropzoneEl.classList.remove('dragover');
            }, false);
        });

        dropzoneEl.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            if (dt && dt.files.length > 0) {
                handleUpload(dt.files[0], progressContainerEl, progressBarEl, progressTextEl, folderSelectEl, callback);
            }
        });
    }

    async function handleUpload(file, progressContainer, progressBar, progressText, folderSelect, callback) {
        // Show progress UI
        if (progressContainer) {
            progressContainer.classList.remove('d-none');
            progressBar.style.width = '20%';
            progressText.innerText = 'Compressing & uploading asset...';
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folderSelect ? folderSelect.value : 'general');
        formData.append('alt_text', file.name.replace(/\.[^/.]+$/, ""));

        try {
            const res = await window.mediaApi.uploadMedia(formData);
            if (res && res.ok) {
                if (progressBar) progressBar.style.width = '100%';
                if (progressText) progressText.innerText = 'Upload successful!';
                
                if (window.showToast) window.showToast('success', 'Asset uploaded successfully');
                
                setTimeout(() => {
                    if (progressContainer) progressContainer.classList.add('d-none');
                    if (callback) callback(res.data);
                }, 1000);
            } else {
                if (progressContainer) progressContainer.classList.add('d-none');
                const errMsg = res.data && res.data.file ? res.data.file[0] : 'Upload failed. Check file type and size limitations.';
                if (window.showToast) window.showToast('error', errMsg);
            }
        } catch (err) {
            console.error(err);
            if (progressContainer) progressContainer.classList.add('d-none');
            if (window.showToast) window.showToast('error', 'Error uploading file.');
        }
    }

    // Modal detail view
    let activeAsset = null;
    async function showAssetDetails(id) {
        try {
            const res = await window.mediaApi.getMediaDetails(id);
            if (res && res.ok && res.data) {
                activeAsset = res.data;
                
                // Set metadata sidebar fields
                document.getElementById('mediaDetailTitle').value = activeAsset.title || '';
                document.getElementById('mediaDetailAltText').value = activeAsset.alt_text || '';
                document.getElementById('metaMime').innerText = activeAsset.mime_type || '—';
                document.getElementById('metaSize').innerText = formatBytes(activeAsset.file_size);
                document.getElementById('metaDimensions').innerText = activeAsset.dimensions || '—';
                document.getElementById('metaUploadedBy').innerText = activeAsset.uploaded_by_username || '—';
                document.getElementById('metaDate').innerText = new Date(activeAsset.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit'});
                document.getElementById('mediaDetailUrl').value = activeAsset.file;

                // Render dynamic preview
                const previewDiv = document.getElementById('mediaDetailPreview');
                if (activeAsset.file_type === 'image') {
                    previewDiv.innerHTML = `<img src="${activeAsset.medium || activeAsset.file}" alt="${activeAsset.alt_text}" />`;
                } else if (activeAsset.file_type === 'video') {
                    previewDiv.innerHTML = `<video src="${activeAsset.file}" controls></video>`;
                } else if (activeAsset.file_type === 'pdf') {
                    previewDiv.innerHTML = `<iframe src="${activeAsset.file}" style="width:100%;height:350px;border:none;"></iframe>`;
                } else {
                    previewDiv.innerHTML = `<i class="fal fa-file fa-3x"></i>`;
                }

                // Show modal
                const modal = new bootstrap.Modal(document.getElementById('mediaDetailModal'));
                modal.show();
            }
        } catch (err) {
            console.error(err);
            if (window.showToast) window.showToast('error', 'Failed to retrieve asset details.');
        }
    }

    // Reusable Media Picker Engine
    window.mediaPicker = {
        open: function(onSelectCallback, options = {}) {
            ensureModals();
            
            const modalEl = document.getElementById('mediaPickerModal');
            const pickerModal = new bootstrap.Modal(modalEl);
            
            const pickerFilters = { page: 1, search: '', file_type: options.file_type || '', folder: '' };
            let selectedAsset = null;

            // Apply options filter presets
            const typeFilterSelect = document.getElementById('pickerTypeFilter');
            if (options.file_type) {
                typeFilterSelect.value = options.file_type;
                typeFilterSelect.disabled = true;
            } else {
                typeFilterSelect.value = '';
                typeFilterSelect.disabled = false;
            }

            // Clean UI state
            document.getElementById('pickerSearchInput').value = '';
            document.getElementById('pickerFolderFilter').value = '';
            document.getElementById('pickerConfirmSelectBtn').disabled = true;
            
            // Activate Browse tab by default
            const browseTabTrigger = document.getElementById('picker-browse-tab');
            const browsePane = document.getElementById('pickerBrowsePane');
            const uploadPane = document.getElementById('pickerUploadPane');
            
            browseTabTrigger.classList.add('active');
            document.getElementById('picker-upload-tab').classList.remove('active');
            browsePane.classList.add('show', 'active');
            uploadPane.classList.remove('show', 'active');

            // Load items
            loadAssets(pickerFilters, true);

            // Set up actions
            const confirmBtn = document.getElementById('pickerConfirmSelectBtn');
            
            // Click card selector
            const gridEl = document.getElementById('pickerGrid');
            $(gridEl).off('click', '.media-item-card').on('click', '.media-item-card', function() {
                const card = $(this);
                gridEl.querySelectorAll('.media-item-card').forEach(el => el.classList.remove('selected'));
                card.addClass('selected');
                
                const assetId = card.data('id');
                // Fetch basic representation to send back
                selectedAsset = assetId;
                confirmBtn.disabled = false;
            });

            // Confirm selection
            $(confirmBtn).off('click').on('click', async function() {
                if (selectedAsset) {
                    try {
                        const res = await window.mediaApi.getMediaDetails(selectedAsset);
                        if (res && res.ok && res.data) {
                            onSelectCallback(res.data);
                            pickerModal.hide();
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            });

            // Filtering
            $('#pickerSearchInput').off('input').on('input', function() {
                pickerFilters.search = this.value;
                pickerFilters.page = 1;
                loadAssets(pickerFilters, true);
            });

            $('#pickerTypeFilter').off('change').on('change', function() {
                pickerFilters.file_type = this.value;
                pickerFilters.page = 1;
                loadAssets(pickerFilters, true);
            });

            $('#pickerFolderFilter').off('change').on('change', function() {
                pickerFilters.folder = this.value;
                pickerFilters.page = 1;
                loadAssets(pickerFilters, true);
            });

            // Pagination links
            $('#pickerPagination').off('click', '.pag-btn').on('click', '.pag-btn', function() {
                const pageNum = parseInt($(this).data('page'));
                if (pageNum && pageNum > 0) {
                    pickerFilters.page = pageNum;
                    loadAssets(pickerFilters, true);
                }
            });

            // Setup picker drag-and-drop upload
            const pickerDropzone = document.getElementById('pickerMediaUploadDropzone');
            const pickerInput = document.getElementById('pickerMediaUploadInput');
            const pickerProgContainer = document.getElementById('pickerUploadProgressContainer');
            const pickerProgressBar = document.getElementById('pickerUploadProgressBar');
            const pickerProgressText = document.getElementById('pickerUploadProgressText');
            const pickerFolderSelect = document.getElementById('pickerUploadFolderSelect');

            setupDragAndDrop(
                pickerDropzone, 
                pickerInput, 
                pickerProgContainer, 
                pickerProgressBar, 
                pickerProgressText, 
                pickerFolderSelect, 
                (newAsset) => {
                    // Automatically pass back the uploaded asset
                    onSelectCallback(newAsset);
                    pickerModal.hide();
                }
            );

            pickerModal.show();
        }
    };

    // Lifecycle manager for Media tab view
    window.adminMediaLifecycle = {
        init: function() {
            ensureModals();
            
            // Set default filters
            activeFilters = { page: 1, search: '', file_type: '', folder: '' };
            loadAssets(activeFilters, false);

            // Bind Event Listeners
            // Search filter
            $('#mediaSearchInput').off('input').on('input', function() {
                activeFilters.search = this.value;
                activeFilters.page = 1;
                loadAssets(activeFilters, false);
            });

            // Type Filter
            $('#mediaTypeFilter').off('change').on('change', function() {
                activeFilters.file_type = this.value;
                activeFilters.page = 1;
                loadAssets(activeFilters, false);
            });

            // Folder Filter
            $('#mediaFolderFilter').off('change').on('change', function() {
                activeFilters.folder = this.value;
                activeFilters.page = 1;
                loadAssets(activeFilters, false);
            });

            // Card click to show details
            $('#mediaGrid').off('click', '.media-item-card').on('click', '.media-item-card', function() {
                const assetId = $(this).data('id');
                if (assetId) showAssetDetails(assetId);
            });

            // Pagination buttons
            $('#mediaPagination').off('click', '.pag-btn').on('click', '.pag-btn', function() {
                const pageNum = parseInt($(this).data('page'));
                if (pageNum && pageNum > 0) {
                    activeFilters.page = pageNum;
                    loadAssets(activeFilters, false);
                }
            });

            // Upload button
            $('#uploadMediaBtn').off('click').on('click', function() {
                const uploadModal = new bootstrap.Modal(document.getElementById('uploadMediaModal'));
                
                // Clear any drag/drop states
                document.getElementById('uploadProgressContainer').classList.add('d-none');
                document.getElementById('mediaUploadInput').value = '';
                
                uploadModal.show();
            });

            // Setup main drag-and-drop
            const dropzone = document.getElementById('mediaUploadDropzone');
            const input = document.getElementById('mediaUploadInput');
            const progContainer = document.getElementById('uploadProgressContainer');
            const progressBar = document.getElementById('uploadProgressBar');
            const progressText = document.getElementById('uploadProgressText');
            const folderSelect = document.getElementById('uploadFolderSelect');

            setupDragAndDrop(
                dropzone, 
                input, 
                progContainer, 
                progressBar, 
                progressText, 
                folderSelect, 
                () => {
                    // On upload success, hide modal and reload main view
                    bootstrap.Modal.getInstance(document.getElementById('uploadMediaModal')).hide();
                    loadAssets(activeFilters, false);
                }
            );

            // Details metadata handlers
            $('#copyMediaUrlBtn').off('click').on('click', function() {
                const urlInput = document.getElementById('mediaDetailUrl');
                urlInput.select();
                document.execCommand('copy');
                if (window.showToast) window.showToast('success', 'URL copied to clipboard');
            });

            // Delete asset action
            $('#deleteMediaAssetBtn').off('click').on('click', async function() {
                if (!activeAsset) return;
                
                const confirmed = confirm(`Are you sure you want to permanently delete "${activeAsset.title || 'this asset'}"?`);
                if (!confirmed) return;

                const btn = $(this);
                const orig = btn.html();
                btn.html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);

                try {
                    const res = await window.mediaApi.deleteMedia(activeAsset.id);
                    if (res && res.ok) {
                        if (window.showToast) window.showToast('success', 'Asset deleted successfully');
                        bootstrap.Modal.getInstance(document.getElementById('mediaDetailModal')).hide();
                        loadAssets(activeFilters, false);
                    } else {
                        btn.html(orig).prop('disabled', false);
                        const errMsg = res.data && res.data.detail ? res.data.detail : 'Delete failed. It may be referenced by services.';
                        if (window.showToast) window.showToast('error', errMsg);
                    }
                } catch (err) {
                    console.error(err);
                    btn.html(orig).prop('disabled', false);
                    if (window.showToast) window.showToast('error', 'Error deleting asset.');
                }
            });
        }
    };
})();
