document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  updateCartBadge();

  // Xử lý tham số tìm kiếm từ URL
  setTimeout(() => {
    handleSearchParams();
  }, 500); // Đợi render xong rồi mới scroll
});

// Xử lý tham số tìm kiếm từ header
function handleSearchParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("productId");
  const section = urlParams.get("section");
  const searchName = urlParams.get("name");
  const searchQuery = urlParams.get("search");

  if (productId && section) {
    // Cuộn đến section chứa món ăn
    scrollToSection(section);

    // Highlight món ăn
    setTimeout(() => {
      highlightProduct(productId, searchName);
    }, 300);
  } else if (searchQuery) {
    // Tìm kiếm chung - highlight tất cả món khớp
    highlightSearchResults(searchQuery);
  }
}

// Cuộn đến section
function scrollToSection(sectionName) {
  let sectionElement = null;

  switch (sectionName) {
    case "best-sellers":
      sectionElement = document.querySelector(".best-selling-section");
      break;
    case "daily-offers":
      sectionElement = document.querySelector(".offer-section");
      break;
    case "main-dishes":
      sectionElement = document.querySelector(".suggest-section");
      break;
    case "desserts":
      sectionElement = document.querySelector(".dessert-section");
      break;
  }

  if (sectionElement) {
    sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Highlight món ăn cụ thể
function highlightProduct(productId, productName) {
  // Tìm tất cả product cards
  const allCards = document.querySelectorAll(".product-card, .offer-card, .dessert-card");

  allCards.forEach(card => {
    const cardName = card.querySelector(".product-title, .offer-title, .dessert-title");
    if (cardName && productName && cardName.textContent.includes(decodeURIComponent(productName))) {
      card.classList.add("search-highlight");
      card.scrollIntoView({ behavior: "smooth", block: "center" });

      // Xóa highlight sau 3 giây
      setTimeout(() => {
        card.classList.remove("search-highlight");
      }, 3000);
    }
  });
}

// Highlight tất cả kết quả tìm kiếm
function highlightSearchResults(query) {
  const decodedQuery = decodeURIComponent(query).toLowerCase();
  const allCards = document.querySelectorAll(".product-card, .offer-card, .dessert-card");
  let firstMatch = null;

  allCards.forEach(card => {
    const cardName = card.querySelector(".product-title, .offer-title, .dessert-title");
    if (cardName && cardName.textContent.toLowerCase().includes(decodedQuery)) {
      card.classList.add("search-highlight");
      if (!firstMatch) firstMatch = card;

      // Xóa highlight sau 5 giây
      setTimeout(() => {
        card.classList.remove("search-highlight");
      }, 5000);
    }
  });

  // Cuộn đến kết quả đầu tiên
  if (firstMatch) {
    firstMatch.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// Dữ liệu fallback khi không kết nối được Backend
const fallbackProducts = [
  // Best Sellers (8 món)
  { id: 1, name: "Cơm Tấm Sườn Bì Chả", price: 65000, discount: 15, bestSeller: true, category: "steak", image: "comtam.png" },
  { id: 2, name: "Phở Bò Tái Nạm", price: 55000, discount: 10, bestSeller: true, category: "steak", image: "phobo.png" },
  { id: 3, name: "Bánh Mì Chảo", price: 45000, discount: 20, bestSeller: true, category: "steak", image: "bmichao.png" },
  { id: 4, name: "Bún Bò Huế", price: 60000, discount: 0, bestSeller: true, category: "steak", image: "bunbo.png" },
  { id: 5, name: "Hủ Tiếu Nam Vang", price: 50000, discount: 15, bestSeller: true, category: "steak", image: "hutieu.png" },
  { id: 6, name: "Cơm Gà Xối Mỡ", price: 55000, discount: 10, bestSeller: true, category: "steak", image: "comga.png" },
  { id: 7, name: "Bánh Xèo Giòn", price: 45000, discount: 0, bestSeller: true, category: "steak", image: "banhxeo.png" },
  { id: 8, name: "Gỏi Cuốn Tôm Thịt", price: 40000, discount: 0, bestSeller: true, category: "steak", image: "goicuonthit.png" },

  // Main Dishes - Món chính (9 món)
  { id: 9, name: "Cơm Chiên Dương Châu", price: 45000, discount: 0, bestSeller: false, category: "steak", image: "comchien.png" },
  { id: 10, name: "Bún Riêu Cua", price: 55000, discount: 0, bestSeller: false, category: "steak", image: "bunrieuu.png" },
  { id: 11, name: "Nem Nướng Nha Trang", price: 50000, discount: 0, bestSeller: false, category: "steak", image: "nemnuong.png" },
  { id: 12, name: "Thịt Kho Tàu", price: 60000, discount: 0, bestSeller: false, category: "steak", image: "thitkho.png" },
  { id: 13, name: "Cá Kho Tộ", price: 65000, discount: 0, bestSeller: false, category: "steak", image: "cakho.png" },
  { id: 14, name: "Mì Quảng Đà Nẵng", price: 50000, discount: 0, bestSeller: false, category: "steak", image: "miquang2.png" },
  { id: 15, name: "Gà Nướng Mật Ong", price: 85000, discount: 0, bestSeller: false, category: "steak", image: "ganuong.png" },
  { id: 16, name: "Vịt Quay Bắc Kinh", price: 95000, discount: 0, bestSeller: false, category: "steak", image: "vitquay.png" },
  { id: 17, name: "Bò Kho Bánh Mì", price: 55000, discount: 0, bestSeller: false, category: "steak", image: "bokho.png" },

  // Desserts & Drinks - Tráng miệng & Đồ uống (9 món - không có discount)
  { id: 18, name: "Chè Khúc Bạch", price: 35000, discount: 0, bestSeller: false, category: "dessert", image: "khucbach.png" },
  { id: 19, name: "Chè Thái Thập Cẩm", price: 35000, discount: 0, bestSeller: false, category: "dessert", image: "chethai.png" },
  { id: 20, name: "Chè Chuối Nướng", price: 30000, discount: 0, bestSeller: false, category: "dessert", image: "chechuoi.png" },
  { id: 21, name: "Bánh Flan Caramen", price: 25000, discount: 0, bestSeller: false, category: "dessert", image: "banhplan.png" },
  { id: 22, name: "Bánh Đậu Xanh", price: 30000, discount: 0, bestSeller: false, category: "dessert", image: "banhdau.png" },
  { id: 23, name: "Bánh Lọt Lá Dứa", price: 30000, discount: 0, bestSeller: false, category: "dessert", image: "banhlot.png" },
  { id: 24, name: "Trà Sen Vàng", price: 35000, discount: 0, bestSeller: false, category: "dessert", image: "trasen.png" },
  { id: 25, name: "Nước Chanh Tươi", price: 25000, discount: 0, bestSeller: false, category: "dessert", image: "nuocchanh.png" },
  { id: 26, name: "Bánh Dâu Tây", price: 40000, discount: 0, bestSeller: false, category: "dessert", image: "dautay.png" },
];

async function fetchProducts() {
  try {
    const response = await fetch("http://localhost:8080/api/products");
    if (!response.ok) throw new Error("Lỗi kết nối Server");
    const products = await response.json();

    console.log("Dữ liệu món ăn:", products);

    renderBestSellers(products);
    renderDailyOffers(products);
    renderMainDishes(products);
    renderDesserts(products);
  } catch (error) {
    console.error("Lỗi:", error);
    console.log("--> Sử dụng dữ liệu fallback cho trang Menu...");

    // Sử dụng dữ liệu fallback khi không kết nối được backend
    renderBestSellers(fallbackProducts);
    renderDailyOffers(fallbackProducts);
    renderMainDishes(fallbackProducts);
    renderDesserts(fallbackProducts);
  }
}

function renderBestSellers(products) {
  const container = document.querySelector(".best-selling-section .product-grid");
  if (container) {
    const list = products.filter((p) => p.bestSeller === true).slice(0, 8);
    container.innerHTML = list.map((p) => createProductCard(p)).join("");
  }
}

function renderDailyOffers(products) {
  const container = document.querySelector(".daily-offer-section .offer-grid") ||
    document.querySelector(".daily-offer-section .product-grid");
  if (container) {
    const list = products.filter((p) => p.discount > 0).slice(0, 5);
    container.innerHTML = list.map((p) => createProductCard(p)).join("");
  }
}

function renderMainDishes(products) {
  const container = document.querySelector(".suggestion-grid");
  if (container) {
    const list = products.filter((p) => p.category === "steak").slice(0, 9);
    container.innerHTML = list.map((p) => createSuggestionCard(p)).join("");
  }
}

function renderDesserts(products) {
  const container = document.querySelector(".dessert-grid");
  if (container) {
    const list = products.filter((p) => p.category === "dessert");
    container.innerHTML = list.map((product) => `
        <div class="dessert-card" onclick="window.location.href='product-detail.html?id=${product.id}'" style="cursor: pointer;">
            <div class="dessert-img-wrap">
                <div class="dessert-bg-shape"></div>
                <img src="${getCleanImageUrl(product.image)}" alt="${product.name}" onerror="this.src='https://placehold.co/300x300?text=Sakedo'">
            </div>
            <div class="dessert-info">
                <h3 class="dessert-name">${product.name}</h3>
                <div class="dessert-price-row">
                    <span class="d-price">${product.price.toLocaleString()}đ</span>
                    <button class="btn-d-cart" onclick="event.stopPropagation(); quickAddToCart(${product.id}, '${product.name}', ${product.price}, ${product.price}, '${product.image}')">
                        <i class="fas fa-shopping-basket"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join("");
  }
}

function createProductCard(product) {
  let finalPrice = product.price;
  let priceHTML = `<span class="price">${product.price.toLocaleString()}đ</span>`;

  if (product.discount && product.discount > 0) {
    finalPrice = (product.price * (100 - product.discount)) / 100;
    priceHTML = `
            <div class="price-container">
                <span class="old-price-display">${product.price.toLocaleString()}đ</span>
                <span class="new-price-display">${finalPrice.toLocaleString()}đ</span>
            </div>`;
  }

  return `
        <div class="product-card" onclick="window.location.href='product-detail.html?id=${product.id}'" style="cursor: pointer;">
            <div class="card-img" style="position: relative;">
                <img src="${getCleanImageUrl(product.image)}" alt="${product.name}" onerror="this.src='https://placehold.co/300x300?text=Sakedo'">
                ${product.discount > 0 ? `<div class="sale-tag">-${product.discount}%</div>` : ""}
            </div>
            <div class="card-info">
                <div class="rating"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                <h3 class="product-name" style="min-height: 40px; margin-bottom: 5px;">${product.name}</h3>
                <div class="price-row">
                    ${priceHTML}
                    <button class="add-cart-btn" onclick="event.stopPropagation(); quickAddToCart(${product.id}, '${product.name}', ${finalPrice}, ${product.price}, '${product.image}')">
                        <i class="fas fa-shopping-basket"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createSuggestionCard(product) {
  return `
        <div class="suggest-card" onclick="window.location.href='product-detail.html?id=${product.id}'" style="cursor: pointer;">
            <div class="suggest-img-wrap">
                <div class="bg-circle"></div>
                <img src="${getCleanImageUrl(product.image)}" alt="${product.name}" onerror="this.src='https://placehold.co/300x300?text=Sakedo'">
            </div>
            <div class="suggest-info">
                <h3 class="suggest-name">${product.name}</h3>
                <div class="suggest-price-row">
                    <span class="s-price">${product.price.toLocaleString()}đ</span>
                    <button class="btn-s-cart" onclick="event.stopPropagation(); quickAddToCart(${product.id}, '${product.name}', ${product.price}, ${product.price}, '${product.image}')">
                        <i class="fas fa-shopping-basket"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getCleanImageUrl(imgName) {
  if (!imgName || imgName.trim() === "") return "https://placehold.co/300x300?text=No+Image";
  if (imgName.startsWith("http") || imgName.startsWith("data:")) return imgName;
  return `../assets/images/${imgName.replace(/^.*[\\\/]/, '')}`;
}

async function quickAddToCart(id, name, price, originalPrice, image) {
  let cleanImage = "no-image.png";
  if (image) {
    if (image.startsWith("http")) {
      cleanImage = image;
    } else if (image.startsWith("data:")) {
      cleanImage = "no-image.png";
    } else {
      cleanImage = image.replace(/^.*[\\\/]/, '');
    }
  }

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find((item) => item.id == id);

  if (existing) {
    existing.quantity += 1;
    existing.price = price;
    existing.originalPrice = originalPrice;
    existing.image = cleanImage;
  } else {
    cart.push({
      id: id,
      name: name,
      price: price,
      originalPrice: originalPrice,
      image: cleanImage,
      quantity: 1,
      note: ""
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  try {
    await syncCartToMongoDB();
  } catch (err) {
    console.warn("Không sync được MongoDB:", err);
  }

  alert(`Đã thêm "${name}" vào giỏ hàng!`);
}

async function syncCartToMongoDB() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let userId = "guest";
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) userId = user.id;
    else if (user && user.email) userId = user.email;
  } catch (e) { }

  if (userId === "guest") {
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = "guest_" + Date.now();
      localStorage.setItem("guestId", guestId);
    }
    userId = guestId;
  }

  console.log("--> Sync giỏ hàng lên MongoDB, user:", userId, ", items:", cart.length);

  const response = await fetch("http://localhost:8080/api/orders/cart/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId,
      items: cart
    })
  });

  if (response.ok) {
    const result = await response.json();
    console.log("--> ✅ Sync thành công:", result);
    if (result.orderId) {
      localStorage.setItem("currentOrderId", result.orderId);
    }
  } else {
    console.error("--> ❌ Sync thất bại");
  }
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badges = document.querySelectorAll(".cart-count");
  badges.forEach((b) => (b.innerText = total));
}