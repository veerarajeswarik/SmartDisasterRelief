package com.disasterrelief.repository;

import com.disasterrelief.entity.Dispatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DispatchRepository extends JpaRepository<Dispatch, Long> {
    List<Dispatch> findByStatus(Dispatch.DispatchStatus status);
    List<Dispatch> findByCampaignId(Long campaignId);
    List<Dispatch> findBySourceHubId(Long hubId);
    List<Dispatch> findByDestinationCampId(Long campId);
    boolean existsByDispatchNumber(String dispatchNumber);
    long countByStatus(Dispatch.DispatchStatus status);
}
