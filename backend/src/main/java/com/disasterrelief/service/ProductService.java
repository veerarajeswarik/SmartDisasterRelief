package com.disasterrelief.service;

import com.disasterrelief.dto.request.ProductRequest;
import com.disasterrelief.dto.response.ProductResponse;
import com.disasterrelief.entity.Product;
import com.disasterrelief.exception.BusinessException;
import com.disasterrelief.exception.ResourceNotFoundException;
import com.disasterrelief.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final AuditService auditService;

    public List<ProductResponse> findAll() {
        return productRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> findActive() {
        return productRepository.findByActiveTrue().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProductResponse findById(Long id) {
        return toResponse(getProduct(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        String code = generateCode(request.getCategory());
        if (productRepository.existsByProductCode(code)) {
            code = code + "-" + System.currentTimeMillis() % 1000;
        }
        Product product = Product.builder()
                .productCode(code)
                .name(request.getName())
                .category(request.getCategory())
                .unit(request.getUnit())
                .description(request.getDescription())
                .minimumStockLevel(request.getMinimumStockLevel())
                .maximumStockCapacity(request.getMaximumStockCapacity())
                .reorderLevel(request.getReorderLevel())
                .active(request.isActive())
                .build();
        Product saved = productRepository.save(product);
        auditService.log("CREATE", "Product", saved.getId(), "Created product: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getProduct(id);
        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setUnit(request.getUnit());
        product.setDescription(request.getDescription());
        product.setMinimumStockLevel(request.getMinimumStockLevel());
        product.setMaximumStockCapacity(request.getMaximumStockCapacity());
        product.setReorderLevel(request.getReorderLevel());
        product.setActive(request.isActive());
        return toResponse(productRepository.save(product));
    }

    public Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private String generateCode(Product.ProductCategory category) {
        String prefix = category.name().substring(0, Math.min(3, category.name().length()));
        long count = productRepository.count() + 1;
        return prefix + "-" + String.format("%04d", count);
    }

    private ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .productCode(p.getProductCode())
                .name(p.getName())
                .category(p.getCategory())
                .unit(p.getUnit())
                .description(p.getDescription())
                .minimumStockLevel(p.getMinimumStockLevel())
                .maximumStockCapacity(p.getMaximumStockCapacity())
                .reorderLevel(p.getReorderLevel())
                .active(p.isActive())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
