(function () {
  // Definimos los pasos a mostrar (puedes editar textos)
  const steps = [
    {
      title: "Bienvenida a MVP Presupuestos",
      html: `<p>Hola 👋, bienvenido(a). Esta breve guía te mostrará cómo usar la app paso a paso.</p>
             <ul>
               <li>Crearás presupuestos con varios ítems (comida, transporte, hospedaje, etc.).</li>
               <li>Los presupuestos se guardan en el navegador (LocalStorage).</li>
               <li>Puedes exportar todo a Excel cuando lo necesites.</li>
             </ul>`
    },
    {
      title: "1 — Crear un presupuesto",
      html: `<p>Haz clic en <strong>Crear Presupuesto</strong>. Se abrirá un formulario/modal para ingresar:</p>
             <ol>
               <li>Nombre del presupuesto (ej. "Viaje a Chile")</li>
               <li>Fecha</li>
               <li>Ítems: descripción y monto</li>
             </ol>`
    },
    {
      title: "2 — Agregar ítems",
      html: `<p>Pulsa <strong>+ Agregar Ítem</strong> tantas veces como necesites y completa descripción y monto.</p>
             <p>El total se calcula automáticamente abajo del formulario.</p>`
    },
    {
      title: "3 — Guardar y gestionar",
      html: `<p>Cuando termines presiona <strong>Guardar</strong>. El presupuesto aparecerá en la tabla del dashboard.</p>
             <p>Desde la tabla podrás <strong>Ver</strong>, <strong>Editar</strong> o <strong>Eliminar</strong> cada presupuesto.</p>`
    },
    {
      title: "4 — Exportar a Excel",
      html: `<p>Usa <strong>Exportar a Excel</strong> para descargar todos los presupuestos en un .xlsx con detalle por hoja.</p>`
    },
    {
      title: "¡Listo!",
      html: `<p>Ya sabes lo básico. Si quieres ver esta guía otra vez, puedes borrarla del LocalStorage o usar el botón de ayuda (si lo añades).</p>}`
    }
  ];

  const modalEl = document.getElementById("welcomeModal");
  const titleEl = document.getElementById("welcomeTitle");
  const contentEl = document.getElementById("welcomeStepContent");
  const progressEl = document.getElementById("welcomeProgress");
  const btnPrev = document.getElementById("welcomePrev");
  const btnNext = document.getElementById("welcomeNext");

  let stepIndex = 0;
  const storageKey = "mvp_presupuestos_welcome_shown";

  // Mostrar/ocultar botones según paso
  function updateButtons() {
    btnPrev.disabled = stepIndex === 0;
    btnNext.textContent = stepIndex === steps.length - 1 ? "Empezar" : "Siguiente";
    progressEl.textContent = `Paso ${stepIndex + 1} de ${steps.length}`;
  }

  function renderStep() {
    const step = steps[stepIndex];
    titleEl.textContent = step.title;
    contentEl.innerHTML = step.html;
    updateButtons();
  }

  // Abrir modal
  function openWelcomeModal() {
    renderStep();
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    // Cuando se cierre el modal, marcamos en localStorage que ya se mostró
    modalEl.addEventListener('hidden.bs.modal', () => {
      try { localStorage.setItem(storageKey, "true"); } catch (e) { /* noop */ }
    }, { once: true });
  }

  // Handlers
  btnPrev.addEventListener("click", () => {
    if (stepIndex > 0) {
      stepIndex--;
      renderStep();
    }
  });

  btnNext.addEventListener("click", () => {
    if (stepIndex < steps.length - 1) {
      stepIndex++;
      renderStep();
    } else {
      // último paso -> cerrar modal y guardar flag (modal hidden handler guardará el flag también)
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
      try { localStorage.setItem(storageKey, "true"); } catch (e) { /* noop */ }
    }
  });

  // Al cargar la página, comprobamos si ya se mostró
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(openWelcomeModal, 200);
  });

  // (Opcional) función global para forzar abrir la guía otra vez
  window.mostrarGuiaBienvenida = function () {
    // Borra flag y muestra
    setTimeout(openWelcomeModal, 100);
  };
})();
let frases = [];
let fraseIndex = 0;

// Cargar JSON
async function loadPhrases() {
  try {
    const response = await fetch("frases.json");
    frases = await response.json();
    if (!Array.isArray(frases)) frases = []; // seguridad
    changePhrase(); // mostrar la primera
    setInterval(changePhrase, 5000); // cada 5 seg
  } catch (error) {
    console.error("Error cargando JSON:", error);
  }
}

function changePhrase() {
  const quoteEl = document.getElementById("quote");
  if (frases.length > 0) {
    const { autor, frase } = frases[fraseIndex];
    quoteEl.style.opacity = 0;
    setTimeout(() => {
      quoteEl.textContent = `"${frase}" — ${autor}`;
      quoteEl.style.opacity = 1;
      fraseIndex = (fraseIndex + 1) % frases.length;
    }, 500);
  } else {
    quoteEl.textContent = "No hay frases disponibles.";
  }
}

let consejos = [];
let consejoIndex = 0;

// Cargar JSON
async function loadConsejo() {
  try {
    const response = await fetch("consejos.json");
    consejos = await response.json();
    if (!Array.isArray(consejos)) consejos = []; // seguridad
    changeConsejo(); // mostrar la primera
    setInterval(changeConsejo, 5000); // cada 5 seg
  } catch (error) {
    console.error("Error cargando JSON:", error);
  }
}

function changeConsejo() {
  const adviceEl = document.getElementById("advice");
  if (consejos.length > 0) {
    const { titulo, contenido } = consejos[consejoIndex];
    adviceEl.style.opacity = 0;
    setTimeout(() => {
      adviceEl.textContent = `"${contenido}" — ${titulo}`;
      adviceEl.style.opacity = 1;
      consejoIndex = (consejoIndex + 1) % consejos.length;
    }, 500);
  } else {
    adviceEl.textContent = "No hay frases disponibles.";
  }
}


// Iniciar cuando cargue el DOM
document.addEventListener("DOMContentLoaded", ()=>{
  loadPhrases();
  loadConsejo();
});