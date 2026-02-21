/**
 * ================================================================
 * TINY WHEELS — Main JavaScript
 * Handles: Mobile nav, form validation, Google Apps Script POST,
 *          WhatsApp redirect, scroll-reveal animations.
 * ================================================================
 */

// =================================================================
// 1. MOBILE NAVIGATION TOGGLE
// =================================================================
const hamburger = document.getElementById('hamburger');
const nav       = document.getElementById('nav');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('open');
});

// Close mobile nav when a link is clicked
nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        nav.classList.remove('open');
    });
});


// =================================================================
// 2. GOOGLE APPS SCRIPT URL (REPLACE THIS!)
// =================================================================
// After deploying your Google Apps Script as a Web App, paste
// the URL below. It will look something like:
// https://script.google.com/macros/s/XXXXXXX/exec
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL';


// =================================================================
// 3. WHATSAPP CONFIGURATION
// =================================================================
const WHATSAPP_NUMBER = '919061512440';


// =================================================================
// 4. FORM HANDLING
// =================================================================
const form       = document.getElementById('bookingForm');
const submitBtn  = document.getElementById('submitBtn');
const successMsg = document.getElementById('formSuccess');
const errorMsg   = document.getElementById('formError');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide any previous messages
    successMsg.classList.remove('show');
    errorMsg.classList.remove('show');

    // --- Validate ---
    const isValid = validateForm();
    if (!isValid) return;

    // --- Collect form data ---
    const formData = {
        fullName:      document.getElementById('fullName').value.trim(),
        phone:         document.getElementById('phone').value.trim(),
        address:       document.getElementById('address').value.trim(),
        serviceType:   document.getElementById('serviceType').value,
        toyType:       document.getElementById('toyType').value,
        preferredDate: document.getElementById('preferredDate').value,
        problem:       document.getElementById('problem').value.trim()
    };

    // --- Show loading state ---
    submitBtn.classList.add('btn--loading');

    try {
        // --- Send data to Google Apps Script ---
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',  // Required for Google Apps Script
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        // Note: With 'no-cors', response is opaque — we assume success
        // if no error is thrown. The Google Apps Script should handle
        // errors on its end.

        // --- Show success message ---
        successMsg.classList.add('show');
        form.style.display = 'none';

        // --- Redirect to WhatsApp after 2 seconds ---
        setTimeout(() => {
            redirectToWhatsApp(formData);
        }, 2000);

    } catch (error) {
        console.error('Submission error:', error);
        errorMsg.classList.add('show');
    } finally {
        submitBtn.classList.remove('btn--loading');
    }
});


// =================================================================
// 5. FORM VALIDATION
// =================================================================

/**
 * Validates required fields and returns true if all pass.
 */
function validateForm() {
    let valid = true;

    // Full Name — required, at least 2 characters
    const fullName = document.getElementById('fullName');
    const fullNameGroup = fullName.closest('.form-group');
    if (fullName.value.trim().length < 2) {
        fullNameGroup.classList.add('has-error');
        valid = false;
    } else {
        fullNameGroup.classList.remove('has-error');
    }

    // Phone — required, must be 10+ digits (Indian numbers)
    const phone = document.getElementById('phone');
    const phoneGroup = phone.closest('.form-group');
    const phoneDigits = phone.value.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        phoneGroup.classList.add('has-error');
        valid = false;
    } else {
        phoneGroup.classList.remove('has-error');
    }

    // Address — required
    const address = document.getElementById('address');
    const addressGroup = address.closest('.form-group');
    if (address.value.trim().length < 3) {
        addressGroup.classList.add('has-error');
        valid = false;
    } else {
        addressGroup.classList.remove('has-error');
    }

    return valid;
}

// Clear error state on input
document.querySelectorAll('#bookingForm input, #bookingForm select, #bookingForm textarea')
    .forEach(field => {
        field.addEventListener('input', () => {
            field.closest('.form-group').classList.remove('has-error');
        });
    });


// =================================================================
// 6. WHATSAPP REDIRECT
// =================================================================

/**
 * Constructs the WhatsApp URL with a prefilled message
 * containing all booking details, then redirects.
 */
function redirectToWhatsApp(data) {
    const message = `Hello Tiny Wheels,

Name: ${data.fullName}
Phone: ${data.phone}
Address: ${data.address}
Service Type: ${data.serviceType}
Toy Type: ${data.toyType}
Problem: ${data.problem || 'Not specified'}
Preferred Date: ${data.preferredDate || 'Not specified'}

Please confirm my booking.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');
}


// =================================================================
// 7. SCROLL-REVEAL ANIMATIONS (IntersectionObserver)
// =================================================================
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
} else {
    // Fallback: show everything immediately
    revealElements.forEach(el => el.classList.add('visible'));
}


// =================================================================
// 8. SET MINIMUM DATE FOR DATE PICKER (today)
// =================================================================
const dateInput = document.getElementById('preferredDate');
if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
}
