package com.disasterrelief.config;

import com.disasterrelief.entity.*;
import com.disasterrelief.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final ReliefHubRepository hubRepository;
    private final CampRepository campRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository txRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository poRepository;
    private final DispatchRepository dispatchRepository;
    private final ResourceRequestRepository requestRepository;
    private final BudgetRepository budgetRepository;
    private final FundAccountRepository fundAccountRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Demo data already exists, skipping seed.");
            return;
        }
        log.info("Seeding demo data...");

        // Users
        User admin = userRepository.save(User.builder().username("admin")
                .password(passwordEncoder.encode("admin123"))
                .fullName("System Administrator").email("admin@disasterrelief.org")
                .role(Role.ADMIN).phone("+1-555-0100").active(true).build());

        User logistics1 = userRepository.save(User.builder().username("logistics1")
                .password(passwordEncoder.encode("password123"))
                .fullName("Maria Santos").email("maria@disasterrelief.org")
                .role(Role.LOGISTICS_OFFICER).phone("+1-555-0101").active(true).build());

        User campRep1 = userRepository.save(User.builder().username("camp_rep1")
                .password(passwordEncoder.encode("password123"))
                .fullName("Ana Cruz").email("ana@disasterrelief.org")
                .role(Role.CAMP_REPRESENTATIVE).phone("+1-555-0103").active(true).build());

        User campRep2 = userRepository.save(User.builder().username("camp_rep2")
                .password(passwordEncoder.encode("password123"))
                .fullName("Ben Reyes").email("ben@disasterrelief.org")
                .role(Role.CAMP_REPRESENTATIVE).phone("+1-555-0104").active(true).build());

        userRepository.save(User.builder().username("logistics2")
                .password(passwordEncoder.encode("password123"))
                .fullName("James Rodriguez").email("james@disasterrelief.org")
                .role(Role.LOGISTICS_OFFICER).phone("+1-555-0102").active(true).build());

        // Campaigns
        Campaign floodCampaign = campaignRepository.save(Campaign.builder()
                .campaignCode("CMPG-0001").name("Flood Relief – Zone A")
                .disasterType(Campaign.DisasterType.FLOOD)
                .location("Zone A, Northern Region")
                .description("Major flooding affecting northern communities. ~15,000 people displaced.")
                .startDate(LocalDate.now().minusDays(10)).endDate(LocalDate.now().plusDays(30))
                .affectedPopulation(15000).allocatedBudget(new BigDecimal("2500000"))
                .status(Campaign.CampaignStatus.ACTIVE).build());

        Campaign cycloneCampaign = campaignRepository.save(Campaign.builder()
                .campaignCode("CMPG-0002").name("Cyclone Response – Coastal District")
                .disasterType(Campaign.DisasterType.CYCLONE)
                .location("Coastal District, Eastern Zone")
                .description("Cyclone devastated coastal communities. Emergency shelters required.")
                .startDate(LocalDate.now().minusDays(5)).endDate(LocalDate.now().plusDays(60))
                .affectedPopulation(8500).allocatedBudget(new BigDecimal("1800000"))
                .status(Campaign.CampaignStatus.ACTIVE).build());

        campaignRepository.save(Campaign.builder()
                .campaignCode("CMPG-0003").name("Earthquake Emergency – Hill District")
                .disasterType(Campaign.DisasterType.EARTHQUAKE)
                .location("Hill District, Western Zone")
                .description("Preparatory campaign for potential earthquake relief.")
                .startDate(LocalDate.now().plusDays(5)).endDate(LocalDate.now().plusDays(90))
                .affectedPopulation(5000).allocatedBudget(new BigDecimal("1200000"))
                .status(Campaign.CampaignStatus.PLANNED).build());

        // Relief Hubs
        ReliefHub centralHub = hubRepository.save(ReliefHub.builder()
                .hubCode("HUB-0001").name("Central Relief Hub")
                .location("City Center, Zone A").address("123 Relief Road, City Center")
                .contactPerson("Sarah Johnson").contactNumber("+1-555-0200")
                .storageCapacity(10000).latitude(14.5995).longitude(120.9842)
                .status(ReliefHub.HubStatus.ACTIVE).build());

        ReliefHub northHub = hubRepository.save(ReliefHub.builder()
                .hubCode("HUB-0002").name("North Relief Hub")
                .location("Northern District, Zone A").address("456 North Street, Northern District")
                .contactPerson("Carlos Mendez").contactNumber("+1-555-0201")
                .storageCapacity(6000).latitude(14.6507).longitude(121.0494)
                .status(ReliefHub.HubStatus.ACTIVE).build());

        ReliefHub emergencyHub = hubRepository.save(ReliefHub.builder()
                .hubCode("HUB-0003").name("Emergency Storage Hub")
                .location("South Coastal, Eastern Zone").address("789 Harbor Road, Coastal District")
                .contactPerson("Linda Torres").contactNumber("+1-555-0202")
                .storageCapacity(4000).latitude(14.5176).longitude(121.0509)
                .status(ReliefHub.HubStatus.ACTIVE).build());

        // Camps
        Camp camp1 = campRepository.save(Camp.builder()
                .campCode("RCP-0001").name("Zone A Camp 01")
                .location("North Village, Zone A").representative("Ana Cruz")
                .contact("+1-555-0300").population(1200)
                .campaign(floodCampaign).assignedHub(centralHub)
                .latitude(14.6090).longitude(120.9820)
                .priority(Camp.Priority.HIGH).status(Camp.CampStatus.ACTIVE).build());

        Camp camp2 = campRepository.save(Camp.builder()
                .campCode("RCP-0002").name("Zone A Camp 02")
                .location("East Village, Zone A").representative("Ben Reyes")
                .contact("+1-555-0301").population(950)
                .campaign(floodCampaign).assignedHub(centralHub)
                .latitude(14.5980).longitude(121.0000)
                .priority(Camp.Priority.MEDIUM).status(Camp.CampStatus.ACTIVE).build());

        Camp camp3 = campRepository.save(Camp.builder()
                .campCode("RCP-0003").name("Zone A Camp 03")
                .location("West Barangay, Zone A").representative("Rosa Flores")
                .contact("+1-555-0302").population(780)
                .campaign(floodCampaign).assignedHub(northHub)
                .latitude(14.5870).longitude(120.9650)
                .priority(Camp.Priority.MEDIUM).status(Camp.CampStatus.ACTIVE).build());

        Camp camp4 = campRepository.save(Camp.builder()
                .campCode("RCP-0004").name("Coastal Camp 04")
                .location("Barangay Seafront, Coastal District").representative("Pedro Lim")
                .contact("+1-555-0303").population(620)
                .campaign(cycloneCampaign).assignedHub(emergencyHub)
                .latitude(14.5100).longitude(121.0200)
                .priority(Camp.Priority.CRITICAL).status(Camp.CampStatus.ACTIVE).build());

        // Assign camps to users
        campRep1.setAssignedCamp(camp1);
        userRepository.save(campRep1);
        campRep2.setAssignedCamp(camp4);
        userRepository.save(campRep2);

        // Products
        Product foodKit = productRepository.save(Product.builder()
                .productCode("FOO-0001").name("Food Ration Kit").category(Product.ProductCategory.FOOD)
                .unit("Pack").description("3-day emergency food ration for one person")
                .minimumStockLevel(100).maximumStockCapacity(2000).reorderLevel(300).active(true).build());

        Product medKit = productRepository.save(Product.builder()
                .productCode("MED-0001").name("Medical First Aid Kit").category(Product.ProductCategory.MEDICAL)
                .unit("Kit").description("Standard first aid kit for emergency relief")
                .minimumStockLevel(50).maximumStockCapacity(1000).reorderLevel(150).active(true).build());

        Product tent = productRepository.save(Product.builder()
                .productCode("SHE-0001").name("Emergency Shelter Tent").category(Product.ProductCategory.SHELTER)
                .unit("Unit").description("4-person waterproof emergency shelter tent")
                .minimumStockLevel(30).maximumStockCapacity(500).reorderLevel(80).active(true).build());

        Product waterPack = productRepository.save(Product.builder()
                .productCode("WAT-0001").name("Drinking Water Pack 20L").category(Product.ProductCategory.WATER)
                .unit("Pack").description("20-litre sealed drinking water pack")
                .minimumStockLevel(200).maximumStockCapacity(3000).reorderLevel(500).active(true).build());

        Product blanket = productRepository.save(Product.builder()
                .productCode("CLO-0001").name("Emergency Blanket").category(Product.ProductCategory.CLOTHING)
                .unit("Piece").description("Thermal emergency blanket")
                .minimumStockLevel(100).maximumStockCapacity(2000).reorderLevel(300).active(true).build());

        Product hygieneKit = productRepository.save(Product.builder()
                .productCode("HYG-0001").name("Hygiene Kit").category(Product.ProductCategory.HYGIENE)
                .unit("Kit").description("Basic hygiene essentials kit")
                .minimumStockLevel(50).maximumStockCapacity(1500).reorderLevel(200).active(true).build());

        Product emergencyEquip = productRepository.save(Product.builder()
                .productCode("EQP-0001").name("Emergency Lighting Set").category(Product.ProductCategory.EMERGENCY_EQUIPMENT)
                .unit("Set").description("Solar-powered LED emergency lighting set")
                .minimumStockLevel(20).maximumStockCapacity(300).reorderLevel(50).active(true).build());

        // Suppliers
        Supplier supplier1 = supplierRepository.save(Supplier.builder()
                .supplierCode("SUP-0001").name("GlobalAid Supplies Co.")
                .contactPerson("Michael Chen").phone("+1-555-0400")
                .email("procurement@globalaid.com").address("100 Industrial Ave, Metro City")
                .suppliedCategories("FOOD, WATER, HYGIENE").paymentTerms("NET-30").active(true).build());

        Supplier supplier2 = supplierRepository.save(Supplier.builder()
                .supplierCode("SUP-0002").name("MedRelief International")
                .contactPerson("Dr. Patricia Moore").phone("+1-555-0401")
                .email("supply@medrelief.org").address("200 Medical Park, Health District")
                .suppliedCategories("MEDICAL, HYGIENE").paymentTerms("NET-15").active(true).build());

        supplierRepository.save(Supplier.builder()
                .supplierCode("SUP-0003").name("ShelterTech Solutions")
                .contactPerson("Robert Davis").phone("+1-555-0402")
                .email("orders@sheltertech.com").address("50 Construction Zone, Industry Park")
                .suppliedCategories("SHELTER, EMERGENCY_EQUIPMENT").paymentTerms("NET-45").active(true).build());

        supplierRepository.save(Supplier.builder()
                .supplierCode("SUP-0004").name("QuickRelief Distributors")
                .contactPerson("Angela Lee").phone("+1-555-0403")
                .email("sales@quickrelief.net").address("75 Logistics Hub, Commercial Zone")
                .suppliedCategories("FOOD, CLOTHING, HYGIENE").paymentTerms("NET-30").active(true).build());

        // Inventory
        seedInv(admin, centralHub, foodKit,   1250, 2000);
        seedInv(admin, centralHub, medKit,     420, 1000);
        seedInv(admin, centralHub, tent,       180,  500);
        seedInv(admin, centralHub, waterPack, 1800, 3000);
        seedInv(admin, centralHub, blanket,    650, 2000);
        seedInv(admin, centralHub, hygieneKit, 380, 1500);

        seedInv(admin, northHub,   foodKit,    280, 2000);
        seedInv(admin, northHub,   medKit,      90, 1000);
        seedInv(admin, northHub,   tent,        40,  500);
        seedInv(admin, northHub,   waterPack,  350, 3000);
        seedInv(admin, northHub,   blanket,    120, 2000);

        seedInv(admin, emergencyHub, foodKit,    60, 2000);
        seedInv(admin, emergencyHub, tent,        18,  500);
        seedInv(admin, emergencyHub, waterPack,  250, 3000);
        seedInv(admin, emergencyHub, medKit,      35, 1000);
        seedInv(admin, emergencyHub, emergencyEquip, 25, 300);

        // Purchase Orders
        PurchaseOrder po1 = new PurchaseOrder();
        po1.setPoNumber("PO-000001"); po1.setSupplier(supplier1); po1.setHub(centralHub);
        po1.setCampaign(floodCampaign); po1.setOrderDate(LocalDate.now().minusDays(7));
        po1.setExpectedDeliveryDate(LocalDate.now().plusDays(3));
        po1.setStatus(PurchaseOrder.POStatus.APPROVED); po1.setCreatedBy(admin); po1.setApprovedBy(admin);
        po1.setNotes("Urgent replenishment for flood relief");
        PurchaseOrderItem pi1 = new PurchaseOrderItem(); pi1.setPurchaseOrder(po1); pi1.setProduct(foodKit);
        pi1.setQuantity(500); pi1.setUnitPrice(new BigDecimal("45")); pi1.setTotalPrice(new BigDecimal("22500")); pi1.setReceivedQuantity(0);
        PurchaseOrderItem pi2 = new PurchaseOrderItem(); pi2.setPurchaseOrder(po1); pi2.setProduct(waterPack);
        pi2.setQuantity(1000); pi2.setUnitPrice(new BigDecimal("28")); pi2.setTotalPrice(new BigDecimal("28000")); pi2.setReceivedQuantity(0);
        PurchaseOrderItem pi3 = new PurchaseOrderItem(); pi3.setPurchaseOrder(po1); pi3.setProduct(blanket);
        pi3.setQuantity(500); pi3.setUnitPrice(new BigDecimal("12")); pi3.setTotalPrice(new BigDecimal("6000")); pi3.setReceivedQuantity(0);
        po1.getItems().addAll(List.of(pi1, pi2, pi3));
        po1.setTotalAmount(new BigDecimal("56500"));
        poRepository.save(po1);

        PurchaseOrder po2 = new PurchaseOrder();
        po2.setPoNumber("PO-000002"); po2.setSupplier(supplier2); po2.setHub(emergencyHub);
        po2.setCampaign(cycloneCampaign); po2.setOrderDate(LocalDate.now().minusDays(3));
        po2.setExpectedDeliveryDate(LocalDate.now().plusDays(5));
        po2.setStatus(PurchaseOrder.POStatus.PENDING_APPROVAL); po2.setCreatedBy(admin);
        po2.setNotes("Emergency medical supplies for coastal camp");
        PurchaseOrderItem pi4 = new PurchaseOrderItem(); pi4.setPurchaseOrder(po2); pi4.setProduct(medKit);
        pi4.setQuantity(200); pi4.setUnitPrice(new BigDecimal("185")); pi4.setTotalPrice(new BigDecimal("37000")); pi4.setReceivedQuantity(0);
        PurchaseOrderItem pi5 = new PurchaseOrderItem(); pi5.setPurchaseOrder(po2); pi5.setProduct(tent);
        pi5.setQuantity(100); pi5.setUnitPrice(new BigDecimal("250")); pi5.setTotalPrice(new BigDecimal("25000")); pi5.setReceivedQuantity(0);
        po2.getItems().addAll(List.of(pi4, pi5));
        po2.setTotalAmount(new BigDecimal("62000"));
        poRepository.save(po2);

        // Dispatches
        Dispatch d1 = new Dispatch();
        d1.setDispatchNumber("DSP-000001"); d1.setCampaign(floodCampaign);
        d1.setSourceHub(centralHub); d1.setDestinationCamp(camp1);
        d1.setVehicle("Truck GT-2024A"); d1.setDriverContact("+1-555-0500");
        d1.setDispatchDate(LocalDate.now().minusDays(2)); d1.setExpectedDeliveryDate(LocalDate.now().plusDays(1));
        d1.setPriority(Camp.Priority.HIGH); d1.setStatus(Dispatch.DispatchStatus.IN_TRANSIT);
        d1.setCreatedBy(admin); d1.setApprovedBy(admin);
        DispatchItem di1 = new DispatchItem(); di1.setDispatch(d1); di1.setProduct(foodKit); di1.setQuantity(200);
        DispatchItem di2 = new DispatchItem(); di2.setDispatch(d1); di2.setProduct(waterPack); di2.setQuantity(300);
        d1.getItems().addAll(List.of(di1, di2));
        dispatchRepository.save(d1);

        Dispatch d2 = new Dispatch();
        d2.setDispatchNumber("DSP-000002"); d2.setCampaign(cycloneCampaign);
        d2.setSourceHub(emergencyHub); d2.setDestinationCamp(camp4);
        d2.setVehicle("Van RC-103"); d2.setDriverContact("+1-555-0501");
        d2.setDispatchDate(LocalDate.now()); d2.setExpectedDeliveryDate(LocalDate.now().plusDays(2));
        d2.setPriority(Camp.Priority.CRITICAL); d2.setStatus(Dispatch.DispatchStatus.APPROVED);
        d2.setCreatedBy(admin); d2.setApprovedBy(admin);
        DispatchItem di3 = new DispatchItem(); di3.setDispatch(d2); di3.setProduct(medKit); di3.setQuantity(50);
        DispatchItem di4 = new DispatchItem(); di4.setDispatch(d2); di4.setProduct(tent); di4.setQuantity(20);
        d2.getItems().addAll(List.of(di3, di4));
        dispatchRepository.save(d2);

        // Resource Requests
        ResourceRequest req1 = new ResourceRequest();
        req1.setRequestNumber("REQ-000001"); req1.setCamp(camp1); req1.setCampaign(floodCampaign);
        req1.setReason("Running low on food supplies. 1200 displaced people need immediate assistance.");
        req1.setPriority(Camp.Priority.HIGH); req1.setStatus(ResourceRequest.RequestStatus.APPROVED);
        req1.setSos(false); req1.setRequestedBy(campRep1);
        ResourceRequestItem ri1 = new ResourceRequestItem(); ri1.setResourceRequest(req1); ri1.setProduct(foodKit);
        ri1.setRequestedQuantity(500); ri1.setApprovedQuantity(500);
        ResourceRequestItem ri2 = new ResourceRequestItem(); ri2.setResourceRequest(req1); ri2.setProduct(waterPack);
        ri2.setRequestedQuantity(600); ri2.setApprovedQuantity(600);
        req1.getItems().addAll(List.of(ri1, ri2));
        requestRepository.save(req1);

        ResourceRequest req2 = new ResourceRequest();
        req2.setRequestNumber("REQ-000002"); req2.setCamp(camp4); req2.setCampaign(cycloneCampaign);
        req2.setReason("URGENT: Medical supplies critically needed. Injuries from cyclone damage.");
        req2.setPriority(Camp.Priority.CRITICAL); req2.setStatus(ResourceRequest.RequestStatus.PENDING);
        req2.setSos(true); req2.setEmergencyType("Medical Emergency");
        req2.setSosLocation("Coastal Camp 04, Barangay Seafront"); req2.setRequestedBy(campRep2);
        ResourceRequestItem ri3 = new ResourceRequestItem(); ri3.setResourceRequest(req2); ri3.setProduct(medKit); ri3.setRequestedQuantity(100);
        ResourceRequestItem ri4 = new ResourceRequestItem(); ri4.setResourceRequest(req2); ri4.setProduct(hygieneKit); ri4.setRequestedQuantity(150);
        req2.getItems().addAll(List.of(ri3, ri4));
        requestRepository.save(req2);

        ResourceRequest req3 = new ResourceRequest();
        req3.setRequestNumber("REQ-000003"); req3.setCamp(camp2); req3.setCampaign(floodCampaign);
        req3.setReason("Request for shelter materials. Many families have damaged homes.");
        req3.setPriority(Camp.Priority.MEDIUM); req3.setStatus(ResourceRequest.RequestStatus.PENDING);
        req3.setSos(false); req3.setRequestedBy(campRep1);
        ResourceRequestItem ri5 = new ResourceRequestItem(); ri5.setResourceRequest(req3); ri5.setProduct(tent); ri5.setRequestedQuantity(80);
        ResourceRequestItem ri6 = new ResourceRequestItem(); ri6.setResourceRequest(req3); ri6.setProduct(blanket); ri6.setRequestedQuantity(200);
        req3.getItems().addAll(List.of(ri5, ri6));
        requestRepository.save(req3);

        // Budgets
        budgetRepository.save(Budget.builder()
                .campaign(floodCampaign).allocatedAmount(new BigDecimal("2500000"))
                .procurementBudget(new BigDecimal("1500000")).dispatchBudget(new BigDecimal("500000"))
                .otherExpensesBudget(new BigDecimal("200000")).actualExpenditure(new BigDecimal("856250"))
                .notes("Flood Relief Zone A campaign budget").build());

        budgetRepository.save(Budget.builder()
                .campaign(cycloneCampaign).allocatedAmount(new BigDecimal("1800000"))
                .procurementBudget(new BigDecimal("1000000")).dispatchBudget(new BigDecimal("350000"))
                .otherExpensesBudget(new BigDecimal("150000")).actualExpenditure(new BigDecimal("412000"))
                .notes("Cyclone Response coastal district budget").build());

        // Fund Accounts
        fundAccountRepository.save(FundAccount.builder().accountCode("ACC-0001").accountName("Main Relief Bank Account")
                .accountType(FundAccount.AccountType.BANK).balance(new BigDecimal("3250000"))
                .description("Primary bank account for relief operations").campaign(floodCampaign).active(true).build());
        fundAccountRepository.save(FundAccount.builder().accountCode("ACC-0002").accountName("Relief Inventory Asset")
                .accountType(FundAccount.AccountType.RELIEF_INVENTORY).balance(new BigDecimal("1240000"))
                .description("Total value of relief inventory on hand").active(true).build());
        fundAccountRepository.save(FundAccount.builder().accountCode("ACC-0003").accountName("UNHCR Relief Grant")
                .accountType(FundAccount.AccountType.RELIEF_GRANTS).balance(new BigDecimal("2500000"))
                .description("UNHCR emergency relief grant").campaign(floodCampaign).active(true).build());
        fundAccountRepository.save(FundAccount.builder().accountCode("ACC-0004").accountName("Red Cross Emergency Fund")
                .accountType(FundAccount.AccountType.RELIEF_GRANTS).balance(new BigDecimal("1800000"))
                .description("Red Cross emergency fund").campaign(cycloneCampaign).active(true).build());
        fundAccountRepository.save(FundAccount.builder().accountCode("ACC-0005").accountName("Supplier Creditors")
                .accountType(FundAccount.AccountType.SUPPLIER_CREDITORS).balance(new BigDecimal("247500"))
                .description("Outstanding payables to suppliers").active(true).build());
        fundAccountRepository.save(FundAccount.builder().accountCode("ACC-0006").accountName("Procurement Expense")
                .accountType(FundAccount.AccountType.PROCUREMENT_EXPENSE).balance(new BigDecimal("856250"))
                .description("Total procurement expenses incurred").active(true).build());
        fundAccountRepository.save(FundAccount.builder().accountCode("ACC-0007").accountName("Dispatch Freight Expense")
                .accountType(FundAccount.AccountType.DISPATCH_FREIGHT_EXPENSE).balance(new BigDecimal("125000"))
                .description("Transport and dispatch costs").active(true).build());

        // Notifications
        notificationRepository.save(Notification.builder()
                .title("🚨 CRITICAL SOS – Coastal Camp 04")
                .message("Emergency medical supplies needed at Coastal Camp 04. 100 Medical Kits requested immediately.")
                .type(Notification.NotificationType.SOS_REQUEST).severity(Notification.NotificationSeverity.CRITICAL)
                .referenceType("ResourceRequest").referenceId(2L).isRead(false).build());
        notificationRepository.save(Notification.builder()
                .title("CRITICAL: Low Stock – Emergency Shelter Tents")
                .message("Emergency Storage Hub: Shelter Tents at 3.6% (18/500). Immediate replenishment required.")
                .type(Notification.NotificationType.LOW_STOCK).severity(Notification.NotificationSeverity.CRITICAL)
                .isRead(false).build());
        notificationRepository.save(Notification.builder()
                .title("Purchase Order Awaiting Approval")
                .message("PO-000002 from MedRelief International is pending approval. Amount: ₱62,000")
                .type(Notification.NotificationType.PO_APPROVAL).severity(Notification.NotificationSeverity.INFO)
                .referenceType("PurchaseOrder").referenceId(2L).isRead(false).build());
        notificationRepository.save(Notification.builder()
                .title("New Resource Request – Zone A Camp 02")
                .message("REQ-000003: 80 tents and 200 blankets requested.")
                .type(Notification.NotificationType.RESOURCE_REQUEST).severity(Notification.NotificationSeverity.INFO)
                .referenceType("ResourceRequest").referenceId(3L).isRead(false).build());
        notificationRepository.save(Notification.builder()
                .title("Dispatch Approved – DSP-000002")
                .message("Dispatch to Coastal Camp 04 approved. Medical supplies en route.")
                .type(Notification.NotificationType.DISPATCH_APPROVED).severity(Notification.NotificationSeverity.INFO)
                .referenceType("Dispatch").referenceId(2L).isRead(true).build());

        log.info("Demo data seeded successfully.");
    }

    private void seedInv(User admin, ReliefHub hub, Product product, int qty, int maxCap) {
        Inventory inv = Inventory.builder().hub(hub).product(product).quantityOnHand(qty)
                .minimumStockLevel(product.getMinimumStockLevel()).maximumStockCapacity(maxCap).build();
        inventoryRepository.save(inv);
        InventoryTransaction tx = InventoryTransaction.builder()
                .hub(hub).product(product).transactionType(InventoryTransaction.TransactionType.INITIAL_STOCK)
                .quantity(qty).quantityBefore(0).quantityAfter(qty)
                .notes("Initial stock setup").performedBy(admin).build();
        txRepository.save(tx);
    }
}
