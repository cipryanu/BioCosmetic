window.addEventListener("DOMContentLoaded", renderTable);

const URL = "https://69030bc3d0f10a340b225a62.mockapi.io/products";

const tableBody = document.querySelector("#products-table tbody");
const addOrEditBtn = document.querySelector("#add-or-edit-btn");
let isEditMode = false;
let productId = null;

const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const imageURLInput = document.getElementById("imageURL");
const descriptionInput = document.getElementById("description");

// ========== RENDER TABLE ==========
function renderTable() {
  fetch(URL)
    .then((response) => response.json())
    .then((products) => {
      tableBody.innerHTML = products
        .map(
          (product, index) => `
            <tr data-id="${product.id}">
              <td>${index + 1}</td>
              <td class="cell-img"><img src="${product.imageURL}" alt="${
            product.name
          }" style="width:60px;height:60px;object-fit:cover;border-radius:8px;"></td>
              <td class="cell-name">${product.name}</td>
              <td class="cell-price">${product.price} RON</td>
              <td>
                <div class="actions">
                  <button class="btn edit" data-action="edit"><i class="fa-solid fa-pen-to-square"></i></button>
                  <button class="btn delete" data-action="delete"><i class="fa-solid fa-trash"></i></button>
                </div>
              </td>
            </tr>`
        )
        .join("");
    })
    .catch((err) => console.error("Eroare la încărcarea produselor:", err));
}

// ========== ADD / EDIT PRODUCT ==========
addOrEditBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const newProduct = {
    name: nameInput.value.trim(),
    price: parseFloat(priceInput.value),
    imageURL: imageURLInput.value.trim(),
    details: descriptionInput.value.trim(),
  };

  if (!newProduct.name || !newProduct.imageURL || isNaN(newProduct.price)) {
    alert("Completează toate câmpurile corect!");
    return;
  }

  const method = isEditMode ? "PUT" : "POST";
  const apiUrl = isEditMode ? `${URL}/${productId}` : URL;

  fetch(apiUrl, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProduct),
  })
    .then((res) => res.json())
    .then(() => {
      renderTable();
      resetForm();
    })
    .catch((err) => console.error("Eroare la salvare:", err));
});

// ========== RESET FORM ==========
function resetForm() {
  nameInput.value = "";
  priceInput.value = "";
  imageURLInput.value = "";
  descriptionInput.value = "";
  addOrEditBtn.textContent = "Adaugă produs";
  isEditMode = false;
  productId = null;
}

// ========== HANDLE EDIT / DELETE ==========
tableBody.addEventListener("click", (e) => {
  const actionBtn = e.target.closest("button");
  if (!actionBtn) return;

  const action = actionBtn.dataset.action;
  const row = actionBtn.closest("tr");
  const id = row.dataset.id;

  if (action === "edit") {
    fetch(`${URL}/${id}`)
      .then((res) => res.json())
      .then((product) => {
        nameInput.value = product.name;
        priceInput.value = product.price;
        imageURLInput.value = product.imageURL;
        descriptionInput.value = product.details || "";
        addOrEditBtn.textContent = "Salvează";
        isEditMode = true;
        productId = id;
      })
      .catch((err) => console.error("Eroare la editare:", err));
  }

  if (action === "delete") {
    if (confirm("Ești sigur că vrei să ștergi acest produs?")) {
      fetch(`${URL}/${id}`, { method: "DELETE" })
        .then(() => renderTable())
        .catch((err) => console.error("Eroare la ștergere:", err));
    }
  }
});
