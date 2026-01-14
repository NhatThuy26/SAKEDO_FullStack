package com.sakedo.mini_store_backend.model;

// Không cần @Entity, @Table nữa
public class OrderItem {
    // Trong MongoDB, item con không bắt buộc phải có ID riêng, nhưng có thể giữ nếu muốn
    private String productName;
    private int quantity;
    private double price;

    public OrderItem() {}

    public OrderItem(String productName, int quantity, double price) {
        this.productName = productName;
        this.quantity = quantity;
        this.price = price;
    }

    // Getters và Setters
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
}