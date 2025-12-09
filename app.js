const data = [
  { name: "학식당", price: 5000, menu: "돈까스" },
  { name: "샤브향", price: 15000, menu: "샤브샤브" },
  { name: "조대포", price: 9000, menu: "돼지국밥" }
];

function filterPrice(maxPrice) {
  const result = data.filter(item => item.price <= maxPrice);

  document.getElementById("result").innerHTML =
    result.map(r => `<p>${r.name} - ${r.price}원</p>`).join("");
}
