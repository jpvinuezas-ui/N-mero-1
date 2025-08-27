// ========= Utilidades =========
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

async function loadJSON(path){
  try{
    const res = await fetch(path, { cache: 'no-store' });
    if(!res.ok) throw new Error(res.status);
    return await res.json();
  }catch(e){
    // silencioso: si no existe el archivo, no rompe nada
    return null;
  }
}

// ========= Menú móvil =========
document.addEventListener('DOMContentLoaded', () => {
  const btn = $('#menuBtn');
  const menu = $('#mainMenu');

  if (btn && menu) {
    btn.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth < 900) menu.classList.remove('open');
      });
    });
  }
});

// ========= Reveal =========
document.addEventListener('DOMContentLoaded', () => {
  const items = $$('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)){
    items.forEach(el => el.classList.add('reveal--visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));
});

// ========= Contadores (KPIs) =========
document.addEventListener('DOMContentLoaded', () => {
  const counters = $$('[data-counter]');
  if (!counters.length) return;

  const animate = (el, target) => {
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = `${prefix}${Math.round(target*eased).toLocaleString('es-EC')}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Si hay /data/kpis_home.json, úsalo para actualizar valores
  (async () => {
    const data = await loadJSON('data/kpis_home.json');
    // Si no existe, solo animamos lo que ya está en HTML
    const obs = new IntersectionObserver((entries, ob)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const el = e.target;
          let target = Number(el.getAttribute('data-counter')) || 0;

          // Si hay JSON, mapear por data-key (opcional)
          const key = el.getAttribute('data-key'); // ej: larvicultura_mensual, maduracion_diaria
          if (data && key){
            if (key === 'larvicultura_mensual') target = Number(data.larvicultura.produccion_mensual_mm)||target;
            if (key === 'larvicultura_bases')   target = Number(data.larvicultura.bases)||target;
            if (key === 'maduracion_diaria')    target = Number(data.maduracion.produccion_diaria_mm)||target;
            if (key === 'maduracion_bases')     target = Number(data.maduracion.bases)||target;
          }
          animate(el, target);
          ob.unobserve(el);
        }
      });
    }, {threshold:.35});
    counters.forEach(el=>obs.observe(el));
  })();
});

// ========= Tablas dinámicas =========
document.addEventListener('DOMContentLoaded', async () => {
  // Larvicultura (agenda)
  const tbodyL = $('#tabla-larvicultura tbody');
  if (tbodyL){
    const rows = await loadJSON('data/larvicultura_tabla.json');
    if (Array.isArray(rows)){
      tbodyL.innerHTML = rows.map(r => {
        const ubic = r.map_url ? `<a href="${r.map_url}" target="_blank" rel="noopener">Mapa</a>` : (r.ubicacion || '—');
        return `<tr>
          <td>${r.base}</td>
          <td>${r.siembra}</td>
          <td>${r.cosecha}</td>
          <td>${r.cantidad}</td>
        </tr>`;
      }).join('');
    }
  }

  // Maduración (producción)
  const tbodyM = $('#tabla-maduracion tbody');
  if (tbodyM){
    const rows = await loadJSON('data/maduracion_tabla.json');
    if (Array.isArray(rows)){
      tbodyM.innerHTML = rows.map(r => {
        const ubic = r.map_url ? `<a href="${r.map_url}" target="_blank" rel="noopener">${r.ubicacion||'Ubicación'}</a>` : (r.ubicacion || '—');
        return `<tr>
          <td>${r.base}</td>
          <td>${r.ubicacion || '—'}</td>
          <td>${r.capacidad_diaria}</td>
          <td>${r.observaciones || '—'}</td>
        </tr>`;
      }).join('');
    }
  }
});

// ========= Noticias (Home) =========
document.addEventListener('DOMContentLoaded', async () => {
  const newsWrap = $('#news-list'); // contenedor opcional en Home
  if (!newsWrap) return;
  const posts = await loadJSON('data/news.json');
  if (!Array.isArray(posts)) return;

  newsWrap.innerHTML = posts.slice(0,3).map(n => `
    <article class="news-card">
      ${n.image ? `<img src="${n.image}" alt="">` : ''}
      <div class="meta">${new Date(n.date).toLocaleDateString('es-EC')}</div>
      <h4><a href="${n.url}" target="_blank" rel="noopener">${n.title}</a></h4>
    </article>
  `).join('');
});
