document.addEventListener("DOMContentLoaded", () => {
  loadCart(); // Incarca si afiseaza produsele in tabel
  updateCartCount(); // Actualizeaza contorul din navbar

  // Atasam listener-ul pe tbody pentru gestionarea evenimentelor (Quantity/Remove)
  document
    .querySelector("#cart-table tbody")
    .addEventListener("click", handleCartActions);
});

// ------------------------------------------
// Functii de Utilitate (Navbar Count, Total)
// ------------------------------------------

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  let totalItems = 0;
  const cartItems = Object.values(cart); // Extrage produsele din obiect

  cartItems.forEach((item) => {
    totalItems += item.quantity;
  });

  // Cauta elementul .cart-count, asigurati-va ca exista in HTML!
  const cartCountElement = document.querySelector(".cart-count");
  if (cartCountElement) {
    // Afișează (X) dacă avem produse, altfel lasă gol
    cartCountElement.textContent = totalItems > 0 ? `(${totalItems})` : "";
  }
}

function updateTotal(cartItems) {
  const totalElem = document.getElementById("total");
  const total = cartItems.reduce((sum, item) => {
    // Asigura-te ca prețul este citit ca număr
    const price = parseFloat(item.price) || 0;
    return sum + price * item.quantity;
  }, 0);
  totalElem.textContent = total.toFixed(2);
}

// ------------------------------------------
// Functia de Baza (Render)
// ------------------------------------------

function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  const tbody = document.querySelector("#cart-table tbody");
  const emptyMsg = document.getElementById("empty-cart");

  // Convertim obiectul in array pentru a putea itera si a calcula totalul
  const cartItems = Object.values(cart);

  tbody.innerHTML = "";

  if (cartItems.length === 0) {
    emptyMsg.style.display = "block";
    document.getElementById("cart-table").style.display = "none";
    updateTotal([]); // Seteaza totalul la zero
    return;
  }

  emptyMsg.style.display = "none";
  document.getElementById("cart-table").style.display = "table";

  cartItems.forEach((item) => {
    // ID-ul este esențial pentru funcționalitatea butoanelor!
    const productId = item.id || item.productId;
    const price = parseFloat(item.price);
    const subtotal = (price * item.quantity).toFixed(2);

    const row = document.createElement("tr");
    row.innerHTML = `
            <td><img src="${item.image}" alt="${
      item.name
    }" class="cart-product-image" /></td>
            <td><a href="details.html?id=${productId}">${item.name}</a></td>
            <td>${price.toFixed(2)} LEI</td>
            <td>
                <div class="qty-controls">
                    <button class="decrease" data-id="${productId}">-</button> 
                    <span>${item.quantity}</span>
                    <button class="increase" data-id="${productId}">+</button>
                </div>
            </td>
            <td>${subtotal} LEI</td>
            <td>
                <button class="remove-btn" data-id="${productId}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
    tbody.appendChild(row);
  });

  updateTotal(cartItems);
}

// ------------------------------------------
// Functii de Actiune (Quantity, Remove)
// ------------------------------------------

function handleCartActions(e) {
  const button =
    e.target.closest(".increase") ||
    e.target.closest(".decrease") ||
    e.target.closest(".remove-btn");

  if (!button) return;

  const productId = button.dataset.id;
  let cart = JSON.parse(localStorage.getItem("cart")) || {};

  // Verificam daca produsul exista
  if (!cart[productId]) return;

  if (button.classList.contains("increase")) {
    changeQuantity(productId, 1, cart);
  } else if (button.classList.contains("decrease")) {
    changeQuantity(productId, -1, cart);
  } else if (button.classList.contains("remove-btn")) {
    removeItem(productId, cart);
  }
}

function changeQuantity(productId, delta, cart) {
  cart[productId].quantity += delta;

  if (cart[productId].quantity < 1) {
    // Daca scade sub 1, stergem produsul.
    delete cart[productId];
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart(); // Re-incarcam si re-afisam coșul
  updateCartCount(); // Actualizam contorul din navbar
}

function removeItem(productId, cart) {
  if (confirm(`Sigur doriți să ștergeți "${cart[productId].name}" din coș?`)) {
    delete cart[productId];
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
    updateCartCount();
  }
}
