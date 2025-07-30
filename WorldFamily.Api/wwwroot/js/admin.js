// World Family Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Sidebar Toggle Functionality
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarToggleMobile = document.getElementById('sidebarToggleMobile');
    const sidebar = document.getElementById('adminSidebar');
    const content = document.querySelector('.admin-content');

    function toggleSidebar() {
        if (window.innerWidth < 992) {
            sidebar.classList.toggle('show');
        } else {
            sidebar.classList.toggle('collapsed');
            content.classList.toggle('expanded');
        }
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    if (sidebarToggleMobile) {
        sidebarToggleMobile.addEventListener('click', toggleSidebar);
    }

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', function(event) {
        if (window.innerWidth < 992) {
            if (!sidebar.contains(event.target) && !sidebarToggleMobile.contains(event.target)) {
                sidebar.classList.remove('show');
            }
        }
    });

    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            const bsAlert = new bootstrap.Alert(alert);
            if (bsAlert) {
                bsAlert.close();
            }
        });
    }, 5000);

    // Initialize DataTables if present
    if (typeof DataTable !== 'undefined') {
        const tables = document.querySelectorAll('.admin-datatable');
        tables.forEach(table => {
            new DataTable(table, {
                pageLength: 25,
                responsive: true,
                order: [[0, 'desc']],
                language: {
                    search: "Search:",
                    lengthMenu: "Show _MENU_ entries",
                    info: "Showing _START_ to _END_ of _TOTAL_ entries",
                    paginate: {
                        first: "First",
                        last: "Last",
                        next: "Next",
                        previous: "Previous"
                    }
                }
            });
        });
    }

    // Real-time search functionality
    const searchInputs = document.querySelectorAll('.admin-search');
    searchInputs.forEach(input => {
        let searchTimeout;
        input.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performAdminSearch(this.value, this.dataset.target);
            }, 300);
        });
    });

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Add fade-in animation to dashboard cards
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in-up');
        }, index * 100);
    });

    // Handle form submissions with loading states
    const adminForms = document.querySelectorAll('.admin-form');
    adminForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="loading-spinner"></span> Processing...';
                submitBtn.disabled = true;
                
                // Re-enable after 10 seconds as fallback
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 10000);
            }
        });
    });
});

// Admin-specific functions
function performAdminSearch(query, target) {
    if (query.length < 2) return;
    
    const targetElement = document.getElementById(target);
    if (!targetElement) return;
    
    showLoadingOverlay(true);
    
    // Simulate search request
    setTimeout(() => {
        // Filter visible rows based on query
        const rows = targetElement.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const searchTerm = query.toLowerCase();
            
            if (text.includes(searchTerm)) {
                row.style.display = '';
                row.classList.add('search-highlight');
            } else {
                row.style.display = 'none';
                row.classList.remove('search-highlight');
            }
        });
        
        showLoadingOverlay(false);
    }, 500);
}

function showLoadingOverlay(show) {
    let overlay = document.getElementById('loadingOverlay');
    
    if (show) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="loading-spinner"></div>';
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
    } else {
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}

// User Management Functions
function updateUserRole(userId, newRole) {
    showLoadingOverlay(true);
    
    fetch('/admin/dashboard/UpdateUserRole', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
            userId: userId,
            newRole: newRole
        })
    })
    .then(response => response.json())
    .then(data => {
        showLoadingOverlay(false);
        if (data.success) {
            showAdminToast(data.message, 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showAdminToast(data.message, 'error');
        }
    })
    .catch(error => {
        showLoadingOverlay(false);
        showAdminToast('An error occurred while updating user role.', 'error');
        console.error('Error:', error);
    });
}

function toggleUserStatus(userId) {
    if (!confirm('Are you sure you want to toggle this user\'s status?')) {
        return;
    }
    
    showLoadingOverlay(true);
    
    fetch('/admin/users/toggle-status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ userId: userId })
    })
    .then(response => response.json())
    .then(data => {
        showLoadingOverlay(false);
        if (data.success) {
            showAdminToast('User status updated successfully.', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showAdminToast('Failed to update user status.', 'error');
        }
    })
    .catch(error => {
        showLoadingOverlay(false);
        showAdminToast('An error occurred.', 'error');
        console.error('Error:', error);
    });
}

// Family Management Functions
function deleteFamilyConfirm(familyId, familyName) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirm Deletion</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete the <strong>${familyName}</strong> family?</p>
                    <p class="text-danger"><strong>Warning:</strong> This action cannot be undone. All family members, photos, and stories will be permanently deleted.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" onclick="deleteFamily(${familyId})">Delete Family</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

function deleteFamily(familyId) {
    showLoadingOverlay(true);
    
    fetch('/admin/families/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ familyId: familyId })
    })
    .then(response => response.json())
    .then(data => {
        showLoadingOverlay(false);
        if (data.success) {
            showAdminToast('Family deleted successfully.', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showAdminToast('Failed to delete family.', 'error');
        }
    })
    .catch(error => {
        showLoadingOverlay(false);
        showAdminToast('An error occurred.', 'error');
        console.error('Error:', error);
    });
    
    // Close any open modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        if (bootstrapModal) {
            bootstrapModal.hide();
        }
    });
}

// System Functions
function runSystemBackup() {
    if (!confirm('Are you sure you want to run a system backup? This may take several minutes.')) {
        return;
    }
    
    showLoadingOverlay(true);
    
    fetch('/admin/system/backup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        showLoadingOverlay(false);
        if (data.success) {
            showAdminToast('Backup started successfully. You will be notified when complete.', 'success');
        } else {
            showAdminToast('Failed to start backup.', 'error');
        }
    })
    .catch(error => {
        showLoadingOverlay(false);
        showAdminToast('An error occurred while starting backup.', 'error');
        console.error('Error:', error);
    });
}

function clearSystemCache() {
    if (!confirm('Are you sure you want to clear the system cache?')) {
        return;
    }
    
    showLoadingOverlay(true);
    
    fetch('/admin/system/clear-cache', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        showLoadingOverlay(false);
        if (data.success) {
            showAdminToast('Cache cleared successfully.', 'success');
        } else {
            showAdminToast('Failed to clear cache.', 'error');
        }
    })
    .catch(error => {
        showLoadingOverlay(false);
        showAdminToast('An error occurred.', 'error');
        console.error('Error:', error);
    });
}

// Notification Functions
function showAdminToast(message, type = 'info') {
    const toastContainer = getOrCreateToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${getBootstrapClass(type)} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas ${getToastIcon(type)} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bootstrapToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 5000
    });
    
    bootstrapToast.show();
    
    toast.addEventListener('hidden.bs.toast', function() {
        toastContainer.removeChild(toast);
    });
}

function getOrCreateToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    return container;
}

function getBootstrapClass(type) {
    const classMap = {
        'success': 'success',
        'error': 'danger',
        'warning': 'warning',
        'info': 'info'
    };
    return classMap[type] || 'info';
}

function getToastIcon(type) {
    const iconMap = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-triangle',
        'warning': 'fa-exclamation-circle',
        'info': 'fa-info-circle'
    };
    return iconMap[type] || 'fa-info-circle';
}

// Export Functions
function exportUserData(format = 'csv') {
    showLoadingOverlay(true);
    
    fetch(`/admin/export/users?format=${format}`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.blob();
        }
        throw new Error('Export failed');
    })
    .then(blob => {
        showLoadingOverlay(false);
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showAdminToast('User data exported successfully.', 'success');
    })
    .catch(error => {
        showLoadingOverlay(false);
        showAdminToast('Failed to export user data.', 'error');
        console.error('Error:', error);
    });
}

function exportFamilyData(format = 'csv') {
    showLoadingOverlay(true);
    
    fetch(`/admin/export/families?format=${format}`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.blob();
        }
        throw new Error('Export failed');
    })
    .then(blob => {
        showLoadingOverlay(false);
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `families_export_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showAdminToast('Family data exported successfully.', 'success');
    })
    .catch(error => {
        showLoadingOverlay(false);
        showAdminToast('Failed to export family data.', 'error');
        console.error('Error:', error);
    });
}

// Real-time Updates
function startRealtimeUpdates() {
    // Update dashboard stats every 30 seconds
    setInterval(updateDashboardStats, 30000);
    
    // Update notification count every 60 seconds
    setInterval(updateNotificationCount, 60000);
}

function updateDashboardStats() {
    fetch('/admin/api/dashboard-stats', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateStatsDisplay(data.stats);
        }
    })
    .catch(error => {
        console.error('Failed to update dashboard stats:', error);
    });
}

function updateStatsDisplay(stats) {
    const elements = {
        totalUsers: document.querySelector('[data-stat="totalUsers"]'),
        totalFamilies: document.querySelector('[data-stat="totalFamilies"]'),
        totalMembers: document.querySelector('[data-stat="totalMembers"]'),
        activeUsers: document.querySelector('[data-stat="activeUsers"]')
    };
    
    if (elements.totalUsers) elements.totalUsers.textContent = stats.totalUsers;
    if (elements.totalFamilies) elements.totalFamilies.textContent = stats.totalFamilies;
    if (elements.totalMembers) elements.totalMembers.textContent = stats.totalMembers;
    if (elements.activeUsers) elements.activeUsers.textContent = stats.activeUsers;
}

function updateNotificationCount() {
    fetch('/admin/api/notification-count', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const badge = document.querySelector('.navbar-nav .badge');
            if (badge) {
                badge.textContent = data.count;
                badge.style.display = data.count > 0 ? 'inline' : 'none';
            }
        }
    })
    .catch(error => {
        console.error('Failed to update notification count:', error);
    });
}

// Utility Functions
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showAdminToast('Copied to clipboard!', 'success');
    }, function() {
        showAdminToast('Failed to copy to clipboard.', 'error');
    });
}

// Initialize real-time updates when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Only start real-time updates on dashboard page
    if (window.location.pathname.includes('/admin') && 
        (window.location.pathname.endsWith('/admin') || window.location.pathname.includes('/dashboard'))) {
        startRealtimeUpdates();
    }
});

// Handle browser back/forward navigation
window.addEventListener('popstate', function(event) {
    // Refresh page content when navigating back/forward
    location.reload();
});