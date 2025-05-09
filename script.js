// DOM 
const productList = document.getElementById('product-list');
const modal = new bootstrap.Modal(document.getElementById('productModal'));
const cartSidebar = new bootstrap.Offcanvas(document.getElementById('cartSidebar'));
const cartBtn = document.getElementById('cartBtn');
const searchInput = document.getElementById('search');

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || {};
let currentProduct = null;

// color segun precio
function getPriceClass(price) {
    if (price < 50) return 'price-low';
    if (price < 150) return 'price-mid';
    return 'price-high';
}

//  la API
async function loadProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        products = await response.json();
        displayProducts(products);
        updateCartIcon();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        productList.innerHTML = '<p class="text-danger">No se pudieron cargar los productos.</p>';
    }
}

function displayProducts(productArray) {
    productList.innerHTML = '';

    productArray.forEach(product => {
        const priceClass = getPriceClass(product.price); // Obtener clase según precio

        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';

        card.innerHTML = `
      <div class="card h-100 ${priceClass}">
        <img src="${product.image}" class="card-img-top p-3" alt="${product.title}" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${product.title}</h5>
          <p class="card-text text-truncate">${product.description}</p>
          <p class="fw-bold ${priceClass}">Precio: $${product.price.toFixed(2)}</p>
<button class="btn mt-auto ${priceClass}" onclick="openProductModal(${product.id})">Ver más</button>

        </div>
      </div>
    `;

        productList.appendChild(card);
    });
}


// detalles del producto
function openProductModal(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;

    const priceClass = getPriceClass(currentProduct.price);

    document.getElementById('modalTitle').textContent = currentProduct.title;
    document.getElementById('modalDescription').textContent = currentProduct.description;

    const priceElem = document.getElementById('modalPrice');
    priceElem.textContent = `$${currentProduct.price.toFixed(2)}`;
    priceElem.className = `fw-bold text-end ${priceClass}`;

    const imgElem = document.getElementById('modalImage');
    imgElem.src = currentProduct.image;
    imgElem.alt = currentProduct.title;

    // Estilo de borde dinámico para el modal
    const modalContent = document.querySelector('#productModal .modal-content');
    modalContent.classList.remove('price-low', 'price-mid', 'price-high');
    modalContent.classList.add(priceClass);

    modal.show();
}


// Agregar  al carrito
function addToCart(product) {
    if (cart[product.id]) {
        cart[product.id].quantity += 1;
    } else {
        cart[product.id] = {
            ...product,
            quantity: 1
        };
    }

    saveCart();
    renderCartItems();
    updateCartIcon();
    alert('Producto agregado al carrito');
}

// Actualizar cantidad en el carrito
function updateCartIcon() {
    const count = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// carrito sidebar
function renderCartItems() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';

    Object.values(cart).forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'd-flex justify-content-between align-items-center mb-3';

        itemDiv.innerHTML = `
      <img src="${item.image}" width="50" alt="${item.title}" />
      <div class="flex-grow-1 mx-2">
        <strong>${item.title}</strong><br />
        <button class="btn btn-sm btn-outline-secondary" ${item.quantity === 1 ? 'disabled' : ''} onclick="changeQuantity(${item.id}, -1)">-</button>
        <span class="mx-2">${item.quantity}</span>
        <button class="btn btn-sm btn-outline-secondary" onclick="changeQuantity(${item.id}, 1)">+</button>
      </div>
      <div class="text-end">
        <span class="${getPriceClass(item.price)}">
          $${(item.price * item.quantity).toFixed(2)}
        </span><br />
        <button class="btn btn-sm btn-outline-danger mt-1" onclick="removeItem(${item.id})">Eliminar</button>
      </div>
    `;
        container.appendChild(itemDiv);
    });
}

function changeQuantity(productId, amount) {
    if (cart[productId]) {
        cart[productId].quantity += amount;
        if (cart[productId].quantity < 1) cart[productId].quantity = 1;

        saveCart();
        renderCartItems();
        updateCartIcon();
    }
}

// Eliminar del carrito
function removeItem(productId) {
    delete cart[productId];
    saveCart();
    renderCartItems();
    updateCartIcon();
}

// Vaciar todo el carrito
function clearCart() {
    if (confirm('¿Estás seguro de que deseas eliminar todos los productos del carrito?')) {
        cart = {};
        saveCart();
        renderCartItems();
        updateCartIcon();
    }
}

// Finalizar la compra
function checkout() {
    if (Object.keys(cart).length === 0) {
        alert('Tu carrito está vacío.');
        return;
    }

    alert('¡Gracias por tu compra!');
    cart = {};
    saveCart();
    renderCartItems();
    updateCartIcon();
}

// Filtrar productos
function filterProducts(text) {
    const query = text.toLowerCase();
    const filtered = products.filter(product =>
        product.title.toLowerCase().includes(query)
    );
    displayProducts(filtered);
}

document.getElementById('addToCartBtn').addEventListener('click', () => {
    if (currentProduct) addToCart(currentProduct);
    modal.hide();
});

document.getElementById('clearCart').addEventListener('click', clearCart);
document.getElementById('checkout').addEventListener('click', checkout);
cartBtn.addEventListener('click', () => cartSidebar.show());

searchInput.addEventListener('input', e => {
    filterProducts(e.target.value);
});


loadProducts();
renderCartItems();
