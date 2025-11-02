document.addEventListener("DOMContentLoaded", () => {
  // Always update navbar count on page load
  updateCartCount();

  // If this page has a cart table, initialize cart UI
  const cartTable = document.getElementById("cart-table");
  if (cartTable) {
    // Ensure any legacy cart shape is normalized before rendering
    const raw = JSON.parse(localStorage.getItem("cart")) || {};
    const normalized = normalizeCart(raw);
    // Persist normalized form if it differs
    try {
      localStorage.setItem("cart", JSON.stringify(normalized));
    } catch (e) {
      console.warn("Could not persist normalized cart:", e);
    }

    loadCart(); // Incarca si afiseaza produsele in tabel

    // Attach listener on tbody for quantity/remove actions (defensive - ensure it's attached)
    const tbody = cartTable.querySelector("tbody");
    if (tbody && !tbody.dataset.listenerAttached) {
      tbody.addEventListener("click", handleCartActions);
      tbody.dataset.listenerAttached = "1";
    }
  }
});

// Normalize older cart shapes to the object keyed by productId that current code expects.
function normalizeCart(raw) {
  if (!raw) return {};

  // If it's already an object with item objects (looks normalized), return as-is
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const vals = Object.values(raw);
    const looksNormalized = vals.every(
      (v) =>
        v &&
        typeof v === "object" &&
        ("quantity" in v || "price" in v || "name" in v)
    );
    if (looksNormalized) return raw;

    // If it's an object but values are objects that look like array entries (0,1,2...), convert them
    const allObjects =
      vals.length > 0 && vals.every((v) => v && typeof v === "object");
    if (allObjects) {
      const out = {};
      vals.forEach((item, i) => {
        const id = String(item.id || item.productId || i);
        out[id] = {
          id,
          quantity: item.quantity || 1,
          price: parseFloat(item.price) || 0,
          image: item.image || item.imageURL || "",
          name: item.name || item.title || "Produs",
        };
      });
      return out;
    }
  }

  // If it's an array (older implementation), convert to object keyed by id
  if (Array.isArray(raw)) {
    const out = {};
    raw.forEach((item, i) => {
      const id = String(item.id || item.productId || i);
      out[id] = {
        id,
        quantity: item.quantity || 1,
        price: parseFloat(item.price) || 0,
        image: item.image || item.imageURL || "",
        name: item.name || item.title || "Produs",
      };
    });
    return out;
  }

  return {};
}

// ---------------------------
// One-time purge utilities
// ---------------------------
function findSuspiciousCartEntries() {
  const raw = JSON.parse(localStorage.getItem("cart")) || {};
  const cart = normalizeCart(raw);
  const suspicious = [];

  Object.entries(cart).forEach(([id, item]) => {
    const priceNum = parseFloat(item.price);
    const hasValidId = id !== "undefined" && id !== "null" && id !== "";
    const hasValidName =
      item.name &&
      String(item.name).trim().length > 0 &&
      item.name !== "Produs";
    const hasValidPrice = !isNaN(priceNum) && priceNum > 0;
    const hasValidQuantity =
      Number.isFinite(item.quantity) && item.quantity > 0;

    // mark suspicious when one of the key fields is missing/invalid
    if (!hasValidId || !hasValidName || !hasValidPrice || !hasValidQuantity) {
      suspicious.push({ id, item });
    }
  });

  return suspicious;
}

/**
 * Purge suspicious/legacy cart entries. Run from console on cart page.
 * - If called without arguments, prompts the user for confirmation.
 * - If called with `true`, will perform deletion without prompt.
 * Returns the list of removed entries.
 */
function purgeLegacyCartEntries(forceDelete = false) {
  const suspects = findSuspiciousCartEntries();
  if (suspects.length === 0) {
    console.info("No suspicious cart entries found.");
    return [];
  }

  console.table(
    suspects.map((s) => ({
      id: s.id,
      name: s.item.name,
      price: s.item.price,
      quantity: s.item.quantity,
    }))
  );

  const proceed =
    forceDelete === true
      ? true
      : confirm(
          `Găsite ${suspects.length} intrări suspecte în coș. Doriți să le ștergeți?`
        );
  if (!proceed) {
    console.info("Purge cancelled by user.");
    return suspects;
  }

  // load, normalize, remove keys, persist
  const raw = JSON.parse(localStorage.getItem("cart")) || {};
  const cart = normalizeCart(raw);

  suspects.forEach((s) => {
    delete cart[s.id];
  });

  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (e) {
    console.error("Failed to persist cleaned cart:", e);
  }

  // re-render and update UI
  try {
    if (typeof loadCart === "function") loadCart();
    if (typeof updateCartCount === "function") updateCartCount();
  } catch (e) {
    // ignore render errors
  }

  console.info(`Removed ${suspects.length} suspicious entries.`);
  return suspects;
}

// Expose helpers for one-time use from the console
window.findSuspiciousCartEntries = findSuspiciousCartEntries;
window.purgeLegacyCartEntries = purgeLegacyCartEntries;

// ------------------------------------------
// Functii de Utilitate (Navbar Count, Total)
// ------------------------------------------

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  const totalItems = Object.values(cart).reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  // Prefer elementul cu id 'cart-count'
  const byId = document.getElementById("cart-count");
  if (byId) {
    byId.textContent = totalItems;
    byId.style.display = totalItems > 0 ? "flex" : "none";
  }

  // De asemenea actualizeaza orice badge din .cart-link
  document.querySelectorAll(".cart-link .badge").forEach((el) => {
    el.textContent = totalItems;
    el.style.display = totalItems > 0 ? "flex" : "none";
  });
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
  const raw = JSON.parse(localStorage.getItem("cart")) || {};
  const cart = normalizeCart(raw);
  // Persist normalized form (defensive)
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (e) {
    console.warn("Could not persist normalized cart:", e);
  }
  const tbody = document.querySelector("#cart-table tbody");
  const emptyMsg = document.getElementById("empty-cart");

  // Use entries so we keep the stored keys as product IDs
  const entries = Object.entries(cart);

  // Ensure each item has its id set (useful when legacy entries lack item.id)
  entries.forEach(([id, item]) => {
    if (!item.id) item.id = id;
  });
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (e) {
    console.warn("Could not persist cart with ids:", e);
  }

  tbody.innerHTML = "";

  if (entries.length === 0) {
    emptyMsg.style.display = "block";
    document.getElementById("cart-table").style.display = "none";
    updateTotal([]); // Seteaza totalul la zero
    return;
  }

  emptyMsg.style.display = "none";
  document.getElementById("cart-table").style.display = "table";

  // Render using the map keys so data-id matches the stored key
  entries.forEach(([productId, item]) => {
    const price = parseFloat(item.price) || 0;
    const subtotal = (price * (item.quantity || 0)).toFixed(2);

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

  // Update total using values
  updateTotal(Object.values(cart));
}

// ------------------------------------------
// Functii de Actiune (Quantity, Remove)
// ------------------------------------------

function handleCartActions(e) {
  // Debug: log target for troubleshooting when buttons seem unresponsive
  // console.log('cart action click', e.target);
  const button =
    e.target.closest(".increase") ||
    e.target.closest(".decrease") ||
    e.target.closest(".remove-btn");

  if (!button) return;

  const productId = button.dataset.id;

  // Defensive: normalize before operating (in case localStorage contains legacy shape)
  let raw = JSON.parse(localStorage.getItem("cart")) || {};
  let cart = normalizeCart(raw);
  // Persist if normalization changed shape
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (e) {
    console.warn("Could not persist normalized cart:", e);
  }

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
