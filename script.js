// Agenda de siembras/cosechas
const harvests = [
  {site:"MARCOR 1A – San Pablo (Pacoa)", sow:"07 de cada mes", size:"70 MM", harvest:"22 al 24"},
  {site:"MARCOR 1B – Ballenita", sow:"28 de cada mes", size:"70 MM", harvest:"16 al 18"},
  {site:"Pelícano A – Ballenita", sow:"21 de cada mes", size:"25 MM", harvest:"09 al 10"},
  {site:"Pelícano B – Ballenita", sow:"21 de cada mes", size:"35 MM", harvest:"09 al 10"},
  {site:"Pelícano C – Punta Carnero", sow:"15 de cada mes", size:"25 MM", harvest:"02 al 04"},
  {site:"MARCOR 2 – Ballenita", sow:"15 de cada mes", size:"50 MM", harvest:"01 al 03"}
];

function renderSchedule(){
  const box = document.getElementById('schedule-list');
  if(!box) return;
  box.innerHTML = "";
  harvests.forEach(h=>{
    const el = document.createElement('div');
    el.className = 'item';
    el.innerHTML = `<h4>${h.site}</h4>
      <div class="meta"><strong>Siembra:</strong> ${h.sow} · 
      <strong>Tamaño:</strong> ${h.size} · 
      <strong>Cosecha:</strong> ${h.harvest}</div>`;
    box.appendChild(el);
  });
}
document.addEventListener('DOMContentLoaded', renderSchedule);
