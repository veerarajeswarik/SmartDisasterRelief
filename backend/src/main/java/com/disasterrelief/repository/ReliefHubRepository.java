package com.disasterrelief.repository;

import com.disasterrelief.entity.ReliefHub;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReliefHubRepository extends JpaRepository<ReliefHub, Long> {
    List<ReliefHub> findByStatus(ReliefHub.HubStatus status);
    boolean existsByHubCode(String hubCode);
    long countByStatus(ReliefHub.HubStatus status);
}
