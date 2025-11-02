document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  const cartTable = document.getElementById("cart-table");
  if (cartTable) {
    loadCart();

    const tbody = cartTable.querySelector("tbody");
    if (tbody) {
      tbody.addEventListener("click", handleCartActions);
    }
  }
});

// ------------------------------------------
// Functii de Utilitate (Navbar Count, Total)
// ------------------------------------------

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  const totalItems = Object.values(cart).reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  const badge = document.getElementById("cart-count");
  if (badge) {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? "flex" : "none";
  }

  document.querySelectorAll(".cart-link .badge").forEach((el) => {
    el.textContent = totalItems;
    el.style.display = totalItems > 0 ? "flex" : "none";
  });
}

function updateTotal(cartItems) {
  const totalElem = document.getElementById("total");
  if (!totalElem) return;

  const total = cartItems.reduce((sum, item) => {
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
  const cartTable = document.getElementById("cart-table");

  if (!tbody) return;

  const entries = Object.entries(cart);
  tbody.innerHTML = "";

  if (entries.length === 0) {
    if (emptyMsg) emptyMsg.style.display = "block";
    if (cartTable) cartTable.style.display = "none";
    updateTotal([]);
    return;
  }

  if (emptyMsg) emptyMsg.style.display = "none";
  if (cartTable) cartTable.style.display = "table";

  entries.forEach(([productId, item]) => {
    const price = parseFloat(item.price) || 0;
    const subtotal = (price * (item.quantity || 0)).toFixed(2);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${item.image}" alt="${item.name}" class="cart-product-image" /></td>
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

  updateTotal(Object.values(cart));
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
  const cart = JSON.parse(localStorage.getItem("cart")) || {};

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
    delete cart[productId];
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

function removeItem(productId, cart) {
  if (confirm(`Sigur doriți să ștergeți "${cart[productId].name}" din coș?`)) {
    delete cart[productId];
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
    updateCartCount();
  }
}
