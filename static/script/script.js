(function () {
  const modalEl = document.getElementById("welcomeModal");
  const titleEl = document.getElementById("welcomeTitle");
  const contentEl = document.getElementById("welcomeStepContent");
  const progressEl = document.getElementById("welcomeProgress");
  const btnPrev = document.getElementById("welcomePrev");
  const btnNext = document.getElementById("welcomeNext");
  const storageKey = "mvp_presupuestos_tutorial_v2";

  let steps = [];
  let stepIndex = 0;
  // === CARGAR PASOS DESDE JSON ===
  async function loadTutorialSteps() {
    try {
      const response = await fetch("../../tutorial.json");
      steps = await response.json();
      if (!Array.isArray(steps)) steps = [];
      if (steps.length > 0) {
        // Si el tutorial no se ha mostrado antes, iniciarlo
         openWelcomeModal(); // siempre mostrar el tutorial al cargar
      }
    } catch (error) {
      console.error("Error cargando tutorial.json:", error);
    }
  }

  // === FUNCIONES DE RENDER ===
  function renderStep() {
    const step = steps[stepIndex];
    if (!step) return;

    titleEl.textContent = `${step.titulo || "Paso"} ${step.paso ? "• " + step.paso : ""}`;
    contentEl.innerHTML = `
      <p>${step.descripcion || ""}</p>
      ${step.tip ? `<div class="alert alert-info mt-3"><strong>💡 Consejo:</strong> ${step.tip}</div>` : ""}
      ${step.resultado ? `<p class="mt-2"><strong>Resultado esperado:</strong> ${step.resultado}</p>` : ""}
      ${step.erroresComunes ? `<ul class="mt-2 text-danger"><strong>Evita:</strong> ${step.erroresComunes.map(e => `<li>${e}</li>`).join("")}</ul>` : ""}
    `;

    progressEl.textContent = `Paso ${stepIndex + 1} de ${steps.length}`;
    btnPrev.style.display = stepIndex === 0 ? "none" : "inline-block";
    btnNext.textContent = stepIndex === steps.length - 1 ? "Finalizar" : "Siguiente";
  }

  function openWelcomeModal() {
    renderStep();
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    // Guardar bandera al cerrar el modal
    modalEl.addEventListener(
      "hidden.bs.modal",
      () => localStorage.setItem(storageKey, "true"),
      { once: true }
    );
  }

  // === MANEJADORES ===
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
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
      localStorage.setItem(storageKey, "true");
    }
  });

  // === REINICIAR MANUALMENTE ===
  window.mostrarGuiaBienvenida = function () {
    localStorage.removeItem(storageKey);
    stepIndex = 0;
    openWelcomeModal();
  };

  // === INICIAR CUANDO CARGUE ===
  document.addEventListener("DOMContentLoaded", () => {
    loadTutorialSteps();
  });
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
    setInterval(changePhrase, 10000); // cada 5 seg
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
    setInterval(changeConsejo, 10000); // cada 5 seg
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