package com.example.back;

import com.example.back.controller.PaymentCaptureController;
import com.example.back.dto.ExpenseRequest;
import com.example.back.dto.ExpenseResponse;
import com.example.back.service.ExpenseService;
import com.example.back.service.TripAccess;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import org.junit.jupiter.api.*;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class PaymentCaptureControllerTest {
    JdbcTemplate db;
    ExpenseService expenses;
    TripAccess access;
    PaymentCaptureController controller;
    final String event = "a".repeat(64);

    @BeforeEach
    void setup() {
        db = mock(JdbcTemplate.class);
        expenses = mock(ExpenseService.class);
        access = mock(TripAccess.class);
        controller = new PaymentCaptureController(db, expenses, access);
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(42L, null, List.of()));
        when(db.queryForObject(contains("FROM users"), eq(Integer.class), eq(42L))).thenReturn(1);
        when(db.queryForObject(contains("FROM user_settings"), eq(Integer.class), eq(42L))).thenReturn(1);
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    PaymentCaptureController.Capture capture(long user, long time) {
        return new PaymentCaptureController.Capture(user, event, "example.card", new BigDecimal("12000"), time);
    }

    PaymentCaptureController.Confirm confirm() {
        return new PaymentCaptureController.Confirm(7L, "점심", new BigDecimal("12000"), "meal",
                LocalDateTime.of(2026, 9, 6, 12, 0));
    }

    @Test
    void deniesCrossAccountCapture() {
        assertEquals(403, assertThrows(ResponseStatusException.class,
                () -> controller.ingest(capture(99L, System.currentTimeMillis()))).getStatusCode().value());
        verify(db, never()).update(anyString(), any(Object[].class));
    }

    @Test
    void requiresCollectionOptIn() {
        when(db.queryForObject(contains("FROM user_settings"), eq(Integer.class), eq(42L))).thenReturn(0);
        assertEquals(403, assertThrows(ResponseStatusException.class,
                () -> controller.ingest(capture(42L, System.currentTimeMillis()))).getStatusCode().value());
    }

    @Test
    void rejectsExpiredAndFutureEvents() {
        assertThrows(ResponseStatusException.class, () -> controller.ingest(capture(42L, 1L)));
        assertThrows(ResponseStatusException.class,
                () -> controller.ingest(capture(42L, System.currentTimeMillis() + 3600000)));
    }

    @Test
    void networkReplayIsAcknowledged() {
        when(db.update(startsWith("INSERT INTO payment_candidates"), any(Object[].class)))
                .thenThrow(new DuplicateKeyException("duplicate"));
        assertEquals(event, controller.ingest(capture(42L, System.currentTimeMillis())).get("eventId"));
    }

    @Test
    void confirmationReplayReturnsExistingExpenseWithoutCreatingAnother() {
        when(db.queryForList(contains("FOR UPDATE"), eq(42L), eq(event)))
                .thenReturn(List.of(Map.of("status", "imported", "trip_id", 7L, "expense_id", 10L)));
        assertEquals("10", controller.confirm(event, confirm()).get("expenseId"));
        verifyNoInteractions(expenses);
    }

    @Test
    void cannotMoveAlreadyImportedCandidateToAnotherTrip() {
        when(db.queryForList(contains("FOR UPDATE"), eq(42L), eq(event)))
                .thenReturn(List.of(Map.of("status", "imported", "trip_id", 8L, "expense_id", 10L)));
        assertEquals(409, assertThrows(ResponseStatusException.class, () -> controller.confirm(event, confirm()))
                .getStatusCode().value());
        verifyNoInteractions(expenses);
    }

    @Test
    void pendingConfirmationUsesCurrentMemberAndExistingExpenseRules() {
        when(db.queryForList(contains("FOR UPDATE"), eq(42L), eq(event)))
                .thenReturn(List.of(Map.of("status", "pending")));
        when(db.queryForObject(contains("SELECT currency"), eq(String.class), eq(7L))).thenReturn("KRW");
        when(db.queryForList(contains("user_id=?"), eq(Long.class), eq(7L), eq(42L))).thenReturn(List.of(3L));
        when(db.queryForList(contains("ORDER BY id"), eq(Long.class), eq(7L))).thenReturn(List.of(3L, 4L));
        when(expenses.createExpense(eq(7L), any())).thenReturn(ExpenseResponse.Item.builder().id(10L).build());
        assertEquals("10", controller.confirm(event, confirm()).get("expenseId"));
        ArgumentCaptor<ExpenseRequest.Create> req = ArgumentCaptor.forClass(ExpenseRequest.Create.class);
        verify(access).mutable(7L);
        verify(expenses).createExpense(eq(7L), req.capture());
        assertEquals(3L, req.getValue().getPayerMemberId());
        assertEquals("even", req.getValue().getSplitMode());
        assertEquals(List.of(3L, 4L),
                req.getValue().getSplits().stream().map(ExpenseRequest.SplitInput::getMemberId).toList());
    }

    @Test
    void settlementLockRejectionDoesNotCreateExpense() {
        when(db.queryForList(contains("FOR UPDATE"), eq(42L), eq(event)))
                .thenReturn(List.of(Map.of("status", "pending")));
        doThrow(new IllegalArgumentException("정산 생성됨")).when(access).mutable(7L);
        assertThrows(IllegalArgumentException.class, () -> controller.confirm(event, confirm()));
        verifyNoInteractions(expenses);
    }
}