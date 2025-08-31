/**
 * MARCOR - JavaScript Configuration & Functions
 * Configuración fácil de editar para el negocio
 */

// ===== CONFIGURACIÓN EDITABLE =====
const CONFIG = {
  // KPIs para los counters del home (editar estos valores según necesidad del negocio)
  counters: {
    larvicultura_mes: 265,     // MM de larvas por mes (calculado automáticamente)
    bases_larvicultura: 6,     // Número de bases de larvicultura
    nauplios_dia: 75,         // MM de nauplios por día
    bases_maduracion: 3       // Número de bases de maduración
  },
  
  // Configuración de animaciones
  animation: {
    counterSpeed: 2000,       // Duración de animación de counters en ms
    revealDelay: 100,        // Delay entre elementos en ms
    observerThreshold: 0.1   // Threshold para Intersection Observer
  },
  
  // Mensajes de formularios
  messages: {
    success: "¡Gracias por tu interés! Te contactaremos en las próximas 24 horas.",
    error: "Ocurrió un error al enviar el formulario. Por favor, intenta nuevamente.",
    loading: "Enviando..."
  }
};

// ===== VARIABLES GLOBALES =====
let countersAnimated = false;
let observer;

// ===== FUNCIONES PRINCIPALES =====

/**
 * Calcular KPIs automáticamente desde datos de tablas
 */
function calculateKPIsFromTables() {
  // Calcular total de larvicultura desde la tabla de agenda (si existe)
  const agendaTable = document.querySelector('.agenda-table tbody');
  if (agendaTable) {
    const rows = agendaTable.querySelectorAll('tr');
    let totalLarvicultura = 0;
    let basesLarvicultura = 0;
    
    rows.forEach(row => {
      const cantidadCell = row.querySelector('td[data-label="Cantidad"]');
      if (cantidadCell) {
        // Extraer número de la celda (ej: "70 MM de larvas" -> 70)
        const match = cantidadCell.textContent.match(/(\d+)\s*MM/);
        if (match) {
          totalLarvicultura += parseInt(match[1]);
          basesLarvicultura++;
        }
      }
    });
    
    // Actualizar CONFIG con valores calculados
    if (totalLarvicultura > 0) {
      CONFIG.counters.larvicultura_mes = totalLarvicultura;
      CONFIG.counters.bases_larvicultura = basesLarvicultura;
    }
  }
  
  // Calcular total de maduración desde la tabla de producción (si existe)
  const productionTable = document.querySelector('.production-table tbody');
  if (productionTable) {
    const rows = productionTable.querySelectorAll('tr');
    let totalNauplios = 0;
    let basesMaduracion = 0;
    
    rows.forEach(row => {
      const capacidadCell = row.querySelector('td[data-label="Capacidad diaria"]');
      if (capacidadCell) {
        // Extraer número de la celda (ej: "25 MM nauplios" -> 25)
        const match = capacidadCell.textContent.match(/(\d+)\s*MM/);
        if (match) {
          totalNauplios += parseInt(match[1]);
          basesMaduracion++;
        }
      }
    });
    
    // Actualizar CONFIG con valores calculados
    if (totalNauplios > 0) {
      CONFIG.counters.nauplios_dia = totalNauplios;
      CONFIG.counters.bases_maduracion = basesMaduracion;
    }
  }
}

/**
 * Inicialización principal del sitio
 */
function initSite() {
  try {
    console.log('🐟 Iniciando sitio MARCOR...');
    
    // Calcular KPIs desde tablas antes de inicializar counters
    calculateKPIsFromTables();
    
    // Inicializar funciones core
    initMobileMenu();
    initCounters();
    initReveal();
    initForms();
    initCurrentYear();
    
    // Smooth scroll para enlaces internos
    initSmoothScroll();
    
    console.log('✅ Sitio MARCOR inicializado correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar el sitio:', error);
  }
}

/**
 * Menú móvil - Toggle y navegación
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  
  if (!menuToggle || !mobileNav) return;
  
  menuToggle.addEventListener('click', function() {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    
    // Toggle estados
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    mobileNav.classList.toggle('active');
    
    // Prevent scroll cuando el menú está abierto
    document.body.style.overflow = !isExpanded ? 'hidden' : '';
  });
  
  // Cerrar menú al hacer click en enlaces
  const mobileLinks = mobileNav.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', function() {
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
  
  // Cerrar menú con Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && mobileNav.classList.contains('active')) {
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/**
 * Counters animados con Intersection Observer
 */
function initCounters() {
  const counterElements = document.querySelectorAll('.counter-number');
  
  if (counterElements.length === 0) return;
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated) {
        // Animar la aparición de las tarjetas primero
        const counterItems = document.querySelectorAll('.counter-item');
        counterItems.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('revealed');
          }, index * 100);
        });
        
        // Luego animar los números
        setTimeout(() => {
          animateCounters();
        }, 400);
        
        countersAnimated = true;
      }
    });
  }, { threshold: CONFIG.animation.observerThreshold });
  
  // Observar el primer counter
  if (counterElements[0]) {
    counterObserver.observe(counterElements[0].parentElement);
  }
}

/**
 * Animación de los números en los counters
 */
function animateCounters() {
  const counterElements = document.querySelectorAll('.counter-number');
  
  counterElements.forEach((element, index) => {
    const target = parseInt(element.getAttribute('data-target'));
    let current = 0;
    const increment = target / (CONFIG.animation.counterSpeed / 50);
    
    // Delay escalonado para cada counter
    setTimeout(() => {
      element.classList.add('counting');
      
      const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
          element.textContent = target;
          element.classList.remove('counting');
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current);
          // Efecto de pulso ocasional durante la animación
          if (Math.random() > 0.7) {
            element.classList.add('counting');
            setTimeout(() => element.classList.remove('counting'), 100);
          }
        }
      }, 50);
    }, index * 200);
  });
}

/**
 * Scroll reveal para secciones
 */
function initReveal() {
  const revealElements = document.querySelectorAll('[data-reveal]');
  
  if (revealElements.length === 0) return;
  
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Delay escalonado para crear efecto de cascada
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, index * CONFIG.animation.revealDelay);
        
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: CONFIG.animation.observerThreshold,
    rootMargin: '0px 0px -50px 0px'
  });
  
  revealElements.forEach(element => {
    observer.observe(element);
  });
}

/**
 * Inicialización de formularios
 */
function initForms() {
  // Formulario principal (home)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    handleForm(contactForm);
  }
  
  // Formulario larvicultura
  const larviculturaForm = document.getElementById('larviculturaForm');
  if (larviculturaForm) {
    handleForm(larviculturaForm);
  }
  
  // Formulario maduración
  const maduracionForm = document.getElementById('maduracionForm');
  if (maduracionForm) {
    handleForm(maduracionForm);
  }
}

/**
 * Manejo de formularios con prevención y mensaje de éxito
 */
function handleForm(form) {
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Estado de loading
    submitBtn.textContent = CONFIG.messages.loading;
    submitBtn.classList.add('loading');
    form.classList.add('form-loading');
    
    // Simular envío (aquí se integraría con el backend real)
    setTimeout(() => {
      // Restaurar estado normal
      submitBtn.textContent = originalText;
      submitBtn.classList.remove('loading');
      form.classList.remove('form-loading');
      
      // Mostrar mensaje de éxito
      showFormSuccess(form);
      
      // Reset del formulario
      form.reset();
    }, 2000);
  });
}

/**
 * Mostrar mensaje de éxito en formularios
 */
function showFormSuccess(form) {
  // Remover mensaje anterior si existe
  const existingMessage = form.querySelector('.form-success');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Crear nuevo mensaje
  const successMessage = document.createElement('div');
  successMessage.className = 'form-success';
  successMessage.textContent = CONFIG.messages.success;
  
  // Añadir después del último elemento del formulario
  form.appendChild(successMessage);
  
  // Scroll suave hacia el mensaje
  successMessage.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center' 
  });
  
  // Remover mensaje después de 8 segundos
  setTimeout(() => {
    if (successMessage.parentNode) {
      successMessage.remove();
    }
  }, 8000);
}

/**
 * Año actual dinámico en el footer
 */
function initCurrentYear() {
  const yearElements = document.querySelectorAll('#currentYear');
  const currentYear = new Date().getFullYear();
  
  yearElements.forEach(element => {
    element.textContent = currentYear;
  });
}

/**
 * Smooth scroll para enlaces internos
 */
function initSmoothScroll() {
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  
  internalLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      const targetId = this.getAttribute('href');
      
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        event.preventDefault();
        
        // Calcular offset para header fijo
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Manejo del scroll del header (opcional - efecto glassmorphism)
 */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  let ticking = false;
  
  function updateHeaderOnScroll() {
    const scrollTop = window.pageYOffset;
    
    if (scrollTop > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    ticking = false;
  }
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateHeaderOnScroll);
      ticking = true;
    }
  });
}

/**
 * FAQ interactivo (para procesos.html)
 */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    if (question && answer) {
      question.addEventListener('click', function() {
        const isOpen = answer.style.display === 'block';
        
        // Cerrar todas las respuestas
        faqItems.forEach(otherItem => {
          const otherAnswer = otherItem.querySelector('.faq-answer');
          const otherQuestion = otherItem.querySelector('.faq-question');
          
          if (otherAnswer && otherQuestion) {
            otherAnswer.style.display = 'none';
            otherQuestion.setAttribute('aria-expanded', 'false');
            otherQuestion.style.setProperty('--after-content', '"+""');
          }
        });
        
        // Toggle actual
        if (!isOpen) {
          answer.style.display = 'block';
          question.setAttribute('aria-expanded', 'true');
          question.style.setProperty('--after-content', '"−"');
        }
      });
    }
  });
}

/**
 * Lazy loading de imágenes (si es necesario)
 */
function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  }
}

/**
 * Manejo de errores globales
 */
function initErrorHandling() {
  window.addEventListener('error', function(event) {
    console.error('Error en el sitio:', event.error);
    // Aquí se podría integrar con un sistema de logging
  });
  
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Promise rechazada:', event.reason);
  });
}

// ===== UTILIDADES =====

/**
 * Utilidad para debounce (útil para scroll y resize)
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Utilidad para throttle (útil para eventos de alta frecuencia)
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

/**
 * Validación simple de email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ===== INICIALIZACIÓN =====

// Esperar a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSite);
} else {
  initSite();
}

// Inicializar funciones adicionales después del load
window.addEventListener('load', function() {
  initHeaderScroll();
  initFAQ();
  initLazyLoading();
  initErrorHandling();
});

// ===== EXPORTS (si se usa como módulo) =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CONFIG,
    initSite,
    initMobileMenu,
    initCounters,
    initReveal,
    initForms
  };
}