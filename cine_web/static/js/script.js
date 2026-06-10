// ========== FUNCIONES PRINCIPALES ==========

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  
  // 🆕 NUEVO: Cargar carrito guardado al iniciar
  loadCart();
  updateCartDisplay();
  
  // Mostrar modal de bienvenida solo en index.html y primera visita
  if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/CineNexus/')) {
    if (!localStorage.getItem('welcomeShown')) {
      setTimeout(() => {
        const welcomeModal = new bootstrap.Modal(document.getElementById('welcomeModal'));
        if (welcomeModal) {
          welcomeModal.show();
          localStorage.setItem('welcomeShown', 'true');
        }
      }, 1500);
    }
  }
  
  // Inicializar funcionalidades según la página actual
  initPageSpecificFunctions();
  
  // Actualizar estado de usuario en navbar
  updateUserNavState();
  
  // Inicializar funcionalidades comunes
  initCommonFunctions();
});

// ========== FUNCIONES ESPECÍFICAS POR PÁGINA ==========
function initPageSpecificFunctions() {
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('cartelera.html')) {
    initCarteleraFunctions();
  } else if (currentPath.includes('reservas.html')) {
    initReservasFunctions();
  } else if (currentPath.includes('confiteria.html')) {
    initConfiteriaFunctions();
  } else if (currentPath.includes('login.html')) {
    initLoginFunctions();
  } else if (currentPath.includes('socios.html')) {
    checkSocioAccess();
  } else if (currentPath.includes('contacto.html')) {
    initContactoFunctions();
  } else if (currentPath.includes('promociones.html')) {
    initPromocionesFunctions();
  }
}

// ========== FUNCIONALIDADES COMUNES ==========
function initCommonFunctions() {
  // Inicializar sistema de estrellas
  initStarRating();
  
  // Efectos hover en todas las cards
  initCardEffects();
}

// ========== SISTEMA DE ESTRELLAS ==========
function initStarRating() {
  const starContainers = document.querySelectorAll('.star-rating-interactive');
  
  starContainers.forEach(container => {
    const stars = container.querySelectorAll('.bi-star, .bi-star-fill, .bi-star-half');
    
    stars.forEach((star, index) => {
      star.addEventListener('click', function() {
        // Verificar si el usuario está registrado
        if (!isUserLoggedIn()) {
          showAlert('Debes iniciar sesión para calificar películas', 'warning');
          return;
        }
        
        // Actualizar estrellas
        stars.forEach((s, i) => {
          if (i <= index) {
            s.classList.remove('bi-star', 'bi-star-half');
            s.classList.add('bi-star-fill');
          } else {
            s.classList.remove('bi-star-fill', 'bi-star-half');
            s.classList.add('bi-star');
          }
        });
        
        showAlert('¡Calificación registrada! Gracias por tu voto ⭐', 'success');
      });
    });
  });
}

// ========== EFECTOS EN CARDS ==========
function initCardEffects() {
  const cards = document.querySelectorAll('.movie-card, .product-card, .promo-card');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px)';
      this.style.boxShadow = '0 10px 30px rgba(229, 9, 20, 0.4)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    });
  });
}

// ========== CARRITO DE COMPRAS (CONFITERÍA) ==========
let cart = [];
let cartTotal = 0;

// 🆕 NUEVO: Guardar carrito en localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// 🆕 NUEVO: Cargar carrito desde localStorage
function loadCart() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
}

function addToCart(productName, price) {
  cart.push({ name: productName, price: parseFloat(price) });
  updateCartDisplay();
  saveCart(); // 🆕 Guardar después de añadir
  showAlert(`${productName} agregado al carrito 🛒`, 'success');
}

function removeFromCart(index) {
  const removedItem = cart[index].name;
  cart.splice(index, 1);
  updateCartDisplay();
  saveCart(); // 🆕 Guardar después de eliminar
  showAlert(`${removedItem} eliminado del carrito`, 'info');
}

function updateCartDisplay() {
  const cartContainer = document.getElementById('cart-items');
  const totalContainer = document.getElementById('cart-total');
  const modalCartContainer = document.getElementById('modal-cart-items'); // 🆕
  const modalTotalContainer = document.getElementById('modal-cart-total'); // 🆕
  const cartCountBadge = document.getElementById('cartCount'); // 🆕
  
  // 🆕 Actualizar contador del badge en navbar
  if (cartCountBadge) {
    cartCountBadge.textContent = cart.length;
    cartCountBadge.style.display = cart.length > 0 ? 'inline' : 'none';
  }
  
  cartTotal = 0;
  
  // 🆕 Función para generar HTML del carrito
  function generateCartHTML() {
    if (cart.length === 0) {
      return '<p class="text-muted">Carrito vacío</p>';
    }
    
    let html = '';
    cart.forEach((item, index) => {
      cartTotal += item.price;
      html += `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-black rounded">
          <span>${item.name}</span>
          <div>
            <span class="text-danger me-2">S/ ${item.price.toFixed(2)}</span>
            <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${index})">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;
    });
    return html;
  }
  
  const cartHTML = generateCartHTML();
  
  // Actualizar carrito en página de confitería
  if (cartContainer) {
    cartContainer.innerHTML = cartHTML;
  }
  if (totalContainer) {
    totalContainer.innerHTML = `Total: S/ ${cartTotal.toFixed(2)}`;
  }
  
  // 🆕 Actualizar carrito en modal (visible desde cualquier página)
  if (modalCartContainer) {
    modalCartContainer.innerHTML = cartHTML;
  }
  if (modalTotalContainer) {
    modalTotalContainer.innerHTML = `Total: S/ ${cartTotal.toFixed(2)}`;
  }
}

function checkoutCart() {
  if (cart.length === 0) {
    showAlert('El carrito está vacío', 'warning');
    return;
  }
  
  if (!isUserLoggedIn()) {
    showAlert('Debes iniciar sesión para finalizar la compra', 'warning');
    return;
  }
  
  showAlert(`Compra finalizada. Total: S/ ${cartTotal.toFixed(2)} 🎉`, 'success');
  cart = [];
  updateCartDisplay();
  saveCart(); // 🆕 Guardar carrito vacío
}

function initConfiteriaFunctions() {
  // Actualizar carrito al cargar
  updateCartDisplay();
}

// ========== FUNCIONES DE CARTELERA ==========
function initCarteleraFunctions() {
  const searchInput = document.getElementById('searchMovie');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const movieItems = document.querySelectorAll('.movie-item');
  const noResults = document.getElementById('noResults');
  
  // Búsqueda en tiempo real
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      filterMovies();
    });
  }
  
  // Filtros por categoría
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remover clase active de todos
      filterBtns.forEach(b => b.classList.remove('active'));
      // Agregar clase active al clickeado
      this.classList.add('active');
      filterMovies();
    });
  });
  
  function filterMovies() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const activeFilter = document.querySelector('.filter-btn.active');
    const activeCategory = activeFilter ? activeFilter.dataset.filter : 'all';
    let visibleCount = 0;
    
    movieItems.forEach(item => {
      const category = item.dataset.category;
      const title = item.querySelector('.card-title').textContent.toLowerCase();
      
      const matchesSearch = title.includes(searchTerm);
      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      
      if (matchesSearch && matchesCategory) {
        item.style.display = 'block';
        item.classList.add('animate-fadeInUp');
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });
    
    // Mostrar mensaje si no hay resultados
    if (noResults) {
      if (visibleCount === 0) {
        noResults.style.display = 'block';
      } else {
        noResults.style.display = 'none';
      }
    }
  }
}

// ========== 🆕 SISTEMA DE BUTACAS ==========
let selectedSeats = [];
const occupiedSeats = ['A3', 'A4', 'B5', 'B6', 'C2', 'D8', 'E4', 'E5']; // Butacas ya ocupadas

// 🆕 Precios por formato
const formatPrices = {
  '2d': 25.00,
  '3d': 35.00,
  'imax': 45.00,
  '4dx': 55.00,
  'vip': 65.00
};

// 🆕 Descuentos por tipo de entrada
const typeDiscounts = {
  'general': 0,
  'adulto-mayor': 0.30,
  'estudiante': 0.25,
  'nino': 0.40
};

// 🆕 Generar mapa de butacas
function generateSeatMap() {
  const seatMap = document.getElementById('seatMap');
  if (!seatMap) return;
  
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;
  
  let html = '<div class="d-flex flex-column align-items-center">';
  
  rows.forEach(row => {
    html += '<div class="d-flex mb-2 align-items-center">';
    html += `<span class="me-3 text-muted" style="width: 20px;">${row}</span>`;
    
    for (let i = 1; i <= seatsPerRow; i++) {
      const seatId = `${row}${i}`;
      const isOccupied = occupiedSeats.includes(seatId);
      const isSelected = selectedSeats.includes(seatId);
      
      let seatClass = 'bg-secondary';
      if (isOccupied) {
        seatClass = 'bg-dark border border-secondary';
      } else if (isSelected) {
        seatClass = 'bg-danger';
      }
      
      html += `
        <div class="seat ${seatClass} me-1" 
             data-seat="${seatId}" 
             style="width: 30px; height: 30px; border-radius: 5px; cursor: ${isOccupied ? 'not-allowed' : 'pointer'}; transition: all 0.2s;"
             onclick="${isOccupied ? '' : `toggleSeat('${seatId}')`}"
             onmouseenter="${isOccupied ? '' : `this.style.transform='scale(1.2)'`}"
             onmouseleave="${isOccupied ? '' : `this.style.transform='scale(1)'`}">
        </div>
      `;
      
      // Espacio de pasillo cada 5 asientos
      if (i === 5) {
        html += '<div style="width: 20px;"></div>';
      }
    }
    
    html += '</div>';
  });
  
  html += '</div>';
  seatMap.innerHTML = html;
}

// 🆕 Seleccionar/deseleccionar butaca
function toggleSeat(seatId) {
  const index = selectedSeats.indexOf(seatId);
  
  if (index > -1) {
    // Deseleccionar
    selectedSeats.splice(index, 1);
  } else {
    // Verificar límite de 10 butacas
    if (selectedSeats.length >= 10) {
      showAlert('Máximo 10 butacas por reserva', 'warning');
      return;
    }
    // Seleccionar
    selectedSeats.push(seatId);
  }
  
  updateSelectedSeatsDisplay();
  generateSeatMap();
  updateReservationSummary();
}

// 🆕 Actualizar display de butacas seleccionadas
function updateSelectedSeatsDisplay() {
  const display = document.getElementById('selectedSeatsList');
  if (!display) return;
  
  if (selectedSeats.length === 0) {
    display.textContent = 'Ninguna';
  } else {
    display.textContent = selectedSeats.join(', ');
  }
  
  // Actualizar cantidad automáticamente
  const cantidadInput = document.getElementById('cantidad');
  if (cantidadInput) {
    cantidadInput.value = selectedSeats.length;
  }
}

// 🆕 Resetear butacas
function resetSeats() {
  selectedSeats = [];
  updateSelectedSeatsDisplay();
  generateSeatMap();
}

// 🆕 Actualizar precio según formato
function updatePriceByFormat() {
  updateReservationSummary();
}

// ========== FUNCIONES DE RESERVAS (ACTUALIZADA) ==========
function initReservasFunctions() {
  // 🆕 Generar mapa de butacas al cargar
  generateSeatMap();
  autoFillUserData();
  const form = document.getElementById('reservationForm');
  const cantidadInput = document.getElementById('cantidad');
  
  // 🆕 Escuchar cambios en formato y tipo de entrada
  const formatoSelect = document.getElementById('formato');
  const tipoEntradaSelect = document.getElementById('tipoEntrada');
  
  if (formatoSelect) {
    formatoSelect.addEventListener('change', updateReservationSummary);
  }
  if (tipoEntradaSelect) {
    tipoEntradaSelect.addEventListener('change', updateReservationSummary);
  }
  
  // Calcular total automáticamente
  if (cantidadInput) {
    cantidadInput.addEventListener('input', calculateTotal);
    cantidadInput.addEventListener('change', calculateTotal);
  }
  
  // Validar formulario
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Verificar si el usuario está registrado
      if (!isUserLoggedIn()) {
        showAlert('Debes iniciar sesión para realizar una reserva', 'warning');
        window.location.href = 'login.html';
        return;
      }
      
      // 🆕 Validar que haya butacas seleccionadas
      if (selectedSeats.length === 0) {
        showAlert('Debes seleccionar al menos una butaca', 'warning');
        return;
      }
      
      // Validar campos
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }
      
      // 🆕 Obtener datos actualizados para el resumen
      const nombre = document.getElementById('nombre').value;
      const apellido = document.getElementById('apellido').value;
      const correo = document.getElementById('correo').value;
      const peliculaSelect = document.getElementById('pelicula');
      const pelicula = peliculaSelect.options[peliculaSelect.selectedIndex].text;
      const horario = document.getElementById('horario').value;
      const formato = document.getElementById('formato').value;
      const tipoEntrada = document.getElementById('tipoEntrada').value;
      
      // 🆕 Calcular total con formato y descuento
      const basePrice = formatPrices[formato] || 35;
      const discount = typeDiscounts[tipoEntrada] || 0;
      const finalPrice = basePrice * (1 - discount);
      const total = finalPrice * selectedSeats.length;
      
      // 🆕 Guardar en historial con datos completos
      saveReservationHistory({
        nombre,
        apellido,
        pelicula,
        horario,
        formato,
        tipoEntrada,
        butacas: selectedSeats.join(', '),
        cantidad: selectedSeats.length,
        total,
        fecha: new Date().toLocaleDateString()
      });
      
      // Mostrar modal de confirmación
      const confirmationBody = document.getElementById('confirmationBody');
      const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
      
      confirmationBody.innerHTML = `
        <p><strong>Nombre:</strong> ${nombre} ${apellido}</p>
        <p><strong>Película:</strong> ${pelicula}</p>
        <p><strong>Formato:</strong> ${formato.toUpperCase()}</p>
        <p><strong>Horario:</strong> ${horario}</p>
        <p><strong>Butacas:</strong> ${selectedSeats.join(', ')}</p>
        <p><strong>Cantidad:</strong> ${selectedSeats.length} entrada(s)</p>
        <hr>
        <h4 class="text-success">Total: S/ ${total.toFixed(2)}</h4>
        <p class="mt-3 text-muted">Se ha enviado un correo de confirmación a ${correo}</p>
      `;
      
      confirmationModal.show();
      
      // Limpiar formulario
      form.reset();
      form.classList.remove('was-validated');
      selectedSeats = [];
      updateSelectedSeatsDisplay();
      generateSeatMap();
      document.getElementById('total-display').innerHTML = 'Total: S/ 0.00';
      document.getElementById('reservationSummary').innerHTML = 'Completa los campos para ver el resumen';
      
      // Actualizar historial en página de socios
      updateReservationHistory();
    });
    
    // Actualizar resumen en tiempo real
    form.addEventListener('input', updateReservationSummary);
    form.addEventListener('change', updateReservationSummary);
  }
}

function calculateTotal() {
  const cantidadInput = document.getElementById('cantidad');
  const totalDisplay = document.getElementById('total-display');
  
  if (cantidadInput && totalDisplay) {
    const cantidad = parseInt(cantidadInput.value) || 0;
    const total = cantidad * 35;
    totalDisplay.innerHTML = `Total: S/ ${total.toFixed(2)}`;
  }
}

// 🆕 ACTUALIZADA: Resumen de reserva con formato, butacas y descuentos
function updateReservationSummary() {
  const nombre = document.getElementById('nombre')?.value || '';
  const apellido = document.getElementById('apellido')?.value || '';
  const peliculaSelect = document.getElementById('pelicula');
  const pelicula = peliculaSelect?.options[peliculaSelect.selectedIndex]?.text || '';
  const horario = document.getElementById('horario')?.value || '';
  const formato = document.getElementById('formato')?.value || '';
  const tipoEntrada = document.getElementById('tipoEntrada')?.value || '';
  
  const summary = document.getElementById('reservationSummary');
  const priceDetails = document.getElementById('priceDetails');
  const totalDisplay = document.getElementById('total-display');
  
  if (!summary) return;
  
  // 🆕 Calcular precios con formato y descuento
  const basePrice = formatPrices[formato] || 0;
  const discount = typeDiscounts[tipoEntrada] || 0;
  const finalPricePerTicket = basePrice * (1 - discount);
  const numSeats = selectedSeats.length || parseInt(document.getElementById('cantidad')?.value) || 0;
  const total = finalPricePerTicket * numSeats;
  
  summary.innerHTML = `
    <p><strong>Nombre:</strong> ${nombre} ${apellido}</p>
    <p><strong>Película:</strong> ${pelicula}</p>
    <p><strong>Horario:</strong> ${horario}</p>
    <p><strong>Formato:</strong> ${formato.toUpperCase()}</p>
    <p><strong>Tipo de Entrada:</strong> ${tipoEntrada.replace('-', ' ')}</p>
    <p><strong>Butacas:</strong> ${selectedSeats.length > 0 ? selectedSeats.join(', ') : 'No seleccionadas'}</p>
    <p><strong>Cantidad:</strong> ${numSeats} entrada(s)</p>
  `;
  
  // 🆕 Mostrar desglose de precios
  if (priceDetails && basePrice > 0) {
    priceDetails.innerHTML = `
      Precio base: S/ ${basePrice.toFixed(2)} | 
      Descuento: ${(discount * 100)}% | 
      Precio final por entrada: S/ ${finalPricePerTicket.toFixed(2)}
    `;
  }
  
  if (totalDisplay) {
    totalDisplay.innerHTML = `Total: S/ ${total.toFixed(2)}`;
  }
}

// ========== SISTEMA DE AUTENTICACIÓN ==========
function isUserLoggedIn() {
  return localStorage.getItem('currentUser') !== null;
}

function loginUser(email, password) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true, user };
  }
  return { success: false };
}

function registerUser(name, email, password) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Verificar si el correo ya existe
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'El correo ya está registrado' };
  }
  
  const newUser = { name, email, password };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  
  return { success: true, user: newUser };
}

function logoutUser() {
  // Limpiar sesión
  localStorage.removeItem('currentUser');
  
  // Detectar dónde estamos para redirigir correctamente
  const currentPath = window.location.pathname;
  const isInPagesFolder = currentPath.includes('/pages/');
  
  // Redirigir al inicio según ubicación actual
  if (isInPagesFolder) {
    window.location.href = '../index.html';  // Desde /pages/ subimos un nivel
  } else {
    window.location.href = 'index.html';      // Desde index.html nos quedamos
  }
}

function updateUserNavState() {
  const navUserText = document.getElementById('nav-user-text');
  const navLoginItem = document.getElementById('nav-login-item');
  
  if (navUserText && isUserLoggedIn()) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    navUserText.textContent = user.name.split(' ')[0]; // Primer nombre
    
    if (navLoginItem) {
      // ✅ DETECTAR SI ESTAMOS EN UNA PÁGINA DENTRO DE /pages/ O EN index.html
      const currentPath = window.location.pathname;
      const isInPagesFolder = currentPath.includes('/pages/');
      
      // ✅ Si estamos en /pages/, NO ponemos "pages/" en la ruta
      // ✅ Si estamos en index.html, SÍ ponemos "pages/"
      const sociosUrl = isInPagesFolder ? 'socios.html' : 'pages/socios.html';
      
      navLoginItem.innerHTML = `
        <div class="dropdown">
          <button class="btn btn-outline-danger btn-sm text-white dropdown-toggle" type="button" data-bs-toggle="dropdown">
            <i class="bi bi-person-circle"></i> ${user.name.split(' ')[0]}
          </button>
          <ul class="dropdown-menu dropdown-menu-dark">
            <li><a class="dropdown-item" href="${sociosUrl}"><i class="bi bi-person-badge"></i> Mi Perfil</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" onclick="logoutUser()"><i class="bi bi-box-arrow-right"></i> Cerrar Sesión</a></li>
          </ul>
        </div>
      `;
    }
  }
}

// ========== FUNCIONES DE LOGIN ==========
function initLoginFunctions() {
  const loginForm = document.getElementById('loginFormElement');
  const registerForm = document.getElementById('registerFormElement');
  
  // Login
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!loginForm.checkValidity()) {
        e.stopPropagation();
        loginForm.classList.add('was-validated');
        return;
      }
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      const result = loginUser(email, password);
      
      if (result.success) {
        const modal = new bootstrap.Modal(document.getElementById('loginSuccessModal'));
        document.getElementById('loggedUserName').textContent = result.user.name;
        modal.show();
        updateUserNavState();
      } else {
        const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        document.getElementById('errorMessage').textContent = 'Correo o contraseña incorrectos';
        errorModal.show();
      }
    });
  }
  
  // Registro
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!registerForm.checkValidity()) {
        e.stopPropagation();
        registerForm.classList.add('was-validated');
        return;
      }
      
      const name = document.getElementById('registerName').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('registerConfirmPassword').value;
      
      // Validar contraseñas coincidan
      if (password !== confirmPassword) {
        const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        document.getElementById('errorMessage').textContent = 'Las contraseñas no coinciden';
        errorModal.show();
        return;
      }
      
      const result = registerUser(name, email, password);
      
      if (result.success) {
        const modal = new bootstrap.Modal(document.getElementById('loginSuccessModal'));
        document.getElementById('loggedUserName').textContent = result.user.name;
        modal.show();
        updateUserNavState();
      } else {
        const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        document.getElementById('errorMessage').textContent = result.message;
        errorModal.show();
      }
    });
  }
  
  // Si viene de otra página para registrarse
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('register') === 'true') {
    const registerTab = document.getElementById('register-tab');
    if (registerTab) {
      registerTab.click();
    }
  }
}

// ========== FUNCIONES DE SOCIOS ==========
function checkSocioAccess() {
  const noLoggedInSection = document.getElementById('noLoggedInSection');
  const loggedInSection = document.getElementById('loggedInSection');
  
  if (isUserLoggedIn()) {
    if (noLoggedInSection) noLoggedInSection.style.display = 'none';
    if (loggedInSection) {
      loggedInSection.style.display = 'block';
      const user = JSON.parse(localStorage.getItem('currentUser'));
      document.getElementById('userName').textContent = user.name;
      updateReservationHistory();
    }
  } else {
    if (noLoggedInSection) noLoggedInSection.style.display = 'block';
    if (loggedInSection) loggedInSection.style.display = 'none';
  }
}

function saveReservationHistory(reservation) {
  const history = JSON.parse(localStorage.getItem('reservationHistory') || '[]');
  history.unshift(reservation); // Agregar al inicio
  localStorage.setItem('reservationHistory', JSON.stringify(history));
}

// 🆕 ACTUALIZADA: Mostrar historial con datos de formato y butacas
function updateReservationHistory() {
  const historyContainer = document.getElementById('reservationHistory');
  if (!historyContainer) return;
  
  const history = JSON.parse(localStorage.getItem('reservationHistory') || '[]');
  
  if (history.length === 0) {
    historyContainer.innerHTML = '<li class="list-group-item bg-dark text-muted">No tienes reservas aún</li>';
    return;
  }
  
  historyContainer.innerHTML = '';
  history.forEach((res, index) => {
    const formatoInfo = res.formato ? ` - ${res.formato.toUpperCase()}` : '';
    const butacasInfo = res.butacas ? `<br><small>Butacas: ${res.butacas}</small>` : '';
    
    historyContainer.innerHTML += `
      <li class="list-group-item bg-dark text-white border-secondary">
        <strong>${res.pelicula}</strong>${formatoInfo}
        ${butacasInfo}
        <br><small>${res.fecha} - ${res.horario} (${res.cantidad} entradas)</small>
        <span class="badge bg-danger float-end">S/ ${res.total.toFixed(2)}</span>
      </li>
    `;
  });
}

// ========== FUNCIONES DE CONTACTO ==========
function initContactoFunctions() {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!contactForm.checkValidity()) {
        e.stopPropagation();
        contactForm.classList.add('was-validated');
        return;
      }
      
      // Mostrar modal de confirmación
      const modal = new bootstrap.Modal(document.getElementById('contactSuccessModal'));
      modal.show();
      
      contactForm.reset();
      contactForm.classList.remove('was-validated');
    });
  }
}

// ========== FUNCIONES DE PROMOCIONES ==========
function initPromocionesFunctions() {
  // Temporizador de cuenta regresiva
  startCountdown();
}

function startCountdown() {
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  
  if (!hoursEl || !minutesEl || !secondsEl) return;
  
  // Tiempo objetivo: 2 horas y 30 minutos desde ahora
  let totalSeconds = 2 * 3600 + 30 * 60;
  
  function updateCountdown() {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
    
    if (totalSeconds > 0) {
      totalSeconds--;
      setTimeout(updateCountdown, 1000);
    } else {
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
    }
  }
  
  updateCountdown();
}

// ========== ALERTAS VISUALES ==========
function showAlert(message, type = 'info') {
  // Crear alerta dinámica
  const alertDiv = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-success' : type === 'warning' ? 'bg-warning' : type === 'danger' ? 'bg-danger' : 'bg-info';
  
  alertDiv.className = `alert ${bgColor} text-white alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3 shadow-lg`;
  alertDiv.style.zIndex = '9999';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(alertDiv);
  
  // Auto-eliminar después de 3 segundos
  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}
// 🆕 Función para auto-rellenar datos del usuario logueado
function autoFillUserData() {
  if (isUserLoggedIn()) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const nombreInput = document.getElementById('nombre');
    const correoInput = document.getElementById('correo');
    
    if (nombreInput && user.name) {
      // Separar nombre y apellido
      const nameParts = user.name.split(' ');
      nombreInput.value = nameParts[0] || '';
      
      // Si hay apellido en el registro
      const apellidoInput = document.getElementById('apellido');
      if (apellidoInput && nameParts.length > 1) {
        apellidoInput.value = nameParts.slice(1).join(' ');
      }
    }
    
    if (correoInput && user.email) {
      correoInput.value = user.email;
    }
    
    // Actualizar resumen después de rellenar
    updateReservationSummary();
  }
}