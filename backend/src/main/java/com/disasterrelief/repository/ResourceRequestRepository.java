package com.disasterrelief.repository;

import com.disasterrelief.entity.ResourceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRequestRepository extends JpaRepository<ResourceRequest, Long> {
    List<ResourceRequest> findByCampId(Long campId);
    List<ResourceRequest> findByCampaignId(Long campaignId);
    List<ResourceRequest> findByStatus(ResourceRequest.RequestStatus status);
    List<ResourceRequest> findByIsSosTrue();
    boolean existsByRequestNumber(String requestNumber);
    long countByStatus(ResourceRequest.RequestStatus status);
}
