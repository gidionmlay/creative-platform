/**
 * G Design Admin Services CMS Module
 * ──────────────────────────────────
 */
console.log("🔥 JS FILE LOADED:", "admin/cms.services.js");

(function() {
    let services = [];
    let categories = [];
    let currentServiceId = null; // null for Create, id for Edit
    let tempFeatures = []; // For holding new features added during create/edit
    let tempGallery = [];  // For holding new gallery files before uploading

    // Helpers
    function toast(type, msg) {
        if (window.showToast) window.showToast(type, msg);
        else alert(msg);
    }

    async function init() {
        appendModals();
        bindEvents();
        await loadCategories();
        await loadServices();
    }

    // Append modals if they don't exist
    function appendModals() {
        if (!document.getElementById('serviceFormModal')) {
            const m = document.createElement('div');
            m.id = 'serviceFormModal';
            m.className = 'custom-modal-overlay';
            m.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1060; align-items: center; justify-content: center;';
            m.innerHTML = `
                <div class="custom-modal-content admin-card" style="width: 100%; max-width: 700px; margin: 20px; position: relative; animation: fadeIn 0.3s ease; max-height: 90vh; overflow-y: auto; padding: 25px;">
                    <button type="button" class="close-modal-btn" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 20px; color: var(--admin-text-muted); cursor: pointer;"><i class="fal fa-times"></i></button>
                    <h3 class="card-title mb-4" id="serviceModalTitle">Add Service</h3>
                    <form class="admin-form" id="serviceForm" enctype="multipart/form-data">
                        <div class="row">
                            <div class="col-md-6 form-group">
                                <label>Title <span class="text-danger">*</span></label>
                                <input type="text" name="title" placeholder="e.g. Logo Design" required>
                            </div>
                            <div class="col-md-6 form-group">
                                <label style="display:flex; justify-content:space-between; align-items:center;">
                                    <span>Category <span class="text-danger">*</span></span>
                                    <button type="button" class="admin-btn secondary" style="padding: 2px 8px; font-size: 11px;" id="inlineCreateCategoryBtn"><i class="fal fa-plus"></i> New</button>
                                </label>
                                <select name="category_id" required>
                                    <option value="">-- Select Category --</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Short Description <span class="text-danger">*</span></label>
                            <input type="text" name="short_description" placeholder="A brief one-sentence pitch..." required>
                        </div>
                        <div class="form-group">
                            <label>Full Description <span class="text-danger">*</span></label>
                            <textarea name="full_description" rows="4" placeholder="Detailed service description, process, deliverables..." required style="width: 100%; padding: 12px; border: 1px solid var(--admin-border); border-radius: 8px; font-family: inherit; font-size: 15px; outline: none;"></textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-4 form-group">
                                <label>Base Price ($) <span class="text-danger">*</span></label>
                                <input type="number" step="0.01" name="base_price" placeholder="250.00" required>
                            </div>
                            <div class="col-md-4 form-group">
                                <label>Discounted Price ($)</label>
                                <input type="number" step="0.01" name="discounted_price" placeholder="199.99">
                            </div>
                            <div class="col-md-4 form-group">
                                <label>Delivery Time <span class="text-danger">*</span></label>
                                <input type="text" name="delivery_time" placeholder="e.g. 3-5 Business Days" required>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6 d-flex align-items-center" style="gap: 10px;">
                                <input type="checkbox" name="featured" id="chkFeatured" style="width:18px; height:18px;">
                                <label for="chkFeatured" style="margin: 0; cursor: pointer;">Featured Service</label>
                            </div>
                            <div class="col-md-6 d-flex align-items-center" style="gap: 10px;">
                                <input type="checkbox" name="active" id="chkActive" checked style="width:18px; height:18px;">
                                <label for="chkActive" style="margin: 0; cursor: pointer;">Active (Visible to Clients)</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Thumbnail Image <span class="text-danger">*</span></label>
                            <div class="d-flex gap-2 align-items-center mb-2">
                                <input type="file" name="thumbnail" id="serviceThumbnailFileInput" accept="image/*" class="admin-input flex-grow-1" style="padding: 6px;">
                                <span class="text-muted" style="font-size:13px;">or</span>
                                <button type="button" class="admin-btn secondary" id="selectThumbnailAssetBtn" style="padding:10px 14px; white-space:nowrap;"><i class="fal fa-images"></i> Choose Media</button>
                            </div>
                            <input type="hidden" name="thumbnail_asset_id" id="serviceThumbnailAssetId" />
                            <div id="thumbnailPreview" style="margin-top: 10px; display: none; position: relative; max-width: 150px;">
                                <img src="" style="max-height: 100px; border-radius: 6px; border: 1px solid var(--admin-border); width: 100%; object-fit: cover;">
                                <button type="button" id="clearThumbnailBtn" style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; border-radius: 50%; background: var(--status-danger); border: none; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; cursor: pointer;"><i class="fal fa-times"></i></button>
                            </div>
                        </div>
                        
                        <!-- Dynamic Features Management -->
                        <div style="border-top: 1px solid var(--admin-border); margin-top: 25px; padding-top: 20px;">
                            <h5 style="font-weight:600; font-size:15px; margin-bottom:15px;">Service Features / Deliverables</h5>
                            <div style="display:flex; gap:10px; margin-bottom:15px;">
                                <input type="text" id="newFeatureInput" placeholder="e.g. 3 Custom Concepts" class="admin-input" style="flex:1;">
                                <button type="button" class="admin-btn secondary" id="addFeatureBtn" style="padding:10px 16px;">Add</button>
                            </div>
                            <ul id="featuresList" style="list-style:none; padding:0; display:flex; flex-direction:column; gap:8px;">
                                <!-- Dynamic features -->
                            </ul>
                        </div>

                        <!-- Gallery Management -->
                        <div style="border-top: 1px solid var(--admin-border); margin-top: 25px; padding-top: 20px; margin-bottom: 25px;">
                            <h5 style="font-weight:600; font-size:15px; margin-bottom:15px;">Showcase Gallery Images</h5>
                            <div class="d-flex gap-2 align-items-center mb-3">
                                <input type="file" id="galleryUploadInput" accept="image/*" multiple class="admin-input flex-grow-1" style="padding:6px;">
                                <span class="text-muted" style="font-size:13px;">or</span>
                                <button type="button" class="admin-btn secondary" id="selectGalleryAssetBtn" style="padding:10px 14px; white-space:nowrap;"><i class="fal fa-images"></i> Add from Media</button>
                            </div>
                            <div id="galleryGrid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap:10px;">
                                <!-- Gallery items -->
                            </div>
                        </div>

                        <div class="d-flex justify-content-end mt-4" style="gap: 10px;">
                            <button type="button" class="admin-btn secondary close-modal-btn" style="padding: 10px 20px;">Cancel</button>
                            <button type="submit" class="admin-btn" style="padding: 10px 20px;"><span class="btn-text">Save Service</span><span class="btn-spinner" style="display:none;"><i class="fas fa-spinner fa-spin"></i></span></button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(m);
        }

        if (!document.getElementById('categoriesModal')) {
            const c = document.createElement('div');
            c.id = 'categoriesModal';
            c.className = 'custom-modal-overlay';
            c.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1060; align-items: center; justify-content: center;';
            c.innerHTML = `
                <div class="custom-modal-content admin-card" style="width: 100%; max-width: 500px; margin: 20px; position: relative; animation: fadeIn 0.3s ease; max-height: 80vh; overflow-y: auto; padding: 25px;">
                    <button type="button" class="close-categories-btn" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 20px; color: var(--admin-text-muted); cursor: pointer;"><i class="fal fa-times"></i></button>
                    <h3 class="card-title mb-4">Manage Categories</h3>
                    
                    <form class="admin-form mb-4" id="categoryForm">
                        <div class="form-group">
                            <label>Category Name <span class="text-danger">*</span></label>
                            <input type="text" name="name" placeholder="e.g. Web Development" required>
                        </div>
                        <div class="form-group">
                            <label>Icon (FontAwesome class)</label>
                            <input type="text" name="icon" placeholder="e.g. fa-code">
                        </div>
                        <button type="submit" class="admin-btn" style="width: 100%;">Create Category</button>
                    </form>

                    <div style="border-top: 1px solid var(--admin-border); padding-top: 15px;">
                        <h5 style="font-weight:600; font-size:14px; margin-bottom:12px;">Existing Categories</h5>
                        <ul id="categoriesList" style="list-style:none; padding:0; display:flex; flex-direction:column; gap:8px; max-height: 250px; overflow-y: auto;">
                            <!-- Categories list -->
                        </ul>
                    </div>
                </div>
            `;
            document.body.appendChild(c);
        }
    }

    function bindEvents() {
        // Main view buttons
        $('#addServiceBtn').off('click').on('click', () => openServiceModal(null));
        $('#manageCategoriesBtn').off('click').on('click', openCategoriesModal);
        
        // Inline category create
        $('#inlineCreateCategoryBtn').off('click').on('click', async () => {
            const name = prompt("Enter new category name:");
            if (name && name.trim()) {
                try {
                    const res = await window.servicesApi.createCategory({ name: name.trim() });
                    if (res && res.ok) {
                        toast('success', 'Category created.');
                        await loadCategories();
                        const formSelect = document.querySelector('select[name="category_id"]');
                        if (formSelect) formSelect.value = res.data.id || res.data.results?.id;
                    } else {
                        toast('error', 'Failed to create category.');
                    }
                } catch(e) {
                    toast('error', e.message);
                }
            }
        });

        // Filters
        $('#serviceSearchInput').off('input').on('input', filterServices);
        $('#serviceCategoryFilter').off('change').on('change', filterServices);
        $('#serviceFeaturedFilter').off('change').on('change', filterServices);

        // Modals close buttons
        $('.close-modal-btn').off('click').on('click', () => {
            document.getElementById('serviceFormModal').style.display = 'none';
        });
        $('.close-categories-btn').off('click').on('click', () => {
            document.getElementById('categoriesModal').style.display = 'none';
        });

        // Feature add
        $('#addFeatureBtn').off('click').on('click', () => {
            const inp = document.getElementById('newFeatureInput');
            const val = inp.value.trim();
            if (val) {
                addFeatureToTemp(val);
                inp.value = '';
            }
        });

        // Submit forms
        $('#serviceForm').off('submit').on('submit', handleServiceSubmit);
        $('#categoryForm').off('submit').on('submit', handleCategorySubmit);

        // Gallery input change
        $('#galleryUploadInput').off('change').on('change', e => {
            const files = e.target.files;
            if (files.length > 0) {
                uploadGalleryFiles(files);
            }
        });

        // Thumbnail media picker
        $('#selectThumbnailAssetBtn').off('click').on('click', () => {
            window.mediaPicker.open(asset => {
                document.getElementById('serviceThumbnailFileInput').value = '';
                document.getElementById('serviceThumbnailAssetId').value = asset.id;
                const preview = document.getElementById('thumbnailPreview');
                preview.style.display = 'block';
                preview.querySelector('img').src = asset.medium || asset.file;
            }, { file_type: 'image' });
        });

        $('#serviceThumbnailFileInput').off('change').on('change', () => {
            document.getElementById('serviceThumbnailAssetId').value = '';
            const file = document.getElementById('serviceThumbnailFileInput').files[0];
            const preview = document.getElementById('thumbnailPreview');
            if (file) {
                const url = URL.createObjectURL(file);
                preview.style.display = 'block';
                preview.querySelector('img').src = url;
            } else {
                preview.style.display = 'none';
            }
        });

        $('#clearThumbnailBtn').off('click').on('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById('serviceThumbnailAssetId').value = '';
            document.getElementById('serviceThumbnailFileInput').value = '';
            document.getElementById('thumbnailPreview').style.display = 'none';
        });

        // Gallery media picker
        $('#selectGalleryAssetBtn').off('click').on('click', () => {
            window.mediaPicker.open(async asset => {
                if (currentServiceId) {
                    try {
                        const res = await window.servicesApi.linkGalleryAsset(currentServiceId, asset.id);
                        if (res && res.ok) {
                            addGalleryToUI(res.data.id, asset.medium || asset.file);
                            toast('success', 'Gallery image linked from Media Library.');
                        }
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    tempGallery.push({ type: 'asset', data: asset });
                    const grid = document.getElementById('galleryGrid');
                    const div = document.createElement('div');
                    div.style.cssText = 'position:relative; height:80px; border-radius:6px; overflow:hidden; border:1px solid var(--admin-border);';
                    div.innerHTML = `
                        <img src="${asset.medium || asset.file}" style="width:100%; height:100%; object-fit:cover;">
                        <button type="button" style="position:absolute; top:4px; right:4px; background:rgba(220,53,69,0.8); border:none; color:white; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;" class="del-temp-gal-btn"><i class="fal fa-times" style="font-size:10px;"></i></button>
                    `;
                    grid.appendChild(div);
                    div.querySelector('.del-temp-gal-btn').addEventListener('click', () => {
                        tempGallery = tempGallery.filter(item => item.data !== asset);
                        div.remove();
                    });
                }
            }, { file_type: 'image' });
        });
    }

    async function loadCategories() {
        try {
            const res = await window.servicesApi.getAdminCategories();
            if (res && res.ok) {
                categories = res.data.results || res.data;
                populateCategoryDropdowns();
                renderCategoriesList();
            }
        } catch (e) {
            console.error("Error loading categories", e);
        }
    }

    function populateCategoryDropdowns() {
        // Filter dropdown
        const filterSelect = document.getElementById('serviceCategoryFilter');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">All Categories</option>';
            categories.forEach(c => {
                filterSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
            });
        }

        // Form dropdown
        const formSelect = document.querySelector('select[name="category_id"]');
        if (formSelect) {
            formSelect.innerHTML = '<option value="">-- Select Category --</option>';
            categories.forEach(c => {
                formSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
            });
        }
    }

    async function loadServices() {
        const tbody = document.getElementById('servicesTableBody');
        const emptyState = document.getElementById('servicesEmptyState');
        const table = document.getElementById('servicesTable');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> Fetching services...</td></tr>';
        if (emptyState) emptyState.style.display = 'none';
        if (table) table.style.display = 'table';

        try {
            const res = await window.servicesApi.getServices();
            if (res && res.ok) {
                services = res.data.results || res.data;
                renderServicesTable(services);
            } else {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Failed to load services data.</td></tr>';
            }
        } catch (e) {
            console.error("Error loading services", e);
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">An error occurred.</td></tr>';
        }
    }

    function renderServicesTable(items) {
        const tbody = document.getElementById('servicesTableBody');
        const emptyState = document.getElementById('servicesEmptyState');
        const table = document.getElementById('servicesTable');
        if (!tbody) return;

        if (items.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            if (table) table.style.display = 'none';
            
            // Empty state add button bind
            $('#emptyStateAddServiceBtn').off('click').on('click', () => openServiceModal(null));
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        if (table) table.style.display = 'table';

        let html = '';
        items.forEach(s => {
            const imgUrl = s.thumbnail_asset_details ? (s.thumbnail_asset_details.medium || s.thumbnail_asset_details.file) : (s.thumbnail || '../../../../src/assets/images/company-img/favicon.svg');
            const categoryName = s.category ? s.category.name : 'Uncategorized';
            const priceText = s.discounted_price ? 
                `<span style="text-decoration:line-through; font-size:12px; color:var(--admin-text-muted); margin-right:5px;">$${s.base_price}</span>$${s.discounted_price}` : 
                `$${s.base_price}`;
            const statusBadge = s.active ? 
                '<span class="status-badge status-active">Active</span>' : 
                '<span class="status-badge status-suspended">Inactive</span>';
            const featuredBadge = s.featured ? 
                '<span class="status-badge status-active" style="background-color:var(--admin-accent);">Featured</span>' : 
                '<span class="status-badge" style="background:#e5e7eb; color:#4b5563;">Standard</span>';

            html += `
                <tr data-service-id="${s.id}">
                    <td><img src="${imgUrl}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 4px; border: 1px solid var(--admin-border);"></td>
                    <td><strong>${s.title}</strong><br><span style="font-size:11px; color:var(--admin-text-muted);">${s.short_description.substring(0, 40)}...</span></td>
                    <td>${categoryName}</td>
                    <td>${priceText}</td>
                    <td>${featuredBadge}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            <button class="admin-btn edit-btn" style="padding: 4px 8px; font-size: 11px; background:var(--admin-card-bg); border:1px solid var(--admin-border); color:var(--admin-text);" data-id="${s.id}"><i class="fal fa-edit"></i> Edit</button>
                            <button class="admin-btn delete-btn" style="padding: 4px 8px; font-size: 11px; background:rgba(220,53,69,0.1); border:1px solid rgba(220,53,69,0.2); color:var(--status-danger);" data-id="${s.id}"><i class="fal fa-trash-alt"></i> Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;

        // Bind list buttons
        tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = parseInt(e.target.closest('[data-id]').dataset.id);
                openServiceModal(id);
            });
        });
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async e => {
                const id = parseInt(e.target.closest('[data-id]').dataset.id);
                if (confirm("Are you sure you want to delete/deactivate this service?")) {
                    try {
                        const res = await window.servicesApi.deleteService(id);
                        if (res && res.ok) {
                            toast('success', 'Service deactivated successfully.');
                            loadServices();
                        } else {
                            toast('error', 'Failed to delete service.');
                        }
                    } catch (err) {
                        toast('error', err.message);
                    }
                }
            });
        });
    }

    function filterServices() {
        const search = document.getElementById('serviceSearchInput').value.toLowerCase().trim();
        const categoryId = document.getElementById('serviceCategoryFilter').value;
        const featured = document.getElementById('serviceFeaturedFilter').value;

        const filtered = services.filter(s => {
            const matchesSearch = s.title.toLowerCase().includes(search) || s.short_description.toLowerCase().includes(search);
            const matchesCategory = !categoryId || (s.category && String(s.category.id) === categoryId);
            const matchesFeatured = !featured || String(s.featured) === featured;
            return matchesSearch && matchesCategory && matchesFeatured;
        });

        renderServicesTable(filtered);
    }

    function openServiceModal(id) {
        currentServiceId = id;
        const modal = document.getElementById('serviceFormModal');
        const form = document.getElementById('serviceForm');
        form.reset();
        
        // Reset preview images
        document.getElementById('thumbnailPreview').style.display = 'none';
        document.getElementById('serviceThumbnailAssetId').value = '';
        document.getElementById('featuresList').innerHTML = '';
        document.getElementById('galleryGrid').innerHTML = '';
        tempFeatures = [];
        tempGallery = [];

        if (id) {
            document.getElementById('serviceModalTitle').textContent = 'Edit Service';
            // Populate fields
            const service = services.find(s => s.id === id);
            if (service) {
                form.title.value = service.title;
                form.category_id.value = service.category ? service.category.id : '';
                form.short_description.value = service.short_description;
                form.full_description.value = service.full_description;
                form.base_price.value = service.base_price;
                form.discounted_price.value = service.discounted_price || '';
                form.delivery_time.value = service.delivery_time;
                form.featured.checked = service.featured;
                form.active.checked = service.active;

                if (service.thumbnail_asset_details) {
                    document.getElementById('serviceThumbnailAssetId').value = service.thumbnail_asset;
                    const preview = document.getElementById('thumbnailPreview');
                    preview.style.display = 'block';
                    preview.querySelector('img').src = service.thumbnail_asset_details.medium || service.thumbnail_asset_details.file;
                } else if (service.thumbnail) {
                    const preview = document.getElementById('thumbnailPreview');
                    preview.style.display = 'block';
                    preview.querySelector('img').src = service.thumbnail;
                }

                // Render features
                if (service.features) {
                    service.features.forEach(f => {
                        addFeatureToUI(f.id, f.title);
                    });
                }

                // Render gallery
                if (service.gallery) {
                    service.gallery.forEach(g => {
                        const imgUrl = g.image_asset_details ? (g.image_asset_details.medium || g.image_asset_details.file) : g.image;
                        addGalleryToUI(g.id, imgUrl);
                    });
                }
            }
        } else {
            document.getElementById('serviceModalTitle').textContent = 'Add Service';
        }

        modal.style.display = 'flex';
    }

    function addFeatureToUI(id, title) {
        const list = document.getElementById('featuresList');
        const li = document.createElement('li');
        li.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#f9fafb; padding:8px 12px; border-radius:6px; border:1px solid var(--admin-border); font-size:13.5px;';
        li.innerHTML = `
            <span>${title}</span>
            <button type="button" style="background:none; border:none; color:var(--status-danger); cursor:pointer;" class="del-feat-btn"><i class="fal fa-trash-alt"></i></button>
        `;
        list.appendChild(li);

        li.querySelector('.del-feat-btn').addEventListener('click', async () => {
            if (currentServiceId && typeof id === 'number') {
                if (confirm("Delete this feature permanently?")) {
                    const res = await window.servicesApi.deleteFeature(currentServiceId, id);
                    if (res && res.ok) {
                        li.remove();
                        toast('success', 'Feature deleted.');
                    }
                }
            } else {
                // If it's unsaved, remove from temp array and UI
                tempFeatures = tempFeatures.filter(f => f !== title);
                li.remove();
            }
        });
    }

    function addFeatureToTemp(title) {
        if (currentServiceId) {
            // Edit mode: save to database immediately
            window.servicesApi.addFeature(currentServiceId, title).then(res => {
                if (res && res.ok) {
                    addFeatureToUI(res.data.id, res.data.title);
                    toast('success', 'Feature added.');
                }
            });
        } else {
            // Create mode: add to temp array
            tempFeatures.push(title);
            addFeatureToUI(title, title); // using title string as temp id
        }
    }

    function addGalleryToUI(id, imgUrl) {
        const grid = document.getElementById('galleryGrid');
        const div = document.createElement('div');
        div.style.cssText = 'position:relative; height:80px; border-radius:6px; overflow:hidden; border:1px solid var(--admin-border);';
        div.innerHTML = `
            <img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover;">
            <button type="button" style="position:absolute; top:4px; right:4px; background:rgba(220,53,69,0.8); border:none; color:white; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;" class="del-gal-btn"><i class="fal fa-times" style="font-size:10px;"></i></button>
        `;
        grid.appendChild(div);

        div.querySelector('.del-gal-btn').addEventListener('click', async () => {
            if (currentServiceId && typeof id === 'number') {
                if (confirm("Delete this gallery image permanently?")) {
                    const res = await window.servicesApi.deleteGallery(currentServiceId, id);
                    if (res && res.ok) {
                        div.remove();
                        toast('success', 'Gallery image deleted.');
                    }
                }
            }
        });
    }

    async function uploadGalleryFiles(files) {
        if (currentServiceId) {
            // Edit mode: upload to API immediately
            for (let i = 0; i < files.length; i++) {
                const fd = new FormData();
                fd.append('image', files[i]);
                try {
                    const res = await window.servicesApi.uploadGallery(currentServiceId, fd);
                    if (res && res.ok) {
                        const imgUrl = res.data.image_asset_details ? (res.data.image_asset_details.medium || res.data.image_asset_details.file) : res.data.image;
                        addGalleryToUI(res.data.id, imgUrl);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
            toast('success', 'Gallery images uploaded.');
        } else {
            // Create mode: hold files locally to upload after service is created
            for (let i = 0; i < files.length; i++) {
                const item = { type: 'file', data: files[i] };
                tempGallery.push(item);
                // Create object url for preview
                const url = URL.createObjectURL(files[i]);
                const grid = document.getElementById('galleryGrid');
                const div = document.createElement('div');
                div.style.cssText = 'position:relative; height:80px; border-radius:6px; overflow:hidden; border:1px solid var(--admin-border);';
                div.innerHTML = `
                    <img src="${url}" style="width:100%; height:100%; object-fit:cover;">
                    <button type="button" style="position:absolute; top:4px; right:4px; background:rgba(220,53,69,0.8); border:none; color:white; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;" class="del-temp-gal-btn"><i class="fal fa-times" style="font-size:10px;"></i></button>
                `;
                grid.appendChild(div);
                div.querySelector('.del-temp-gal-btn').addEventListener('click', () => {
                    tempGallery = tempGallery.filter(f => f !== item);
                    div.remove();
                });
            }
        }
    }

    async function handleServiceSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const btn = $(form).find('button[type="submit"]');
        const text = btn.find('.btn-text');
        const spin = btn.find('.btn-spinner');

        const fd = new FormData();
        fd.append('title', form.title.value);
        fd.append('category_id', form.category_id.value);
        fd.append('short_description', form.short_description.value);
        fd.append('full_description', form.full_description.value);
        fd.append('base_price', form.base_price.value);
        if (form.discounted_price.value) fd.append('discounted_price', form.discounted_price.value);
        fd.append('delivery_time', form.delivery_time.value);
        fd.append('featured', form.featured.checked);
        fd.append('active', form.active.checked);

        // Thumbnail Asset vs File upload
        const thumbAssetId = document.getElementById('serviceThumbnailAssetId').value;
        const thumbFile = form.thumbnail.files[0];
        
        if (thumbAssetId) {
            fd.append('thumbnail_asset', thumbAssetId);
        } else if (thumbFile) {
            fd.append('thumbnail', thumbFile);
        } else if (!currentServiceId) {
            toast('error', 'Thumbnail image is required for new services.');
            return;
        }

        btn.prop('disabled', true);
        text.hide();
        spin.show();

        try {
            let res;
            if (currentServiceId) {
                // If edit mode and they cleared the thumbnail asset, we clear it on backend too by sending blank
                if (!thumbAssetId && !thumbFile) {
                    fd.append('thumbnail_asset', '');
                }
                res = await window.servicesApi.updateService(currentServiceId, fd);
            } else {
                res = await window.servicesApi.createService(fd);
            }

            if (res && res.ok) {
                const service = res.data;
                
                // If in create mode, upload features & gallery now that we have service ID
                if (!currentServiceId) {
                    // Upload features
                    for (let f of tempFeatures) {
                        await window.servicesApi.addFeature(service.id, f);
                    }
                    // Upload gallery items (could be files or assets)
                    for (let g of tempGallery) {
                        if (g.type === 'file') {
                            const galleryFd = new FormData();
                            galleryFd.append('image', g.data);
                            await window.servicesApi.uploadGallery(service.id, galleryFd);
                        } else if (g.type === 'asset') {
                            await window.servicesApi.linkGalleryAsset(service.id, g.data.id);
                        }
                    }
                }

                toast('success', currentServiceId ? 'Service updated successfully!' : 'Service created successfully!');
                document.getElementById('serviceFormModal').style.display = 'none';
                loadServices();
            } else {
                const errorMsg = res.data ? JSON.stringify(res.data) : 'Failed to save service.';
                toast('error', errorMsg);
            }
        } catch (err) {
            toast('error', err.message);
        } finally {
            btn.prop('disabled', false);
            text.show();
            spin.hide();
        }
    }

    function openCategoriesModal() {
        document.getElementById('categoriesModal').style.display = 'flex';
    }

    function renderCategoriesList() {
        const list = document.getElementById('categoriesList');
        if (!list) return;

        if (categories.length === 0) {
            list.innerHTML = '<li style="padding: 10px; text-align: center; color: var(--admin-text-muted);">No categories created.</li>';
            return;
        }

        let html = '';
        categories.forEach(c => {
            const icon = c.icon || 'fa-tag';
            html += `
                <li style="display:flex; justify-content:space-between; align-items:center; background:#f9fafb; padding:10px 14px; border-radius:8px; border:1px solid var(--admin-border); font-size:14px;">
                    <span style="font-weight: 500;"><i class="fal ${icon}" style="margin-right:8px; color:var(--admin-accent);"></i> ${c.name}</span>
                </li>
            `;
        });
        list.innerHTML = html;
    }

    async function handleCategorySubmit(e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.name.value,
            icon: form.icon.value
        };

        try {
            const res = await window.servicesApi.createCategory(data);
            if (res && res.ok) {
                toast('success', 'Category created.');
                form.reset();
                await loadCategories();
            } else {
                toast('error', 'Failed to create category.');
            }
        } catch (err) {
            toast('error', err.message);
        }
    }

    window.adminServicesLifecycle = {
        init: init
    };
})();
