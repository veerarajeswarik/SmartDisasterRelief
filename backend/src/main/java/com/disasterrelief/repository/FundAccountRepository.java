package com.disasterrelief.repository;

import com.disasterrelief.entity.FundAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface FundAccountRepository extends JpaRepository<FundAccount, Long> {
    List<FundAccount> findByActiveTrue();
    List<FundAccount> findByAccountType(FundAccount.AccountType accountType);
    Optional<FundAccount> findByAccountCode(String accountCode);
    boolean existsByAccountCode(String accountCode);

    @Query("SELECT COALESCE(SUM(f.balance), 0) FROM FundAccount f WHERE f.accountType = 'BANK' AND f.active = true")
    BigDecimal sumBankBalance();

    @Query("SELECT COALESCE(SUM(f.balance), 0) FROM FundAccount f WHERE f.accountType = 'RELIEF_GRANTS' AND f.active = true")
    BigDecimal sumGrantsBalance();
}
