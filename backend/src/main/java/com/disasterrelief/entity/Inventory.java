package com.disasterrelief.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"hub_id", "product_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hub_id", nullable = false)
    private ReliefHub hub;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantityOnHand = 0;

    private Integer minimumStockLevel;
    private Integer maximumStockCapacity;

    @UpdateTimestamp
    private LocalDateTime lastUpdated;

    public StockStatus getStockStatus() {
        if (maximumStockCapacity == null || maximumStockCapacity == 0) return StockStatus.NORMAL;
        double pct = (double) quantityOnHand / maximumStockCapacity * 100;
        if (pct < 15) return StockStatus.CRITICAL;
        if (pct < 30) return StockStatus.LOW;
        return StockStatus.NORMAL;
    }

    public double getStockPercentage() {
        if (maximumStockCapacity == null || maximumStockCapacity == 0) return 0;
        return (double) quantityOnHand / maximumStockCapacity * 100;
    }

    public enum StockStatus {
        NORMAL, LOW, CRITICAL
    }
}
