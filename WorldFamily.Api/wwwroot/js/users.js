// Checkbox selection functionality
        function toggleSelectAll() {
            const selectAll = document.getElementById('selectAll');
            const checkboxes = document.querySelectorAll('.user-checkbox');
            
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAll.checked;
            });
            
            updateBulkActionButton();
        }

        function selectAllUsers() {
            const selectAll = document.getElementById('selectAll');
            selectAll.checked = true;
            toggleSelectAll();
        }

        function updateBulkActionButton() {
            const checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
            const bulkActionBtn = document.getElementById('bulkActionBtn');
            
            bulkActionBtn.disabled = checkedBoxes.length === 0;
            bulkActionBtn.textContent = `Bulk Action (${checkedBoxes.length})`;
        }

        // Add event listeners to checkboxes
        document.querySelectorAll('.user-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateBulkActionButton);
        });

        // User management functions
        function viewUserDetails(userId) {
            window.location.href = `/admin/users/details/${userId}`;
        }

        function editUser(userId) {
            window.location.href = `/admin/users/edit/${userId}`;
        }

        function toggleUserStatus(userId, action) {
            const actionText = action === 'lock' ? 'lock' : 'unlock';
            
            if (!confirm(`Are you sure you want to ${actionText} this user?`)) {
                return;
            }
            
            showLoadingOverlay(true);
            
            fetch('/admin/users/toggle-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ userId: userId, action: action })
            })
            .then(response => response.json())
            .then(data => {
                showLoadingOverlay(false);
                if (data.success) {
                    showAdminToast(`User ${actionText}ed successfully.`, 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showAdminToast(`Failed to ${actionText} user.`, 'error');
                }
            })
            .catch(error => {
                showLoadingOverlay(false);
                showAdminToast(`An error occurred while ${actionText}ing user.`, 'error');
                console.error('Error:', error);
            });
        }

        function bulkAction(action) {
            const checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
            const userIds = Array.from(checkedBoxes).map(cb => cb.value);
            
            if (userIds.length === 0) {
                showAdminToast('Please select users first.', 'warning');
                return;
            }
            
            if (!confirm(`Are you sure you want to ${action} ${userIds.length} user(s)?`)) {
                return;
            }
            
            showLoadingOverlay(true);
            
            fetch('/admin/users/bulk-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ userIds: userIds, action: action })
            })
            .then(response => response.json())
            .then(data => {
                showLoadingOverlay(false);
                if (data.success) {
                    showAdminToast(`Bulk ${action} completed successfully.`, 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showAdminToast(`Failed to perform bulk ${action}.`, 'error');
                }
            })
            .catch(error => {
                showLoadingOverlay(false);
                showAdminToast(`An error occurred during bulk ${action}.`, 'error');
                console.error('Error:', error);
            });
        }

        // Real-time search
        let searchTimeout;
        document.getElementById('search').addEventListener('input', function() {
            clearTimeout(searchTimeout);
            if (this.value.length >= 3 || this.value.length === 0) {
                searchTimeout = setTimeout(() => {
                    this.form.submit();
                }, 500);
            }
        });

        // Auto-refresh every 5 minutes
        setInterval(() => {
            location.reload();
        }, 300000);