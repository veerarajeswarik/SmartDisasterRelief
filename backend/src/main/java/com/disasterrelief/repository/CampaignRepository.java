package com.disasterrelief.repository;

import com.disasterrelief.entity.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    List<Campaign> findByStatus(Campaign.CampaignStatus status);
    boolean existsByCampaignCode(String campaignCode);
    long countByStatus(Campaign.CampaignStatus status);

    @Query("SELECT c FROM Campaign c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%',:name,'%'))")
    List<Campaign> searchByName(String name);
}
