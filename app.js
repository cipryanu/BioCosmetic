window.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});

const URL = "https://69030bc3d0f10a340b225a62.mockapi.io/products";
let currentPage = 1;
let productsPerPage = 8;
let allProducts = [];

function loadProducts() {
  fetch(URL)
    .then((response) => {
      if (response.ok === false) {
        throw new Error("Network error!");
      } else {
        return response.json();
      }
    })
    .then((products) => {
      allProducts = products || [];
      setupPagination();
      displayProducts(currentPage);
    })
    .catch((err) => console.error("Eroare la încărcarea produselor:", err));
}

function displayProducts(page) {
  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const productsToShow = allProducts.slice(start, end);

  const container = document.querySelector(".products-container");
  if (!container) return;

  container.innerHTML = productsToShow
    .map(
      (product) => `
        <div class="product-card">
          <img
              src="${product.imageURL}"
              alt="Product image"
          />
          <div class="product-info">
              <h3>${product.name}</h3>
              <div class="price">${product.price} LEI</div>
              <div class="buttons">
                  <a href="details.html?id=${product.id}" class="details-btn">Detalii</a>
                  <button data-id="${product.id}" class="cart-btn">Adaugă în Coș</button>
              </div>
          </div>
        </div>
    `
    )
    .join("");

  // attach add-to-cart handlers after rendering
  const addToCartButtons = document.querySelectorAll(".cart-btn");
  addToCartButtons.forEach((button) => {
    // remove previous listener if any by cloning node
    const newBtn = button.cloneNode(true);
    button.parentNode.replaceChild(newBtn, button);
    newBtn.addEventListener("click", (e) => {
      const productId = e.currentTarget.dataset.id;
      const product = allProducts.find((p) => p.id === productId);
      if (!product) return;

      let cart = JSON.parse(localStorage.getItem("cart")) || {};

      if (cart[productId]) {
        cart[productId].quantity++;
      } else {
        cart[productId] = {
          quantity: 1,
          price: parseFloat(product.price) || 0,
          image: product.imageURL,
          name: product.name,
          id: product.id,
        };
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      if (typeof updateCartCount === "function") updateCartCount();
    });
  });
}

function setupPagination() {
  const totalPages = Math.max(
    1,
    Math.ceil(allProducts.length / productsPerPage)
  );
  const totalPagesEl = document.getElementById("total-pages");
  if (totalPagesEl) totalPagesEl.textContent = totalPages;

  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");

  if (prevBtn && !prevBtn.dataset.bound) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        updatePagination();
        displayProducts(currentPage);
      }
    });
    prevBtn.dataset.bound = "true";
  }

  if (nextBtn && !nextBtn.dataset.bound) {
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
        displayProducts(currentPage);
      }
    });
    nextBtn.dataset.bound = "true";
  }

  updatePagination();
}

function updatePagination() {
  const totalPages = Math.max(
    1,
    Math.ceil(allProducts.length / productsPerPage)
  );
  const currentEl = document.getElementById("current-page");
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");

  if (currentEl) currentEl.textContent = currentPage;
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}
