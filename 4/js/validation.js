/* Funciones genéricas de formulario */

const PASSWORD_RULES = {
    length: (pw) => pw.length >= 8,
    uppercase: (pw) => /[A-Z]/.test(pw),
    number: (pw) => /[0-9]/.test(pw),
};

/* activa el ícono de "mostrar/ocultar"
para todos los .toggle-password del documento. */
function setupPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;

            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            btn.classList.toggle('showing', isHidden);
            btn.setAttribute(
                'aria-label',
                isHidden ? 'Ocultar contraseña' : 'Mostrar contraseña'
            );
        });
    });
}

/* conecta un input de contraseña con un <ul> checklist.
 Cada <li data-rule="..."> se marca .valid en vivo según PASSWORD_RULES. */
function setupPasswordChecklist(passwordInputId, checklistId) {
    const input = document.getElementById(passwordInputId);
    const checklist = document.getElementById(checklistId);
    if (!input || !checklist) return;

    const items = checklist.querySelectorAll('li[data-rule]');

    input.addEventListener('input', () => {
        const value = input.value;
        items.forEach((li) => {
            const rule = li.getAttribute('data-rule');
            const check = PASSWORD_RULES[rule];
            if (!check) return;
            li.classList.toggle('valid', check(value));
        });
    });
}

/** true si la contraseña cumple TODAS las reglas. */
function isPasswordStrong(password) {
    return Object.values(PASSWORD_RULES).every((check) => check(password));
}

/* muestra un mensaje de error para un input puntual.
 busca un <span class="field-error" data-error-for="ID">. */
function setFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorEl = document.querySelector(`[data-error-for="${inputId}"]`);
    if (input) input.classList.toggle('error', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
}

/* boolean, valida los campos required */
function validateRequiredFields(form) {

    let isValid = true;

    form.querySelectorAll('[required]').forEach((input) => {

        const empty =
            input.type === 'checkbox'
                ? !input.checked
                : !input.value.trim();

        if (empty) {

            isValid = false;

            if (input.id) {
                setFieldError(input.id, 'Este campo es obligatorio');
            }

        } else if (!input.checkValidity()) {

            isValid = false;

            if (input.id) {
                setFieldError(input.id, 'El formato no es válido');
            }

        } else if (input.id) {

            setFieldError(input.id, '');
        }
    });

    return isValid;
}

/* chequea la contraseña coincida.
 error en el segundo input */
function validatePasswordsMatch(passwordId, repeatId) {
    const password = document.getElementById(passwordId);
    const repeat = document.getElementById(repeatId);
    if (!password || !repeat) return true;

    const match = password.value === repeat.value;
    setFieldError(repeatId, match ? '' : 'Las contraseñas no coinciden');
    return match;
}