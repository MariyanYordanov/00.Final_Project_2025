// World Family - Client-Side Validation

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize form validation
    initializeFormValidation();
    
    // Initialize real-time validation
    initializeRealTimeValidation();
    
    // Initialize custom validation rules
    initializeCustomValidation();
    
    // Initialize security features
    initializeSecurityFeatures();
});

// Form validation initialization
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity() || !validateCustomRules(form)) {
                event.preventDefault();
                event.stopPropagation();
                
                // Focus first invalid field
                const firstInvalid = form.querySelector(':invalid, .is-invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                showValidationSummary(form);
            }
            
            form.classList.add('was-validated');
        });
    });
}

// Real-time validation
function initializeRealTimeValidation() {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Validate on blur
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        // Validate on input for invalid fields
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
            
            // Real-time validation for specific fields
            if (this.type === 'email') {
                validateEmailField(this);
            } else if (this.type === 'password') {
                validatePasswordField(this);
            } else if (this.type === 'date') {
                validateDateField(this);
            }
        });
        
        // Special handling for file inputs
        if (input.type === 'file') {
            input.addEventListener('change', function() {
                validateFileField(this);
            });
        }
    });
    
    // Password confirmation validation
    const passwordConfirm = document.querySelector('#ConfirmPassword');
    const password = document.querySelector('#Password');
    
    if (passwordConfirm && password) {
        passwordConfirm.addEventListener('input', function() {
            validatePasswordConfirmation(password, passwordConfirm);
        });
        
        password.addEventListener('input', function() {
            if (passwordConfirm.value) {
                validatePasswordConfirmation(password, passwordConfirm);
            }
        });
    }
}

// Custom validation rules
function initializeCustomValidation() {
    
    // Family name validation
    const familyNameInputs = document.querySelectorAll('input[data-val-family-name]');
    familyNameInputs.forEach(input => {
        input.addEventListener('input', function() {
            validateFamilyName(this);
        });
    });
    
    // Person name validation
    const personNameInputs = document.querySelectorAll('input[data-val-person-name]');
    personNameInputs.forEach(input => {
        input.addEventListener('input', function() {
            validatePersonName(this);
        });
    });
    
    // Birth date validation
    const birthDateInputs = document.querySelectorAll('input[data-val-birth-date]');
    birthDateInputs.forEach(input => {
        input.addEventListener('change', function() {
            validateBirthDate(this);
        });
    });
    
    // Death date validation
    const deathDateInputs = document.querySelectorAll('input[data-val-death-date]');
    deathDateInputs.forEach(input => {
        input.addEventListener('change', function() {
            validateDeathDate(this);
        });
    });
}

// Security features initialization
function initializeSecurityFeatures() {
    
    // Prevent XSS in text inputs
    const textInputs = document.querySelectorAll('input[type="text"], textarea');
    textInputs.forEach(input => {
        input.addEventListener('input', function() {
            sanitizeInput(this);
        });
    });
    
    // CSRF token validation
    ensureCsrfToken();
    
    // Prevent form double submission
    preventDoubleSubmission();
    
    // Add security headers to AJAX requests
    setupSecureAjax();
}

// Field validation functions
function validateField(field) {
    const isValid = field.checkValidity() && validateCustomField(field);
    
    field.classList.remove('is-valid', 'is-invalid');
    field.classList.add(isValid ? 'is-valid' : 'is-invalid');
    
    updateFieldFeedback(field, isValid);
    
    return isValid;
}

function validateCustomField(field) {
    // Add custom validation logic here
    if (field.hasAttribute('data-val-no-html')) {
        return validateNoHtml(field);
    }
    
    if (field.hasAttribute('data-val-family-name')) {
        return validateFamilyName(field);
    }
    
    if (field.hasAttribute('data-val-person-name')) {
        return validatePersonName(field);
    }
    
    return true;
}

function validateEmailField(field) {
    const email = field.value.trim();
    let isValid = true;
    let message = '';
    
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            isValid = false;
            message = 'Please enter a valid email address.';
        }
        
        // Check for common typos
        const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        const domain = email.split('@')[1];
        if (domain && !commonDomains.includes(domain)) {
            // Suggest corrections for common typos
            const suggestions = getSuggestedDomain(domain, commonDomains);
            if (suggestions.length > 0) {
                message = `Did you mean ${email.split('@')[0]}@${suggestions[0]}?`;
                showFieldSuggestion(field, message);
            }
        }
    }
    
    updateCustomFieldValidation(field, isValid, message);
    return isValid;
}

function validatePasswordField(field) {
    const password = field.value;
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
    };
    
    updatePasswordStrength(field, requirements);
    
    const isValid = Object.values(requirements).every(req => req);
    updateCustomFieldValidation(field, isValid, '');
    
    return isValid;
}

function validatePasswordConfirmation(passwordField, confirmField) {
    const password = passwordField.value;
    const confirm = confirmField.value;
    
    const isValid = password === confirm;
    const message = isValid ? '' : 'Passwords do not match.';
    
    updateCustomFieldValidation(confirmField, isValid, message);
    return isValid;
}

function validateDateField(field) {
    const date = new Date(field.value);
    const today = new Date();
    let isValid = true;
    let message = '';
    
    if (field.hasAttribute('data-val-birth-date')) {
        // Birth date cannot be in the future
        if (date > today) {
            isValid = false;
            message = 'Birth date cannot be in the future.';
        }
        
        // Person cannot be older than 150 years
        const maxAge = new Date();
        maxAge.setFullYear(today.getFullYear() - 150);
        if (date < maxAge) {
            isValid = false;
            message = 'Birth date cannot be more than 150 years ago.';
        }
    }
    
    if (field.hasAttribute('data-val-death-date')) {
        // Death date cannot be in the future
        if (date > today) {
            isValid = false;
            message = 'Death date cannot be in the future.';
        }
        
        // Check if death date is after birth date
        const birthDateField = document.querySelector('#BirthDate');
        if (birthDateField && birthDateField.value) {
            const birthDate = new Date(birthDateField.value);
            if (date <= birthDate) {
                isValid = false;
                message = 'Death date must be after birth date.';
            }
        }
    }
    
    updateCustomFieldValidation(field, isValid, message);
    return isValid;
}

function validateFileField(field) {
    const file = field.files[0];
    let isValid = true;
    let message = '';
    
    if (file) {
        // Check file size
        const maxSize = parseInt(field.getAttribute('data-val-max-size')) || (10 * 1024 * 1024); // 10MB default
        if (file.size > maxSize) {
            isValid = false;
            message = `File size cannot exceed ${(maxSize / (1024 * 1024)).toFixed(1)} MB.`;
        }
        
        // Check file extension
        const allowedExtensions = field.getAttribute('data-val-extensions')?.split(',') || ['.jpg', '.jpeg', '.png', '.gif'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            isValid = false;
            message = `Only ${allowedExtensions.join(', ')} files are allowed.`;
        }
        
        // Check file type
        if (file.type && !file.type.startsWith('image/')) {
            isValid = false;
            message = 'Only image files are allowed.';
        }
    }
    
    updateCustomFieldValidation(field, isValid, message);
    
    // Show file preview if valid
    if (isValid && file && file.type.startsWith('image/')) {
        showFilePreview(field, file);
    }
    
    return isValid;
}

// Custom validation helpers
function validateNoHtml(field) {
    const value = field.value;
    const hasHtml = /<[^>]*>/.test(value) || /javascript:/i.test(value) || /on\w+\s*=/i.test(value);
    
    if (hasHtml) {
        updateCustomFieldValidation(field, false, 'HTML tags and scripts are not allowed.');
        return false;
    }
    
    return true;
}

function validateFamilyName(field) {
    const name = field.value.trim();
    
    if (!name) return true; // Let required validation handle empty values
    
    // Check length
    if (name.length < 2) {
        updateCustomFieldValidation(field, false, 'Family name must be at least 2 characters long.');
        return false;
    }
    
    if (name.length > 50) {
        updateCustomFieldValidation(field, false, 'Family name cannot exceed 50 characters.');
        return false;
    }
    
    // Check for valid characters
    if (!/^[a-zA-Z\s\-']+$/.test(name)) {
        updateCustomFieldValidation(field, false, 'Family name can only contain letters, spaces, hyphens, and apostrophes.');
        return false;
    }
    
    // Check for forbidden words
    const forbiddenWords = ['test', 'fake', 'dummy', 'admin', 'root', 'system'];
    if (forbiddenWords.some(word => name.toLowerCase().includes(word))) {
        updateCustomFieldValidation(field, false, 'Family name contains forbidden words.');
        return false;
    }
    
    return true;
}

function validatePersonName(field) {
    const name = field.value.trim();
    
    if (!name) return true; // Let required validation handle empty values
    
    // Check length
    if (name.length > 30) {
        updateCustomFieldValidation(field, false, 'Name cannot exceed 30 characters.');
        return false;
    }
    
    // Check for valid characters
    if (!/^[a-zA-Z\s\-']+$/.test(name)) {
        updateCustomFieldValidation(field, false, 'Name can only contain letters, spaces, hyphens, and apostrophes.');
        return false;
    }
    
    // Must start with a letter
    if (name && !isLetter(name[0])) {
        updateCustomFieldValidation(field, false, 'Name must start with a letter.');
        return false;
    }
    
    return true;
}

// UI update functions
function updateFieldFeedback(field, isValid) {
    const feedback = field.parentNode.querySelector('.invalid-feedback, .valid-feedback');
    if (!feedback) return;
    
    if (isValid) {
        feedback.style.display = 'none';
    } else {
        feedback.style.display = 'block';
    }
}

function updateCustomFieldValidation(field, isValid, message) {
    field.classList.remove('is-valid', 'is-invalid');
    field.classList.add(isValid ? 'is-valid' : 'is-invalid');
    
    // Update or create feedback element
    let feedback = field.parentNode.querySelector('.custom-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'custom-feedback invalid-feedback';
        field.parentNode.appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.style.display = isValid ? 'none' : 'block';
}

function updatePasswordStrength(field, requirements) {
    let strengthIndicator = document.querySelector('#passwordStrength');
    
    if (!strengthIndicator) {
        strengthIndicator = document.createElement('div');
        strengthIndicator.id = 'passwordStrength';
        strengthIndicator.className = 'password-strength mt-2';
        field.parentNode.appendChild(strengthIndicator);
    }
    
    const score = Object.values(requirements).filter(req => req).length;
    const strength = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][score];
    const colors = ['#dc3545', '#fd7e14', '#ffc107', '#20c997', '#28a745'];
    
    strengthIndicator.innerHTML = `
        <div class="progress" style="height: 5px;">
            <div class="progress-bar" style="width: ${(score / 5) * 100}%; background-color: ${colors[score]}"></div>
        </div>
        <small class="text-muted">Password strength: <span style="color: ${colors[score]}">${strength}</span></small>
        <div class="password-requirements mt-1">
            ${Object.entries(requirements).map(([key, met]) => 
                `<small class="${met ? 'text-success' : 'text-muted'}">
                    <i class="fas fa-${met ? 'check' : 'times'} me-1"></i>
                    ${getRequirementText(key)}
                </small>`
            ).join('<br>')}
        </div>
    `;
}

function showFilePreview(field, file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        let preview = field.parentNode.querySelector('.file-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'file-preview mt-2';
            field.parentNode.appendChild(preview);
        }
        
        preview.innerHTML = `
            <div class="card" style="max-width: 200px;">
                <img src="${e.target.result}" class="card-img-top" style="height: 150px; object-fit: cover;">
                <div class="card-body p-2">
                    <small class="text-muted">${file.name}</small>
                    <button type="button" class="btn btn-sm btn-outline-danger ms-2" onclick="removeFilePreview(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    };
    reader.readAsDataURL(file);
}

function removeFilePreview(button) {
    const preview = button.closest('.file-preview');
    const fileInput = preview.parentNode.querySelector('input[type="file"]');
    
    preview.remove();
    fileInput.value = '';
}

// Security functions
function sanitizeInput(field) {
    if (field.hasAttribute('data-val-no-html')) {
        let value = field.value;
        
        // Remove potential XSS patterns
        value = value.replace(/<script[^>]*>.*?<\/script>/gi, '');
        value = value.replace(/javascript:/gi, '');
        value = value.replace(/on\w+\s*=/gi, '');
        
        if (value !== field.value) {
            field.value = value;
            showSecurityWarning('Potentially harmful content was removed from your input.');
        }
    }
}

function ensureCsrfToken() {
    const forms = document.querySelectorAll('form[method="post"]');
    forms.forEach(form => {
        if (!form.querySelector('input[name="__RequestVerificationToken"]')) {
            const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;
            if (token) {
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = '__RequestVerificationToken';
                hiddenInput.value = token;
                form.appendChild(hiddenInput);
            }
        }
    });
}

function preventDoubleSubmission() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
            if (submitButton) {
                setTimeout(() => {
                    submitButton.disabled = true;
                    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
                }, 100);
            }
        });
    });
}

function setupSecureAjax() {
    // Add CSRF token to all AJAX requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        if (options.method && options.method.toUpperCase() !== 'GET') {
            const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;
            if (token) {
                options.headers = options.headers || {};
                options.headers['RequestVerificationToken'] = token;
            }
        }
        return originalFetch(url, options);
    };
}

// Utility functions
function validateCustomRules(form) {
    const customFields = form.querySelectorAll('[data-val-custom]');
    let allValid = true;
    
    customFields.forEach(field => {
        if (!validateCustomField(field)) {
            allValid = false;
        }
    });
    
    return allValid;
}

function showValidationSummary(form) {
    const invalidFields = form.querySelectorAll(':invalid, .is-invalid');
    if (invalidFields.length === 0) return;
    
    let summary = form.querySelector('.validation-summary');
    if (!summary) {
        summary = document.createElement('div');
        summary.className = 'validation-summary alert alert-danger';
        form.insertBefore(summary, form.firstChild);
    }
    
    const errors = Array.from(invalidFields).map(field => {
        const label = form.querySelector(`label[for="${field.id}"]`)?.textContent || field.name;
        const message = field.validationMessage || 'Invalid value';
        return `${label}: ${message}`;
    });
    
    summary.innerHTML = `
        <h6>Please correct the following errors:</h6>
        <ul class="mb-0">
            ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
    `;
    
    summary.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showFieldSuggestion(field, message) {
    let suggestion = field.parentNode.querySelector('.field-suggestion');
    if (!suggestion) {
        suggestion = document.createElement('div');
        suggestion.className = 'field-suggestion alert alert-info alert-sm mt-1';
        field.parentNode.appendChild(suggestion);
    }
    
    suggestion.innerHTML = `<small>${message}</small>`;
    setTimeout(() => suggestion.remove(), 5000);
}

function showSecurityWarning(message) {
    const warning = document.createElement('div');
    warning.className = 'alert alert-warning alert-dismissible fade show position-fixed';
    warning.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 300px;';
    warning.innerHTML = `
        <i class="fas fa-shield-alt me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(warning);
    setTimeout(() => warning.remove(), 5000);
}

function getRequirementText(key) {
    const texts = {
        length: 'At least 8 characters',
        uppercase: 'At least one uppercase letter',
        lowercase: 'At least one lowercase letter',
        number: 'At least one number',
        special: 'At least one special character'
    };
    return texts[key] || key;
}

function getSuggestedDomain(domain, commonDomains) {
    // Simple domain suggestion logic
    return commonDomains.filter(common => 
        levenshteinDistance(domain, common) <= 2
    );
}

function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[str2.length][str1.length];
}

function isLetter(char) {
    return /^[a-zA-Z]$/.test(char);
}