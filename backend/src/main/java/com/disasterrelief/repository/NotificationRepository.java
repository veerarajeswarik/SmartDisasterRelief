package com.disasterrelief.repository;

import com.disasterrelief.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.targetUser.id = :userId OR n.targetUser IS NULL ORDER BY n.createdAt DESC")
    List<Notification> findByTargetUserIdOrTargetUserIsNullOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT n FROM Notification n WHERE (n.targetUser.id = :userId OR n.targetUser IS NULL) AND n.isRead = false")
    List<Notification> findUnreadForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.targetUser.id = :userId OR n.targetUser IS NULL) AND n.isRead = false")
    long countUnreadForUser(@Param("userId") Long userId);

    List<Notification> findTop10ByOrderByCreatedAtDesc();
}
