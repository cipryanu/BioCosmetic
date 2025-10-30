window.addEventListener("DOMContentLoaded", displayProducts);

const URL = "https://69030bc3d0f10a340b225a62.mockapi.io/products";

function displayProducts() {
  fetch(URL)
    .then((response) => {
      if (response.ok === false) {
        throw new Error("Network error!");
      } else {
        return response.json();
      }
    })
    .then((products) => {
      document.querySelector(".products-container").innerHTML = products
        .map(
          (product) => `
         <div class="product-card">
				<img
					src=${product.imageURL}
					alt="Product image"
				/>
				<div class="product-info">
					<h3>${product.name}</h3>
					<div class="price">${product.price} LEI</div>
					<div class="buttons">
						<a href="details.html?id=${product.id}" class="details-btn">Details</a>
						<button data-id=${product.id} class="cart-btn">Add to Cart</button>
					</div>
				</div>
			</div>   
      `
        )
        .join("");
      const addToCartButtons = document.querySelectorAll(".cart-btn");
      addToCartButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          const productId = e.target.dataset.id;
          const product = products.filter(
            (product) => product.id === productId
          )[0];
          console.log(product);

          let cart = JSON.parse(localStorage.getItem("cart")) || {};

          if (cart[productId]) {
            cart[productId].quantity++;
          } else {
            cart[productId] = {
              quantity: 1,
              price: product.price,
              image: product.imageURL,
              name: product.name,
            };
          }

          localStorage.setItem("cart", JSON.stringify(cart));
        });
      });
    });
}
