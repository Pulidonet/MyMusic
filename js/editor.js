// 🌗 Modo oscuro
document.getElementById("modoToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// 🔄 Flip del logo
document.getElementById("logoFlip").addEventListener("click", () => {
  document.getElementById("logoFlip").classList.toggle("flipped");
});

// 📝 Solicitudes
const solicitudes = [];

document.getElementById("formSolicitud").addEventListener("submit", function (e) {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const comentario = document.getElementById("comentario").value.trim();

  if (!nombre || !email || !comentario) return;

  const nueva = { nombre, email, comentario };
  solicitudes.push(nueva);
  agregarSolicitud(nueva);
  this.reset();
});

function agregarSolicitud(s) {
  const lista = document.getElementById("listaSolicitudes");
  if (document.querySelector(".vacio")) lista.innerHTML = "";

  const li = document.createElement("li");
  li.textContent = `${s.nombre} pidió: "${s.comentario}"`;

  const btn = document.createElement("button");
  btn.textContent = "🗑️";
  btn.onclick = () => {
    lista.removeChild(li);
    const i = solicitudes.indexOf(s);
    if (i !== -1) solicitudes.splice(i, 1);
    if (solicitudes.length === 0) {
      lista.innerHTML = '<li class="vacio">Ninguna solicitud aún</li>';
    }
  };

  li.appendChild(btn);
  lista.appendChild(li);
}

document.getElementById("descargarBtn").addEventListener("click", function () {
  if (solicitudes.length === 0) return;

  let csv = "Nombre,Correo,Canción\n";
  solicitudes.forEach(s => {
    csv += `"${s.nombre}","${s.email}","${s.comentario.replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "solicitudes.csv";
  a.click();
});

// 🎧 Editor de audio
const audioFileInput = document.getElementById("audioFile");
const audioPlayer = document.getElementById("audioPlayer");
let audioBuffer = null;

audioFileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const context = new AudioContext();
    context.decodeAudioData(e.target.result, function (buffer) {
      audioBuffer = buffer;
      const url = URL.createObjectURL(file);
      audioPlayer.src = url;
    });
  };
  reader.readAsArrayBuffer(file);
});

document.getElementById("recortarBtn").addEventListener("click", recortarYDescargar);

function recortarYDescargar() {
  if (!audioBuffer) return;

  const start = parseFloat(document.getElementById("startTime").value);
  const end = parseFloat(document.getElementById("endTime").value);
  const duration = end - start;

  const context =
