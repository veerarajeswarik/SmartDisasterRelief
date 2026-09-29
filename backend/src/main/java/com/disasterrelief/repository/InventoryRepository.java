package com.disasterrelief.repository;

import com.disasterrelief.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByHubIdAndProductId(Long hubId, Long productId);
    List<Inventory> findByHubId(Long hubId);
    List<Inventory> findByProductId(Long productId);

    @Query("SELECT i FROM Inventory i WHERE i.maximumStockCapacity > 0 AND (i.quantityOnHand * 100.0 / i.maximumStockCapacity) < 15")
    List<Inventory> findCriticalStockItems();

    @Query("SELECT i FROM Inventory i WHERE i.maximumStockCapacity > 0 AND (i.quantityOnHand * 100.0 / i.maximumStockCapacity) < 30")
    List<Inventory> findLowStockItems();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.maximumStockCapacity > 0 AND (i.quantityOnHand * 100.0 / i.maximumStockCapacity) < 15")
    long countCriticalStockItems();

    @Query("SELECT SUM(i.quantityOnHand) FROM Inventory i")
    Long sumTotalQuantity();
}
