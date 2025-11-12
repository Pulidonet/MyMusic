// Proyecto desarrollado por Santiago Pulido Castaño
// 🎧 Editor de audio con recorte y fade
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

function recortarYDescargar() {
  if (!audioBuffer) return;

  const start = parseFloat(document.getElementById("startTime").value);
  const end = parseFloat(document.getElementById("endTime").value);
  const duration = end - start;

  const context = new AudioContext();
  const sampleRate = audioBuffer.sampleRate;
  const length = Math.floor(duration * sampleRate);
  const newBuffer = context.createBuffer(audioBuffer.numberOfChannels, length, sampleRate);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const oldData = audioBuffer.getChannelData(channel);
    const newData = newBuffer.getChannelData(channel);
    const startSample = Math.floor(start * sampleRate);

    for (let i = 0; i < length; i++) {
      let sample = oldData[startSample + i];
      const fadeIn = Math.min(1, i / (sampleRate * 1));
      const fadeOut = Math.min(1, (length - i) / (sampleRate * 1));
      sample *= Math.min(fadeIn, fadeOut);
      newData[i] = sample;
    }
  }

  exportWAV(newBuffer, sampleRate);
}

function exportWAV(buffer, sampleRate) {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length * numChannels * 2;
  const wavBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(wavBuffer);

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  let offset = 0;
  writeString(view, offset, "RIFF"); offset += 4;
  view.setUint32(offset, 36 + length, true); offset += 4;
  writeString(view, offset, "WAVE"); offset += 4;
  writeString(view, offset, "fmt "); offset += 4;
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, numChannels, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * numChannels * 2, true); offset += 4;
  view.setUint16(offset, numChannels * 2, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;
  writeString(view, offset, "data"); offset += 4;
  view.setUint32(offset, length, true); offset += 4;

  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = buffer.getChannelData(channel)[i];
      const s = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, s * 0x7FFF, true);
      offset += 2;
    }
  }

  const blob = new Blob([view], { type: "audio/wav" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "recorte.wav";
  a.click();
}

// 📝 Solicitudes tipo tareas
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

function descargarCSV() {
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
}

// 🌗 Modo oscuro toggle
document.getElementById("modoToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// 🔄 Flip del logo del colegio
document.getElementById("logoFlip").addEventListener("click", () => {
  document.getElementById("logoFlip").classList.toggle("flipped");
});
