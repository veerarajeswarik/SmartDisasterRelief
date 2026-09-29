package com.disasterrelief.repository;

import com.disasterrelief.entity.VendorBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorBillRepository extends JpaRepository<VendorBill, Long> {
    List<VendorBill> findBySupplierId(Long supplierId);
    List<VendorBill> findByPaymentStatus(VendorBill.PaymentStatus paymentStatus);
    boolean existsByBillNumber(String billNumber);
}
