document.addEventListener("DOMContentLoaded", showCart);

const cartContainer = document.querySelector(".cart-container");
const totalPriceContainer = document.querySelector(".total-price-container");
const cartCountContaier = document.querySelector("#cart-count");
let cart;

function showCart() {
  cart = JSON.parse(localStorage.getItem("cart"));

  let total = 0;
  let totalNumberOfProducts = 0;

  cartContainer.innerHTML = "";

  for (let id in cart) {
    cartContainer.innerHTML += `
         <div class="card-cart">
            <img width="50px" src=${cart[id].image} >
            <span>${cart[id].name}</span>
            <span>${cart[id].price}</span>
            <div>
               <button class="decrease" data-id=${id}>-</button>
               <span>${cart[id].quantity}</span>
               <button class="increase" data-id=${id}>+</button>
            </div>
            <span>${cart[id].price * cart[id].quantity} lei</span>
            <button data-id="${id}" class="delete">Sterge</button>
            
         `;
    total += cart[id].price * cart[id].quantity;
    totalNumberOfProducts += cart[id].quantity;
  }
  totalPriceContainer.innerHTML =
    total === 0
      ? "Cosul de cumparaturi este gol"
      : `Total: ${total.toFixed(2)} lei`;

  cartCountContaier.innerHTML = totalNumberOfProducts;
}

cartContainer.addEventListener("click", (e) => {
  const btn = event.target;
  const id = btn.dataset.id;
  console.log(id);

  if (btn.classList.contains("increase")) {
    cart[id].quantity++;
    console.log("+++++", btn);
  } else if (btn.classList.contains("decrease")) {
    if (cart[id].quantity === 1) {
      console.log(btn);
      btn.disabled = true;
      btn.style.backgroundColor = "red";
    } else {
      cart[id].quantity--;
      console.log(btn);
    }
  } else if (btn.classList.contains("delete")) {
    delete cart[id];
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  showCart();
});
