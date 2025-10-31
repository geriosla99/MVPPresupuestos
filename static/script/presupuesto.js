document.addEventListener("DOMContentLoaded", () => {
  let total = 0;
  let presupuestoSeleccionado = null;

  // === Formateador de números ===
  const formatoMoneda = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // === Helpers LocalStorage ===
  function cargarPresupuestos() {
    return JSON.parse(localStorage.getItem("presupuestos") || "[]");
  }

  function guardarPresupuestos(presupuestos) {
    localStorage.setItem("presupuestos", JSON.stringify(presupuestos));
  }

  // === Cargar tabla al inicio ===
  mostrarPresupuestos();
  actualizarResumen();

  // === Agregar ítem ===
  document.getElementById("agregarItem").addEventListener("click", () => {
    const tbody = document.querySelector("#tablaItems tbody");
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td><input type="text" class="form-control descripcion" placeholder="Ej. Alquiler"></td>
      <td><input type="number" class="form-control monto monto-item" min="0" step="any" placeholder="0"></td>
      <td>
        <select class="form-control tipo-item">
          <option value="">Seleccione...</option>
          <option value="ingreso">Ingreso</option>
          <option value="gasto">Gasto</option>
        </select>
      </td>
      <td><button type="button" class="btn btn-danger btn-sm eliminar w-100">Eliminar</button></td>
    `;

    tbody.appendChild(fila);

    // Eventos
    fila.querySelector(".eliminar").addEventListener("click", () => {
      fila.remove();
      actualizarTotal();
    });

    fila.querySelector(".monto").addEventListener("input", actualizarTotal);
    fila.querySelector(".tipo-item").addEventListener("change", actualizarTotal);
  });

  // === Calcular total ===
  function actualizarTotal() {
    total = 0;
    document.querySelectorAll("#tablaItems tbody tr").forEach(row => {
      const monto = parseFloat(row.querySelector(".monto").value) || 0;
      const tipo = row.querySelector(".tipo-item").value;

      if (tipo === "ingreso") total += monto;
      else if (tipo === "gasto") total -= monto;
    });

    document.getElementById("totalPresupuesto").textContent = formatoMoneda.format(total);
  }

  // === Guardar presupuesto ===
  document.getElementById("guardarPresupuesto").addEventListener("click", () => {
    const nombre = document.getElementById("nombrePresupuesto").value.trim();
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFin = document.getElementById("fechaFin").value;

    const items = [];
    let tipoVacio = false;

    document.querySelectorAll("#tablaItems tbody tr").forEach(fila => {
      const descripcion = fila.querySelector(".descripcion").value.trim();
      const monto = parseFloat(fila.querySelector(".monto").value) || 0;
      const tipoItem = fila.querySelector(".tipo-item").value;
      if (!tipoItem) tipoVacio = true;
      items.push({ descripcion, monto, tipo: tipoItem });
    });

    if (!nombre || !fechaInicio || !fechaFin) {
      alert("Completa nombre, fecha inicio y fecha fin.");
      return;
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      alert("La fecha de inicio no puede ser posterior a la fecha fin.");
      return;
    }
    if (items.length === 0) {
      alert("Agrega al menos un ítem.");
      return;
    }
    if (tipoVacio) {
      alert("Selecciona tipo en todos los ítems.");
      return;
    }

    const presupuesto = {
      nombre,
      fechaInicio,
      fechaFin,
      items,
      totalIngresos: items.reduce((a, i) => a + (i.tipo === "ingreso" ? i.monto : 0), 0),
      totalEgresos: items.reduce((a, i) => a + (i.tipo === "gasto" ? i.monto : 0), 0),
      total,
      creadoEn: new Date().toISOString()
    };

    const presupuestos = cargarPresupuestos();
    presupuestos.push(presupuesto);
    guardarPresupuestos(presupuestos);

    mostrarPresupuestos();
    actualizarResumen();

    // Limpiar formulario
    document.getElementById("nombrePresupuesto").value = "";
    document.getElementById("fechaInicio").value = "";
    document.getElementById("fechaFin").value = "";
    document.querySelector("#tablaItems tbody").innerHTML = "";
    document.getElementById("totalPresupuesto").textContent = formatoMoneda.format(0);

    bootstrap.Modal.getInstance(document.getElementById("modalPresupuesto")).hide();
  });

  // === Mostrar presupuestos ===
  function mostrarPresupuestos() {
    const presupuestos = cargarPresupuestos();
    const tbody = document.getElementById("transaction-table");
    if (!tbody) return;

    tbody.innerHTML = "";

    presupuestos.forEach((p, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.nombre}</td>
        <td>${p.fechaInicio}</td>
        <td>${p.fechaFin}</td>
        <td>${formatoMoneda.format(p.total)}</td>
        <td>
          <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown">Acciones</button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#" data-action="ver" data-index="${index}">Ver</a></li>
              <li><a class="dropdown-item" href="#" data-action="editar" data-index="${index}">Editar</a></li>
              <li><a class="dropdown-item" href="#" data-action="eliminar" data-index="${index}">Eliminar</a></li>
            </ul>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".dropdown-item").forEach(item => {
      item.addEventListener("click", e => {
        e.preventDefault();
        const index = e.target.getAttribute("data-index");
        const action = e.target.getAttribute("data-action");
        if (action === "ver") verElemento(index);
        else if (action === "editar") editarElemento(index);
        else if (action === "eliminar") eliminarElemento(index);
      });
    });
  }

  // === Ver presupuesto ===
  function verElemento(index) {
    const presupuestos = cargarPresupuestos();
    const p = presupuestos[index];
    presupuestoSeleccionado = index;

    document.getElementById("verNombre").textContent = p.nombre;
    document.getElementById("verFecha").textContent = `${p.fechaInicio} - ${p.fechaFin}`;
    document.getElementById("verTotal").textContent = formatoMoneda.format(p.total);

    const itemsList = document.getElementById("verItems");
    itemsList.innerHTML = "";
    p.items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.descripcion}: ${formatoMoneda.format(item.monto)} (${item.tipo})`;
      itemsList.appendChild(li);
    });

    new bootstrap.Modal(document.getElementById("modalVer")).show();
  }

  // === Editar ===
  function editarElemento(index) {
    const presupuestos = cargarPresupuestos();
    const p = presupuestos[index];
    presupuestoSeleccionado = index;

    document.getElementById("editarNombre").value = p.nombre;
    document.getElementById("editarFecha").value = p.fechaInicio;
    document.getElementById("editarTotal").value = formatoMoneda.format(p.total);

    new bootstrap.Modal(document.getElementById("modalEditar")).show();
  }

  // === Eliminar ===
  function eliminarElemento(index) {
    presupuestoSeleccionado = index;
    new bootstrap.Modal(document.getElementById("modalEliminar")).show();
  }

  document.getElementById("confirmarEliminar").addEventListener("click", () => {
    const presupuestos = cargarPresupuestos();
    if (presupuestoSeleccionado == null) return;

    presupuestos.splice(presupuestoSeleccionado, 1);
    guardarPresupuestos(presupuestos);
    mostrarPresupuestos();
    actualizarResumen();
    presupuestoSeleccionado = null;

    bootstrap.Modal.getInstance(document.getElementById("modalEliminar")).hide();
  });

  // === Actualizar resumen general ===
  function actualizarResumen() {
    const presupuestos = cargarPresupuestos();
    let ingresos = 0;
    let gastos = 0;

    presupuestos.forEach(p => {
      ingresos += p.totalIngresos || 0;
      gastos += p.totalEgresos || 0;
    });

    const ahorro = ingresos - gastos;

    document.getElementById("totalIngresos").textContent = formatoMoneda.format(ingresos);
    document.getElementById("totalGastos").textContent = formatoMoneda.format(gastos);
    document.getElementById("totalAhorro").textContent = formatoMoneda.format(ahorro);
  }
});
