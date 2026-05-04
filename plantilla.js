const { jsPDF } = window.jspdf;

const TOTAL = 54;
let imagenes = [];

// 📥 Cargar imágenes
function cargarImagenes() {
  let promesas = [];

  for (let i = 1; i <= TOTAL; i++) {
    promesas.push(new Promise(resolve => {
      let img = new Image();
      img.src = `/Plantillas/imagenes/${i}.jpg`;

      img.onload = () => resolve(img);
      img.onerror = () => {
        console.error("Error cargando:", img.src);
        resolve(null);
      };
    }));
  }

  return Promise.all(promesas).then(imgs => {
    imagenes = imgs.filter(i => i !== null);
  });
}

// 🚀 GENERAR PDF
async function generarPlantilla() {

  await cargarImagenes();

  if (imagenes.length !== 54) {
    alert("Deben existir exactamente 54 imágenes.");
    return;
  }

  // 🎛️ INPUTS
  let cantidad = parseInt(document.getElementById("cantidad").value);
  let anchoCm = parseFloat(document.getElementById("ancho").value);
  let altoCm = parseFloat(document.getElementById("alto").value);
  let orientacion = document.getElementById("orientacion").value;

  let anchoLam = anchoCm * 10;
  let altoLam = altoCm * 10;

  // 📄 CREAR PDF DINÁMICO
  const doc = new jsPDF({
    orientation: orientacion,
    unit: "mm",
    format: "letter"
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // 📐 MÁRGENES (3 mm)
  const margen = 3;
const separacion = 3; // 🔥 NUEVO

  const maxW = pageW - margen * 2;
  const maxH = pageH - margen * 2;

  // 🧠 CUÁNTAS LÁMINAS CABEN POR HOJA
  let colsHoja = Math.floor(maxW / anchoLam);
  let rowsHoja = Math.floor(maxH / altoLam);

  if (colsHoja === 0 || rowsHoja === 0) {
    alert("La lámina es demasiado grande para la hoja.");
    return;
  }

  let laminasPorHoja = colsHoja * rowsHoja;

  // 🧾 DEBUG (puedes quitar después)
  console.log("Orientación:", orientacion);
  console.log("Columnas:", colsHoja);
  console.log("Filas:", rowsHoja);
  console.log("Por hoja:", laminasPorHoja);

  let laminaActual = 0;

  while (laminaActual < cantidad) {

    let usadas = Math.min(laminasPorHoja, cantidad - laminaActual);

    // 📍 CENTRADO
    let anchoUsado = colsHoja * anchoLam;
    let altoUsado = rowsHoja * altoLam;

    let offsetX = (pageW - anchoUsado) / 2;
    let offsetY = (pageH - altoUsado) / 2;

    for (let i = 0; i < usadas; i++) {

      let col = i % colsHoja;
      let fila = Math.floor(i / colsHoja);

      let baseX = offsetX + col * anchoLam;
      let baseY = offsetY + fila * altoLam;

      // 🧩 GRID INTERNO (9x6)
      let cols = 9;
      let rows = 6;

      let cartaW = anchoLam / cols;
      let cartaH = altoLam / rows;

      let index = 0;

      for (let f = 0; f < rows; f++) {
        for (let c = 0; c < cols; c++) {

          let x = baseX + c * cartaW;
          let y = baseY + f * cartaH;

          doc.addImage(imagenes[index], "JPEG", x, y, cartaW, cartaH);

          // 🔲 contorno
          doc.setDrawColor(0);
          doc.rect(x, y, cartaW, cartaH);

          index++;
        }
      }
    }

    laminaActual += usadas;

    if (laminaActual < cantidad) {
      doc.addPage();
    }
  }

  doc.save("laminas_loteria.pdf");
}

// ✅ EVENTO
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnPDF").addEventListener("click", generarPlantilla);
});
