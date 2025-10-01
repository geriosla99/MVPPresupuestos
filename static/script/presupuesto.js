let total = 0;

// Agregar ítem
document.getElementById("agregarItem").addEventListener("click", () => {
    const tbody = document.querySelector("#tablaItems tbody");
    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td><input type="text" class="form-control descripcion"></td>
        <td><input type="number" class="form-control monto" min="0"></td>
        <td><button type="button" class="btn btn-danger btn-sm eliminar">X</button></td>
      `;
    tbody.appendChild(fila);

    fila.querySelector(".eliminar").addEventListener("click", () => {
        fila.remove();
        actualizarTotal();
    });

    fila.querySelector(".monto").addEventListener("input", actualizarTotal);
});

// Calcular total
function actualizarTotal() {
    total = 0;
    document.querySelectorAll(".monto").forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    document.getElementById("totalPresupuesto").textContent = total.toFixed(2);
}

// Guardar presupuesto
document.getElementById("guardarPresupuesto").addEventListener("click", () => {
    const nombre = document.getElementById("nombrePresupuesto").value;
    const fecha = document.getElementById("fechaPresupuesto").value;
    const tipo = document.getElementById("tipoPresupuesto").value; // select
    const items = [];

    document.querySelectorAll("#tablaItems tbody tr").forEach(fila => {
        const descripcion = fila.querySelector(".descripcion").value;
        const monto = parseFloat(fila.querySelector(".monto").value) || 0;
        if (descripcion && monto > 0) {
            items.push({ descripcion, monto });
        }
    });

    if (!nombre || !fecha || !tipo || items.length === 0) {
        alert("⚠️ Completa todos los campos y agrega al menos un ítem.");
        return;
    }

    // Guardamos también el tipo
    const presupuesto = { nombre, fecha, tipo, items, total };

    let presupuestos = JSON.parse(localStorage.getItem("presupuestos")) || [];
    presupuestos.push(presupuesto);
    localStorage.setItem("presupuestos", JSON.stringify(presupuestos));

    alert("✅ Presupuesto guardado con éxito!");

    // Reiniciar formulario
    document.getElementById("nombrePresupuesto").value = "";
    document.getElementById("fechaPresupuesto").value = "";
    document.getElementById("tipoPresupuesto").value = "";
    document.querySelector("#tablaItems tbody").innerHTML = "";
    document.getElementById("totalPresupuesto").textContent = "0.00";

    mostrarPresupuestos();
    actualizarResumen();

    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalPresupuesto"));
    modal.hide();
});

// Mostrar presupuestos
function mostrarPresupuestos() {
    let presupuestos = JSON.parse(localStorage.getItem("presupuestos")) || [];
    const tbody = document.getElementById("transaction-table");
    tbody.innerHTML = "";

    presupuestos.forEach((p, index) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${index + 1}</td>
          <td data-label="Categoría">${p.nombre}</td>
          <td data-label="Fecha">${p.fecha}</td>
          <td data-label="Tipo">${p.tipo}</td>
          <td data-label="Monto">$${p.total.toFixed(2)}</td>
          <td class="row g-2" data-label="Acciones">
              <button class="btn btn-primary btn-sm col-4" onclick="verElemento(${index})">Ver</button>
              <button class="btn btn-warning btn-sm col-4" onclick="editarElemento(${index})">Editar</button>
              <button class="btn btn-danger btn-sm col-4" onclick="eliminarElemento(${index})">Eliminar</button>
          </td>
        `;
        tbody.appendChild(fila);
    });
}

// Resumen financiero
function actualizarResumen() {
  let ingresos = 0;
  let gastos = 0;

  const presupuestos = JSON.parse(localStorage.getItem("presupuestos")) || [];

  presupuestos.forEach(p => {
    if (p.tipo === "ingreso") {
      ingresos += p.total || 0;
    } else if (p.tipo === "gasto") {
      gastos += p.total || 0;
    }
  });

  const ahorro = ingresos - gastos;

  document.getElementById("totalIngresos").textContent = ingresos.toLocaleString();
  document.getElementById("totalGastos").textContent = gastos.toLocaleString();
  document.getElementById("totalAhorro").textContent = ahorro.toLocaleString();
}

// Al cargar
window.addEventListener("DOMContentLoaded",()=>{
  mostrarPresupuestos();
  actualizarResumen();
});

let presupuestoSeleccionado = null;

// VER
function verElemento(index) {
  console.log("Ver elemento en índice:", index);
  const presupuestos = JSON.parse(localStorage.getItem("presupuestos")) || [];
  const p = presupuestos[index];
  presupuestoSeleccionado = index;
  console.log("Presupuesto seleccionado:", p);
  document.getElementById("verNombre").textContent = p.nombre;
  document.getElementById("verFecha").textContent = p.fecha;
  document.getElementById("verTipo").textContent = p.tipo;
  document.getElementById("verTotal").textContent = p.total.toFixed(2);

  const itemsList = document.getElementById("verItems");
  itemsList.innerHTML = "";
  p.items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.descripcion}: $${item.monto}`;
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
  document.getElementById("editarFecha").value = p.fecha;
  document.getElementById("editarTotal").value = p.total.toFixed(2);

  new bootstrap.Modal(document.getElementById("modalEditar")).show();
}

document.getElementById("guardarEdicion").addEventListener("click", () => {
  let presupuestos = JSON.parse(localStorage.getItem("presupuestos")) || [];
  presupuestos[presupuestoSeleccionado].nombre = document.getElementById("editarNombre").value;
  presupuestos[presupuestoSeleccionado].fecha = document.getElementById("editarFecha").value;
  localStorage.setItem("presupuestos", JSON.stringify(presupuestos));
  mostrarPresupuestos();
  actualizarResumen();
  bootstrap.Modal.getInstance(document.getElementById("modalEditar")).hide();
});

// ELIMINAR
function eliminarElemento(index) {
  presupuestoSeleccionado = index;
  new bootstrap.Modal(document.getElementById("modalEliminar")).show();
}

document.getElementById("confirmarEliminar").addEventListener("click", () => {
  let presupuestos = JSON.parse(localStorage.getItem("presupuestos")) || [];
  presupuestos.splice(presupuestoSeleccionado, 1);
  localStorage.setItem("presupuestos", JSON.stringify(presupuestos));
  mostrarPresupuestos();
  actualizarResumen();
  bootstrap.Modal.getInstance(document.getElementById("modalEliminar")).hide();
});

// DESCARGAR
document.getElementById("descargarExcel").addEventListener("click", () => {
  const data = JSON.parse(localStorage.getItem("presupuestos")) || [];

  if (data.length === 0) {
    alert("No hay presupuestos para exportar");
    return;
  }

  const wb = XLSX.utils.book_new();

  // 1) Hoja general con la tabla completa + detalle de ítems
  const resumen = [["Presupuesto", "Fecha", "Tipo", "Descripción", "Monto", "Total Presupuesto"]];
  
  data.forEach(presupuesto => {
    if (presupuesto.items && presupuesto.items.length > 0) {
      presupuesto.items.forEach((item, idx) => {
        resumen.push([
          idx === 0 ? presupuesto.nombre : "", // solo mostramos nombre en la primera fila
          idx === 0 ? presupuesto.fecha : "",
          idx === 0 ? presupuesto.tipo : "",
          item.descripcion,
          item.monto,
          idx === 0 ? presupuesto.total : "" // total solo en la primera fila
        ]);
      });
    } else {
      // si no tiene items, igual se registra
      resumen.push([presupuesto.nombre, presupuesto.fecha, presupuesto.tipo, "-", 0, presupuesto.total]);
    }
  });

  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

  // 2) Hojas detalladas de cada presupuesto
  data.forEach((presupuesto, index) => {
    const rows = [
      ["Nombre del Presupuesto", presupuesto.nombre],
      ["Fecha", presupuesto.fecha],
      ["Tipo", presupuesto.tipo],
      [],
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

  // Descargar archivo
  XLSX.writeFile(wb, "presupuestos_detallados.xlsx");
});

// Abrir modal simulador
document.getElementById("simularAhorro").addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("simuladorModal"));
  modal.show();
});

// Mostrar campos según modo
document.getElementById("modoSimulador").addEventListener("change", (e) => {
  const modo = e.target.value;
  document.getElementById("campoMeses").style.display = (modo === "meses") ? "block" : "none";
  document.getElementById("campoAhorroMensual").style.display = (modo === "ahorroMensual") ? "block" : "none";
});

// Calcular simulación
document.getElementById("calcularSimulador").addEventListener("click", () => {
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

  const modo = document.getElementById("modoSimulador").value;

  if (modo === "meses") {
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

  } else if (modo === "ahorroMensual") {
    let ahorroMensualDeseado = parseFloat(document.getElementById("ahorroMensual").value) || 0;
    if (ahorroMensualDeseado <= 0) {
      alert("⚠️ Ingresa un ahorro mensual válido.");
      return;
    }

    if (ahorroMensualDeseado > ahorroDisponible) {
      ahorroMensualDeseado = ahorroDisponible;
    }

    const meses = Math.ceil(meta / ahorroMensualDeseado);

    document.getElementById("resultadoSimulador").textContent =
      `✅ Con un ahorro mensual de $${ahorroMensualDeseado.toLocaleString()}, alcanzarás tu meta de $${meta.toLocaleString()} en aproximadamente ${meses} meses.`;
  }
});
