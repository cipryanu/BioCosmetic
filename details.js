// URL-ul MockAPI de bază
// 🚨 VERIFICATI DACA ACEST URL ESTE INCA VALABIL! 🚨
const BASE_URL = "https://69030bc3d0f10a340b225a62.mockapi.io/products";

document.addEventListener("DOMContentLoaded", displayProductDetails);

// Adăugați (sau asigurați-vă că este inclusă) funcția de actualizare a contorului
// Aceasta ar trebui să fie definită într-un fișier global sau în cart.js și inclusă aici.
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  let totalItems = 0;
  const cartItems = Object.values(cart);

  cartItems.forEach((item) => {
    totalItems += item.quantity;
  });

  const cartCountElement = document.querySelector(".cart-count");
  if (cartCountElement) {
    cartCountElement.textContent = totalItems > 0 ? `(${totalItems})` : "";
  }
}

/**
 * Functia principala pentru a prelua si afisa un singur produs pe baza ID-ului din URL.
 */
function displayProductDetails() {
  // 1. Preluarea ID-ului din URL (query parameter: ?id=X)
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  const detailsContainer = document.getElementById("product-details");

  if (!productId) {
    detailsContainer.innerHTML =
      "<h2>❌ Eroare: ID-ul produsului lipsește din adresă.</h2>";
    return;
  }

  // 2. Construirea URL-ului și afișarea mesajului de încărcare
  const PRODUCT_URL = `${BASE_URL}/${productId}`;
  detailsContainer.innerHTML = `<p>Se încarcă detaliile produsului...</p>`;

  // 3. Preluarea datelor produsului de la MockAPI
  fetch(PRODUCT_URL)
    .then((response) => {
      if (!response.ok) {
        // Arunca o eroare daca produsul nu este gasit (e.g. 404)
        throw new Error("Produsul nu a fost găsit în baza de date!");
      }
      return response.json();
    })
    .then((product) => {
      // 4. Randarea detaliilor
      renderProduct(product, detailsContainer);

      // 5. Atasarea event listener-ului pe butonul nou creat
      attachAddToCartListener(product);

      // 6. Actualizeaza contorul cosului la incarcarea paginii
      updateCartCount();
    })
    .catch((error) => {
      console.error("Eroare la preluarea detaliilor:", error);
      detailsContainer.innerHTML = `<h2>⚠️ Eroare</h2><p>Eroare la rețea sau produsul nu există. ${error.message}</p>`;
    });
}

/**
 * Functie pentru a genera HTML-ul si a-l injecta in container.
 * ATENȚIE: Am folosit proprietățile din MockAPI (name, price, imageURL, description)
 */
function renderProduct(product, container) {
  container.innerHTML = `
        <img src="${product.imageURL}" alt="${product.name}" />
        <div class="details-info">
            <h2>${product.name}</h2>
            <div class="price">${product.price} LEI</div>
            
            <p class="description">
                ${product.description || "Fără descriere detaliată."}
            </p>
            
            <button 
                id="add-to-cart"
            >
                Adaugă în Coș
            </button>
        </div>
    `;
}

/**
 * Ataseaza logica de adaugare in cos la butonul de pe pagina de detalii.
 */
function attachAddToCartListener(product) {
  const button = document.getElementById("add-to-cart");

  if (button) {
    button.addEventListener("click", () => {
      const productId = product.id;
      let cart = JSON.parse(localStorage.getItem("cart")) || {};

      if (cart[productId]) {
        cart[productId].quantity++;
      } else {
        cart[productId] = {
          quantity: 1,
          price: parseFloat(product.price),
          image: product.imageURL,
          name: product.name,
          id: product.id, // ID-ul este esențial pentru funcționalitatea din cart.js
        };
      }

      localStorage.setItem("cart", JSON.stringify(cart));

      // 🟢 CORECTIE: Apelarea funcției de actualizare a contorului
      if (typeof updateCartCount === "function") {
        updateCartCount();
      }

      // Afișează notificare (dacă funcția showToast este definită)
      // if (typeof showToast === 'function') {
      //     showToast(`"${product.name}" a fost adăugat în coș!`);
      // }
    });
  }
}
