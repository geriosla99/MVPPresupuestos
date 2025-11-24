document.addEventListener("DOMContentLoaded", () => {
  let total = 0;
  let presupuestoSeleccionado = null;

  // === ✅ Formateador con símbolo de pesos ===
  const formatoMoneda = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
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

  // Función de formateo local (no necesita estar en window)
  function formatearMiles(valor) {
    valor = String(valor).replace(/\D/g, '');
    return valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // Delegación de eventos: escucha inputs dentro de la tabla (verifica existencia)
  const tablaItemsTbody = document.querySelector('#tablaItems tbody');
  if (tablaItemsTbody) {
    tablaItemsTbody.addEventListener('input', (e) => {
      const target = e.target;
      if (target.classList.contains('monto-item')) {
        const cursorPos = target.selectionStart; // opcional: intentar mantener cursor
        const oldLength = target.value.length;

        target.value = formatearMiles(target.value);

        // Opcional: intentar restablecer cursor (no perfecto con puntos)
        const newLength = target.value.length;
        const diff = newLength - oldLength;
        try { target.setSelectionRange(cursorPos + diff, cursorPos + diff); } catch (err) { }
      }
    });
  }

  const btnAgregar = document.getElementById("agregarItem");
  if (btnAgregar) {
    btnAgregar.addEventListener("click", () => {
      const tbody = document.querySelector("#tablaItems tbody");
      if (!tbody) return;

      const fila = document.createElement("tr");

      // uso de form-floating para inputs (floating labels)
      fila.innerHTML = `
        <td>
          <div class="form-floating">
            <input type="text" class="form-control descripcion" id="descTemp" placeholder="Descripción">
            <label for="descTemp">Descripción</label>
          </div>
        </td>
        <td>
          <div class="form-floating">
            <input type="text" class="form-control monto monto-item text-end" id="montoTemp" placeholder="0">
            <label for="montoTemp">Monto</label>
          </div>
        </td>
        <td>
          <div class="form-floating">
            <select class="form-select tipo-item" id="tipoTemp">
              <option value="">Seleccione...</option>
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>
            <label for="tipoTemp">Tipo</label>
          </div>
        </td>
        <td><button type="button" class="btn btn-danger btn-sm eliminar w-100">Eliminar</button></td>
      `;

      tbody.appendChild(fila);

      // Evento eliminar fila
      fila.querySelector(".eliminar").addEventListener("click", () => {
        fila.remove();
        if (typeof actualizarTotal === 'function') actualizarTotal();
      });
    });
  }

  // Ejemplo simple de actualizarTotal (adaptalo a tu lógica)
  function actualizarTotal() {
    const filas = document.querySelectorAll('#tablaItems tbody tr');
    let totalIngresos = 0;
    let totalGastos = 0;

    filas.forEach(row => {
      const montoInput = row.querySelector('.monto-item');
      const tipo = row.querySelector('.tipo-item')?.value;
      if (!montoInput || !tipo) return;

      // quitar puntos y convertir a número
      const raw = montoInput.value.replace(/\./g, '');
      const num = raw ? parseFloat(raw) : 0;

      if (tipo === 'ingreso') totalIngresos += num;
      if (tipo === 'gasto') totalGastos += num;
    });

    // muestra por consola; cambia por donde quieras actualizar el DOM
    console.log('Ingresos:', totalIngresos, 'Gastos:', totalGastos, 'Neto:', totalIngresos - totalGastos);
  }
  // === Guardar presupuesto ===
  const btnGuardarPresupuesto = document.getElementById("guardarPresupuesto");
  if (btnGuardarPresupuesto) {
    btnGuardarPresupuesto.addEventListener("click", () => {
      // recalcula totales antes de construir el objeto (asegura que `total` esté actualizado)
      if (typeof actualizarTotal === "function") actualizarTotal();

      const nombre = document.getElementById("nombrePresupuesto").value.trim();
      const fechaInicio = document.getElementById("fechaInicio").value;
      const fechaFin = document.getElementById("fechaFin").value;

      const items = [];
      let tipoVacio = false;

      document.querySelectorAll("#tablaItems tbody tr").forEach(fila => {
        const descripcion = (fila.querySelector(".descripcion")?.value || "").trim();
        // buscar input monto por ambas clases para mayor compatibilidad
        const montoEl = fila.querySelector(".monto") || fila.querySelector(".monto-item");
        const montoStr = (montoEl?.value || "").replace(/\./g, '').replace(/,/g, '.');
        const monto = parseFloat(montoStr) || 0;
        const tipoItem = fila.querySelector(".tipo-item")?.value || '';
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

      const totalIngresos = items.reduce((a, i) => a + (i.tipo === "ingreso" ? i.monto : 0), 0);
      const totalEgresos = items.reduce((a, i) => a + (i.tipo === "gasto" ? i.monto : 0), 0);
      const neto = totalIngresos - totalEgresos;

      const presupuesto = {
        nombre,
        fechaInicio,
        fechaFin,
        items,
        totalIngresos,
        totalEgresos,
        total: neto,
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

      const modalInstance = bootstrap.Modal.getInstance(document.getElementById("modalPresupuesto"));
      if (modalInstance) modalInstance.hide();
    });
  }

  // === ✅ Mostrar presupuestos con formato (más robusto) ===
  function mostrarPresupuestos() {
    const presupuestos = cargarPresupuestos();

    // localizar contenedor: puede ser tbody o tabla o div
    const cont = document.getElementById("transaction-table")
              || document.getElementById("tablaPresupuestosBody")
              || document.querySelector("#tablaPresupuestos tbody")
              || document.querySelector("#tablaPresupuestos");
    if (!cont) return;

    // si es <table>, usamos su tbody si existe
    let tbody = cont;
    if (cont.tagName === "TABLE") {
      tbody = cont.tBodies[0] || cont;
    }

    tbody.innerHTML = "";

    presupuestos.forEach((p, index) => {
      const fila = document.createElement("tr");
      // usar formato consistente y seguro
      const totalFormateado = formatoMoneda.format(Number(p.total || 0));
      fila.innerHTML = `
        <td>${p.nombre || ""}</td>
        <td>${p.fechaInicio || ""}</td>
        <td>${totalFormateado}</td>
        <td>
          <div class="dropdown">
            <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="acciones${index}" data-bs-toggle="dropdown" aria-expanded="false">
              Acciones
            </button>
            <ul class="dropdown-menu" aria-labelledby="acciones${index}">
              <li><a class="dropdown-item ver" href="#" data-index="${index}">Ver</a></li>
              <li><a class="dropdown-item editar" href="#" data-index="${index}">Editar</a></li>
              <li><a class="dropdown-item eliminar" href="#" data-index="${index}">Eliminar</a></li>
            </ul>
          </div>
        </td>
      `;
      tbody.appendChild(fila);
    });
  }

  // Reemplaza el listener global para usar verElemento y abrir editar correctamente
  document.addEventListener("click", (e) => {
    // ✏️ Botón Editar
    if (e.target.classList.contains("editar")) {
      e.preventDefault();
      const index = e.target.dataset.index;
      abrirModalEditar(index);
    }

    // 👁️ Botón Ver -> usar verElemento (no existe verPresupuesto)
    if (e.target.classList.contains("ver")) {
      e.preventDefault();
      const index = e.target.dataset.index;
      verElemento(index);
    }

    // 🗑️ Botón Eliminar
    if (e.target.classList.contains("eliminar")) {
      e.preventDefault();
      const index = e.target.dataset.index;
      presupuestoSeleccionado = Number(index);
      new bootstrap.Modal(document.getElementById("modalEliminar")).show();
    }
  });

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
    document.getElementById("editarTotal").value = p.total;

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

  // === ✅ Resumen formateado ===
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
  // === ✏️ ABRIR MODAL EDITAR ===
  function abrirModalEditar(index) {
    const presupuestos = cargarPresupuestos();
    const presupuesto = presupuestos[index];
    presupuestoSeleccionado = index;

    document.getElementById("editarNombre").value = presupuesto.nombre;
    document.getElementById("editarFecha").value = presupuesto.fechaInicio;
    document.getElementById("editarTotal").value = presupuesto.total.toLocaleString("es-CO");

    const tbody = document.getElementById("editarItemsBody");
    tbody.innerHTML = "";

    presupuesto.items.forEach((item, i) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
      <td><input type="text" class="form-control descripcion" value="${item.descripcion}"></td>
      <td>
        <select class="form-select tipo">
          <option value="Ingreso" ${item.tipo === "Ingreso" ? "selected" : ""}>Ingreso</option>
          <option value="Gasto" ${item.tipo === "Gasto" ? "selected" : ""}>Gasto</option>
        </select>
      </td>
      <td><input type="number" class="form-control monto" value="${item.monto}"></td>
    `;
      tbody.appendChild(fila);
    });

    new bootstrap.Modal(document.getElementById("modalEditar")).show();
  }

  // 💾 GUARDAR CAMBIOS AL EDITAR
  document.getElementById("guardarEdicion").addEventListener("click", () => {
    const presupuestos = cargarPresupuestos();
    if (presupuestoSeleccionado == null) return;

    const nombre = document.getElementById("editarNombre").value.trim();
    const fecha = document.getElementById("editarFecha").value;

    if (!nombre || !fecha) {
      alert("Completa todos los campos antes de guardar.");
      return;
    }

    const filas = document.querySelectorAll("#editarItemsBody tr");
    const items = [];
    let totalIngresos = 0;
    let totalEgresos = 0;

    filas.forEach(fila => {
      const descripcion = fila.querySelector(".descripcion").value.trim();
      const tipo = fila.querySelector(".tipo").value;
      const monto = parseFloat(fila.querySelector(".monto").value) || 0;

      if (descripcion) {
        items.push({ descripcion, tipo, monto });
        if (tipo === "Ingreso") totalIngresos += monto;
        else totalEgresos += monto;
      }
    });

    presupuestos[presupuestoSeleccionado] = {
      ...presupuestos[presupuestoSeleccionado],
      nombre,
      fechaInicio: fecha,
      totalIngresos,
      totalEgresos,
      total: totalIngresos - totalEgresos,
      items
    };

    guardarPresupuestos(presupuestos);
    mostrarPresupuestos();
    actualizarResumen();

    presupuestoSeleccionado = null;
    bootstrap.Modal.getInstance(document.getElementById("modalEditar")).hide();
  });

  // 🔄 ACTUALIZAR TOTAL AUTOMÁTICAMENTE EN EDICIÓN
  function actualizarTotalEditar() {
    let total = 0;
    const filas = document.querySelectorAll("#editarItemsBody tr");

    filas.forEach(fila => {
      const tipo = fila.querySelector(".tipo").value;
      const monto = parseFloat(fila.querySelector(".monto").value) || 0;
      if (tipo === "Ingreso") total += monto;
      else total -= monto;
    });

    document.getElementById("editarTotal").value = total.toLocaleString("es-CO");
  }

  document.addEventListener("input", (e) => {
    if (e.target.closest("#editarItemsBody") && e.target.classList.contains("monto")) {
      actualizarTotalEditar();
    }
  });


  document.getElementById("descargarExcel").addEventListener("click", descargarExcel);

  function descargarExcel() {
    const presupuestos = cargarPresupuestos();
    if (!presupuestos.length) {
      alert("No hay presupuestos guardados.");
      return;
    }

    const wb = XLSX.utils.book_new();

    // Hoja Resumen
    const resumen = [["#", "Presupuesto", "Fecha inicio", "Fecha fin", "Tipo", "Descripción", "Monto", "Total Presupuesto"]];
    presupuestos.forEach((p, idx) => {
      if (Array.isArray(p.items) && p.items.length) {
        p.items.forEach((it, i) => {
          resumen.push([
            idx + 1,
            i === 0 ? p.nombre || "" : "",
            i === 0 ? p.fechaInicio || "" : "",
            i === 0 ? p.fechaFin || "" : "",
            it.tipo || "",
            it.descripcion || "",
            Number(it.monto || 0),
            i === 0 ? Number(p.total || 0) : ""
          ]);
        });
      } else {
        resumen.push([idx + 1, p.nombre || "", p.fechaInicio || "", p.fechaFin || "", p.tipo || "", "-", 0, Number(p.total || 0)]);
      }
    });

    const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

    // Hojas detalladas por presupuesto
    presupuestos.forEach((p, idx) => {
      const rows = [
        ["Nombre", p.nombre || ""],
        ["Fecha inicio", p.fechaInicio || ""],
        ["Fecha fin", p.fechaFin || ""],
        [],
        ["Descripción", "Tipo", "Monto"]
      ];
      (p.items || []).forEach(it => {
        rows.push([it.descripcion || "", it.tipo || "", Number(it.monto || 0)]);
      });
      rows.push([]);
      rows.push(["TOTAL", Number(p.total || 0)]);
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const name = (p.nombre || `Presupuesto${idx+1}`).toString().substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, name);
    });

    XLSX.writeFile(wb, "presupuestos_detallados.xlsx");
  }

});