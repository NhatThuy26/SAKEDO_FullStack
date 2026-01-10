let currentProduct = null;

// Chạy khi trang tải xong
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  console.log("--> Đang xem sản phẩm ID:", productId); // Kiểm tra ID trên Console

  if (productId) {
    fetchProductDetail(productId);
  } else {
    alert("Không tìm thấy ID sản phẩm trên đường dẫn!");
  }

  updateCartBadge();
  initStarRating();
});

async function fetchProductDetail(id) {
  try {
    // Gọi API lấy dữ liệu từ Backend
    const response = await fetch(`http://localhost:8080/api/products/${id}`);

    if (!response.ok) {
      throw new Error(`Lỗi API: ${response.status}`);
    }

    const product = await response.json();

    // --- QUAN TRỌNG: IN DỮ LIỆU GỐC RA ĐỂ KIỂM TRA ---
    console.log("--> Dữ liệu nhận được từ Backend:", product);
    // Bạn hãy nhấn F12, chọn tab Console để xem tên các biến (name, price, image...) có đúng không nhé!

    currentProduct = product;
    renderProductInfo(product);
  } catch (error) {
    console.error("Lỗi khi tải sản phẩm:", error);

    // Nếu lỗi (ví dụ Backend chưa chạy), dùng dữ liệu giả để test giao diện
    console.warn("--> Đang sử dụng dữ liệu mẫu (Mock Data)");
    const mockProduct = {
      id: id,
      name: "Món Ăn Mẫu (Do lỗi kết nối)",
      price: 50000,
      originalPrice: 65000,
      image: "", // Để trống để test ảnh lỗi
      description:
        "Không thể lấy dữ liệu từ Server. Vui lòng kiểm tra Console (F12).",
    };
    currentProduct = mockProduct;
    renderProductInfo(mockProduct);
  }
}

function renderProductInfo(product) {
  // 1. Hiển thị Tên & Mô tả (Dùng toán tử || để tránh lỗi nếu thiếu dữ liệu)
  document.title = `${product.name || "Chi tiết món"} - Sakedo`;
  document.getElementById("detail-name").textContent =
    product.name || "Tên món chưa cập nhật";
  document.getElementById("detail-desc").textContent =
    product.description || "Chưa có mô tả.";

  // 2. Hiển thị Ảnh (Xử lý an toàn hơn)
  const imgElement = document.getElementById("detail-img");
  if (imgElement) {
    // 1. Lấy dữ liệu ảnh (thử các tên biến phổ biến)
    let rawImage =
      product.image || product.imageUrl || product.thumbnail || product.img;

    // 2. Xử lý đường dẫn ảnh
    let finalImageSrc = "";

    if (!rawImage) {
      // Trường hợp 1: Không có dữ liệu ảnh -> Dùng ảnh mặc định
      finalImageSrc =
        "https://via.placeholder.com/500x400?text=Sakedo+No+Image";
    } else if (rawImage.startsWith("http") || rawImage.startsWith("/")) {
      // Trường hợp 2: Đã là đường dẫn đầy đủ (VD: /assets/images/food/a.jpg)
      finalImageSrc = rawImage;
    } else {
      // Trường hợp 3: Chỉ có tên file (VD: banhxeo.jpg) -> Tự nối thêm thư mục
      // BẠN HÃY SỬA ĐƯỜNG DẪN DƯỚI ĐÂY CHO ĐÚNG VỚI THƯ MỤC ẢNH CỦA BẠN
      finalImageSrc = `/assets/images/${rawImage}`;
    }

    console.log("--> Đang hiển thị ảnh từ link:", finalImageSrc); // Xem log để debug
    imgElement.src = finalImageSrc;

    // 3. Nếu ảnh vẫn lỗi (404) -> Tự chuyển về ảnh mặc định
    imgElement.onerror = function () {
      console.warn("--> Ảnh bị lỗi (404), đang dùng ảnh thay thế.");
      this.src = "https://via.placeholder.com/500x400?text=Anh+Bi+Loi";
    };
  }

  // 3. Hiển thị Giá (Logic an toàn, chống Crash)
  const priceBox = document.getElementById("detail-price");
  if (priceBox) {
    // Chuyển đổi giá về dạng số (đề phòng backend trả về chuỗi "50000")
    const price = parseFloat(product.price || 0);
    const originalPrice = parseFloat(product.originalPrice || 0);

    let htmlContent = "";

    // Nếu có giá gốc và giá gốc > giá bán -> Hiện cả 2
    if (originalPrice > price) {
      htmlContent = `
                <span class="old-price">${originalPrice.toLocaleString(
                  "vi-VN"
                )}đ</span>
                <span>${price.toLocaleString("vi-VN")}đ</span>
            `;
    } else {
      // Chỉ hiện giá bán
      htmlContent = `<span>${price.toLocaleString("vi-VN")}đ</span>`;
    }

    priceBox.innerHTML = htmlContent;
  }
}

// ... (Các hàm addToCart, updateCartBadge, initStarRating giữ nguyên như cũ) ...
function addToCartDetail(isBuyNow) {
  if (!currentProduct) return;
  const qtyInput = document.getElementById("qty-input");
  const qty = parseInt(qtyInput.value) || 1;
  const note = document.getElementById("order-note").value;

  // Lưu ý: Đảm bảo tên biến ở đây khớp với dữ liệu thật
  const cartItem = {
    id: currentProduct.id,
    name: currentProduct.name,
    price: parseFloat(currentProduct.price || 0), // Chuyển về số
    image: currentProduct.image || product.imageUrl || "",
    quantity: qty,
    note: note,
  };

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find((item) => item.id == cartItem.id);

  if (existingItem) {
    existingItem.quantity += qty;
    if (note) existingItem.note = note;
  } else {
    cart.push(cartItem);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();

  if (isBuyNow) {
    window.location.href = "/pages/cart.html";
  } else {
    alert(`Đã thêm ${qty} phần "${currentProduct.name}" vào giỏ!`);
  }
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("cart-count-badge");
  if (badge) badge.innerText = totalQty;
}

function initStarRating() {
  const stars = document.querySelectorAll("#star-rating-input i");
  const ratingInput = document.getElementById("rating-value");
  if (!stars.length) return;

  stars.forEach((star) => {
    star.addEventListener("click", function () {
      const value = this.getAttribute("data-value");
      if (ratingInput) ratingInput.value = value;
      stars.forEach((s) => {
        if (s.getAttribute("data-value") <= value) s.classList.add("active");
        else s.classList.remove("active");
      });
    });
  });
}

function submitReview() {
  alert("Cảm ơn bạn đã đánh giá!");
}
