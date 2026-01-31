let currentProduct = null;

// Dữ liệu fallback khi không kết nối được Backend
const fallbackProducts = [
  { id: 1, name: "Cơm Tấm Sườn Bì Chả", price: 65000, discount: 15, category: "steak", image: "comtam.png", description: "Cơm tấm truyền thống với sườn nướng thơm lừng, bì giòn và chả trứng đậm đà. Phục vụ kèm đồ chua và nước mắm pha đặc biệt." },
  { id: 2, name: "Phở Bò Tái Nạm", price: 55000, discount: 10, category: "steak", image: "phobo.png", description: "Phở bò truyền thống với nước dùng hầm xương thơm ngọt, thịt bò tái mềm, nạm gầu đậm đà. Ăn kèm rau thơm và chanh." },
  { id: 3, name: "Bánh Mì Chảo", price: 45000, discount: 20, category: "steak", image: "bmichao.png", description: "Bánh mì chảo nóng hổi với trứng ốp la, xúc xích, patê gan và bơ thơm lừng. Món ăn sáng hoàn hảo." },
  { id: 4, name: "Bún Bò Huế", price: 60000, discount: 0, category: "steak", image: "bunbo.png", description: "Bún bò Huế cay nồng đặc trưng với giò heo, thịt bò và huyết. Nước dùng đậm đà hương sả và mắm ruốc." },
  { id: 5, name: "Hủ Tiếu Nam Vang", price: 50000, discount: 15, category: "steak", image: "hutieu.png", description: "Hủ tiếu sợi dai với tôm, thịt băm, gan và trứng cút. Nước dùng trong thanh ngọt tự nhiên." },
  { id: 6, name: "Cơm Gà Xối Mỡ", price: 55000, discount: 10, category: "steak", image: "comga.png", description: "Cơm gà xối mỡ giòn rụm, da vàng óng. Phục vụ kèm cơm trắng dẻo và nước mắm gừng." },
  { id: 7, name: "Bánh Xèo Giòn", price: 45000, discount: 0, category: "steak", image: "banhxeo.png", description: "Bánh xèo giòn tan với nhân tôm, thịt và giá. Cuốn cùng rau sống và chấm nước mắm chua ngọt." },
  { id: 8, name: "Gỏi Cuốn Tôm Thịt", price: 40000, discount: 0, category: "steak", image: "goicuonthit.png", description: "Gỏi cuốn tươi mát với tôm, thịt heo, bún và rau thơm. Chấm kèm tương đậu phộng béo ngậy." },
  { id: 9, name: "Cơm Chiên Dương Châu", price: 45000, discount: 0, category: "steak", image: "comchien.png", description: "Cơm chiên thơm với tôm, lạp xưởng, trứng và đậu hà lan. Món ăn đầy đủ dinh dưỡng." },
  { id: 10, name: "Bún Riêu Cua", price: 55000, discount: 0, category: "steak", image: "bunrieuu.png", description: "Bún riêu cua đồng với gạch cua béo, đậu hũ và riêu cua. Nước dùng chua thanh đậm đà." },
  { id: 11, name: "Nem Nướng Nha Trang", price: 50000, discount: 0, category: "steak", image: "nemnuong.png", description: "Nem nướng thơm lừng cuốn cùng bánh tráng, rau thơm và bún. Chấm nước mắm pha đặc biệt." },
  { id: 12, name: "Thịt Kho Tàu", price: 60000, discount: 0, category: "steak", image: "thitkho.png", description: "Thịt kho tàu mềm nhừ với trứng kho. Vị ngọt mặn đậm đà, ăn kèm cơm trắng nóng." },
  { id: 13, name: "Cá Kho Tộ", price: 65000, discount: 0, category: "steak", image: "cakho.png", description: "Cá kho tộ thơm nức với nước màu dừa. Thịt cá chắc, vị mặn ngọt hài hòa." },
  { id: 14, name: "Mì Quảng Đà Nẵng", price: 50000, discount: 0, category: "steak", image: "miquang2.png", description: "Mì Quảng truyền thống với tôm, thịt và trứng. Ăn kèm bánh tráng nướng và rau sống." },
  { id: 15, name: "Gà Nướng Mật Ong", price: 85000, discount: 0, category: "steak", image: "ganuong.png", description: "Gà nướng mật ong vàng óng, da giòn thịt mềm. Thấm đẫm gia vị thơm lừng." },
  { id: 16, name: "Vịt Quay Bắc Kinh", price: 95000, discount: 0, category: "steak", image: "vitquay.png", description: "Vịt quay da giòn, thịt mềm ngọt. Phục vụ kèm bánh và nước chấm đặc biệt." },
  { id: 17, name: "Bò Kho Bánh Mì", price: 55000, discount: 0, category: "steak", image: "bokho.png", description: "Bò kho thơm ngọt với cà rốt, khoai tây. Ăn kèm bánh mì nóng giòn." },
  { id: 18, name: "Chè Khúc Bạch", price: 35000, discount: 0, category: "dessert", image: "khucbach.png", description: "Chè khúc bạch mát lạnh với thạch trắng mềm mịn, nhãn và vải. Ngọt thanh tươi mát." },
  { id: 19, name: "Chè Thái Thập Cẩm", price: 35000, discount: 0, category: "dessert", image: "chethai.png", description: "Chè Thái đủ màu sắc với nước cốt dừa béo ngậy. Thơm mát, giải nhiệt tuyệt vời." },
  { id: 20, name: "Chè Chuối Nướng", price: 30000, discount: 0, category: "dessert", image: "chechuoi.png", description: "Chè chuối nướng thơm lừng với nước cốt dừa béo. Vị ngọt tự nhiên của chuối chín." },
  { id: 21, name: "Bánh Flan Caramen", price: 25000, discount: 0, category: "dessert", image: "banhplan.png", description: "Bánh flan mềm mịn với caramen ngọt đắng. Món tráng miệng cổ điển thơm ngon." },
  { id: 22, name: "Bánh Đậu Xanh", price: 30000, discount: 0, category: "dessert", image: "banhdau.png", description: "Bánh đậu xanh bùi béo, tan trong miệng. Vị ngọt nhẹ, thơm mùi đậu." },
  { id: 23, name: "Bánh Lọt Lá Dứa", price: 30000, discount: 0, category: "dessert", image: "banhlot.png", description: "Bánh lọt lá dứa xanh mướt với nước cốt dừa. Thơm mát, giòn sựt." },
  { id: 24, name: "Trà Sen Vàng", price: 35000, discount: 0, category: "dessert", image: "trasen.png", description: "Trà sen thơm thanh, hậu vị ngọt nhẹ. Giải nhiệt và thanh lọc cơ thể." },
  { id: 25, name: "Nước Chanh Tươi", price: 25000, discount: 0, category: "dessert", image: "nuocchanh.png", description: "Nước chanh tươi mát lạnh, vị chua ngọt tự nhiên. Giải khát tức thì." },
  { id: 26, name: "Bánh Dâu Tây", price: 40000, discount: 0, category: "dessert", image: "dautay.png", description: "Bánh dâu tây tươi ngon với kem béo. Vị ngọt tự nhiên của dâu chín." },
];

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (productId) {
    fetchProductDetail(productId);
  } else {
    alert("Không tìm thấy sản phẩm!");
    window.location.href = "menu.html";
  }
  updateCartBadge();
  initStarRating();
});

async function fetchProductDetail(id) {
  try {
    const response = await fetch(`http://localhost:8080/api/products/${id}`);
    if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);
    const product = await response.json();
    currentProduct = product;
    renderProductInfo(product);
  } catch (error) {
    console.error("Lỗi:", error);
    console.log("--> Sử dụng dữ liệu fallback...");

    // Tìm sản phẩm trong fallback data
    const fallbackProduct = fallbackProducts.find(p => p.id == id);
    if (fallbackProduct) {
      currentProduct = fallbackProduct;
      renderProductInfo(fallbackProduct);
    } else {
      // Nếu không tìm thấy, hiển thị sản phẩm đầu tiên
      currentProduct = fallbackProducts[0];
      renderProductInfo(fallbackProducts[0]);
    }
  }
}

function renderProductInfo(product) {
  document.title = `${product.name} - Sakedo`;
  document.getElementById("detail-name").textContent = product.name;
  document.getElementById("detail-desc").textContent = product.description;

  const imgElement = document.getElementById("detail-img");
  if (imgElement) {
    let imgSrc = product.image || "";
    if (!imgSrc.startsWith("http") && !imgSrc.startsWith("data:")) {
      imgSrc = `../assets/images/${imgSrc.replace(/^.*[\\\/]/, '')}`;
    }
    imgElement.src = imgSrc;
  }

  const priceBox = document.getElementById("detail-price");
  if (priceBox) {
    let finalPrice = product.price;
    let htmlContent = "";
    if (product.discount > 0) {
      finalPrice = (product.price * (100 - product.discount)) / 100;
      currentProduct.finalPrice = finalPrice;
      htmlContent = `
        <div class="price-wrapper">
            <span class="old-price">${product.price.toLocaleString()}đ</span>
            <span class="current-price">${finalPrice.toLocaleString()}đ</span>
            <span class="discount-badge">-${product.discount}%</span>
        </div>`;
    } else {
      currentProduct.finalPrice = product.price;
      htmlContent = `<span class="current-price">${product.price.toLocaleString()}đ</span>`;
    }
    priceBox.innerHTML = htmlContent;
  }
}

function addToCartDetail(isBuyNow) {
  if (!currentProduct) return;

  const qtyInput = document.getElementById("qty-input");
  const qty = parseInt(qtyInput.value) || 1;
  const note = document.getElementById("order-note").value;
  const priceToAdd = currentProduct.finalPrice || currentProduct.price;

  let cleanImage = currentProduct.image || "no-image.png";
  if (cleanImage.startsWith("data:")) {
    cleanImage = "no-image.png";
  } else if (!cleanImage.startsWith("http")) {
    cleanImage = cleanImage.replace(/^.*[\\\\/]/, '');
  }

  const cartItem = {
    id: currentProduct.id,
    name: currentProduct.name,
    price: priceToAdd,
    originalPrice: currentProduct.price,
    image: cleanImage,
    quantity: qty,
    note: note,
  };

  if (isBuyNow) {
    const existingCart = localStorage.getItem("cart");
    if (existingCart) {
      localStorage.setItem("cart_backup", existingCart);
    }
    localStorage.setItem("cart", JSON.stringify([cartItem]));
    localStorage.setItem("buyNowMode", "true");
    window.location.href = "cart.html";
  } else {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find((item) => item.id == cartItem.id);

    if (existingItem) {
      existingItem.quantity += qty;
      if (note) existingItem.note = note;
      existingItem.image = cleanImage;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
    alert(`Đã thêm ${qty} phần "${currentProduct.name}" vào giỏ!`);
  }
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badges = document.querySelectorAll(".cart-count");
  badges.forEach((badge) => {
    badge.innerText = totalQty;
  });
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
