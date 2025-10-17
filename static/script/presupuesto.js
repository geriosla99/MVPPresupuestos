let total = 0;
let presupuestoSeleccionado = null; // variable para edición/eliminar

// Helpers para localStorage
function cargarPresupuestos() {
  return JSON.parse(localStorage.getItem('presupuestos') || '[]');
}

function guardarPresupuestos(presupuestos) {
  localStorage.setItem('presupuestos', JSON.stringify(presupuestos));
}

// Al cargar
window.addEventListener("DOMContentLoaded", () => {
  mostrarPresupuestos();
  actualizarResumen(); // Asegúrate de que se llame aquí
});

// Agregar ítem
document.getElementById("agregarItem").addEventListener("click", () => {
  const tbody = document.querySelector("#tablaItems tbody");
  const fila = document.createElement("tr");
  fila.innerHTML = `
      <tr class="item-row">
        <td>
          <label class="d-md-none form-label">Descripción</label>
          <input type="text" class="form-control descripcion" placeholder="Ej. Alquiler">
        </td>
        <td>
          <label class="d-md-none form-label">Monto</label>
          <input type="number" class="form-control monto monto-item" min="0" placeholder="0">
        </td>
        <td>
          <label class="d-md-none form-label">Tipo</label>
          <select class="form-control tipo-item">
            <option value="">Seleccione aquí...</option>
            <option value="ingreso">Ingreso</option>
            <option value="gasto">Gasto</option>
          </select>
        </td>
        <td>
          <label class="d-md-none form-label">Acción</label>
          <button type="button" class="btn btn-danger btn-sm eliminar w-100">Eliminar</button>
        </td>
      </tr>
    `;
  tbody.appendChild(fila);

  fila.querySelector(".eliminar").addEventListener("click", () => {
    fila.remove();
    actualizarTotal();
  });

  fila.querySelector(".monto").addEventListener("input", actualizarTotal);
  
  fila.querySelector(".tipo-item").addEventListener("change", () => {
    actualizarTotal();
  });
});

// Helper para formatear números con separador de miles y 2 decimales
function formatCurrency(value) {
  const n = Number(value) || 0;
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Calcular total
function actualizarTotal() {
  total = 0;
  document.querySelectorAll("#tablaItems tbody tr").forEach(row => {
    const monto = parseFloat(row.querySelector(".monto").value) || 0;
    const tipo = row.querySelector(".tipo-item").value;

    if (tipo === "ingreso") {
      total += monto;
    } else if (tipo === "gasto") {
      total -= monto;
    }
  });

  document.getElementById("totalPresupuesto").textContent = formatCurrency(total);
}

// Modificar la función que maneja los items del presupuesto
function actualizarTotales() {
  let totalIngresosPresupuesto = 0;
  let totalEgresosPresupuesto = 0;

  // Recorrer todos los items de la tabla
  document.querySelectorAll('#tablaItems tbody tr').forEach(row => {
    const monto = parseFloat(row.querySelector('.monto-item').value) || 0;
    const tipo = row.querySelector('.tipo-item').value;

    if (tipo === 'ingreso') totalIngresosPresupuesto += monto;
    else if (tipo === 'gasto') totalEgresosPresupuesto += monto;
  });

  document.getElementById('totalPresupuesto').textContent =
    formatCurrency(totalIngresosPresupuesto - totalEgresosPresupuesto);
}

// Guardar presupuesto
document.getElementById("guardarPresupuesto").addEventListener("click", () => {
  const nombre = document.getElementById("nombrePresupuesto")?.value?.trim() || '';
  const fechaInicio = document.getElementById("fechaInicio")?.value || '';
  const fechaFin = document.getElementById("fechaFin")?.value || '';

  const items = [];
  let tipoVacio = false;
  document.querySelectorAll("#tablaItems tbody tr").forEach(fila => {
    const descripcion = fila.querySelector(".descripcion")?.value || '';
    const monto = parseFloat(fila.querySelector(".monto")?.value) || 0;
    const tipoItem = fila.querySelector(".tipo-item")?.value || '';
    if (!tipoItem) tipoVacio = true;
    items.push({ descripcion, monto, tipo: tipoItem });
  });

  if (!nombre || !fechaInicio || !fechaFin) {
    alert('Completa nombre, fecha inicio y fecha fin.');
    return;
  }
  if (new Date(fechaInicio) > new Date(fechaFin)) {
    alert('La fecha de inicio no puede ser posterior a la fecha fin.');
    return;
  }
  if (items.length === 0) {
    alert('Agrega al menos un ítem.');
    return;
  }
  if (tipoVacio) {
    alert('Selecciona tipo en todos los ítems.');
    return;
  }

  const presupuesto = {
    nombre,
    fechaInicio,
    fechaFin,
    items,
    totalIngresos: items.reduce((acc, item) => acc + (item.tipo === 'ingreso' ? item.monto : 0), 0),
    totalEgresos: items.reduce((acc, item) => acc + (item.tipo === 'gasto' ? item.monto : 0), 0),
    total: total || 0,
    creadoEn: new Date().toISOString()
  };

  const presupuestos = cargarPresupuestos();
  presupuestos.push(presupuesto);
  guardarPresupuestos(presupuestos);

  // Actualizar UI
  mostrarPresupuestos();
  actualizarResumen();

  // Limpiar formulario y cerrar modal
  document.getElementById("nombrePresupuesto").value = "";
  document.getElementById("fechaInicio").value = "";
  document.getElementById("fechaFin").value = "";
  document.querySelector("#tablaItems tbody").innerHTML = "";
  document.getElementById("totalPresupuesto").textContent = "0.00";

  const modal = bootstrap.Modal.getInstance(document.getElementById("modalPresupuesto"));
  modal.hide();
});

// Mostrar presupuestos
function mostrarPresupuestos() {
  const presupuestos = cargarPresupuestos();
  const tbody = document.getElementById("transaction-table");
  if (!tbody) return;
  tbody.innerHTML = '';
  presupuestos.forEach((p, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
            <td>${p.nombre}</td>
            <td>${p.fechaInicio}</td>
            <td>${p.fechaFin}</td>
            <td>$${formatCurrency(p.total || 0)}</td>
            <td>
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton${index}" data-bs-toggle="dropdown" aria-expanded="false">
                        Acciones
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${index}">
                        <li><a class="dropdown-item" href="#" onclick="verElemento(${index})">Ver</a></li>
                        <li><a class="dropdown-item" href="#" onclick="editarElemento(${index})">Editar</a></li>
                        <li><a class="dropdown-item" href="#" onclick="eliminarElemento(${index})">Eliminar</a></li>
                    </ul>
                </div>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// Resumen financiero
function actualizarResumen() {
  let ingresos = 0;
  let gastos = 0;

  const presupuestos = cargarPresupuestos();

  presupuestos.forEach(p => {
    ingresos += p.totalIngresos || 0;
    gastos += p.totalEgresos || 0;
  });

  const ahorro = ingresos - gastos;

  document.getElementById("totalIngresos").textContent = `$${formatCurrency(ingresos)}`;
  document.getElementById("totalGastos").textContent = `$${formatCurrency(gastos)}`;
  document.getElementById("totalAhorro").textContent = `$${formatCurrency(ahorro)}`;
}

// Editar elemento
function editarElemento(index) {
  let presupuestos = cargarPresupuestos();
  presupuestoSeleccionado = index;
  const presupuesto = presupuestos[index];

  document.getElementById("editarNombre").value = presupuesto.nombre;
  document.getElementById("editarFechaInicio").value = presupuesto.fechaInicio;
  document.getElementById("editarFechaFin").value = presupuesto.fechaFin;
  document.getElementById("editarTipo").value = presupuesto.tipo;
  // ... resto del código de edición
}

// Guardar edición
document.getElementById("guardarEdicion").addEventListener("click", () => {
  const presupuestos = cargarPresupuestos();
  if (presupuestoSeleccionado === null || !presupuestos[presupuestoSeleccionado]) return;

  const nombre = document.getElementById("editarNombre")?.value?.trim() || '';
  const fechaInicio = document.getElementById("editarFechaInicio")?.value || '';
  const fechaFin = document.getElementById("editarFechaFin")?.value || '';
  const tipo = document.getElementById("editarTipo")?.value || '';

  // Actualiza campos básicos
  presupuestos[presupuestoSeleccionado].nombre = nombre;
  presupuestos[presupuestoSeleccionado].fechaInicio = fechaInicio;
  presupuestos[presupuestoSeleccionado].fechaFin = fechaFin;
  presupuestos[presupuestoSeleccionado].tipo = tipo;

  guardarPresupuestos(presupuestos);
  mostrarPresupuestos();
  actualizarResumen();

  // cerrar modal edición
  const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditar"));
  modal.hide();
});

// ELIMINAR
function eliminarElemento(index) {
  presupuestoSeleccionado = index; // Guardar el índice del presupuesto a eliminar
  new bootstrap.Modal(document.getElementById("modalEliminar")).show();
}

document.getElementById("confirmarEliminar").addEventListener("click", () => {
  let presupuestos = cargarPresupuestos(); // Cargar presupuestos
  if (presupuestoSeleccionado === null || presupuestoSeleccionado < 0 || presupuestoSeleccionado >= presupuestos.length) return; // Verificar que el índice sea válido

  presupuestos.splice(presupuestoSeleccionado, 1); // Eliminar solo el presupuesto seleccionado
  guardarPresupuestos(presupuestos); // Guardar los cambios en localStorage
  mostrarPresupuestos(); // Actualizar la UI
  actualizarResumen(); // Actualizar el resumen financiero
  presupuestoSeleccionado = null; // Reiniciar la selección

  // cerrar modal eliminar
  bootstrap.Modal.getInstance(document.getElementById("modalEliminar")).hide();
});

// DESCARGAR
document.getElementById("descargarExcel").addEventListener("click", () => {
  const data = cargarPresupuestos();

  if (data.length === 0) {
    alert("No hay presupuestos para exportar");
    return;
  }

  const wb = XLSX.utils.book_new();
  const resumen = [["Presupuesto", "Fecha", "Tipo", "Descripción", "Monto", "Total Presupuesto"]];

  data.forEach(presupuesto => {
    if (presupuesto.items && presupuesto.items.length > 0) {
      presupuesto.items.forEach((item, idx) => {
        resumen.push([
          idx === 0 ? presupuesto.nombre : "",
          idx === 0 ? presupuesto.fecha : "",
          idx === 0 ? presupuesto.tipo : "",
          item.descripcion,
          item.monto,
          idx === 0 ? presupuesto.total : ""
        ]);
      });
    } else {
      resumen.push([presupuesto.nombre, presupuesto.fecha, presupuesto.tipo, "-", 0, presupuesto.total]);
    }
  });

  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

  data.forEach((presupuesto, index) => {
    const rows = [
      ["Nombre del Presupuesto", presupuesto.nombre],
      ["Fecha", presupuesto.fecha],
      ["Tipo", presupuesto.tipo],
      ["Descripción", "Monto"]
    ];

    presupuesto.items.forEach(item => {
      rows.push([item.descripcion, item.monto]);
    });

    rows.push([]);
    rows.push(["TOTAL", presupuesto.total]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, presupuesto.nombre || `Presupuesto${index + 1}`);
  });

  XLSX.writeFile(wb, "presupuestos_detallados.xlsx");
});

// Abrir modal simulador
document.getElementById("simularAhorro").addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("simuladorModal"));
  modal.show();
});

// Calcular simulación
document.getElementById("calcularSimulador").addEventListener("click", () => {
  const tabla = document.getElementById("transaction-table");
  const filas = tabla.querySelectorAll("tr");

  if (filas.length === 0) {
    document.getElementById("resultadoSimulador").textContent =
      "⚠️ No tienes registros en tu presupuesto. Agrega ingresos y gastos antes de simular.";
    return;
  }

  const meta = parseFloat(document.getElementById("metaAhorro").value) || 0;
  const ingresos = parseFloat(document.getElementById("totalIngresos").textContent.replace(/\D/g, "")) || 0;
  const gastos = parseFloat(document.getElementById("totalGastos").textContent.replace(/\D/g, "")) || 0;
  const ahorroDisponible = ingresos - gastos;

  if (meta <= 0) {
    alert("⚠️ Ingresa una meta válida.");
    return;
  }

  if (ahorroDisponible <= 0) {
    document.getElementById("resultadoSimulador").textContent =
      "😓 Actualmente no tienes capacidad de ahorro. Revisa tus gastos.";
    return;
  }

  const meses = parseInt(document.getElementById("mesesDeseados").value) || 0;
  if (meses <= 0) {
    alert("⚠️ Ingresa un número válido de meses.");
    return;
  }
  const ahorroMensual = Math.ceil(meta / meses);

  if (ahorroMensual > ahorroDisponible) {
    document.getElementById("resultadoSimulador").textContent =
      `❌ Para ahorrar $${meta.toLocaleString()} en ${meses} meses, necesitarías $${ahorroMensual.toLocaleString()} mensuales, pero tu capacidad máxima es $${ahorroDisponible.toLocaleString()}.`;
  } else {
    document.getElementById("resultadoSimulador").textContent =
      `✅ Para alcanzar tu meta de $${meta.toLocaleString()} en ${meses} meses, necesitas ahorrar $${ahorroMensual.toLocaleString()} cada mes.`;
  }
});

// Función para limpiar toda la información del simulador
function limpiarSimulador() {
  document.getElementById("metaAhorro").value = "";
  document.getElementById("mesesDeseados").value = "";
  document.getElementById("resultadoSimulador").textContent = "";
}

// Si usas Bootstrap modal
document.getElementById("simuladorModal").addEventListener("hidden.bs.modal", limpiarSimulador);

// VER
function verElemento(index) {
  const presupuestos = cargarPresupuestos() || [];
  const p = presupuestos[index];
  presupuestoSeleccionado = index;

  document.getElementById("verNombre").textContent = p.nombre;
  document.getElementById("verFecha").textContent = p.fechaInicio + " - " + p.fechaFin;
  document.getElementById("verTipo").textContent = p.tipo || '';
  document.getElementById("verTotal").textContent = `$${formatCurrency(p.total || 0)}`;

  const itemsList = document.getElementById("verItems");
  itemsList.innerHTML = "";
  p.items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.descripcion}: $${formatCurrency(item.monto)}`;
    itemsList.appendChild(li);
  });

  new bootstrap.Modal(document.getElementById("modalVer")).show();
}

// EDITAR
function editarElemento(index) {
  const presupuestos = JSON.parse(localStorage.getItem("presupuestos")) || [];
  const p = presupuestos[index];
  presupuestoSeleccionado = index;

  document.getElementById("editarNombre").value = p.nombre;
  document.getElementById("editarFecha").value = p.fechaInicio + " - " + p.fechaFin;
  document.getElementById("editarTotal").value = p.total.toFixed(2);

  new bootstrap.Modal(document.getElementById("modalEditar")).show();
}

// ELIMINAR
function eliminarElemento(index) {
  presupuestoSeleccionado = index; // Guardar el índice del presupuesto a eliminar
  new bootstrap.Modal(document.getElementById("modalEliminar")).show();
}

document.getElementById("confirmarEliminar").addEventListener("click", () => {
  let presupuestos = cargarPresupuestos(); // Cargar presupuestos
  if (presupuestoSeleccionado === null || presupuestoSeleccionado < 0 || presupuestoSeleccionado >= presupuestos.length) return; // Verificar que el índice sea válido

  presupuestos.splice(presupuestoSeleccionado, 1); // Eliminar solo el presupuesto seleccionado
  guardarPresupuestos(presupuestos); // Guardar los cambios en localStorage
  mostrarPresupuestos(); // Actualizar la UI
  actualizarResumen(); // Actualizar el resumen financiero
  presupuestoSeleccionado = null; // Reiniciar la selección

  // cerrar modal eliminar
  bootstrap.Modal.getInstance(document.getElementById("modalEliminar")).hide();
});