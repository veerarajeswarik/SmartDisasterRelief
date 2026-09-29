package com.disasterrelief.controller;

import com.disasterrelief.entity.*;
import com.disasterrelief.repository.*;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportController {

    private final InventoryRepository inventoryRepository;
    private final PurchaseOrderRepository poRepository;
    private final DispatchRepository dispatchRepository;
    private final BudgetRepository budgetRepository;
    private final FundAccountRepository fundAccountRepository;
    private final CampaignRepository campaignRepository;

    @GetMapping("/inventory")
    public ResponseEntity<List<Map<String, Object>>> inventoryReport(
            @RequestParam(required = false) Long hubId) {
        List<Inventory> items = hubId != null ?
                inventoryRepository.findByHubId(hubId) : inventoryRepository.findAll();
        return ResponseEntity.ok(items.stream().map(i -> Map.<String, Object>of(
                "id", i.getId(),
                "product", i.getProduct().getName(),
                "productCode", i.getProduct().getProductCode(),
                "category", i.getProduct().getCategory().name(),
                "hub", i.getHub().getName(),
                "quantity", i.getQuantityOnHand(),
                "maxCapacity", i.getMaximumStockCapacity() != null ? i.getMaximumStockCapacity() : 0,
                "stockPercentage", String.format("%.1f", i.getStockPercentage()),
                "status", i.getStockStatus().name()
        )).collect(Collectors.toList()));
    }

    @GetMapping("/purchase-orders")
    public ResponseEntity<List<Map<String, Object>>> purchaseReport() {
        return ResponseEntity.ok(poRepository.findAllOrderByCreatedAtDesc().stream().map(po -> Map.<String, Object>of(
                "id", po.getId(),
                "poNumber", po.getPoNumber(),
                "supplier", po.getSupplier().getName(),
                "hub", po.getHub().getName(),
                "orderDate", po.getOrderDate() != null ? po.getOrderDate().toString() : "",
                "totalAmount", po.getTotalAmount(),
                "status", po.getStatus().name()
        )).collect(Collectors.toList()));
    }

    @GetMapping("/dispatches")
    public ResponseEntity<List<Map<String, Object>>> dispatchReport(
            @RequestParam(required = false) Long campaignId) {
        List<Dispatch> dispatches = campaignId != null ?
                dispatchRepository.findByCampaignId(campaignId) : dispatchRepository.findAll();
        return ResponseEntity.ok(dispatches.stream().map(d -> Map.<String, Object>of(
                "id", d.getId(),
                "dispatchNumber", d.getDispatchNumber(),
                "campaign", d.getCampaign() != null ? d.getCampaign().getName() : "N/A",
                "sourceHub", d.getSourceHub().getName(),
                "destinationCamp", d.getDestinationCamp().getName(),
                "dispatchDate", d.getDispatchDate() != null ? d.getDispatchDate().toString() : "",
                "status", d.getStatus().name(),
                "priority", d.getPriority().name(),
                "itemCount", d.getItems().size()
        )).collect(Collectors.toList()));
    }

    @GetMapping("/budget")
    public ResponseEntity<List<Map<String, Object>>> budgetReport() {
        return ResponseEntity.ok(budgetRepository.findAll().stream().map(b -> Map.<String, Object>of(
                "id", b.getId(),
                "campaign", b.getCampaign().getName(),
                "allocatedAmount", b.getAllocatedAmount(),
                "actualExpenditure", b.getActualExpenditure(),
                "remainingAmount", b.getRemainingAmount(),
                "utilizationPercentage", String.format("%.1f", b.getUtilizationPercentage()),
                "status", b.getUtilizationPercentage() > 85 ? "HIGH" : b.getUtilizationPercentage() > 70 ? "WARNING" : "NORMAL"
        )).collect(Collectors.toList()));
    }

    @GetMapping("/balance-sheet")
    public ResponseEntity<Map<String, Object>> balanceSheet() {
        List<FundAccount> accounts = fundAccountRepository.findByActiveTrue();
        BigDecimal bankBalance = accounts.stream()
                .filter(a -> a.getAccountType() == FundAccount.AccountType.BANK)
                .map(FundAccount::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal inventoryValue = accounts.stream()
                .filter(a -> a.getAccountType() == FundAccount.AccountType.RELIEF_INVENTORY)
                .map(FundAccount::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal supplierCreditors = accounts.stream()
                .filter(a -> a.getAccountType() == FundAccount.AccountType.SUPPLIER_CREDITORS)
                .map(FundAccount::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalAssets = bankBalance.add(inventoryValue);
        BigDecimal totalLiabilities = supplierCreditors;
        return ResponseEntity.ok(Map.of(
                "assets", Map.of("bank", bankBalance, "inventory", inventoryValue, "total", totalAssets),
                "liabilities", Map.of("supplierCreditors", supplierCreditors, "total", totalLiabilities),
                "equity", totalAssets.subtract(totalLiabilities)
        ));
    }

    @GetMapping("/profit-loss")
    public ResponseEntity<Map<String, Object>> profitAndLoss() {
        List<FundAccount> accounts = fundAccountRepository.findByActiveTrue();
        BigDecimal grants = accounts.stream()
                .filter(a -> a.getAccountType() == FundAccount.AccountType.RELIEF_GRANTS)
                .map(FundAccount::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal procurementExpense = accounts.stream()
                .filter(a -> a.getAccountType() == FundAccount.AccountType.PROCUREMENT_EXPENSE)
                .map(FundAccount::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal freightExpense = accounts.stream()
                .filter(a -> a.getAccountType() == FundAccount.AccountType.DISPATCH_FREIGHT_EXPENSE)
                .map(FundAccount::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal otherExpense = accounts.stream()
                .filter(a -> a.getAccountType() == FundAccount.AccountType.OTHER_EXPENSE)
                .map(FundAccount::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpenses = procurementExpense.add(freightExpense).add(otherExpense);
        return ResponseEntity.ok(Map.of(
                "income", Map.of("reliefGrants", grants, "total", grants),
                "expenses", Map.of(
                        "procurement", procurementExpense,
                        "dispatchFreight", freightExpense,
                        "other", otherExpense,
                        "total", totalExpenses),
                "netSurplus", grants.subtract(totalExpenses)
        ));
    }
}
