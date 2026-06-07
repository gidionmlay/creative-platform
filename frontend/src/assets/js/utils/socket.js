/**
 * Real-Time Notifications Socket Manager
 */
(function() {
    let socket = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let notifications = [];

    // UI Elements
    const elements = {
        bellIcon: () => document.getElementById('notificationBellIcon'),
        badge: () => document.getElementById('notificationBadge'),
        dropdown: () => document.getElementById('notificationDropdownList'),
        emptyState: () => document.getElementById('notificationEmptyState')
    };

    /**
     * Show Toast Notification
     */
    const showToast = (title, message) => {
        if (window.showToast) {
            window.showToast("info", `${title}: ${message}`);
            return;
        }

        // Fallback custom toast if standard toast doesn't exist
        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #111827;
            color: #fff;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 9999;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 350px;
        `;
        toast.innerHTML = `
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <div style="color: #3B82F6; font-size: 20px;"><i class="fas fa-bell"></i></div>
                <div>
                    <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${title}</h4>
                    <p style="margin: 0; font-size: 13px; color: #9CA3AF; line-height: 1.4;">${message}</p>
                </div>
            </div>
        `;

        document.body.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });

        // Remove after 5 seconds
        setTimeout(() => {
            toast.style.transform = 'translateY(20px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    };

    /**
     * Render Notifications UI
     */
    const renderNotifications = () => {
        const badge = elements.badge();
        const dropdownList = elements.dropdown();
        const emptyState = elements.emptyState();

        if (!badge || !dropdownList) return;

        const unreadCount = notifications.filter(n => !n.is_read).length;
        
        // Update badge
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }

        // Empty state vs List
        if (notifications.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            dropdownList.innerHTML = '';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            
            let html = '';
            notifications.slice(0, 10).forEach(n => {
                const dateStr = n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Just now';
                const readStyle = n.is_read ? 'opacity: 0.7;' : 'font-weight: 600; background: rgba(59, 130, 246, 0.05);';
                
                html += `
                    <div class="notification-item" style="padding: 12px 16px; border-bottom: 1px solid var(--admin-border); cursor: pointer; transition: background 0.2s; ${readStyle}" data-id="${n.id}">
                        <div style="display: flex; gap: 12px;">
                            <div style="color: var(--primary); font-size: 18px; margin-top: 2px;">
                                <i class="fas fa-circle" style="font-size: 8px; vertical-align: middle; margin-right: 4px; display: ${n.is_read ? 'none' : 'inline-block'}"></i>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-size: 14px; margin-bottom: 2px;">${n.title}</div>
                                <div style="font-size: 13px; color: var(--admin-text-muted); line-height: 1.4;">${n.message}</div>
                                <div style="font-size: 11px; color: var(--admin-text-muted); margin-top: 6px;">${dateStr}</div>
                            </div>
                        </div>
                    </div>
                `;
            });
            dropdownList.innerHTML = html;
            
            // Attach click listeners
            dropdownList.querySelectorAll('.notification-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.getAttribute('data-id');
                    markAsRead(id);
                });
            });
        }
    };

    /**
     * Mark Notification as Read
     */
    const markAsRead = async (id) => {
        const notif = notifications.find(n => n.id == id);
        if (notif && !notif.is_read) {
            notif.is_read = true;
            renderNotifications();
            
            try {
                await fetch(`http://127.0.0.1:8000/api/v1/notifications/${id}/read/`, {
                    method: 'PATCH',
                    headers: window.api.getAuthHeaders()
                });
            } catch (error) {
                console.error("Failed to mark notification as read", error);
            }
        }
    };

    /**
     * Fetch Initial Notifications via API
     */
    const fetchInitialNotifications = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/v1/notifications/', {
                headers: window.api.getAuthHeaders()
            });
            
            if (res.ok) {
                const data = await res.json();
                notifications = data.results || data;
                renderNotifications();
            }
        } catch (error) {
            console.warn("Failed to fetch initial notifications", error);
        }
    };

    /**
     * Connect WebSocket
     */
    const connect = () => {
        const token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Note: Using 127.0.0.1:8000 directly for local dev
        const wsUrl = `ws://127.0.0.1:8000/ws/notifications/?token=${token}`;
        
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log("WebSocket connected!");
            reconnectAttempts = 0;
            // Get initial state
            fetchInitialNotifications();
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
                const newNotif = {
                    id: data.id,
                    title: data.title,
                    message: data.message,
                    type: data.notification_type,
                    created_at: data.created_at,
                    is_read: false
                };
                
                notifications.unshift(newNotif);
                renderNotifications();
                showToast(newNotif.title, newNotif.message);
                
                // If on client requests page, might want to refresh list
                if (window.clientRequests && typeof window.clientRequests.fetchRequests === 'function') {
                    window.clientRequests.fetchRequests();
                }
            }
        };

        socket.onclose = () => {
            console.log("WebSocket closed");
            if (reconnectAttempts < maxReconnectAttempts) {
                setTimeout(() => {
                    reconnectAttempts++;
                    console.log(`Reconnecting... Attempt ${reconnectAttempts}`);
                    connect();
                }, 2000 * reconnectAttempts); // Exponential backoff
            } else {
                console.warn("WebSocket Max Reconnects Reached. Falling back to polling.");
                // Fallback polling every 30 seconds
                setInterval(fetchInitialNotifications, 30000);
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket Error:", error);
            socket.close();
        };
    };

    /**
     * Dropdown toggle logic
     */
    const setupUI = () => {
        const bellIcon = elements.bellIcon();
        if (bellIcon) {
            bellIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('notificationDropdownContainer');
                if (dropdown) {
                    const isVisible = dropdown.style.display === 'block';
                    // Hide profile dropdown if open (use class-based system)
                    const profileDropdown = document.getElementById('profileDropdown');
                    if (profileDropdown) profileDropdown.classList.remove('active');
                    
                    dropdown.style.display = isVisible ? 'none' : 'block';
                }
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                const dropdown = document.getElementById('notificationDropdownContainer');
                if (dropdown && !e.target.closest('.notification-box')) {
                    dropdown.style.display = 'none';
                }
            });
        }
    };

    // Initialize
    window.addEventListener('DOMContentLoaded', () => {
        setupUI();
        connect();
    });

})();
