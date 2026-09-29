package com.disasterrelief.dto.response;

import com.disasterrelief.entity.Notification;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private Notification.NotificationType type;
    private Notification.NotificationSeverity severity;
    private String referenceType;
    private Long referenceId;
    private boolean isRead;
    private LocalDateTime createdAt;
}
