package com.sakedo.mini_store_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "orders") // MongoDB dùng @Document
public class Order {

    @Id
    private String id; // MongoDB tự sinh ID là chuỗi (String), không phải Long

    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private String note;
    private double shippingFee;
    private double totalAmount;

    private int status; // 0: Chờ xác nhận, 1: Bếp làm, 2: Chờ ship...
    private Date createdAt;

    // Trong MongoDB, List này sẽ được nhúng thẳng vào trong Document Order
    private List<OrderItem> items = new ArrayList<>();

    public Order() {
        this.createdAt = new Date();
        this.status = 0;
    }

    // Getters và Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String customerAddress) { this.customerAddress = customerAddress; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public double getShippingFee() { return shippingFee; }
    public void setShippingFee(double shippingFee) { this.shippingFee = shippingFee; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}