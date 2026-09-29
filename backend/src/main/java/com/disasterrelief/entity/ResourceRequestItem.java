package com.disasterrelief.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resource_request_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResourceRequestItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_request_id", nullable = false)
    private ResourceRequest resourceRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer requestedQuantity;

    private Integer approvedQuantity;
    private Integer allocatedQuantity;
}
