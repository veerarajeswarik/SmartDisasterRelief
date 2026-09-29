package com.disasterrelief.repository;

import com.disasterrelief.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {
    List<LedgerEntry> findByAccountIdOrderByEntryDateDesc(Long accountId);
    List<LedgerEntry> findByEntryDateBetweenOrderByEntryDateDesc(LocalDate from, LocalDate to);

    @Query("SELECT COALESCE(SUM(l.debitAmount - l.creditAmount), 0) FROM LedgerEntry l WHERE l.account.id = :accountId")
    BigDecimal getNetBalanceForAccount(Long accountId);
}
