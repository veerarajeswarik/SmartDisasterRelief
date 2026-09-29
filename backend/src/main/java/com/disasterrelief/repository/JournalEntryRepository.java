package com.disasterrelief.repository;

import com.disasterrelief.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    List<JournalEntry> findByCampaignId(Long campaignId);
    List<JournalEntry> findByJournalType(JournalEntry.JournalType type);
    List<JournalEntry> findByEntryDateBetween(LocalDate from, LocalDate to);
    boolean existsByEntryNumber(String entryNumber);
}
