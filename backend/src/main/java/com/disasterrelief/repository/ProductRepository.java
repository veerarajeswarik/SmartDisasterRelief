package com.disasterrelief.repository;

import com.disasterrelief.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(Product.ProductCategory category);
    List<Product> findByActiveTrue();
    boolean existsByProductCode(String productCode);
}
