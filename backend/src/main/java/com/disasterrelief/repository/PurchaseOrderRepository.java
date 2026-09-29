package com.disasterrelief.repository;

import com.disasterrelief.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByStatus(PurchaseOrder.POStatus status);
    List<PurchaseOrder> findBySupplierId(Long supplierId);
    List<PurchaseOrder> findByCampaignId(Long campaignId);
    boolean existsByPoNumber(String poNumber);
    long countByStatus(PurchaseOrder.POStatus status);

    @Query("SELECT po FROM PurchaseOrder po ORDER BY po.createdAt DESC")
    List<PurchaseOrder> findAllOrderByCreatedAtDesc();
}
