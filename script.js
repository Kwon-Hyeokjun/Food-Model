console.log("script.js 로드됨"); // 디버깅용

const FAV_KEY = "favs";

// ⭐ 즐겨찾기 불러오기
function getFavs() {
  return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
}

// ⭐ 즐겨찾기 저장
function setFavs(list) {
  localStorage.setItem(FAV_KEY, JSON.stringify(list));
}

// ⭐ 가격 비교 함수 (공통으로 사용)
function priceMatch(storePrice, selectedPrice) {
  if (selectedPrice === "전체") return true;

  // "1800/100g" 같은 특수 가격은 일반 가격 필터랑 안 맞게 처리
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

// ⭐ 공통 필터 함수
function getFilteredStores({ keyword, selectedCategory, selectedPrice, favOnly }) {
  const favs = getFavs();

  return STORE_DATA.filter(store => {
    const matchCategory =
      selectedCategory === "전체" || store.category === selectedCategory;

    const matchPrice = priceMatch(store.price, selectedPrice);

    const matchKeyword =
      keyword === "" ||
      store.name.includes(keyword) ||
      store.sub.includes(keyword);

    const matchFav = !favOnly || favs.includes(store.name);

    return matchCategory && matchPrice && matchKeyword && matchFav;
  });
}

// ⭐ 결과 출력
function showResult(list) {
  const box = document.getElementById("result");
  const favs = getFavs();

  if (list.length === 0) {
    box.innerHTML = "<p>검색 결과 없음</p>";
    return;
  }

  box.innerHTML = list
    .map(item => {
      const naverLink = `https://map.naver.com/v5/search/${encodeURIComponent(item.name)}`;
      const isFav = favs.includes(item.name);
      const star = isFav ? "★" : "⭐";

      return `
        <div class="result-card">
          <span class="tag tag-${item.category}">${item.category}</span>

          <a href="${naverLink}" target="_blank" class="store-name" style="color:#4a7cff; text-decoration:none;">
            ${item.name}
          </a>

          <div class="store-sub">${item.sub}</div>
          <div class="store-price">${item.price}</div>

          <button class="fav-btn" data-name="${item.name}">
            ${star}
          </button>
        </div>
      `;
    })
    .join("");

  // ⭐ 결과 카드의 "즐겨찾기" 버튼 클릭 이벤트
  document.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const name = this.dataset.name;
      let favs = getFavs();

      if (favs.includes(name)) {
        // 이미 있으면 제거
        favs = favs.filter(v => v !== name);
      } else {
        // 없으면 추가
        favs.push(name);
      }
      setFavs(favs);

      // 즐겨찾기만 보기 체크된 상태면 리스트를 다시 필터링
      const favOnly = document.getElementById("favOnly").checked;
      if (favOnly) {
        autoSearch(); // 목록 다시 그림
      } else {
        // 아니면 버튼 모양만 즉시 변경
        this.textContent = favs.includes(name) ? "★" : "⭐";
      }
    });
  });
}

// ------------------------------
// 🔍 검색 버튼 클릭
// ------------------------------
document.getElementById("searchBtn").addEventListener("click", function () {
  const keyword = document.getElementById("searchInput").value.trim();
  const selectedCategory = document.getElementById("categorySelect").value;
  const selectedPrice = document.getElementById("priceSelect").value;
  const favOnly = document.getElementById("favOnly").checked;

  const result = getFilteredStores({
    keyword,
    selectedCategory,
    selectedPrice,
    favOnly,
  });

  showResult(result);
});

// ------------------------------
// 🔁 카테고리 & 가격 & 즐겨찾기 체크 시 자동 검색
// ------------------------------
document.getElementById("categorySelect").addEventListener("change", autoSearch);
document.getElementById("priceSelect").addEventListener("change", autoSearch);
document.getElementById("favOnly").addEventListener("change", autoSearch);

function autoSearch() {
  const keyword = document.getElementById("searchInput").value.trim();
  const selectedCategory = document.getElementById("categorySelect").value;
  const selectedPrice = document.getElementById("priceSelect").value;
  const favOnly = document.getElementById("favOnly").checked;

  const result = getFilteredStores({
    keyword,
    selectedCategory,
    selectedPrice,
    favOnly,
  });

  showResult(result);
}

// ------------------------------
// 🎲 랜덤 추천 기능
// ------------------------------
document.getElementById("randomBtn").addEventListener("click", function () {
  const keyword = document.getElementById("searchInput").value.trim();
  const selectedCategory = document.getElementById("categorySelect").value;
  const selectedPrice = document.getElementById("priceSelect").value;

  // 랜덤 추천은 즐겨찾기 여부 상관없이 전체에서 뽑기 (원하면 favOnly도 넣어도 됨)
  const filtered = getFilteredStores({
    keyword,
    selectedCategory,
    selectedPrice,
    favOnly: false,
  });

  if (filtered.length === 0) {
    alert("현재 조건에 맞는 식당이 없습니다!");
    return;
  }

  const randomStore = filtered[Math.floor(Math.random() * filtered.length)];

  const naverLink = `https://map.naver.com/v5/search/${encodeURIComponent(randomStore.name)}`;

  document.getElementById("result").innerHTML = `
    <div class="result-card" style="border: 2px solid #6c5ce7;">
      <span class="tag tag-${randomStore.category}">${randomStore.category}</span>
      <a href="${naverLink}" target="_blank" class="store-name" style="color:#4a7cff; text-decoration:none;">
        ${randomStore.name} 🎉
      </a>
      <div class="store-sub">${randomStore.sub}</div>
      <div class="store-price">${randomStore.price}</div>
      <p style="margin-top:8px; color:#6c5ce7; font-weight:bold;">랜덤 추천!</p>
    </div>
  `;
});
