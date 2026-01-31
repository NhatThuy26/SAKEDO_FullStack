// Biến lưu trạng thái chọn món
let selectedItems = new Set();

document.addEventListener("DOMContentLoaded", function () {
  const isBuyNowMode = localStorage.getItem("buyNowMode") === "true";
  if (isBuyNowMode) {
    localStorage.removeItem("buyNowMode");
  }

  renderCart();

  const checkoutBtn = document.querySelector(".btn-checkout");
  if (checkoutBtn) {
    checkoutBtn.onclick = handleCheckout;
  }
});

function showBuyNowNotice() {
  const cartContent = document.getElementById("cart-content");
  if (!cartContent) return;

  const notice = document.createElement("div");
  notice.id = "buy-now-notice";
  notice.className = "buy-now-notice";
  notice.innerHTML = `
    <span><i class="fas fa-info-circle"></i> Bạn đang ở chế độ <strong>Mua Ngay</strong>. Giỏ hàng cũ được lưu tạm.</span>
    <button onclick="cancelBuyNow()">
      <i class="fas fa-arrow-left"></i> Quay lại giỏ hàng
    </button>
  `;
  cartContent.insertBefore(notice, cartContent.firstChild);
}

function cancelBuyNow() {
  const backup = localStorage.getItem("cart_backup");
  if (backup) {
    localStorage.setItem("cart", backup);
    localStorage.removeItem("cart_backup");
  }
  localStorage.removeItem("buyNowMode");
  window.location.reload();
}

function getCartImageUrl(imgName) {
  if (!imgName || imgName.trim() === "" || imgName === "no-image.png") {
    return "https://placehold.co/100x100?text=Sakedo";
  }
  if (imgName.startsWith("http") || imgName.startsWith("data:")) {
    return imgName;
  }
  if (imgName.includes("/")) {
    return imgName;
  }
  return `../assets/images/${imgName}`;
}

function renderCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemsWrapper = document.getElementById("cart-items-wrapper");
  const cartContent = document.getElementById("cart-content");
  const emptyMsg = document.getElementById("empty-cart-msg");

  if (!itemsWrapper) return;

  if (cart.length === 0) {
    if (cartContent) cartContent.style.display = "none";
    if (emptyMsg) emptyMsg.style.display = "block";
    selectedItems.clear();
    return;
  } else {
    if (cartContent) cartContent.style.display = "flex";
    if (emptyMsg) emptyMsg.style.display = "none";
  }

  // Mặc định chọn tất cả các món khi load lần đầu
  if (selectedItems.size === 0) {
    cart.forEach((_, index) => selectedItems.add(index));
  }

  itemsWrapper.innerHTML = "";

  cart.forEach((item, index) => {
    let price = typeof item.price === "string"
      ? parseFloat(item.price.replace(/\./g, "").replace("đ", ""))
      : item.price;

    let imgSrc = getCartImageUrl(item.image);
    const isChecked = selectedItems.has(index);
    const noteHtml = item.note ? `<div class="item-note"><i class="fas fa-sticky-note"></i>${item.note}</div>` : '';

    itemsWrapper.innerHTML += `
      <div class="cart-item ${isChecked ? 'selected' : ''}">
        <label class="checkbox-container item-checkbox">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleItemSelect(${index})">
          <span class="checkmark"></span>
        </label>
        <img src="${imgSrc}" class="item-img" onerror="this.src='https://placehold.co/100x100?text=Sakedo'">
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <span class="item-price item-price-bold">${price.toLocaleString()}đ</span>
          ${noteHtml}
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="updateItemQty(${index}, -1)">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="updateItemQty(${index}, 1)">+</button>
        </div>
        <i class="fas fa-trash-alt btn-remove" onclick="removeItem(${index})"></i>
      </div>`;
  });

  updateTotals();
  updateSelectAllCheckbox();
}

function toggleItemSelect(index) {
  if (selectedItems.has(index)) {
    selectedItems.delete(index);
  } else {
    selectedItems.add(index);
  }

  // Cập nhật giao diện item
  const cartItems = document.querySelectorAll('.cart-item');
  if (cartItems[index]) {
    cartItems[index].classList.toggle('selected', selectedItems.has(index));
  }

  updateTotals();
  updateSelectAllCheckbox();
}

function toggleSelectAll() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const selectAllCheckbox = document.getElementById("select-all-checkbox");

  if (selectAllCheckbox.checked) {
    // Chọn tất cả
    cart.forEach((_, index) => selectedItems.add(index));
  } else {
    // Bỏ chọn tất cả
    selectedItems.clear();
  }

  renderCart();
}

function updateSelectAllCheckbox() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const selectAllCheckbox = document.getElementById("select-all-checkbox");

  if (selectAllCheckbox && cart.length > 0) {
    selectAllCheckbox.checked = selectedItems.size === cart.length;
  }

  // Cập nhật số món được chọn
  const selectedCountEl = document.getElementById("selected-count");
  if (selectedCountEl) {
    selectedCountEl.textContent = `(${selectedItems.size} món được chọn)`;
  }
}

function updateTotals() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let selectedTotal = 0;
  let selectedCount = 0;

  cart.forEach((item, index) => {
    if (selectedItems.has(index)) {
      let price = typeof item.price === "string"
        ? parseFloat(item.price.replace(/\./g, "").replace("đ", ""))
        : item.price;
      selectedTotal += (price * item.quantity);
      selectedCount += item.quantity;
    }
  });

  if (document.getElementById("final-total")) {
    document.getElementById("final-total").textContent = selectedTotal.toLocaleString() + "đ";
  }
  if (document.getElementById("selected-items-count")) {
    document.getElementById("selected-items-count").textContent = selectedItems.size;
  }
}

async function handleCheckout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Giỏ hàng trống!");
    return;
  }

  if (selectedItems.size === 0) {
    alert("Vui lòng chọn ít nhất 1 món để thanh toán!");
    return;
  }

  // Lọc chỉ các món được chọn để thanh toán
  const selectedCart = cart.filter((_, index) => selectedItems.has(index));

  // Lưu giỏ hàng được chọn để thanh toán
  localStorage.setItem("checkout_cart", JSON.stringify(selectedCart));

  // Lưu các món còn lại trong giỏ
  const remainingCart = cart.filter((_, index) => !selectedItems.has(index));
  localStorage.setItem("cart", JSON.stringify(remainingCart));

  // Chuyển đến trang checkout
  window.location.href = "checkout.html";
}

function updateItemQty(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity += change;
  if (cart[index].quantity < 1) {
    cart.splice(index, 1);
    selectedItems.delete(index);
    // Cập nhật lại index trong selectedItems
    const newSelected = new Set();
    selectedItems.forEach(i => {
      if (i > index) newSelected.add(i - 1);
      else if (i < index) newSelected.add(i);
    });
    selectedItems = newSelected;
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function removeItem(index) {
  if (confirm("Xóa món này khỏi giỏ hàng?")) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    selectedItems.delete(index);
    // Cập nhật lại index trong selectedItems
    const newSelected = new Set();
    selectedItems.forEach(i => {
      if (i > index) newSelected.add(i - 1);
      else if (i < index) newSelected.add(i);
    });
    selectedItems = newSelected;
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
}