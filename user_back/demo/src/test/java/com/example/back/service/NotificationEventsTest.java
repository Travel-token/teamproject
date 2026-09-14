package com.example.back.service;

import org.junit.jupiter.api.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DuplicateKeyException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class NotificationEventsTest {
    @Test
    void optedOutUserReceivesNoNotification() {
        var db = mock(JdbcTemplate.class);
        when(db.queryForObject(anyString(), eq(Integer.class), eq(7L))).thenReturn(0);
        assertFalse(new NotificationEvents(db).emit(7L, 1L, "invite:1:1", "invite", "초대", "본문", "invite"));
        verify(db, never()).update(anyString(), any(Object[].class));
    }

    @Test
    void duplicateEventDoesNotInsertAnotherNotification() {
        var db = mock(JdbcTemplate.class);
        when(db.queryForObject(anyString(), eq(Integer.class), eq(7L))).thenReturn(1);
        when(db.update(startsWith("INSERT INTO notification_events"), eq(7L), eq("gps:1:100")))
                .thenThrow(new DuplicateKeyException("duplicate"));
        assertFalse(new NotificationEvents(db).emit(7L, 1L, "gps:1:100", "gps", "주변", "본문", "open_map"));
        verify(db, never()).update(startsWith("INSERT INTO notifications("), any(Object[].class));
    }

    @Test
    void eligibleEventCreatesInboxNotification() {
        var db = mock(JdbcTemplate.class);
        when(db.queryForObject(anyString(), eq(Integer.class), eq(7L))).thenReturn(1);
        assertTrue(new NotificationEvents(db).emit(7L, 1L, "invite:1:1", "invite", "초대", "본문", "invite"));
        verify(db).update(startsWith("INSERT INTO notifications("), eq(7L), eq(1L), eq("invite"), eq("초대"), eq("본문"),
                eq("invite"));
    }
}