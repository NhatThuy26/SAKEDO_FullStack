document.addEventListener("DOMContentLoaded", function () {
  // Ngay khi web tải xong, gọi hàm lấy dữ liệu
  fetchAllProducts();
});

// --- HÀM CHÍNH: GỌI API ---
function fetchAllProducts() {
  fetch("http://localhost:8080/api/products")
    .then((res) => res.json())
    .then((products) => {
      console.log("Đã lấy được danh sách món:", products);

      // 1. Điền dữ liệu vào Banner (Món đầu tiên hoặc món bán chạy nhất)
      renderHeroProduct(products);

      // 2. Điền dữ liệu vào mục Ưu đãi (Món có giảm giá)
      renderPromoSection(products);

      // 3. Điền dữ liệu vào Carousel (Món ngon phải thử)
      renderBestSellers(products);

      // 4. Kích hoạt logic chuyển Tab (Tráng miệng / Món chính...)
      setupMenuTabs(products);
    })
    .catch((err) => {
      console.error("Lỗi kết nối API:", err);
      // Nếu lỗi thì thôi, để yên giao diện tĩnh hoặc hiện thông báo nhỏ
    });
}

// ==============================================
// 1. XỬ LÝ BANNER (HERO SECTION)
// ==============================================
function renderHeroProduct(products) {
  // Tìm khu vực banner bằng ID mà chúng ta đã thêm ở index.html
  const heroArea = document.getElementById("hero-product-area");
  if (!heroArea || products.length === 0) return;

  // Lấy món đầu tiên trong danh sách làm Banner (hoặc lọc món nào bạn thích)
  const product = products[0];
  const price = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(product.price);

  // Thay thế HTML bên trong, giữ nguyên Class CSS cũ (.hero-card, .float-card...)
  heroArea.innerHTML = `
        <div class="hero-card float-card">
            <div class="card-info">
                <span class="badge">Best Seller</span>
                <h3>${price}</h3>
                <p>${product.name}</p>
                <div class="stars">★★★★★</div>
            </div>
            <img src="../assets/images/${product.image}" 
                 alt="${product.name}" 
                 class="card-img"
                 onerror="this.src='https://via.placeholder.com/400x400?text=Sakedo'"/>
        </div>
    `;
}

// ==============================================
// 2. XỬ LÝ MỤC KHÁM PHÁ ƯU ĐÃI (PROMOTION)
// ==============================================
function renderPromoSection(products) {
  const container = document.getElementById("promo-container");
  if (!container) return;

  // Lọc ra các món có discount > 0, lấy tối đa 4 món
  const promoItems = products.filter((p) => p.discount > 0).slice(0, 4);

  // Tạo HTML giữ nguyên class .promo-card, thêm onclick để chuyển trang
  container.innerHTML = promoItems
    .map(
      (item) => `
        <div class="promo-card" onclick="window.location.href='product-detail.html?id=${item.id}'" style="cursor: pointer;">
            <img src="../assets/images/${item.image}" 
                 alt="${item.name}" 
                 class="promo-img" 
                 onerror="this.src='https://via.placeholder.com/300'"/>
            <div class="promo-overlay">
                <h3 class="dish-name">${item.name.toUpperCase()}</h3>
            </div>
            <div class="discount-badge"><span>-${item.discount}%</span></div>
        </div>
    `
    )
    .join("");
}

// ==============================================
// 3. XỬ LÝ CAROUSEL (MÓN NGON PHẢI THỬ)
// ==============================================
function renderBestSellers(products) {
  const track = document.getElementById("mustTryTrack");
  if (!track) return;

  // Lọc món Best Seller
  const bestSellers = products.filter((p) => p.bestSeller === true);

  // Tạo HTML giữ nguyên class .food-card phức tạp của bạn
  track.innerHTML = bestSellers
    .map((item) => {
      const price = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(item.price);

      // Tính giá cũ giả định (để hiển thị cho đẹp nếu có giảm giá)
      // Nếu không giảm giá thì ẩn giá cũ đi
      let oldPriceHtml = "";
      if (item.discount > 0) {
        const oldPrice = (item.price * (100 + item.discount)) / 100;
        const oldPriceStr = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(oldPrice);
        oldPriceHtml = `<span class="old-price">${oldPriceStr}</span>`;
      }

      return `
            <div class="food-card" onclick="window.location.href='product-detail.html?id=${item.id}'" style="cursor: pointer;">
                <div class="card-header">
                    <span class="sale-badge">HOT</span>
                    <div class="img-bg"></div>
                    <img src="../assets/images/${item.image}" 
                         alt="${item.name}" 
                         class="food-img"
                         onerror="this.src='https://via.placeholder.com/200'"/>
                </div>
                <div class="card-body">
                    <h3 class="food-title">${item.name}</h3>
                    <div class="price-row">
                        <div class="price-info">
                            ${oldPriceHtml}
                            <span class="new-price">${price}</span>
                        </div>
                        <button class="cart-btn-small" onclick="event.stopPropagation(); handleHomeAddToCart(${item.id}, '${item.name.replace(/'/g, "\\'").replace(/"/g, '&quot;')}', ${item.price}, '${item.image}')">
                            <i class="fas fa-shopping-bag"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");
}

// ==============================================
// 4. XỬ LÝ TAB MENU (TRÁNG MIỆNG / MÓN CHÍNH)
// ==============================================
function setupMenuTabs(allProducts) {
  const tabs = document.querySelectorAll(".cat-item");
  const listContainer = document.getElementById("menu-list");
  const titleElement = document.getElementById("menu-title");
  const imgElement = document.getElementById("menu-img");

  // Hàm vẽ lại danh sách khi bấm Tab
  const renderList = (category) => {
    // Lọc món theo loại (steak, dessert, coffee)
    const filtered = allProducts
      .filter((p) => p.category === category)
      .slice(0, 4); // Lấy 4 món

    // Cập nhật Tiêu đề và Ảnh to bên trái
    if (titleElement) {
      if (category === "steak") titleElement.innerText = "Món Chính";
      else if (category === "coffee") titleElement.innerText = "Coffee";
      else titleElement.innerText = "Tráng Miệng";
    }

    if (imgElement && filtered.length > 0) {
      imgElement.src = `../assets/images/${filtered[0].image}`;
    }

    listContainer.innerHTML = filtered
      .map((item) => {
        const price = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(item.price);
        return `
                <div class="menu-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed #eee;">
                     <div style="flex: 1;">
                        <span class="item-name" style="display: block; font-weight: 700; color: #333; font-size: 16px;">${item.name
          }</span>
                        <p class="item-desc" style="margin: 5px 0 0; font-size: 13px; color: #777;">${item.description || "Hương vị tuyệt hảo từ Sakedo"
          }</p>
                    </div>
                    <span class="item-price" style="font-weight: 700; color: #D4AF37; margin-left: 15px;">${price}</span>
                </div>
            `;
      })
      .join("");
  };

  // 1. Mặc định chạy Tab đang active (thường là Tráng miệng)
  const activeTab = document.querySelector(".cat-item.active");
  if (activeTab) {
    renderList(activeTab.getAttribute("data-type"));
  }

  // 2. Bắt sự kiện Click vào các Tab
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Xóa active cũ, thêm active mới
      document
        .querySelectorAll(".cat-item")
        .forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      // Vẽ lại dữ liệu tương ứng
      renderList(this.getAttribute("data-type"));
    });
  });
}

// ==============================================
// 5. CÁC HÀM HỖ TRỢ RIÊNG CHO HOME
// ==============================================

// Hàm xử lý thêm giỏ hàng (Có kiểm tra quyền từ global.js)
function handleHomeAddToCart(id, name, price, image) {
  // 1. Gọi hàm kiểm tra quyền trong global.js
  if (typeof window.checkLoginRequired === "function") {
    if (!window.checkLoginRequired()) return;
  }

  // 2. Logic thêm vào LocalStorage (Giống trong menu.js)
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find((item) => item.id == id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: id,
      name: name,
      price: price,
      originalPrice: price,
      image: image,
      quantity: 1,
      note: "",
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  // 3. Cập nhật Badge trên Header (Hàm trong global.js)
  if (window.updateCartBadge) window.updateCartBadge();

  alert(`Đã thêm "${name}" vào giỏ hàng!`);
}

// Hàm format tiền tệ (nếu global chưa có)
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}
