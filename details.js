const searchParams = new URLSearchParams(window.location.search);
const id = searchParams.get("id");

const URL = "https://69030bc3d0f10a340b225a62.mockapi.io/products";

fetch(`${URL}/${id}`)
  .then((response) => response.json())
  .then(
    (product) =>
      (document.querySelector(".details-container").innerHTML = product.details)
  );
