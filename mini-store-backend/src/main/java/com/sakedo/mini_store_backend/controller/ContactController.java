package com.sakedo.mini_store_backend.controller;

import com.sakedo.mini_store_backend.model.Contact;
import com.sakedo.mini_store_backend.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/contacts")
@CrossOrigin(origins = "*") // Cho phép Frontend gọi thoải mái
public class ContactController {

    @Autowired
    private ContactRepository contactRepository;

    // API NHẬN TIN NHẮN TỪ KHÁCH HÀNG
    // URL: POST http://localhost:8080/api/contacts
    @PostMapping
    public ResponseEntity<?> sendContact(@RequestBody Contact contact) {
        // Gán thời gian gửi là ngay bây giờ
        contact.setCreatedAt(LocalDateTime.now());

        // Lưu vào MongoDB
        contactRepository.save(contact);

        // Trả lời cho Frontend biết là đã xong
        return ResponseEntity.ok(Map.of("message", "Gửi liên hệ thành công!"));
    }
}