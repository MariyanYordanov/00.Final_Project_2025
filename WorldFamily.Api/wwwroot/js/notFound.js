 function goBack() {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/';
            }
        }

        function performSearch() {
            const searchTerm = document.getElementById('errorPageSearch').value.trim();
            if (searchTerm) {
                window.location.href = `/FamilyMvc/Browse?search=${encodeURIComponent(searchTerm)}`;
            } else {
                window.location.href = '/FamilyMvc/Browse';
            }
        }

        function reportProblem() {
            const problemData = {
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                referrer: document.referrer
            };
            
            // In a real application, this would send data to your error tracking service
            console.log('Problem reported:', problemData);
            
            showToast('Problem reported. Thank you for helping us improve!', 'success');
            
            // Optionally redirect to contact form with pre-filled data
            setTimeout(() => {
                window.location.href = '/contact?subject=404 Error Report&url=' + encodeURIComponent(window.location.href);
            }, 2000);
        }

        // Search on Enter key
        document.getElementById('errorPageSearch').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // Add some interaction to the floating members
        document.querySelectorAll('.floating-member').forEach((member, index) => {
            member.addEventListener('mouseenter', function() {
                this.style.transform = `scale(1.2) rotate(${Math.random() * 20 - 10}deg)`;
            });
            
            member.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1) rotate(0deg)';
            });
        });

        // Log 404 error for analytics (in a real app)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_not_found', {
                'page_location': window.location.href,
                'page_referrer': document.referrer
            });
        }