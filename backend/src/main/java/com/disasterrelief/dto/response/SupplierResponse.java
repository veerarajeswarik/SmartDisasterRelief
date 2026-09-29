package com.disasterrelief.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class SupplierResponse {
    private Long id;
    private String supplierCode;
    private String name;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private String suppliedCategories;
    private String paymentTerms;
    private boolean active;
    private int totalOrders;
    private LocalDateTime createdAt;
}
