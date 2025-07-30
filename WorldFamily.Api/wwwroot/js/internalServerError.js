 let retryCountdown = 60;
        let countdownInterval;

        function startCountdown() {
            countdownInterval = setInterval(() => {
                retryCountdown--;
                const countdownElement = document.querySelector('#retryCountdown span');
                if (countdownElement) {
                    countdownElement.textContent = retryCountdown + 's';
                }
                
                if (retryCountdown <= 0) {
                    clearInterval(countdownInterval);
                    retryPage();
                }
            }, 1000);
        }

        function retryPage() {
            // Show loading state
            const retryBtn = document.querySelector('button[onclick="retryPage()"]');
            if (retryBtn) {
                const originalText = retryBtn.innerHTML;
                retryBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Retrying...';
                retryBtn.disabled = true;
                
                // Wait a moment then reload
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                window.location.reload();
            }
        }

        function reportError() {
            const errorData = {
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                referrer: document.referrer,
                errorType: '500 Internal Server Error'
            };
            
            // In a real application, this would send to your error tracking service
            console.log('Error reported:', errorData);
            
            showToast('Error reported successfully. Our team has been notified.', 'success');
            
            // Optionally redirect to support
            setTimeout(() => {
                window.location.href = '/contact?subject=500 Error Report&error=Internal Server Error';
            }, 2000);
        }

        function sendErrorReport() {
            const email = document.getElementById('errorReportEmail').value;
            
            if (!email) {
                showToast('Please enter your email address.', 'warning');
                return;
            }
            
            if (!isValidEmail(email)) {
                showToast('Please enter a valid email address.', 'error');
                return;
            }
            
            // Send notification request
            fetch('/api/error-notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    errorType: '500',
                    url: window.location.href,
                    timestamp: new Date().toISOString()
                })
            })
            .then(response => response.json())
            .then(data => {
                showToast('Thank you! We\'ll notify you when the issue is resolved.', 'success');
                document.getElementById('errorReportEmail').value = '';
            })
            .catch(error => {
                showToast('Unable to register for notifications. Please try again later.', 'error');
            });
        }

        function openLiveChat() {
            // In a real application, this would open your live chat widget
            showToast('Live chat is temporarily unavailable. Please use email or phone support.', 'info');
        }

        function copyErrorDetails() {
            const errorInfo = `
Error Type: 500 Internal Server Error
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Referrer: ${document.referrer}
            `.trim();
            
            navigator.clipboard.writeText(errorInfo).then(() => {
                showToast('Error details copied to clipboard', 'success');
            }).catch(() => {
                showToast('Unable to copy to clipboard', 'error');
            });
        }

        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        // Start countdown when page loads
        document.addEventListener('DOMContentLoaded', function() {
            startCountdown();
            
            // Log error for analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exception', {
                    'description': '500 Internal Server Error',
                    'fatal': false
                });
            }
        });

        // Clear countdown if user interacts with page
        document.addEventListener('click', function() {
            if (countdownInterval) {
                clearInterval(countdownInterval);
                const countdownElement = document.getElementById('retryCountdown');
                if (countdownElement) {
                    countdownElement.innerHTML = 'Auto-retry cancelled';
                }
            }
        });
