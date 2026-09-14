package com.example.back.controller;

import com.example.back.dto.ExpenseRequest;
import com.example.back.service.ExpenseService;
import com.example.back.service.TripAccess;
import com.example.back.util.SecurityUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "integrations.payment-capture.enabled", havingValue = "true")
@RequestMapping("/api/payment-candidates")
@RequiredArgsConstructor
public class PaymentCaptureController {
    private final JdbcTemplate db;
    private final ExpenseService expenses;
    private final TripAccess access;

    public record Capture(@NotNull Long ownerUserId,
            @NotBlank @Pattern(regexp = "[a-f0-9]{64}") String eventId,
            @NotBlank @Size(max = 200) @Pattern(regexp = "[a-zA-Z0-9_.]+") String sourcePackage,
            @NotNull @Positive @DecimalMax("1000000000") @Digits(integer = 10, fraction = 0) BigDecimal amount,
            @NotNull @Positive Long observedAt) {
    }

    public record Confirm(@NotNull @Positive Long tripId,
            @NotBlank @Size(max = 100) String name,
            @NotNull @Positive @DecimalMax("1000000000") @Digits(integer = 10, fraction = 0) BigDecimal amount,
            @NotBlank String categoryCode, @NotNull LocalDateTime spentAt) {
    }

    private Long user() {
        Long id = SecurityUtil.getCurrentUserId();
        if (db.queryForObject("SELECT COUNT(*) FROM users WHERE id=? AND status<>'withdrawn'", Integer.class, id) != 1)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return id;
    }

    @PostMapping
    public Map<String, String> ingest(@Valid @RequestBody Capture c) {
        Long uid = user();
        if (!uid.equals(c.ownerUserId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "다른 계정의 수집 내역입니다.");
        if (db.queryForObject("SELECT COUNT(*) FROM user_settings WHERE user_id=? AND pay_sync_enabled=1",
                Integer.class, uid) == 0)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "결제 수집 설정이 꺼져 있습니다.");
        long now = System.currentTimeMillis();
        if (c.observedAt() < now - 7L * 24 * 60 * 60 * 1000 || c.observedAt() > now + 5 * 60 * 1000)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "수집 시각 범위를 확인하세요.");
        try {
            db.update(
                    "INSERT INTO payment_candidates(user_id,event_id,source_package,amount,observed_at) VALUES(?,?,?,?,?)",
                    uid, c.eventId(), c.sourcePackage(), c.amount(), c.observedAt());
        } catch (DuplicateKeyException ignored) {
            /* 동일 이벤트 재전송: 성공으로 응답 */ }
        return Map.of("eventId", c.eventId());
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return db.queryForList(
                "SELECT event_id eventId,source_package sourcePackage,amount,observed_at observedAt FROM payment_candidates WHERE user_id=? AND status='pending' ORDER BY observed_at DESC LIMIT 100",
                user());
    }

    @PostMapping("/{eventId}/dismiss")
    public void dismiss(@PathVariable String eventId) {
        db.update(
                "UPDATE payment_candidates SET status='dismissed' WHERE user_id=? AND event_id=? AND status='pending'",
                user(), eventId);
    }

    @Transactional
    @PostMapping("/{eventId}/confirm")
    public Map<String, String> confirm(@PathVariable String eventId, @Valid @RequestBody Confirm c) {
        Long uid = user();
        var rows = db.queryForList(
                "SELECT status,expense_id,trip_id FROM payment_candidates WHERE user_id=? AND event_id=? FOR UPDATE",
                uid, eventId);
        if (rows.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        var old = rows.get(0);
        if ("imported".equals(old.get("status"))) {
            if (((Number) old.get("trip_id")).longValue() != c.tripId())
                throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 다른 여행에 등록했습니다.");
            access.member(c.tripId());
            return Map.of("expenseId", String.valueOf(old.get("expense_id")));
        }
        if (!"pending".equals(old.get("status")))
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        access.mutable(c.tripId());
        if (!"KRW".equals(db.queryForObject("SELECT currency FROM trips WHERE id=?", String.class, c.tripId())))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "원화 여행에만 등록할 수 있습니다.");
        var mine = db.queryForList("SELECT id FROM trip_members WHERE trip_id=? AND user_id=?", Long.class, c.tripId(),
                uid);
        if (mine.size() != 1)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "본인 멤버를 확인하세요.");
        ExpenseRequest.Create req = new ExpenseRequest.Create();
        req.setName(c.name());
        req.setAmount(c.amount());
        req.setCategoryCode(c.categoryCode());
        req.setPayerMemberId(mine.get(0));
        req.setSpentAt(c.spentAt());
        req.setSplitMode("even");
        req.setMemo("결제 알림 수집함에서 확인 후 등록");
        req.setSplits(db.queryForList("SELECT id FROM trip_members WHERE trip_id=? ORDER BY id", Long.class, c.tripId())
                .stream().map(id -> {
                    var split = new ExpenseRequest.SplitInput();
                    split.setMemberId(id);
                    return split;
                }).toList());
        Long expenseId = expenses.createExpense(c.tripId(), req).getId();
        // 현재 expenses.source는 manual/ocr/card_sync 구분을 이미 갖고 있다.
        db.update("UPDATE expenses SET source='card_sync' WHERE id=?", expenseId);
        db.update(
                "UPDATE payment_candidates SET status='imported',expense_id=?,trip_id=? WHERE user_id=? AND event_id=?",
                expenseId, c.tripId(), uid, eventId);
        return Map.of("expenseId", String.valueOf(expenseId));
    }
}
