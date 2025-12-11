console.log("script.js loaded");

const FAV_KEY = "favs";
const RECENT_KEY = "recentSearches";
const RECENT_LIMIT = 5;

/* -----------------------------
   ⭐ 즐겨찾기
----------------------------- */
function getFavs() {
  return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
}

function setFavs(list) {
  localStorage.setItem(FAV_KEY, JSON.stringify(list));
}

/* -----------------------------
   ⭐ 최근 검색어
----------------------------- */
function getRecentSearches() {
  return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
}

function addRecentSearch(keyword) {
  if (!keyword || keyword.trim() === "") return;

  let list = getRecentSearches();
  list = list.filter(v => v !== keyword);
  list.unshift(keyword);

  if (list.length > RECENT_LIMIT) {
    list = list.slice(0, RECENT_LIMIT);
  }

  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  renderRecentSearches();
}

function renderRecentSearches() {
  const box = document.getElementById("recentSearches");
  const list = getRecentSearches();

  if (!box) return;

  if (list.length === 0) {
    box.innerHTML = "<p>최근 검색어 없음</p>";
    return;
  }

  box.innerHTML = list
    .map(item => `<button class="recent-btn" data-key="${item}">${item}</button>`)
    .join("");

  document.querySelectorAll(".recent-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const keyword = this.dataset.key;
      document.getElementById("searchInput").value = keyword;
      autoSearch();
    });
  });
}

/* -----------------------------
   ⭐ 가격 비교
----------------------------- */
function priceMatch(storePrice, selectedPrice) {
  if (selectedPrice === "전체") return true;
  if (!storePrice.includes("이하")) return false;

  const LEVEL = {
    "1만원 이하": 1,
    "2만원 이하": 2,
    "3만원 이하": 3,
  };

  return LEVEL[storePrice] <= LEVEL[selectedPrice];
}

/* -----------------------------
   ⭐ 필터링
----------------------------- */
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

/* -----------------------------
   ⭐ 검색 결과 출력
----------------------------- */
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
          <a href="${naverLink}" target="_blank" class="store-name">${item.name}</a>
          <div class="store-sub">${item.sub}</div>
          <div class="store-price">${item.price}</div>
          <button class="fav-btn" data-name="${item.name}">${star}</button>
        </div>
      `;
    })
    .join("");

  document.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const name = this.dataset.name;
      let favs = getFavs();

      if (favs.includes(name)) {
        favs = favs.filter(v => v !== name);
      } else {
        favs.push(name);
      }

      setFavs(favs);

      const favOnly = document.getElementById("favOnly").checked;
      if (favOnly) {
        autoSearch();
      } else {
        this.textContent = favs.includes(name) ? "★" : "⭐";
      }
    });
  });
}

/* -----------------------------
   ⭐ 자동 검색
----------------------------- */
function autoSearch() {
  const keyword = document.getElementById("searchInput").value.trim();
  const selectedCategory = document.getElementById("categorySelect").value;
  const selectedPrice = document.getElementById("priceSelect").value;
  const favOnly = document.getElementById("favOnly").checked;

  if (keyword) addRecentSearch(keyword);

  const list = getFilteredStores({
    keyword,
    selectedCategory,
    selectedPrice,
    favOnly,
  });

  showResult(list);
}

/* -----------------------------
   ⭐ DOMContentLoaded
----------------------------- */
document.addEventListener("DOMContentLoaded", function () {

  console.log("DOM fully loaded");

  // 검색 버튼
  document.getElementById("searchBtn").addEventListener("click", function () {
    const keyword = document.getElementById("searchInput").value.trim();
    const selectedCategory = document.getElementById("categorySelect").value;
    const selectedPrice = document.getElementById("priceSelect").value;
    const favOnly = document.getElementById("favOnly").checked;

    addRecentSearch(keyword);

    const list = getFilteredStores({
      keyword,
      selectedCategory,
      selectedPrice,
      favOnly,
    });

    showResult(list);
  });

  // 자동 검색 요소
  document.getElementById("categorySelect").addEventListener("change", autoSearch);
  document.getElementById("priceSelect").addEventListener("change", autoSearch);
  document.getElementById("favOnly").addEventListener("change", autoSearch);

  // 랜덤 버튼
  document.getElementById("randomBtn").addEventListener("click", function () {
    const keyword = document.getElementById("searchInput").value.trim();
    const selectedCategory = document.getElementById("categorySelect").value;
    const selectedPrice = document.getElementById("priceSelect").value;

    const filtered = getFilteredStores({
      keyword,
      selectedCategory,
      selectedPrice,
      favOnly: false,
    });

    if (filtered.length === 0) {
      alert("조건에 맞는 식당이 없습니다.");
      return;
    }

    const randomStore = filtered[Math.floor(Math.random() * filtered.length)];
    const naverLink = `https://map.naver.com/v5/search/${encodeURIComponent(randomStore.name)}`;

    document.getElementById("result").innerHTML = `
      <div class="result-card" style="border:2px solid #6c5ce7;">
        <span class="tag tag-${randomStore.category}">${randomStore.category}</span>
        <a href="${naverLink}" target="_blank" class="store-name">${randomStore.name} 🎉</a>
        <div class="store-sub">${randomStore.sub}</div>
        <div class="store-price">${randomStore.price}</div>
      </div>
    `;
  });

  // 최근 검색어 출력
  renderRecentSearches();
});
