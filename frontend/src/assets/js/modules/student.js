/**
 * G Design — Student Dashboard
 * ─────────────────────────────
 * Fully stabilized: dynamic profile, real API data, proper states, event rebinding
 */
console.log("🔥 JS FILE LOADED:", "student.js");

/* ── Global event delegation ─────────────────────────────────── */
document.addEventListener("click", function(e) {
    var menuItem = e.target.closest(".menu-item[data-view]");
    if (menuItem) {
        e.preventDefault();
        var v = menuItem.dataset.view;
        if (v && typeof window._studentLoadView === "function") window._studentLoadView(v);
        return;
    }

    var trigger = e.target.closest("[data-view-trigger]");
    if (trigger) {
        e.preventDefault();
        var v = trigger.dataset.viewTrigger;
        if (v && typeof window._studentLoadView === "function") window._studentLoadView(v);
        var dd = document.getElementById("profileDropdown");
        if (dd) dd.classList.remove("active");
        return;
    }

    var logoutBtn = e.target.closest('[data-action="logout"]');
    if (logoutBtn) {
        e.preventDefault();
        if (window.helpers && window.helpers.logout) window.helpers.logout();
        else if (window.auth && window.auth.logout) window.auth.logout();
        return;
    }

    if (!e.target.closest(".profile-box")) {
        var dd = document.getElementById("profileDropdown");
        if (dd) dd.classList.remove("active");
    }
});

$(document).ready(function () {
    console.log("🔥 student.js — $(document).ready FIRED");

    /* ── Helpers ──────────────────────────────────────────────── */
    var sa = (window.helpers && window.helpers.safeArray) ? window.helpers.safeArray : function(v) { return Array.isArray(v) ? v : []; };
    var sn = (window.helpers && window.helpers.safeNumber) ? window.helpers.safeNumber : function(v) { return isNaN(Number(v)) ? 0 : Number(v); };
    var st = (window.helpers && window.helpers.safeText) ? window.helpers.safeText : function(v, fb) { return (v != null && String(v).trim()) ? String(v).trim() : (fb || ''); };

    /* ── State ────────────────────────────────────────────────── */
    var state = { user: null, myCourses: [], allCourses: [], loading: false };

    /* ── View Templates ───────────────────────────────────────── */
    var views = {
        dashboard: '<div class="view-container">' +
            '<div class="mb-4"><h3 style="font-family:var(--nexin-font);font-weight:600" id="welcomeGreeting">Welcome back!</h3><p style="color:var(--admin-text-muted)">Ready to continue learning?</p></div>' +
            '<div class="kpi-grid">' +
                '<div class="admin-card kpi-card gradient-blue"><div class="kpi-icon"><i class="fal fa-graduation-cap"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiEnrolled">0</span><span class="kpi-label">Courses In Progress</span></div></div>' +
                '<div class="admin-card kpi-card gradient-emerald"><div class="kpi-icon"><i class="fal fa-check-circle"></i></div><div class="kpi-info"><span class="kpi-value" id="kpiCompleted">0</span><span class="kpi-label">Completed Courses</span></div></div>' +
            '</div>' +
            '<div class="row gutter-y-30">' +
                '<div class="col-lg-8">' +
                    '<div class="admin-card mb-4" id="continueLearningCard" style="display:none">' +
                        '<div class="d-flex justify-content-between align-items-center mb-4"><h3 class="card-title m-0">Continue Learning</h3><span class="status-badge status-active">Last accessed recently</span></div>' +
                        '<div style="display:flex;gap:20px;flex-wrap:wrap">' +
                            '<div id="continueImg" style="width:150px;height:100px;border-radius:8px;background-color:#eee;background-size:cover;background-position:center"></div>' +
                            '<div style="flex-grow:1">' +
                                '<h4 id="continueTitle" style="font-size:18px;font-weight:600;margin-bottom:5px">-</h4>' +
                                '<p style="font-size:14px;color:var(--admin-text-muted);margin-bottom:15px">Pick up where you left off</p>' +
                                '<div class="chart-bar-track mb-2"><div id="continueProgressFill" class="chart-bar-fill" style="width:0%"></div></div>' +
                                '<div class="d-flex justify-content-between align-items-center">' +
                                    '<span id="continueProgressText" style="font-size:12px;font-weight:600;color:var(--admin-accent)">0% Complete</span>' +
                                    '<button class="admin-btn" data-view-trigger="courses"><i class="fal fa-play" style="margin-right:8px"></i>View Courses</button>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="admin-card mb-4" id="emptyLearningCard">' +
                        '<div style="padding:40px;text-align:center">' +
                            '<i class="fal fa-graduation-cap" style="font-size:48px;color:var(--admin-border);margin-bottom:15px"></i>' +
                            '<h4 style="font-weight:600;font-size:18px">No Enrolled Courses</h4>' +
                            '<p style="color:var(--admin-text-muted);margin-bottom:20px">You haven\'t enrolled in any courses yet.</p>' +
                            '<button class="admin-btn" data-view-trigger="explore"><i class="fal fa-search" style="margin-right:8px"></i>Explore Courses</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="col-lg-4">' +
                    '<div class="admin-card mb-4"><div class="card-header"><h3 class="card-title">Quick Actions</h3></div>' +
                        '<div style="display:flex;flex-direction:column;gap:15px"><button class="admin-btn" style="width:100%" data-view-trigger="explore"><i class="fal fa-compass" style="margin-right:8px"></i>Explore Courses</button></div>' +
                    '</div>' +
                '</div>' +
            '</div></div>',

        courses: '<div class="view-container"><div class="mb-4 d-flex justify-content-between align-items-center" style="flex-wrap:wrap;gap:15px"><div><h3 style="font-family:var(--nexin-font);font-weight:600">My Courses</h3><p style="color:var(--admin-text-muted)">Track your progress across enrolled courses.</p></div><button class="admin-btn secondary" data-view-trigger="explore"><i class="fal fa-plus" style="margin-right:8px"></i>Add New Course</button></div><div class="row gutter-y-30" id="studentCoursesGrid"></div></div>',

        explore: '<div class="view-container"><div class="mb-4"><h3 style="font-family:var(--nexin-font);font-weight:600">Explore Catalog</h3><p style="color:var(--admin-text-muted)">Discover new courses and expand your skills.</p></div><div class="row gutter-y-30" id="exploreCoursesGrid"></div></div>',

        assignments: '<div class="view-container"><div class="admin-card" style="padding:60px;text-align:center"><i class="fal fa-tasks" style="font-size:48px;color:var(--admin-border);margin-bottom:20px;display:block"></i><h3 class="card-title" style="margin-bottom:10px">Assignments</h3><p style="color:var(--admin-text-muted)">No assignments due at the moment. Assignments from your enrolled courses will appear here.</p></div></div>',

        certificates: '<div class="view-container"><div class="admin-card" style="padding:60px;text-align:center"><i class="fal fa-award" style="font-size:48px;color:var(--admin-border);margin-bottom:20px;display:block"></i><h3 class="card-title" style="margin-bottom:10px">Certificates</h3><p style="color:var(--admin-text-muted)">Complete courses to earn certificates. Your achievements will be displayed here.</p></div></div>',

        settings: '<div class="view-container"><div class="admin-card" style="padding:60px;text-align:center"><i class="fal fa-cog" style="font-size:48px;color:var(--admin-border);margin-bottom:20px;display:block"></i><h3 class="card-title" style="margin-bottom:10px">Settings</h3><p style="color:var(--admin-text-muted)">Account settings and preferences will be available here in a future update.</p></div></div>'
    };

    /* ── Data Loading ─────────────────────────────────────────── */
    var loadData = async function() {
        if (window.helpers && window.helpers.renderUserProfile) {
            try { await window.helpers.renderUserProfile(); } catch(e) { console.warn("renderUserProfile:", e.message); }
        }
        state.loading = true;

        // Fetch enrolled courses
        if (window.studentApi && window.studentApi.getMyCourses) {
            try {
                var res = await window.studentApi.getMyCourses();
                console.log("📡 API my courses:", res ? "received" : "null");
                state.myCourses = (res && res.ok) ? sa(res.data.results || res.data) : [];
            } catch (err) {
                console.error("❌ API my courses failed:", err.message);
                state.myCourses = [];
            }
        } else {
            console.warn("⚠️ studentApi.getMyCourses not available");
            state.myCourses = [];
        }

        // Fetch all courses catalog
        if (window.studentApi && window.studentApi.getCourses) {
            try {
                var res = await window.studentApi.getCourses();
                console.log("📡 API all courses:", res ? "received" : "null");
                state.allCourses = (res && res.ok) ? sa(res.data.results || res.data) : [];
            } catch (err) {
                console.error("❌ API all courses failed:", err.message);
                state.allCourses = [];
            }
        } else {
            console.warn("⚠️ studentApi.getCourses not available");
            state.allCourses = [];
        }

        state.loading = false;
        updateDashboardKPIs();
    };

    var updateDashboardKPIs = function() {
        if (!state.myCourses) return;
        var active = state.myCourses.filter(function(c) { return c.status === 'active' || sn(c.progress) < 100; }).length;
        var completed = state.myCourses.filter(function(c) { return c.status === 'completed' || sn(c.progress) === 100; }).length;

        $('#kpiEnrolled').text(active);
        $('#kpiCompleted').text(completed);

        if (state.myCourses.length > 0) {
            $('#emptyLearningCard').hide();
            $('#continueLearningCard').show();
            var latest = state.myCourses[0];
            if (!latest.course) {
                console.warn("⚠️ latest enrollment has no .course object");
                return;
            }
            $('#continueTitle').text(st(latest.course.title, 'Untitled Course'));
            var progress = sn(latest.progress);
            $('#continueProgressText').text(progress + '% Complete');
            $('#continueProgressFill').css('width', progress + '%');
            if (latest.course.thumbnail) {
                $('#continueImg').css('background-image', "url('" + latest.course.thumbnail + "')");
            } else {
                $('#continueImg').css('background', 'var(--admin-bg)');
            }
        } else {
            $('#emptyLearningCard').show();
            $('#continueLearningCard').hide();
        }
    };

    /* ── Rendering ────────────────────────────────────────────── */
    var renderMyCourses = function() {
        var grid = $('#studentCoursesGrid');
        if (!grid.length) return;

        if (state.loading) {
            grid.html('<div class="col-12"><div class="admin-card text-center py-5"><i class="fas fa-spinner fa-spin"></i> Loading courses...</div></div>');
            return;
        }
        if (state.myCourses.length === 0) {
            grid.html('<div class="col-12"><div class="admin-card" style="padding:60px;text-align:center"><i class="fal fa-graduation-cap" style="font-size:48px;color:var(--admin-border);margin-bottom:15px;display:block"></i><h4 style="font-weight:600">No Enrolled Courses</h4><p style="color:var(--admin-text-muted);margin-bottom:20px">Explore our catalog to find courses that interest you.</p><button class="admin-btn" data-view-trigger="explore"><i class="fal fa-compass" style="margin-right:8px"></i>Explore Courses</button></div></div>');
            return;
        }

        var html = '';
        state.myCourses.forEach(function(enroll) {
            var c = enroll.course;
            if (!c) return;
            var thumb = c.thumbnail ? "url('" + c.thumbnail + "')" : 'var(--admin-bg)';
            var progress = sn(enroll.progress);
            var checkmark = progress === 100 ? '<div style="position:absolute;top:15px;right:15px;background:var(--status-success);color:#fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center"><i class="fal fa-check"></i></div>' : '';

            html += '<div class="col-lg-4 col-md-6"><div class="admin-card p-0 overflow-hidden" style="display:flex;flex-direction:column;height:100%;border-radius:12px;transition:transform .3s ease,box-shadow .3s ease" onmouseover="this.style.transform=\'translateY(-5px)\';this.style.boxShadow=\'0 15px 30px rgba(0,0,0,.1)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'">' +
                '<div style="height:160px;background:' + thumb + ' center/cover;position:relative">' + checkmark + '</div>' +
                '<div style="padding:20px;display:flex;flex-direction:column;flex-grow:1">' +
                    '<h4 style="font-weight:600;font-size:18px;margin-bottom:5px">' + st(c.title) + '</h4>' +
                    '<p style="color:var(--admin-text-muted);font-size:13px;margin-bottom:15px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + st(c.description, 'No description available.') + '</p>' +
                    '<div class="mt-auto">' +
                        '<div class="d-flex justify-content-between align-items-center mb-2"><span style="font-size:12px;font-weight:600;color:' + (progress === 100 ? 'var(--status-success)' : 'var(--admin-text)') + '">' + progress + '% Complete</span></div>' +
                        '<div class="chart-bar-track mb-3"><div class="chart-bar-fill" style="width:' + progress + '%;' + (progress === 100 ? 'background-color:var(--status-success)' : '') + '"></div></div>' +
                        '<button class="admin-btn ' + (progress === 100 ? 'secondary' : '') + '" style="width:100%"><i class="fal fa-play" style="margin-right:8px"></i>' + (progress === 100 ? 'Review' : 'Continue') + '</button>' +
                    '</div>' +
                '</div></div></div>';
        });
        grid.html(html);
    };

    var renderExploreCourses = function() {
        var grid = $('#exploreCoursesGrid');
        if (!grid.length) return;

        if (state.loading) {
            grid.html('<div class="col-12"><div class="admin-card text-center py-5"><i class="fas fa-spinner fa-spin"></i> Loading catalog...</div></div>');
            return;
        }
        if (state.allCourses.length === 0) {
            grid.html('<div class="col-12"><div class="admin-card" style="padding:60px;text-align:center"><i class="fal fa-book-open" style="font-size:48px;color:var(--admin-border);margin-bottom:15px;display:block"></i><h4 style="font-weight:600">No Courses Available</h4><p style="color:var(--admin-text-muted)">New courses are being prepared. Check back soon!</p></div></div>');
            return;
        }

        var html = '';
        state.allCourses.forEach(function(c) {
            var isEnrolled = state.myCourses.some(function(en) { return en.course && en.course.id === c.id; });
            var thumb = c.thumbnail ? "url('" + c.thumbnail + "')" : 'var(--admin-bg)';
            var btn = isEnrolled
                ? '<button class="admin-btn secondary" style="width:100%" disabled><i class="fal fa-check-circle" style="margin-right:8px"></i>Enrolled</button>'
                : '<button class="admin-btn enroll-btn" data-id="' + c.id + '" style="width:100%"><i class="fal fa-plus" style="margin-right:8px"></i>Enroll Now</button>';

            html += '<div class="col-lg-4 col-md-6"><div class="admin-card p-0 overflow-hidden" style="display:flex;flex-direction:column;height:100%;border-radius:12px;transition:transform .3s ease" onmouseover="this.style.transform=\'translateY(-5px)\'" onmouseout="this.style.transform=\'\'">' +
                '<div style="height:160px;background:' + thumb + ' center/cover"></div>' +
                '<div style="padding:20px;display:flex;flex-direction:column;flex-grow:1">' +
                    '<h4 style="font-weight:600;font-size:18px;margin-bottom:5px">' + st(c.title) + '</h4>' +
                    '<p style="color:var(--admin-text-muted);font-size:13px;margin-bottom:20px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">' + st(c.description, 'No description.') + '</p>' +
                    '<div class="mt-auto">' + btn + '</div>' +
                '</div></div></div>';
        });
        grid.html(html);

        // Enroll button handlers
        $('.enroll-btn').off('click').on('click', async function() {
            var btn = $(this);
            var id = btn.data('id');
            var orig = btn.html();
            btn.html('<i class="fas fa-spinner fa-spin"></i> Enrolling...').prop('disabled', true);
            try {
                var res = await window.studentApi.enrollCourse(id);
                if (res && res.ok) {
                    if (window.showToast) window.showToast('success', 'Successfully enrolled!');
                    await loadData();
                    renderExploreCourses();
                } else {
                    var msg = (res && res.data && res.data.detail) ? res.data.detail : 'Enrollment failed';
                    if (window.showToast) window.showToast('error', msg);
                    btn.html(orig).prop('disabled', false);
                }
            } catch (err) {
                console.error("API FAILED (enroll):", err);
                if (window.showToast) window.showToast('error', 'Error: ' + err.message);
                btn.html(orig).prop('disabled', false);
            }
        });
    };

    /* ── View Switching ───────────────────────────────────────── */
    var loadView = function(viewName) {
        console.log("📌 loadView:", viewName);

        var titleMap = { courses: "My Courses", explore: "Explore Catalog" };
        var title = titleMap[viewName] || (viewName.charAt(0).toUpperCase() + viewName.slice(1));
        var pt = document.getElementById('pageTitle');
        if (pt) pt.textContent = title;

        var content = document.getElementById('adminContent');
        if (!content) { console.warn("⚠️ Missing: #adminContent"); return; }
        content.innerHTML = views[viewName] || views['dashboard'];

        if (viewName === 'dashboard') updateDashboardKPIs();
        if (viewName === 'courses')   renderMyCourses();
        if (viewName === 'explore')   renderExploreCourses();

        document.querySelectorAll('.menu-item').forEach(function(el) { el.classList.remove('active'); });
        var active = document.querySelector('.menu-item[data-view="' + viewName + '"]');
        if (active) active.classList.add('active');

        if (window.innerWidth < 992) {
            var sb = document.getElementById('adminSidebar');
            var ov = document.querySelector('.sidebar-overlay');
            if (sb) sb.classList.remove('show');
            if (ov) ov.classList.remove('show');
        }

        if (viewName === 'dashboard' && window.helpers && window.helpers.renderUserProfile) {
            window.helpers.renderUserProfile();
        }
    };

    window._studentLoadView = loadView;

    /* ── UI Initialization ────────────────────────────────────── */
    function initUI() {
        if (!document.querySelector('.sidebar-overlay')) {
            var ov = document.createElement('div');
            ov.className = 'sidebar-overlay';
            document.body.appendChild(ov);
        }

        var trigger = document.getElementById('profileDropdownTrigger');
        var dropdown = document.getElementById('profileDropdown');
        if (trigger && dropdown) {
            var newTrigger = trigger.cloneNode(true);
            trigger.parentNode.replaceChild(newTrigger, trigger);
            newTrigger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });
        }

        $('#sidebarToggle').off('click').on('click', function() { $('#adminSidebar').addClass('show'); $('.sidebar-overlay').addClass('show'); });
        $('#sidebarClose, .sidebar-overlay').off('click').on('click', function() { $('#adminSidebar').removeClass('show'); $('.sidebar-overlay').removeClass('show'); });

        console.log("✅ UI components initialized");
    }

    /* ── Dashboard Boot ───────────────────────────────────────── */
    var initializeDashboard = async function() {
        console.log("STEP 1: Build menu extras");
        if ($('.menu-item[data-view="explore"]').length === 0) {
            var coursesItem = $('.menu-item[data-view="courses"]');
            if (coursesItem.length) coursesItem.after('<li class="menu-item" data-view="explore"><a href="#"><i class="fal fa-compass"></i> Explore Courses</a></li>');
        }
        $('.menu-item[data-view="courseview"]').hide();

        console.log("STEP 2: Load data");
        await loadData();

        console.log("STEP 3: Render default view");
        loadView('dashboard');

        console.log("STEP 4: Init UI components");
        initUI();

        console.log("✅ Student dashboard fully initialized");
    };

    initializeDashboard().catch(function(err) { console.error("❌ STUDENT INIT FAILED:", err); });
});
