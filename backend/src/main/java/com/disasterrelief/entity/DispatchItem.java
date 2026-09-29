package com.disasterrelief.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dispatch_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DispatchItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispatch_id", nullable = false)
    private Dispatch dispatch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    private Integer deliveredQuantity;
}
