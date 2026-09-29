package com.disasterrelief.service;

import com.disasterrelief.entity.Notification;
import com.disasterrelief.entity.User;
import com.disasterrelief.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void createNotification(String title, String message,
                                   Notification.NotificationType type,
                                   Notification.NotificationSeverity severity,
                                   User targetUser, String refType, Long refId) {
        Notification notification = Notification.builder()
                .title(title).message(message).type(type).severity(severity)
                .targetUser(targetUser).referenceType(refType).referenceId(refId)
                .isRead(false).build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void createBroadcastNotification(String title, String message,
                                            Notification.NotificationType type,
                                            Notification.NotificationSeverity severity) {
        createNotification(title, message, type, severity, null, null, null);
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByTargetUserIdOrTargetUserIsNullOrderByCreatedAtDesc(userId);
    }

    public long countUnreadForUser(Long userId) {
        return notificationRepository.countUnreadForUser(userId);
    }

    @Transactional
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsReadForUser(Long userId) {
        List<Notification> unread = notificationRepository.findUnreadForUser(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public List<Notification> getRecent() {
        return notificationRepository.findTop10ByOrderByCreatedAtDesc();
    }
}
