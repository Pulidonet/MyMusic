// Proyecto desarrollado por Santiago Pulido Castaño

// 🎶 Editor de audio con recorte y fade
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
      showToast("🎧 Audio cargado correctamente");
    });
  };
  reader.readAsArrayBuffer(file);
});

function recortarYDescargar() {
  if (!audioBuffer) {
    showToast("⚠️ Primero sube un archivo de audio", true);
    return;
  }

  const start = parseFloat(document.getElementById("startTime").value);
  const end = parseFloat(document.getElementById("endTime").value);
  const duration = end - start;

  if (isNaN(start) || isNaN(end) || start >= end || end > audioBuffer.duration) {
    showToast("⚠️ Verifica los tiempos de inicio y fin", true);
    return;
  }

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
  showToast("✅ Recorte listo para descargar");
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

// 📥 Solicitudes de canciones sin servidor
const solicitudes = [];

function guardarSolicitud() {
  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const comentario = document.getElementById("comentario").value.trim();

  if (!nombre || !email || !comentario) {
    showToast("⚠️ Por favor completa todos los campos", true);
    return;
  }

  solicitudes.push({ nombre, email, comentario });
  showToast("✅ ¡Solicitud guardada!");

  document.getElementById("nombre").value = "";
  document.getElementById("email").value = "";
  document.getElementById("comentario").value = "";
}

function descargarCSV() {
  if (solicitudes.length === 0) {
    showToast("⚠️ No hay solicitudes para descargar", true);
    return;
  }

  let csv = "Nombre,Correo electrónico,Canción\n";
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

// 🔔 Toast de notificación
function showToast(mensaje, error = false) {
  const toast = document.createElement("div");
  toast.textContent = mensaje;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = error ? "#b30000" : "#008000";
  toast.style.color = "#fff";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "5px";
  toast.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
  toast.style.zIndex = "9999";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

