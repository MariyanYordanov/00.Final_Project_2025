// World Family - Site JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Search functionality with debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(this.value);
            }, 300);
        });
    }

    // Family grid animations
    observeElements('.family-card', 'animate-fade-in');
    observeElements('.feature-card', 'animate-slide-up');

    // Form validation enhancement
    enhanceFormValidation();

    // Loading states for buttons
    addLoadingStates();
});

// Search functionality
function performSearch(query) {
    if (query.length < 2) return;
    
    // Show loading state
    showSearchLoading(true);
    
    // This would typically make an AJAX call to search endpoint
    // For now, we'll just filter visible cards
    const cards = document.querySelectorAll('.family-card');
    cards.forEach(card => {
        const familyName = card.querySelector('h5').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const searchTerm = query.toLowerCase();
        
        if (familyName.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
            card.classList.add('animate-fade-in');
        } else {
            card.style.display = 'none';
        }
    });
    
    showSearchLoading(false);
}

function showSearchLoading(show) {
    const searchButton = document.querySelector('.search-btn');
    if (searchButton) {
        if (show) {
            searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            searchButton.disabled = true;
        } else {
            searchButton.innerHTML = '<i class="fas fa-search"></i>';
            searchButton.disabled = false;
        }
    }
}

// Intersection Observer for animations
function observeElements(selector, animationClass) {
    const elements = document.querySelectorAll(selector);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(animationClass);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// Enhanced form validation
function enhanceFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                
                // Focus first invalid field
                const firstInvalid = form.querySelector(':invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            
            form.classList.add('was-validated');
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    validateField(this);
                }
            });
        });
    });
}

function validateField(field) {
    const isValid = field.checkValidity();
    
    field.classList.remove('is-valid', 'is-invalid');
    field.classList.add(isValid ? 'is-valid' : 'is-invalid');
    
    // Custom validation messages
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback && !isValid) {
        feedback.textContent = getValidationMessage(field);
    }
}

function getValidationMessage(field) {
    if (field.validity.valueMissing) {
        return `${field.getAttribute('data-field-name') || 'This field'} is required.`;
    }
    if (field.validity.typeMismatch) {
        return `Please enter a valid ${field.type}.`;
    }
    if (field.validity.tooShort) {
        return `Must be at least ${field.minLength} characters long.`;
    }
    if (field.validity.tooLong) {
        return `Must be no more than ${field.maxLength} characters long.`;
    }
    if (field.validity.patternMismatch) {
        return field.getAttribute('data-pattern-message') || 'Please match the requested format.';
    }
    return 'Please enter a valid value.';
}

// Loading states for buttons
function addLoadingStates() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="loading"></span> Processing...';
                submitBtn.disabled = true;
                
                // Re-enable after 10 seconds as fallback
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 10000);
            }
        });
    });
}

// Utility functions
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

// AJAX helper function
function makeRequest(url, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    };
    
    const config = { ...defaultOptions, ...options };
    
    return fetch(url, config)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Request failed:', error);
            showToast('An error occurred. Please try again.', 'danger');
            throw error;
        });
}

// Animation CSS classes (to be added via JavaScript)
const animationStyles = `
    .animate-fade-in {
        animation: fadeIn 0.6s ease-in-out;
    }
    
    .animate-slide-up {
        animation: slideUp 0.8s ease-out;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(40px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

// Inject animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);