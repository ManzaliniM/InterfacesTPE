/* bienvenida -> login <-> registro
   validación en validation.js */

document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const authCard = document.getElementById('auth-card');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');

    const startBtn = document.getElementById('start-btn');
    const goToRegister = document.getElementById('go-to-register');
    const goToLogin = document.getElementById('go-to-login');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // ---- bienvenida -> login ----
    startBtn.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        authCard.classList.remove('hidden');
        showView(loginView, registerView);
    });

    // ---- login <-> registro toggle ----
    goToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        showView(registerView, loginView);
    });

    goToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showView(loginView, registerView);
    });

    function showView(toShow, toHide) {
        toHide.classList.add('hidden');
        toHide.classList.remove('active');
        toShow.classList.remove('hidden');
        toShow.classList.add('active');
    }

    function showAuthSuccess(message) {
        loginView.classList.add('hidden');
        registerView.classList.add('hidden');
        document.getElementById('auth-success-message').textContent = message;
        document.getElementById('auth-success').classList.remove('hidden');

        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1600);
    }

    // ---- Validación ----
    setupPasswordToggles();
    setupPasswordChecklist('reg-password', 'password-checklist');

    // ---- Submit: login ----
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateRequiredFields(loginForm)) return;

        showAuthSuccess('¡Bienvenidx de nuevo!');
    });

    // ---- Submit: registro ----
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const requiredOk = validateRequiredFields(registerForm);
        const passwordsOk = validatePasswordsMatch('reg-password', 'reg-password-repeat');
        const strongOk = isPasswordStrong(document.getElementById('reg-password').value);

        if (!strongOk) {
            setFieldError('reg-password', 'La contraseña no cumple los requisitos');
        } else {
            setFieldError('reg-password', '');
        }

        if (!requiredOk || !passwordsOk || !strongOk) return;

        showAuthSuccess('¡Cuenta creada con éxito!');
    });
});