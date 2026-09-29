package com.disasterrelief.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SupplierRequest {
    @NotBlank(message = "Supplier name is required")
    private String name;

    private String contactPerson;
    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    private String address;
    private String suppliedCategories;
    private String paymentTerms;
    private boolean active = true;
}
