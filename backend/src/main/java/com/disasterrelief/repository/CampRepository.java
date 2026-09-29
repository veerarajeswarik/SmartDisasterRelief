package com.disasterrelief.repository;

import com.disasterrelief.entity.Camp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampRepository extends JpaRepository<Camp, Long> {
    List<Camp> findByCampaignId(Long campaignId);
    List<Camp> findByPriority(Camp.Priority priority);
    List<Camp> findByStatus(Camp.CampStatus status);
    boolean existsByCampCode(String campCode);
}
