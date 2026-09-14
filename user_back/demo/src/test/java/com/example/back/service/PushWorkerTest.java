package com.example.back.service;

import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.client.RestClient;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.http.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class PushWorkerTest {
    JdbcTemplate db;
    PushWorker worker;
    MockRestServiceServer server;

    @BeforeEach
    void setup() {
        db = mock(JdbcTemplate.class);
        RestClient.Builder builder = RestClient.builder().baseUrl("https://exp.host/--/api/v2/push");
        server = MockRestServiceServer.bindTo(builder).build();
        worker = new PushWorker(db, builder.build());
        when(db.update(startsWith("UPDATE push_outbox SET state=?,available_at="), any(Object[].class))).thenReturn(1);
    }

    void job(String state) {
        when(db.queryForList(startsWith("SELECT id,state"))).thenReturn(List.of(Map.of("id", 1L, "state", state)));
        Map<String, Object> row = new HashMap<>(Map.of("notification_id", 5L, "device_id", 2L, "user_id", 1L,
                "session_version", 1L, "expo_token", "ExpoPushToken[test]", "send_attempts", 1));
        row.put("ticket_id", "ticket-1");
        when(db.queryForList(startsWith("SELECT o.*"), eq(1L))).thenReturn(List.of(row));
        when(db.queryForMap(startsWith("SELECT trip_id"), eq(5L))).thenReturn(Map.of("trip_id", 7L, "type", "settle"));
    }

    @AfterEach
    void verifyNetwork() {
        server.verify();
    }

    @Test
    void ticketIsPersistedAndPayloadHasNoAccountDetails() {
        job("pending");
        server.expect(requestTo("https://exp.host/--/api/v2/push/send"))
                .andExpect(jsonPath("$.data.userId").value("1"))
                .andExpect(jsonPath("$.data.tripId").value("7"))
                .andExpect(jsonPath("$.body").value("새 알림이 있습니다. 앱에서 확인해 주세요."))
                .andRespond(
                        withSuccess("{\"data\":{\"status\":\"ok\",\"id\":\"ticket-1\"}}", MediaType.APPLICATION_JSON));
        worker.tick();
        verify(db).update(startsWith("UPDATE push_outbox SET state='ticket'"), eq("ticket-1"), eq(1L));
    }

    @Test
    void receiptOkCompletesDelivery() {
        job("ticket");
        server.expect(requestTo("https://exp.host/--/api/v2/push/getReceipts"))
                .andRespond(withSuccess("{\"data\":{\"ticket-1\":{\"status\":\"ok\"}}}", MediaType.APPLICATION_JSON));
        worker.tick();
        verify(db).update(startsWith("UPDATE push_outbox SET state=?,last_error=? WHERE"), eq("delivered"), isNull(),
                eq(1L));
    }

    @Test
    void revokedTokenDisablesOnlyItsCurrentSession() {
        job("ticket");
        server.expect(requestTo("https://exp.host/--/api/v2/push/getReceipts")).andRespond(withSuccess(
                "{\"data\":{\"ticket-1\":{\"status\":\"error\",\"details\":{\"error\":\"DeviceNotRegistered\"}}}}",
                MediaType.APPLICATION_JSON));
        worker.tick();
        verify(db).update(startsWith("UPDATE push_devices SET enabled=0"), eq(2L), eq(1L), eq("ExpoPushToken[test]"),
                eq(1L));
    }

    @Test
    void rateLimitIsRetriedRatherThanReportedDelivered() {
        job("pending");
        server.expect(requestTo("https://exp.host/--/api/v2/push/send"))
                .andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));
        worker.tick();
        verify(db).update(startsWith("UPDATE push_outbox SET state=?,last_error=?,available_at="), eq("pending"),
                eq("NETWORK_OR_RATE_LIMIT"), eq(1L));
    }

    @Test
    void missingReceiptIsPolledAgain() {
        job("ticket");
        server.expect(requestTo("https://exp.host/--/api/v2/push/getReceipts"))
                .andRespond(withSuccess("{\"data\":{}}", MediaType.APPLICATION_JSON));
        worker.tick();
        verify(db).update(startsWith("UPDATE push_outbox SET state=?,last_error=?,available_at="), eq("ticket"),
                eq("RECEIPT_PENDING"), eq(1L));
    }

    @Test
    void disabledOrChangedOwnerDoesNotSend() {
        job("pending");
        when(db.queryForList(startsWith("SELECT o.*"), eq(1L))).thenReturn(List.of());
        worker.tick();
        verify(db).update(startsWith("UPDATE push_outbox SET state=?,last_error=? WHERE"), eq("dead"),
                eq("DISABLED_READ_OR_EXPIRED"), eq(1L));
    }
}
