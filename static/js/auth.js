// Authentication JavaScript - Space Theme

document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication functionality
    initAuth();
});

function initAuth() {
    // Add floating planets to background
    addFloatingPlanets();
    
    // Initialize form validation
    initFormValidation();
    
    // Initialize password strength checker
    initPasswordStrength();
    
    // Initialize form animations
    initFormAnimations();
}

// Add floating planets to the background
function addFloatingPlanets() {
    const starfield = document.querySelector('.starfield');
    if (!starfield) return;
    
    // Create floating planets
    for (let i = 0; i < 3; i++) {
        const planet = document.createElement('div');
        planet.className = 'floating-planet';
        starfield.appendChild(planet);
    }
}

// Initialize form validation
function initFormValidation() {
    const forms = document.querySelectorAll('.auth-form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('.form-input');
        
        inputs.forEach(input => {
            // Add focus/blur effects
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
                validateField(this);
            });
            
            // Real-time validation for email
            if (input.type === 'email') {
                input.addEventListener('input', function() {
                    validateEmail(this);
                });
            }
            
            // Real-time validation for password
            if (input.type === 'password' && input.name === 'password') {
                input.addEventListener('input', function() {
                    updatePasswordStrength(this.value);
                });
            }
            
            // Real-time validation for confirm password
            if (input.name === 'confirm_password') {
                input.addEventListener('input', function() {
                    validatePasswordMatch();
                });
            }
        });
        
        // Form submission validation
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error styling
    field.classList.remove('error');
    removeFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = `${getFieldLabel(fieldName)} is required.`;
    }
    
    // Specific field validations
    switch (fieldName) {
        case 'username':
            if (value && value.length < 3) {
                isValid = false;
                errorMessage = 'Username must be at least 3 characters long.';
            }
            break;
            
        case 'email':
            if (value && !isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            }
            break;
            
        case 'password':
            if (value && value.length < 6) {
                isValid = false;
                errorMessage = 'Password must be at least 6 characters long.';
            }
            break;
            
        case 'confirm_password':
            const passwordField = document.querySelector('input[name="password"]');
            if (value && passwordField && value !== passwordField.value) {
                isValid = false;
                errorMessage = 'Passwords do not match.';
            }
            break;
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Validate entire form
function validateForm(form) {
    const inputs = form.querySelectorAll('.form-input[required]');
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    // Special validation for password confirmation
    const passwordField = form.querySelector('input[name="password"]');
    const confirmPasswordField = form.querySelector('input[name="confirm_password"]');
    
    if (passwordField && confirmPasswordField) {
        if (passwordField.value !== confirmPasswordField.value) {
            showFieldError(confirmPasswordField, 'Passwords do not match.');
            isFormValid = false;
        }
    }
    
    return isFormValid;
}

// Email validation
function validateEmail(field) {
    const email = field.value.trim();
    if (email && !isValidEmail(email)) {
        showFieldError(field, 'Please enter a valid email address.');
    } else {
        removeFieldError(field);
    }
}

// Check if email is valid
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password strength checker
function initPasswordStrength() {
    const passwordField = document.querySelector('input[name="password"]');
    if (!passwordField) return;
    
    // Create password strength indicator
    const strengthContainer = document.createElement('div');
    strengthContainer.className = 'password-strength';
    strengthContainer.innerHTML = '<div class="password-strength-bar"></div>';
    
    passwordField.parentNode.appendChild(strengthContainer);
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.password-strength-bar');
    if (!strengthBar) return;
    
    const strength = calculatePasswordStrength(password);
    
    // Remove all strength classes
    strengthBar.className = 'password-strength-bar';
    
    // Add appropriate strength class
    if (password.length === 0) {
        strengthBar.style.width = '0%';
    } else if (strength < 25) {
        strengthBar.classList.add('password-strength-weak');
    } else if (strength < 50) {
        strengthBar.classList.add('password-strength-fair');
    } else if (strength < 75) {
        strengthBar.classList.add('password-strength-good');
    } else {
        strengthBar.classList.add('password-strength-strong');
    }
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 10;
    if (password.length >= 12) strength += 10;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    
    return Math.min(strength, 100);
}

// Validate password match
function validatePasswordMatch() {
    const passwordField = document.querySelector('input[name="password"]');
    const confirmPasswordField = document.querySelector('input[name="confirm_password"]');
    
    if (!passwordField || !confirmPasswordField) return;
    
    if (confirmPasswordField.value && passwordField.value !== confirmPasswordField.value) {
        showFieldError(confirmPasswordField, 'Passwords do not match.');
    } else {
        removeFieldError(confirmPasswordField);
    }
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    removeFieldError(field);
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = '#fca5a5';
    errorElement.style.fontSize = '0.75rem';
    errorElement.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorElement);
}

// Remove field error
function removeFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Get field label
function getFieldLabel(fieldName) {
    const labels = {
        'username': 'Username',
        'email': 'Email',
        'password': 'Password',
        'confirm_password': 'Confirm Password'
    };
    return labels[fieldName] || fieldName;
}

// Initialize form animations
function initFormAnimations() {
    const authCard = document.querySelector('.auth-card');
    if (!authCard) return;
    
    // Add entrance animation
    authCard.style.opacity = '0';
    authCard.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        authCard.style.transition = 'all 0.6s ease';
        authCard.style.opacity = '1';
        authCard.style.transform = 'translateY(0)';
    }, 100);
    
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.auth-button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Show loading state
function showLoading(button) {
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span> Loading...';
    
    return function hideLoading() {
        button.disabled = false;
        button.textContent = originalText;
    };
}

// Handle form submission with loading state
function handleFormSubmission(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;
    
    form.addEventListener('submit', function() {
        if (validateForm(this)) {
            const hideLoading = showLoading(submitButton);
            
            // Re-enable button after 5 seconds as fallback
            setTimeout(hideLoading, 5000);
        }
    });
}

// Initialize form submission handlers
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(handleFormSubmission);
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains('form-input')) {
            const form = activeElement.closest('form');
            if (form) {
                const inputs = Array.from(form.querySelectorAll('.form-input'));
                const currentIndex = inputs.indexOf(activeElement);
                const nextInput = inputs[currentIndex + 1];
                
                if (nextInput) {
                    e.preventDefault();
                    nextInput.focus();
                }
            }
        }
    }
});

// Add accessibility improvements
function initAccessibility() {
    // Add ARIA labels to form inputs
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        if (!input.getAttribute('aria-label')) {
            const label = input.previousElementSibling;
            if (label && label.classList.contains('form-label')) {
                input.setAttribute('aria-label', label.textContent);
            }
        }
    });
    
    // Add role to flash messages
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(message => {
        message.setAttribute('role', 'alert');
    });
}

// Initialize accessibility on page load
document.addEventListener('DOMContentLoaded', initAccessibility);
