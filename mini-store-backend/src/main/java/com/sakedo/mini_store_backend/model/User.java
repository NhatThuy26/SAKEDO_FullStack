package com.sakedo.mini_store_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String address; // Thêm trường này
    private String avatar;
    private String password;

    // 1. Constructor rỗng (Bắt buộc)
    public User() {}

    // 2. Constructor đầy đủ (Để sửa lỗi Controller)
    public User(String id, String fullName, String email, String phone, String address, String avatar, String password) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.avatar = avatar;
        this.password = password;
    }

    // 3. Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; } // Getter Address
    public void setAddress(String address) { this.address = address; } // Setter Address

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}