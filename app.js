/**
 * MEXICOMIGO ACADEMIA - LANDING PAGE INTERACTIVITY & ENGINE
 * Implementation of responsive actions, carousel transitions, and interactive checkout.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       1. Mobile Menu Drawer Navigation
       ========================================================================== */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link, .btn-nav');

    if (mobileMenuBtn && navMenu) {
        // Toggle mobile menu drawer
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
            // Disable page scroll when mobile drawer is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'visible';
        });

        // Close mobile drawer when clicking a navigation link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'visible';
            });
        });

        // Close mobile menu if clicked outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !mobileMenuBtn.contains(e.target)) {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'visible';
            }
        });
    }

    /* ==========================================================================
       2. Plan Selection & Auto-populate Form
       ========================================================================== */
    const selectPlanButtons = document.querySelectorAll('.btn-select-plan');
    const planSelectDropdown = document.getElementById('plan-select');

    selectPlanButtons.forEach(button => {
        button.addEventListener('click', () => {
            const planValue = button.getAttribute('data-plan');
            if (planSelectDropdown && planValue) {
                // Populate dropdown option
                planSelectDropdown.value = planValue;
                
                // Trigger scroll to subscription section
                const checkoutSection = document.getElementById('assinatura');
                if (checkoutSection) {
                    checkoutSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    /* ==========================================================================
       3. Payment Method Switcher ( Pix / Card )
       ========================================================================== */
    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    const creditCardFieldsContainer = document.getElementById('credit-card-fields');
    const ccCardNum = document.getElementById('card-number');
    const ccExpiry = document.getElementById('card-expiry');
    const ccCvv = document.getElementById('card-cvv');

    function updatePaymentFieldsVisibility() {
        if (!creditCardFieldsContainer) return;
        
        const selectedMethodRadio = document.querySelector('input[name="payment-method"]:checked');
        const selectedMethod = selectedMethodRadio ? selectedMethodRadio.value : 'cartao';

        if (selectedMethod === 'pix') {
            creditCardFieldsContainer.classList.add('hide');
            // Remove required tag to avoid browser block
            if (ccCardNum) ccCardNum.removeAttribute('required');
            if (ccExpiry) ccExpiry.removeAttribute('required');
            if (ccCvv) ccCvv.removeAttribute('required');
        } else {
            creditCardFieldsContainer.classList.remove('hide');
            // Set required tag for client-side validation
            if (ccCardNum) ccCardNum.setAttribute('required', 'true');
            if (ccExpiry) ccExpiry.setAttribute('required', 'true');
            if (ccCvv) ccCvv.setAttribute('required', 'true');
        }
    }

    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', updatePaymentFieldsVisibility);
    });

    // Run once on load to ensure initial state matches radio select
    updatePaymentFieldsVisibility();

    /* ==========================================================================
       4. Form Checkout & Modal Flow
       ========================================================================== */
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutModal = document.getElementById('checkout-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const btnCloseSuccess = document.getElementById('btn-close-success');
    
    // Modal states
    const processingState = document.getElementById('modal-processing-state');
    const successCardState = document.getElementById('modal-success-card');
    const successPixState = document.getElementById('modal-success-pix');
    
    // Dynamic text selectors
    const successUserNameText = document.getElementById('success-user-name');
    const successPlanNameText = document.getElementById('success-plan-name');
    const successPixPlanText = document.getElementById('success-pix-plan');

    // Humanize plan labels
    const planNameMapping = {
        'basico': 'Plano Básico (R$ 79,90/mês)',
        'premium': 'Plano Premium (R$ 109,90/mês)',
        'performance': 'Plano Performance (R$ 149,90/mês)'
    };

    if (checkoutForm && checkoutModal) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Retrieve values
            const fullName = document.getElementById('full-name').value;
            const selectedPlanKey = planSelectDropdown.value;
            const selectedMethodVal = document.querySelector('input[name="payment-method"]:checked').value;
            
            const humanPlanName = planNameMapping[selectedPlanKey] || 'Plano Premium';
            
            // Open modal in Processing State
            processingState.style.display = 'flex';
            successCardState.style.display = 'none';
            successPixState.style.display = 'none';
            checkoutModal.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Simulate server payment processing delay (1.5s)
            setTimeout(() => {
                processingState.style.display = 'none';
                
                if (selectedMethodVal === 'cartao') {
                    // Update user card details
                    if (successUserNameText) successUserNameText.textContent = fullName;
                    if (successPlanNameText) successPlanNameText.textContent = humanPlanName;
                    
                    successCardState.style.display = 'flex';
                } else if (selectedMethodVal === 'pix') {
                    // Update user pix details
                    if (successPixPlanText) successPixPlanText.textContent = humanPlanName;
                    
                    successPixState.style.display = 'flex';
                }
            }, 1500);
        });

        // Close modal actions
        function closeModal() {
            checkoutModal.classList.remove('active');
            document.body.style.overflow = 'visible';
            // Reset form fields after checkout modal completes
            if (successCardState.style.display === 'flex' || successPixState.style.display === 'flex') {
                checkoutForm.reset();
                updatePaymentFieldsVisibility();
            }
        }

        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
        if (btnCloseSuccess) btnCloseSuccess.addEventListener('click', closeModal);
        
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && checkoutModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    /* ==========================================================================
       5. Copy PIX Key to Clipboard
       ========================================================================== */
    const btnCopyPix = document.getElementById('btn-copy-pix');
    const pixKeyText = document.getElementById('pix-key-text');

    if (btnCopyPix && pixKeyText) {
        btnCopyPix.addEventListener('click', () => {
            const keyString = pixKeyText.textContent;
            
            navigator.clipboard.writeText(keyString)
                .then(() => {
                    const originalBtnText = btnCopyPix.textContent;
                    btnCopyPix.textContent = 'Chave Copiada! ✓';
                    btnCopyPix.style.backgroundColor = '#32D74B';
                    btnCopyPix.style.color = '#FFFFFF';
                    
                    setTimeout(() => {
                        btnCopyPix.textContent = originalBtnText;
                        btnCopyPix.style.backgroundColor = '';
                        btnCopyPix.style.color = '';
                    }, 2500);
                })
                .catch(err => {
                    console.error('Falha ao copiar a chave PIX: ', err);
                    alert('Não foi possível copiar automaticamente. Por favor, selecione e copie o código manualmente.');
                });
        });
    }

    /* ==========================================================================
       6. Testimonials Carousel Engine
       ========================================================================== */
    const carouselTrack = document.getElementById('carousel-track');
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById('carousel-prev-btn');
    const nextBtn = document.getElementById('carousel-next-btn');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    
    let currentSlideIndex = 0;
    const totalSlides = carouselSlides.length;
    let autoplayInterval;

    if (carouselTrack && totalSlides > 0) {
        
        // A. Render bullet indicator nodes dynamically
        if (indicatorsContainer) {
            indicatorsContainer.innerHTML = '';
            for (let i = 0; i < totalSlides; i++) {
                const bullet = document.createElement('button');
                bullet.classList.add('indicator');
                if (i === 0) bullet.classList.add('active');
                bullet.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
                bullet.addEventListener('click', () => {
                    goToSlide(i);
                    resetAutoplay();
                });
                indicatorsContainer.appendChild(bullet);
            }
        }

        const indicators = document.querySelectorAll('.carousel-indicators .indicator');

        // B. Main transition action
        function goToSlide(index) {
            if (index < 0) {
                currentSlideIndex = totalSlides - 1;
            } else if (index >= totalSlides) {
                currentSlideIndex = 0;
            } else {
                currentSlideIndex = index;
            }

            // Translate the track horizontally
            carouselTrack.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

            // Update indicators state
            if (indicators.length > 0) {
                indicators.forEach((ind, i) => {
                    if (i === currentSlideIndex) {
                        ind.classList.add('active');
                    } else {
                        ind.classList.remove('active');
                    }
                });
            }
        }

        // C. Bind control arrows
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                goToSlide(currentSlideIndex - 1);
                resetAutoplay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                goToSlide(currentSlideIndex + 1);
                resetAutoplay();
            });
        }

        // D. Autoplay automation loop
        function startAutoplay() {
            autoplayInterval = setInterval(() => {
                goToSlide(currentSlideIndex + 1);
            }, 6000);
        }

        function resetAutoplay() {
            clearInterval(autoplayInterval);
            startAutoplay();
        }

        // Initialize autoplay
        startAutoplay();
        
        // Touch support for swiping carousel slides
        let startX = 0;
        let endX = 0;

        carouselTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        carouselTrack.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const threshold = 50; // swipe threshold in px
            if (startX - endX > threshold) {
                // Swiped left, show next
                goToSlide(currentSlideIndex + 1);
                resetAutoplay();
            } else if (endX - startX > threshold) {
                // Swiped right, show prev
                goToSlide(currentSlideIndex - 1);
                resetAutoplay();
            }
        }, { passive: true });
    }

    /* ==========================================================================
       7. Scroll Animation System (Intersection Observer)
       ========================================================================== */
    const revealElements = document.querySelectorAll(
        '.reveal-fade, .reveal-slide-up, .reveal-scale-up, .reveal-slide-left, .reveal-slide-right'
    );

    if ('IntersectionObserver' in window && revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Inject active state class to trigger transition
                    entry.target.classList.add('active');
                    // Stop watching once animated to optimize browser cycles
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null, // use browser viewport
            threshold: 0.10, // element 10% in view
            rootMargin: '0px 0px -40px 0px' // adjust bottom threshold trigger slightly
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        // Fallback for older browsers: show all sections instantly
        revealElements.forEach(element => {
            element.classList.add('active');
        });
    }
});
