document.addEventListener("DOMContentLoaded", function () {
  // Tìm đến cái khung có id="footer-placeholder"
  const footerContainer = document.getElementById("footer-placeholder");

  if (footerContainer) {
    // Tải nội dung từ file footer.html
    fetch("../components/footer.html")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Không tìm thấy file footer.html");
        }
        return response.text();
      })
      .then((data) => {
        // Nhét code HTML vừa tải được vào trong khung
        footerContainer.innerHTML = data;
      })
      .catch((error) => {
        console.error("Lỗi khi tải footer:", error);
      });
  }
});
