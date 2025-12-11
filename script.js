console.log("script.js 로드됨"); // 디버깅용

document.getElementById("searchBtn").addEventListener("click", function () {
  const keyword = document.getElementById("searchInput").value.trim();
  const selectedCategory = document.getElementById("categorySelect").value;
  const selectedPrice = document.getElementById("priceSelect").value;

  // ⭐ 가격 비교 함수
  function priceMatch(storePrice, selectedPrice) {
   if (selectedPrice === "전체") return true;

    if (storePrice.includes("원")) {
      // ex) "1만원 이하"
      return storePrice === selectedPrice;
    }

    // 마라탕(1800/100g) 같은 경우 필터에서 제외
    return selectedPrice === "3만원 이하"; 
  }

  // ⭐ 필터링 수행
  const result = STORE_DATA.filter(store => {
   const matchCategory =
      selectedCategory === "전체" || store.category === selectedCategory;

    const matchPrice = priceMatch(store.price, selectedPrice);

    const matchKeyword =
      keyword === "" ||
      store.name.includes(keyword) ||
      store.sub.includes(keyword);

    return matchCategory && matchPrice && matchKeyword;
  });

  showResult(result);
});

// 결과 출력
function showResult(list) {
  const box = document.getElementById("result");

  if (list.length === 0) {
    box.innerHTML = "<p>검색 결과 없음</p>";
    return;
  }

  box.innerHTML = list
    .map(
      item => `
      <div class="result-card">
        <span class="tag tag-${item.category}">${item.category}</span>
        <div class="store-name">${item.name}</div>
        <div class="store-sub">${item.sub}</div>
        <div class="store-price">${item.price}</div>
      </div>
      `
    )
    .join("");
}

// ------------------------------
// ⭐ 카테고리 & 가격 선택 시 자동 검색
// ------------------------------
document.getElementById("categorySelect").addEventListener("change", autoSearch);
document.getElementById("priceSelect").addEventListener("change", autoSearch);

function autoSearch() {
  const keyword = document.getElementById("searchInput").value.trim();
  const selectedCategory = document.getElementById("categorySelect").value;
  const selectedPrice = document.getElementById("priceSelect").value;

  function priceMatch(storePrice, selectedPrice) {
  if (selectedPrice === "전체") return true;

  // "1800/100g" 같은 경우 숫자 비교 불가 → 가격 필터 적용 X
  if (!storePrice.includes("이하")) return false;

  // 가격 등급 숫자로 변환
  const LEVEL = {
    "1만원 이하": 1,
    "2만원 이하": 2,
    "3만원 이하": 3,
    "4만원 이하": 4,
  };

  const storeLevel = LEVEL[storePrice];
  const selectedLevel = LEVEL[selectedPrice];

  // 가격 등급이 존재하지 않는다면 false
  if (!storeLevel || !selectedLevel) return false;

  // ⭐ 선택 가격보다 낮거나 같으면 통과
  return storeLevel <= selectedLevel;
}


  const result = STORE_DATA.filter(store => {
    const matchCategory =
      selectedCategory === "전체" || store.category === selectedCategory;

    const matchPrice = priceMatch(store.price, selectedPrice);

    const matchKeyword =
      keyword === "" ||
      store.name.includes(keyword) ||
      store.sub.includes(keyword);

    return matchCategory && matchPrice && matchKeyword;
  });

  showResult(result);
}
// ⭐ 랜덤 추천 기능
document.getElementById("randomBtn").addEventListener("click", function () {
  // 현재 카테고리/가격/키워드 조건 적용해서 랜덤 추천하기
  const keyword = document.getElementById("searchInput").value.trim();
  const selectedCategory = document.getElementById("categorySelect").value;
  const selectedPrice = document.getElementById("priceSelect").value;

  // 가격 비교 함수 (기존 autoSearch와 동일)
  function priceMatch(storePrice, selectedPrice) {
    if (selectedPrice === "전체") return true;
    if (!storePrice.includes("이하")) return false;

    const LEVEL = {
      "1만원 이하": 1,
      "2만원 이하": 2,
      "3만원 이하": 3,
      "4만원 이하": 4,
    };

    const storeLevel = LEVEL[storePrice];
    const selectedLevel = LEVEL[selectedPrice];

    if (!storeLevel || !selectedLevel) return false;

    return storeLevel <= selectedLevel;
  }

  // 현재 조건으로 필터링
  const filtered = STORE_DATA.filter(store => {
    const matchCategory =
      selectedCategory === "전체" || store.category === selectedCategory;
    const matchPrice = priceMatch(store.price, selectedPrice);
    const matchKeyword =
      keyword === "" ||
      store.name.includes(keyword) ||
      store.sub.includes(keyword);
    return matchCategory && matchPrice && matchKeyword;
  });

  if (filtered.length === 0) {
    alert("현재 조건에 맞는 식당이 없습니다!");
    return;
  }

  // 랜덤으로 하나 추천
  const randomStore = filtered[Math.floor(Math.random() * filtered.length)];

  // 결과 박스에 강조해서 띄우기
  document.getElementById("result").innerHTML = `
    <div class="result-card" style="border: 2px solid #6c5ce7;">
      <span class="tag tag-${randomStore.category}">${randomStore.category}</span>
      <div class="store-name">${randomStore.name} 🎉</div>
      <div class="store-sub">${randomStore.sub}</div>
      <div class="store-price">${randomStore.price}</div>
      <p style="margin-top:8px; color:#6c5ce7; font-weight:bold;">랜덤 추천!</p>
    </div>
  `;
});
