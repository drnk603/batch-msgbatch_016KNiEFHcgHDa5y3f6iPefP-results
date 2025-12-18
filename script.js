(function() {
    'use strict';

    window.__app = window.__app || {};

    function throttle(func, delay) {
        var timeoutId;
        var lastExecTime = 0;
        return function() {
            var context = this;
            var args = arguments;
            var currentTime = Date.now();
            if (currentTime - lastExecTime > delay) {
                func.apply(context, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(function() {
                    func.apply(context, args);
                    lastExecTime = Date.now();
                }, delay);
            }
        };
    }

    function debounce(func, delay) {
        var timeoutId;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function() {
                func.apply(context, args);
            }, delay);
        };
    }

    function initBurgerMenu() {
        if (__app.burgerInit) return;
        __app.burgerInit = true;

        var toggler = document.querySelector('.navbar-toggler');
        var collapse = document.querySelector('.navbar-collapse');
        var body = document.body;

        if (!toggler || !collapse) return;

        var navLinks = collapse.querySelectorAll('.nav-link');

        function openMenu() {
            collapse.classList.add('show');
            toggler.setAttribute('aria-expanded', 'true');
            body.classList.add('u-no-scroll');
            collapse.style.height = 'calc(100vh - var(--header-h))';
        }

        function closeMenu() {
            collapse.classList.remove('show');
            toggler.setAttribute('aria-expanded', 'false');
            body.classList.remove('u-no-scroll');
            collapse.style.height = '';
        }

        toggler.addEventListener('click', function(e) {
            e.preventDefault();
            if (collapse.classList.contains('show')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && collapse.classList.contains('show')) {
                closeMenu();
            }
        });

        document.addEventListener('click', function(e) {
            if (collapse.classList.contains('show') && 
                !collapse.contains(e.target) && 
                !toggler.contains(e.target)) {
                closeMenu();
            }
        });

        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].addEventListener('click', function() {
                if (collapse.classList.contains('show')) {
                    closeMenu();
                }
            });
        }

        window.addEventListener('resize', debounce(function() {
            if (window.innerWidth >= 1024 && collapse.classList.contains('show')) {
                closeMenu();
            }
        }, 250));
    }

    function initSmoothScroll() {
        if (__app.scrollInit) return;
        __app.scrollInit = true;

        var isHomepage = location.pathname === '/' || location.pathname === '/index.html';
        var header = document.querySelector('.l-header, header');

        function getHeaderHeight() {
            return header ? header.offsetHeight : 70;
        }

        if (!isHomepage) {
            var sectionLinks = document.querySelectorAll('a[href^="#"]');
            for (var i = 0; i < sectionLinks.length; i++) {
                var link = sectionLinks[i];
                var href = link.getAttribute('href');
                if (href !== '#' && href !== '#!' && href.indexOf('#section-') === 0) {
                    link.setAttribute('href', '/' + href);
                }
            }
        }

        document.addEventListener('click', function(e) {
            var target = e.target.closest('a[href^="#"]');
            if (!target) return;

            var href = target.getAttribute('href');
            if (href === '#' || href === '#!') return;

            if (isHomepage) {
                e.preventDefault();
                var targetElement = document.querySelector(href);
                if (targetElement) {
                    var offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - getHeaderHeight();
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }

    function initScrollSpy() {
        if (__app.scrollSpyInit) return;
        __app.scrollSpyInit = true;

        var sections = document.querySelectorAll('section[id]');
        var navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        if (sections.length === 0 || navLinks.length === 0) return;

        var header = document.querySelector('.l-header, header');
        var headerHeight = header ? header.offsetHeight : 70;

        function updateActiveLink() {
            var scrollPos = window.pageYOffset + headerHeight + 100;

            for (var i = sections.length - 1; i >= 0; i--) {
                var section = sections[i];
                if (section.offsetTop <= scrollPos) {
                    var sectionId = section.getAttribute('id');
                    
                    for (var j = 0; j < navLinks.length; j++) {
                        var link = navLinks[j];
                        link.classList.remove('active');
                        link.removeAttribute('aria-current');
                        
                        if (link.getAttribute('href') === '#' + sectionId) {
                            link.classList.add('active');
                            link.setAttribute('aria-current', 'page');
                        }
                    }
                    break;
                }
            }
        }

        window.addEventListener('scroll', throttle(updateActiveLink, 100));
        updateActiveLink();
    }

    function initActiveMenuState() {
        if (__app.menuStateInit) return;
        __app.menuStateInit = true;

        var currentPath = location.pathname;
        var navLinks = document.querySelectorAll('.nav-link');

        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].removeAttribute('aria-current');
            navLinks[i].classList.remove('active');
        }

        for (var j = 0; j < navLinks.length; j++) {
            var link = navLinks[j];
            var href = link.getAttribute('href');

            if (href === currentPath || 
                (currentPath === '/' && href === '/index.html') ||
                (currentPath === '/index.html' && href === '/')) {
                link.setAttribute('aria-current', 'page');
                link.classList.add('active');
                break;
            }
        }
    }

    function initImages() {
        if (__app.imagesInit) return;
        __app.imagesInit = true;

        var images = document.querySelectorAll('img');
        
        for (var i = 0; i < images.length; i++) {
            var img = images[i];

            if (!img.hasAttribute('loading') && 
                !img.classList.contains('c-logo__img') && 
                !img.hasAttribute('data-critical')) {
                img.setAttribute('loading', 'lazy');
            }

            if (!img.classList.contains('img-fluid')) {
                img.classList.add('img-fluid');
            }

            img.style.opacity = '0';
            img.style.transform = 'translateY(20px)';
            img.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';

            (function(image) {
                if (image.complete) {
                    setTimeout(function() {
                        image.style.opacity = '1';
                        image.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    image.addEventListener('load', function() {
                        image.style.opacity = '1';
                        image.style.transform = 'translateY(0)';
                    });
                }

                image.addEventListener('error', function() {
                    var svgPlaceholder = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23e9ecef"%3E%3C/rect%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="16" fill="%236c757d"%3EBild nicht verfügbar%3C/text%3E%3C/svg%3E';
                    
                    this.src = svgPlaceholder;
                    this.style.objectFit = 'contain';
                    this.style.opacity = '1';
                    this.style.transform = 'translateY(0)';
                });
            })(img);
        }
    }

    function initVideos() {
        if (__app.videosInit) return;
        __app.videosInit = true;

        var videos = document.querySelectorAll('video');
        
        for (var i = 0; i < videos.length; i++) {
            var video = videos[i];
            
            if (!video.hasAttribute('loading')) {
                video.setAttribute('loading', 'lazy');
            }
        }
    }

    function initFormValidation() {
        if (__app.formsInit) return;
        __app.formsInit = true;

        var forms = document.querySelectorAll('.needs-validation');

        var patterns = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[\d\s\+\(\)\-]{10,20}$/,
            name: /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/,
            message: /^.{10,}$/
        };

        var errorMessages = {
            firstName: 'Bitte geben Sie einen gültigen Vornamen ein (2-50 Zeichen).',
            lastName: 'Bitte geben Sie einen gültigen Nachnamen ein (2-50 Zeichen).',
            email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
            phone: 'Bitte geben Sie eine gültige Telefonnummer ein.',
            message: 'Bitte geben Sie mindestens 10 Zeichen ein.',
            privacy: 'Sie müssen die Datenschutzerklärung akzeptieren.',
            required: 'Dieses Feld ist erforderlich.'
        };

        function showError(input, message) {
            input.classList.add('is-invalid');
            var feedback = input.parentNode.querySelector('.invalid-feedback');
            if (!feedback) {
                feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                input.parentNode.appendChild(feedback);
            }
            feedback.textContent = message;
            feedback.style.display = 'block';
        }

        function clearError(input) {
            input.classList.remove('is-invalid');
            var feedback = input.parentNode.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.style.display = 'none';
            }
        }

        function validateField(input) {
            var value = input.value.trim();
            var name = input.getAttribute('name') || input.getAttribute('id');
            var isValid = true;

            clearError(input);

            if (input.hasAttribute('required') && !value) {
                showError(input, errorMessages.required);
                return false;
            }

            if (value) {
                if ((name === 'firstName' || name === 'lastName') && !patterns.name.test(value)) {
                    showError(input, errorMessages[name]);
                    isValid = false;
                } else if (name === 'email' && !patterns.email.test(value)) {
                    showError(input, errorMessages.email);
                    isValid = false;
                } else if (name === 'phone' && value && !patterns.phone.test(value)) {
                    showError(input, errorMessages.phone);
                    isValid = false;
                } else if (name === 'message' && !patterns.message.test(value)) {
                    showError(input, errorMessages.message);
                    isValid = false;
                }
            }

            if (input.type === 'checkbox' && input.hasAttribute('required') && !input.checked) {
                showError(input, errorMessages.privacy);
                isValid = false;
            }

            return isValid;
        }

        for (var i = 0; i < forms.length; i++) {
            var form = forms[i];
            var inputs = form.querySelectorAll('input, textarea, select');

            for (var j = 0; j < inputs.length; j++) {
                var input = inputs[j];
                
                input.addEventListener('blur', function() {
                    validateField(this);
                });

                input.addEventListener('input', function() {
                    if (this.classList.contains('is-invalid')) {
                        validateField(this);
                    }
                });
            }

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                var currentForm = this;
                var formInputs = currentForm.querySelectorAll('input, textarea, select');
                var isFormValid = true;

                for (var k = 0; k < formInputs.length; k++) {
                    if (!validateField(formInputs[k])) {
                        isFormValid = false;
                    }
                }

                if (isFormValid) {
                    var submitBtn = currentForm.querySelector('[type="submit"]');
                    var originalText = submitBtn.innerHTML;
                    
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Wird gesendet...';
                    
                    setTimeout(function() {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                        window.location.href = 'thank_you.html';
                    }, 1500);
                }

                currentForm.classList.add('was-validated');
            });
        }
    }

    function initIntersectionObserver() {
        if (__app.observerInit) return;
        __app.observerInit = true;

        if (!('IntersectionObserver' in window)) return;

        var observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        var animatedElements = document.querySelectorAll('.card, .c-card, section, .accordion-item');
        
        for (var i = 0; i < animatedElements.length; i++) {
            var element = animatedElements[i];
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            observer.observe(element);
        }
    }

    function initButtonInteractions() {
        if (__app.buttonInit) return;
        __app.buttonInit = true;

        var buttons = document.querySelectorAll('.btn, .c-button, a[class*="btn"]');
        
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            
            button.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s ease-out';
            });

            button.addEventListener('click', function(e) {
                if (this.classList.contains('disabled') || this.disabled) return;

                var ripple = document.createElement('span');
                var rect = this.getBoundingClientRect();
                var size = Math.max(rect.width, rect.height);
                var x = e.clientX - rect.left - size / 2;
                var y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = 'position: absolute; border-radius: 50%; background: rgba(255,255,255,0.6); width: ' + size + 'px; height: ' + size + 'px; left: ' + x + 'px; top: ' + y + 'px; transform: scale(0); animation: ripple 0.6s ease-out; pointer-events: none;';

                var style = document.createElement('style');
                if (!document.getElementById('ripple-animation')) {
                    style.id = 'ripple-animation';
                    style.textContent = '@keyframes ripple { to { transform: scale(4); opacity: 0; } }';
                    document.head.appendChild(style);
                }

                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);

                setTimeout(function() {
                    ripple.remove();
                }, 600);
            });
        }
    }

    function initCountUp() {
        if (__app.countUpInit) return;
        __app.countUpInit = true;

        var counters = document.querySelectorAll('[data-count]');
        
        if (counters.length === 0) return;

        function animateCounter(element) {
            var target = parseInt(element.getAttribute('data-count'));
            var duration = 2000;
            var start = 0;
            var increment = target / (duration / 16);
            var current = start;

            function updateCounter() {
                current += increment;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target;
                }
            }

            updateCounter();
        }

        if ('IntersectionObserver' in window) {
            var counterObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            for (var i = 0; i < counters.length; i++) {
                counterObserver.observe(counters[i]);
            }
        }
    }

    function initScrollToTop() {
        if (__app.scrollTopInit) return;
        __app.scrollTopInit = true;

        var scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '↑';
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
        scrollBtn.style.cssText = 'position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px; background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light)); color: white; border: none; border-radius: 50%; font-size: 24px; cursor: pointer; opacity: 0; visibility: hidden; transition: all 0.3s ease-out; z-index: 999; box-shadow: 0 4px 12px rgba(76, 29, 149, 0.3);';

        document.body.appendChild(scrollBtn);

        window.addEventListener('scroll', throttle(function() {
            if (window.pageYOffset > 500) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.visibility = 'visible';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.visibility = 'hidden';
            }
        }, 100));

        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    function initCardHoverEffects() {
        if (__app.cardHoverInit) return;
        __app.cardHoverInit = true;

        var cards = document.querySelectorAll('.card, .c-card, a.card');
        
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            
            card.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s ease-out';
            });
        }
    }

    function initAccordionEnhancements() {
        if (__app.accordionInit) return;
        __app.accordionInit = true;

        var accordionButtons = document.querySelectorAll('.accordion-button');
        
        for (var i = 0; i < accordionButtons.length; i++) {
            var button = accordionButtons[i];
            
            button.addEventListener('click', function() {
                var targetId = this.getAttribute('data-bs-target');
                var target = document.querySelector(targetId);
                
                if (target) {
                    if (target.classList.contains('show')) {
                        target.style.maxHeight = '0';
                        this.classList.add('collapsed');
                    } else {
                        target.style.maxHeight = target.scrollHeight + 'px';
                        this.classList.remove('collapsed');
                    }
                }
            });
        }
    }

    function initModalPrivacy() {
        if (__app.modalInit) return;
        __app.modalInit = true;

        var privacyLinks = document.querySelectorAll('a[href*="privacy"]');
        
        for (var i = 0; i < privacyLinks.length; i++) {
            privacyLinks[i].addEventListener('click', function(e) {
                if (this.getAttribute('href') === '#' || this.getAttribute('href') === 'privacy.html') {
                    e.preventDefault();
                    
                    var modal = document.createElement('div');
                    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1060; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease-out;';
                    
                    var modalContent = document.createElement('div');
                    modalContent.style.cssText = 'background: white; padding: 2rem; border-radius: 0.75rem; max-width: 600px; max-height: 80vh; overflow-y: auto; transform: scale(0.9); transition: transform 0.3s ease-out;';
                    modalContent.innerHTML = '<h3>Datenschutzerklärung</h3><p>Hier finden Sie unsere Datenschutzerklärung...</p><button class="btn btn-primary mt-3">Schließen</button>';
                    
                    modal.appendChild(modalContent);
                    document.body.appendChild(modal);
                    
                    setTimeout(function() {
                        modal.style.opacity = '1';
                        modalContent.style.transform = 'scale(1)';
                    }, 10);
                    
                    var closeBtn = modalContent.querySelector('button');
                    closeBtn.addEventListener('click', function() {
                        modal.style.opacity = '0';
                        modalContent.style.transform = 'scale(0.9)';
                        setTimeout(function() {
                            modal.remove();
                        }, 300);
                    });
                    
                    modal.addEventListener('click', function(e) {
                        if (e.target === modal) {
                            closeBtn.click();
                        }
                    });
                }
            });
        }
    }

    __app.init = function() {
        if (__app.initialized) return;
        __app.initialized = true;

        initBurgerMenu();
        initSmoothScroll();
        initScrollSpy();
        initActiveMenuState();
        initImages();
        initVideos();
        initFormValidation();
        initIntersectionObserver();
        initButtonInteractions();
        initCountUp();
        initScrollToTop();
        initCardHoverEffects();
        initAccordionEnhancements();
        initModalPrivacy();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', __app.init);
    } else {
        __app.init();
    }

})();
