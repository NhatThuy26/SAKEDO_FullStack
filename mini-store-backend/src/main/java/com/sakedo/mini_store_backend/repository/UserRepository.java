package com.sakedo.mini_store_backend.repository;

import com.sakedo.mini_store_backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional; // [QUAN TRỌNG] Nhớ import dòng này

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    // 1. Thêm hàm này để sửa lỗi "cannot find symbol method existsByEmail"
    boolean existsByEmail(String email);

    // 2. Sửa dòng này: Thêm Optional<...> để sửa lỗi "cannot find symbol method orElse"
    Optional<User> findByEmail(String email);
}