// Script principal para la app de presupuestos

document.addEventListener('DOMContentLoaded', () => {
    // Elementos principales
    const budgetForm = document.getElementById('budget-form');
    const transactionTable = document.getElementById('transaction-table');
    const logoutBtn = document.getElementById('logout-btn');
    const registerForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-form');

    // Mostrar transacciones
    function loadTransactions() {
        if (!transactionTable) return;
        fetch('/api/transactions')
            .then(res => res.json())
            .then(data => {
                transactionTable.innerHTML = '';
                data.forEach(tx => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
						<td>${tx.fecha}</td>
						<td>${tx.descripcion}</td>
						<td>${tx.monto}</td>
						<td class="status-${tx.estado.toLowerCase()}">${tx.estado}</td>
					`;
                    transactionTable.appendChild(row);
                });
            });
    }

    // Agregar presupuesto
    if (budgetForm) {
        budgetForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(budgetForm);
            fetch('/api/budget', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    descripcion: formData.get("descripcion"),
                    monto: parseFloat(formData.get("monto"))
                })
            })

        });
    }

    // Registro de usuario
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(registerForm);
            fetch('/register', {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert('Registro exitoso, ahora puedes iniciar sesión');
                        window.location.href = '/login';
                    } else {
                        alert(data.message || 'Error en el registro');
                    }
                });
        });
    }

    // Recuperación de contraseña
    if (forgotForm) {
        forgotForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(forgotForm);
            fetch('/forgot-password', {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert('Revisa tu correo para instrucciones de recuperación');
                    } else {
                        alert(data.message || 'No se pudo enviar el correo');
                    }
                });
        });
    }

    // Cerrar sesión
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            fetch('/api/logout', { method: 'POST' })
                .then(() => {
                    window.location.href = '/login';
                });
        });
    }

    // Inicializar dashboard si corresponde
    if (transactionTable) {
        loadTransactions();
    }
});
