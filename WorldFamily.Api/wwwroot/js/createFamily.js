       // Character counter for description
        document.getElementById('Description').addEventListener('input', function() {
            const count = document.getElementById('descriptionCount');
            count.textContent = this.value.length;
            
            if (this.value.length > 900) {
                count.style.color = '#dc3545';
            } else if (this.value.length > 800) {
                count.style.color = '#ffc107';
            } else {
                count.style.color = '#6c757d';
            }
        });

        // Photo preview functionality
        function previewFamilyPhoto(input) {
            const file = input.files[0];
            const preview = document.getElementById('photoPreview');
            const previewImage = document.getElementById('previewImage');
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                preview.style.display = 'none';
            }
        }

        function removePhoto() {
            document.getElementById('familyPhoto').value = '';
            document.getElementById('photoPreview').style.display = 'none';
        }

        // Form validation enhancement
        (function() {
            'use strict';
            const form = document.querySelector('.needs-validation');
            
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
            }, false);
        })();

        // Real-time validation
        const inputs = document.querySelectorAll('input[required], textarea[required]');
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

        function validateField(field) {
            const isValid = field.checkValidity();
            
            field.classList.remove('is-valid', 'is-invalid');
            field.classList.add(isValid ? 'is-valid' : 'is-invalid');
        }

        // Privacy setting explanations
        document.querySelectorAll('input[name="IsPublic"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const explanation = document.getElementById('privacyExplanation');
                if (this.value === 'true') {
                    showToast('Public families can be discovered by anyone searching for relatives with your family name.', 'info');
                } else {
                    showToast('Private families provide complete control over who can access your family information.', 'success');
                }
            });
        });

        // Auto-save draft functionality (optional)
        let draftTimer;
        function saveDraft() {
            const formData = {
                name: document.getElementById('Name').value,
                description: document.getElementById('Description').value,
                location: document.getElementById('location').value,
                isPublic: document.querySelector('input[name="IsPublic"]:checked')?.value
            };
            
            if (formData.name || formData.description) {
                localStorage.setItem('familyDraft', JSON.stringify(formData));
                showToast('Draft saved automatically', 'info');
            }
        }

        // Load draft on page load
        window.addEventListener('load', function() {
            const savedDraft = localStorage.getItem('familyDraft');
            if (savedDraft) {
                const draft = JSON.parse(savedDraft);
                if (confirm('We found a saved draft. Would you like to load it?')) {
                    if (draft.name) document.getElementById('Name').value = draft.name;
                    if (draft.description) document.getElementById('Description').value = draft.description;
                    if (draft.location) document.getElementById('location').value = draft.location;
                    if (draft.isPublic) {
                        document.querySelector(`input[name="IsPublic"][value="${draft.isPublic}"]`).checked = true;
                    }
                    
                    // Trigger character count update
                    if (draft.description) {
                        document.getElementById('Description').dispatchEvent(new Event('input'));
                    }
                }
            }
        });

        // Save draft periodically
        document.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('input', function() {
                clearTimeout(draftTimer);
                draftTimer = setTimeout(saveDraft, 2000);
            });
        });

        // Clear draft on successful submission
        document.querySelector('form').addEventListener('submit', function() {
            localStorage.removeItem('familyDraft');
        });