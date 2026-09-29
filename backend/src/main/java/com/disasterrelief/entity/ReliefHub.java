package com.disasterrelief.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "relief_hubs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReliefHub {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String hubCode;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 300)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 100)
    private String contactPerson;

    @Column(length = 20)
    private String contactNumber;

    private Integer storageCapacity;

    private Double latitude;

    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private HubStatus status = HubStatus.ACTIVE;

    @OneToMany(mappedBy = "hub", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Inventory> inventories = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum HubStatus {
        ACTIVE, INACTIVE, MAINTENANCE
    }
}
