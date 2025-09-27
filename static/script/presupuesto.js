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
    const tipo = document.getElementsByClassName("tipoPresupuesto").value;
    const items = [];
    console.log(tipo);
    document.querySelectorAll("#tablaItems tbody tr").forEach(fila => {
        const descripcion = fila.querySelector(".descripcion").value;
        const monto = parseFloat(fila.querySelector(".monto").value) || 0;
        if (descripcion && monto > 0) {
            items.push({ descripcion, monto });
        }
    });

    if (!nombre || !fecha || items.length === 0) {
        alert("⚠️ Completa todos los campos y agrega al menos un ítem.");
        return;
    }

    const presupuesto = { nombre, fecha, items, total };

    let presupuestos = JSON.parse(localStorage.getItem("presupuestos")) || [];
    presupuestos.push(presupuesto);
    localStorage.setItem("presupuestos", JSON.stringify(presupuestos));

    alert("✅ Presupuesto guardado con éxito!");

    // Reiniciar formulario
    document.getElementById("nombrePresupuesto").value = "";
    document.getElementById("fechaPresupuesto").value = "";
    document.querySelector("#tablaItems tbody").innerHTML = "";
    document.getElementById("totalPresupuesto").textContent = "0.00";

    mostrarPresupuestos();

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
        console.log(p, index);
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${index + 1}</td>
          <td>${p.nombre}</td>
          <td>${p.fecha}</td>
          <td>$${p.total.toFixed(2)}</td>
        <td class="justify-content-around mb-3 d-flex ">
            <button class="btn btn-primary btn-sm " onclick="verElemento(${index})">Ver</button>
            <button class="btn btn-warning btn-sm mx-3" onclick="editarElemento(${index})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="eliminarElemento(${index})">Eliminar</button>
        </td>
        `;
        tbody.appendChild(fila);
    });
}

// Al cargar
window.addEventListener("DOMContentLoaded", mostrarPresupuestos);

let presupuestoSeleccionado = null;

// VER
function verElemento(index) {
  const presupuestos = JSON.parse(localStorage.getItem("presupuestos")) || [];
  const p = presupuestos[index];
  presupuestoSeleccionado = index;

  document.getElementById("verNombre").textContent = p.nombre;
  document.getElementById("verFecha").textContent = p.fecha;
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
  bootstrap.Modal.getInstance(document.getElementById("modalEliminar")).hide();
});

document.getElementById("descargarExcel").addEventListener("click", () => {
  // 1. Obtener presupuestos de LocalStorage
  const data = JSON.parse(localStorage.getItem("presupuestos")) || [];

  if (data.length === 0) {
    alert("No hay presupuestos para exportar");
    return;
  }

  // 2. Crear workbook
  const wb = XLSX.utils.book_new();

  data.forEach((presupuesto, index) => {
    // Estructura: cabecera + items
    const rows = [
      ["Nombre del Presupuesto", presupuesto.nombre],
      ["Fecha", presupuesto.fecha],
      [],
      ["Descripción", "Monto"]
    ];

    presupuesto.items.forEach(item => {
      rows.push([item.descripcion, item.monto]);
    });

    rows.push([]);
    rows.push(["TOTAL", presupuesto.total]);

    // Convertir a sheet
    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Agregar cada presupuesto como hoja distinta
    XLSX.utils.book_append_sheet(wb, ws, presupuesto.nombre || `Presupuesto${index+1}`);
  });

  // 3. Exportar
  XLSX.writeFile(wb, "presupuestos_detallados.xlsx");
});
