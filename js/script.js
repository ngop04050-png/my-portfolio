const themeStorageKey = 'portfolio-theme';
const systemColorScheme = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;
const isValidTheme = (theme) => theme === 'light' || theme === 'dark';
let savedTheme = null;

try {
    const storedTheme = localStorage.getItem(themeStorageKey);
    if (isValidTheme(storedTheme)) {
        savedTheme = storedTheme;
    }
} catch (error) {
    console.warn('Không thể đọc giao diện đã lưu.', error);
}

const getSystemTheme = () => systemColorScheme && systemColorScheme.matches ? 'dark' : 'light';
const initialTheme = savedTheme || getSystemTheme();
document.documentElement.dataset.theme = initialTheme;
document.documentElement.style.colorScheme = initialTheme;

document.addEventListener('DOMContentLoaded', () => {
    const themeButtons = document.querySelectorAll('[data-theme-toggle]');
    const applyTheme = (theme) => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;

        themeButtons.forEach((button) => {
            const sunIcon = button.querySelector('[data-theme-icon="sun"]');
            const moonIcon = button.querySelector('[data-theme-icon="moon"]');
            const nextMode = theme === 'dark' ? 'sáng' : 'tối';

            if (sunIcon) {
                sunIcon.hidden = theme !== 'dark';
            }
            if (moonIcon) {
                moonIcon.hidden = theme === 'dark';
            }

            button.setAttribute('aria-pressed', String(theme === 'dark'));
            button.setAttribute('aria-label', `Chuyển sang chế độ ${nextMode}`);
            button.title = `Chuyển sang chế độ ${nextMode}`;
        });
    };

    applyTheme(initialTheme);

    themeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            applyTheme(nextTheme);
            savedTheme = nextTheme;

            try {
                localStorage.setItem(themeStorageKey, nextTheme);
            } catch (error) {
                console.warn('Không thể lưu lựa chọn giao diện.', error);
            }
        });
    });

    if (systemColorScheme) {
        const handleSystemThemeChange = (event) => {
            if (!savedTheme) {
                applyTheme(event.matches ? 'dark' : 'light');
            }
        };

        if (typeof systemColorScheme.addEventListener === 'function') {
            systemColorScheme.addEventListener('change', handleSystemThemeChange);
        } else if (typeof systemColorScheme.addListener === 'function') {
            systemColorScheme.addListener(handleSystemThemeChange);
        }
    }

    window.addEventListener('storage', (event) => {
        if (event.key !== themeStorageKey && event.key !== null) {
            return;
        }

        savedTheme = isValidTheme(event.newValue) ? event.newValue : null;
        applyTheme(savedTheme || getSystemTheme());
    });

    const yearElements = document.querySelectorAll('[data-current-year]');

    yearElements.forEach((element) => {
        element.textContent = new Date().getFullYear();
    });

    const revealElements = document.querySelectorAll('[data-reveal]');
    const prefersReducedMotion = window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (revealElements.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -40px 0px',
            threshold: 0.1
        });

        document.body.classList.add('has-reveal');
        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });
    }

    document.querySelectorAll('.site-nav').forEach((navigation) => {
        const toggle = navigation.querySelector('.nav-toggle');
        const links = navigation.querySelectorAll('.nav-links a');

        if (!toggle) {
            return;
        }

        const closeMenu = () => {
            navigation.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Mở menu điều hướng');
        };

        toggle.addEventListener('click', () => {
            const isOpen = toggle.getAttribute('aria-expanded') === 'true';
            navigation.classList.toggle('is-open', !isOpen);
            toggle.setAttribute('aria-expanded', String(!isOpen));
            toggle.setAttribute('aria-label', isOpen ? 'Mở menu điều hướng' : 'Đóng menu điều hướng');
        });

        links.forEach((link) => {
            link.addEventListener('click', closeMenu);
        });

        navigation.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
                closeMenu();
                toggle.focus();
            }
        });
    });

    const contactForm = document.querySelector('[data-formspree-form]');
    const formStatus = document.querySelector('[data-form-status]');

    if (!contactForm || !formStatus) {
        return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        formStatus.textContent = '';
        formStatus.removeAttribute('data-state');

        if (!contactForm.reportValidity()) {
            return;
        }

        const endpoint = contactForm.getAttribute('action');
        const endpointMatch = endpoint
            ? endpoint.match(/^https:\/\/formspree\.io\/f\/([a-z0-9_-]+)\/?$/i)
            : null;
        if (!endpointMatch || endpointMatch[1].toUpperCase() === 'FORM_ID') {
            formStatus.textContent = 'Form chưa được kết nối. Hãy thay FORM_ID trong thuộc tính action bằng ID thật từ Formspree trước khi gửi.';
            formStatus.dataset.state = 'error';
            return;
        }

        submitButton.disabled = true;
        submitButton.setAttribute('aria-busy', 'true');

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: {
                    Accept: 'application/json'
                }
            });

            let result = null;
            try {
                result = await response.json();
            } catch {
                result = null;
            }

            if (!response.ok) {
                const serverErrors = result && Array.isArray(result.errors)
                    ? result.errors
                        .map((error) => error && typeof error.message === 'string' ? error.message : '')
                        .filter(Boolean)
                    : [];
                const serverMessage = result && typeof result.message === 'string'
                    ? result.message
                    : serverErrors.join(' ') || 'Không thể gửi tin nhắn lúc này. Vui lòng thử lại sau.';
                formStatus.textContent = serverMessage;
                formStatus.dataset.state = 'error';
                return;
            }

            formStatus.textContent = 'Tin nhắn đã được gửi thành công. Cảm ơn bạn đã liên hệ!';
            contactForm.reset();
        } catch {
            formStatus.textContent = 'Không thể kết nối để gửi tin nhắn. Vui lòng kiểm tra kết nối mạng và thử lại.';
            formStatus.dataset.state = 'error';
        } finally {
            submitButton.disabled = false;
            submitButton.removeAttribute('aria-busy');
        }
    });
});
