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

  console.log("Iniciando generación...");

  await cargarImagenes();

  console.log("Imágenes cargadas:", imagenes.length);

  if (imagenes.length !== 54) {
    alert("Error: deben existir exactamente 54 imágenes.");
    return;
  }

  // 📥 INPUTS
  let cantidad = parseInt(document.getElementById("cantidad").value);
  let anchoCm = parseFloat(document.getElementById("ancho").value);
  let altoCm = parseFloat(document.getElementById("alto").value);

  let anchoTotal = anchoCm * 10;
  let altoTotal = altoCm * 10;

  // 📄 PDF
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "letter"
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // 📐 MÁRGENES
  const margen = 5;
  const tolerancia = 0.5;

  const maxW = pageW - margen * 2;
  const maxH = pageH - margen * 2;

  // 🔧 AJUSTE SOLO SI EXCEDE
  if (anchoTotal > maxW + tolerancia || altoTotal > maxH + tolerancia) {
    let escala = Math.min(maxW / anchoTotal, maxH / altoTotal);
    anchoTotal *= escala;
    altoTotal *= escala;

    alert("El tamaño excedía la hoja. Se ajustó automáticamente.");
  }

  // 🧩 GRID
  let cols = 9;
  let rows = 6;

  let cartaW = anchoTotal / cols;
  let cartaH = altoTotal / rows;

  // 📍 CENTRADO
  let offsetX = (pageW - anchoTotal) / 2;
  let offsetY = (pageH - altoTotal) / 2;

  // 🔁 GENERAR LÁMINAS (UNA POR HOJA)
  for (let lamina = 0; lamina < cantidad; lamina++) {

    // ➕ Nueva hoja (excepto la primera)
    if (lamina > 0) {
      doc.addPage();
    }

    let index = 0;

    for (let fila = 0; fila < rows; fila++) {
      for (let col = 0; col < cols; col++) {

        let x = offsetX + col * cartaW;
        let y = offsetY + fila * cartaH;

        doc.addImage(imagenes[index], "JPEG", x, y, cartaW, cartaH);

        doc.setDrawColor(0);
        doc.rect(x, y, cartaW, cartaH);

        index++;
      }
    }
  }

  console.log("Generando PDF...");

  doc.save("laminas_loteria.pdf");
}

// ✅ EVENTO
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnPDF").addEventListener("click", generarPlantilla);
});
