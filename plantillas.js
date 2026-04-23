const { jsPDF } = window.jspdf;

const TOTAL = 54;
let imagenes = [];

// 📥 Cargar imágenes
function cargarImagenes() {
  let promesas = [];

  for (let i = 1; i <= TOTAL; i++) {
    promesas.push(new Promise(resolve => {
      let img = new Image();

      img.src = `../imagenes/${i}.jpg`;

      img.onload = () => resolve(img);
      img.onerror = () => {
        console.error("Error cargando imagen:", img.src);
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

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter"
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  let anchoCm = parseFloat(document.getElementById("ancho").value);
  let altoCm = parseFloat(document.getElementById("alto").value);

  let anchoTotal = anchoCm * 10;
  let altoTotal = altoCm * 10;

  // Ajuste automático si excede hoja
  if (anchoTotal > pageW || altoTotal > pageH) {
    let escala = Math.min(pageW / anchoTotal, pageH / altoTotal);
    anchoTotal *= escala;
    altoTotal *= escala;
    alert("El tamaño excedía la hoja. Se ajustó automáticamente.");
  }

  let cols = 9;
  let rows = 6;

  let cartaW = anchoTotal / cols;
  let cartaH = altoTotal / rows;

  let offsetX = (pageW - anchoTotal) / 2;
  let offsetY = (pageH - altoTotal) / 2;

  for (let i = 0; i < 54; i++) {
    let col = i % cols;
    let fila = Math.floor(i / cols);

    let x = offsetX + col * cartaW;
    let y = offsetY + fila * cartaH;

    doc.addImage(imagenes[i], "JPEG", x, y, cartaW, cartaH);

    doc.setDrawColor(0);
    doc.rect(x, y, cartaW, cartaH);
  }

  console.log("Generando PDF...");

  doc.save("plantilla_54_cartas.pdf");
}

// ✅ EVENTO (SIN onclick)
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnPDF").addEventListener("click", generarPlantilla);
});
