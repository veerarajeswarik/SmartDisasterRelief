package com.disasterrelief.repository;

import com.disasterrelief.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByHubIdAndProductIdOrderByCreatedAtDesc(Long hubId, Long productId);
    List<InventoryTransaction> findTop20ByOrderByCreatedAtDesc();
}
