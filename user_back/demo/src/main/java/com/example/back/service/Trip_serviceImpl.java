package com.example.back.service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.back.dto.Trip_RequestDto;
import com.example.back.dto.Trip_ResponseDto;
import com.example.back.dto.TripMember_RequestDto;
import com.example.back.dto.TripMember_ResponseDto;
import com.example.back.repository.Trip_repository;
import com.example.back.vo.Trip_vo;
import com.example.back.vo.TripMember_vo;

// ============================================================
// Trip_serviceImpl : 여행+멤버 요리사 본체
// 새 스키마의 3대 반영사항:
//  ① invite_code 자동 발급 (UNIQUE 충돌 대비 재시도 루프)
//  ② created_by 임시 기본값 1L (시드 1번 회원)
//     → 로그인(박찬민) 완성 시 세션의 회원 id로 교체할 지점!
//  ③ 방 생성 시 생성자를 owner 멤버로 자동 등록
// ============================================================
@Service
@org.springframework.transaction.annotation.Transactional
public class Trip_serviceImpl implements Trip_service {

    private final Trip_repository tripRepository;
    @org.springframework.beans.factory.annotation.Autowired private TripAccess access;
    @org.springframework.beans.factory.annotation.Autowired private org.springframework.jdbc.core.JdbcTemplate db;
    private Trip_ResponseDto response(Trip_vo vo) {
        var dto=Trip_ResponseDto.from(vo);
        var prefs=db.queryForMap("SELECT emoji,currency FROM trips WHERE id=?",vo.getId());
        dto.setEmoji((String)prefs.get("emoji"));dto.setCurrency((String)prefs.get("currency"));
        dto.setTotalExpense(db.queryForObject("SELECT COALESCE(SUM(amount),0) FROM expenses WHERE trip_id=?",java.math.BigDecimal.class,vo.getId()));
        dto.setMyExpense(db.queryForObject("SELECT COALESCE(SUM(e.amount),0) FROM expenses e JOIN trip_members m ON m.id=e.payer_member_id WHERE e.trip_id=? AND m.user_id=?",java.math.BigDecimal.class,vo.getId(),access.userId()));
        dto.setPhotoUrls(db.queryForList("SELECT CONCAT('/api/trips/',trip_id,'/photos/',id,'/content') FROM trip_photos WHERE trip_id=? ORDER BY id DESC LIMIT 4",String.class,vo.getId()));
        return dto;
    }
    private void preferences(Long id,Trip_RequestDto request) {
        if(request.getEmoji()!=null){if(request.getEmoji().length()>16)throw new IllegalArgumentException("아이콘이 너무 깁니다.");db.update("UPDATE trips SET emoji=? WHERE id=?",request.getEmoji(),id);}
        if(request.getCurrency()!=null){if(!List.of("KRW","USD","JPY","EUR").contains(request.getCurrency()))throw new IllegalArgumentException("지원하지 않는 통화입니다.");
        if(db.queryForObject("SELECT COUNT(*) FROM expenses WHERE trip_id=?",Integer.class,id)>0 && !request.getCurrency().equals(db.queryForObject("SELECT currency FROM trips WHERE id=?",String.class,id)))throw new IllegalArgumentException("지출 등록 후 통화를 바꿀 수 없습니다.");
        db.update("UPDATE trips SET currency=? WHERE id=?",request.getCurrency(),id);}
    }
    private static final SecureRandom RANDOM = new SecureRandom();
    // 헷갈리는 글자(0/O, 1/I/L) 제외한 코드용 문자 세트
    private static final String CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

    public Trip_serviceImpl(Trip_repository tripRepository) {
        this.tripRepository = tripRepository;
    }

    // ---------- [f] 여행 만들기 ----------
    @Override
    public Trip_ResponseDto createTrip(Trip_RequestDto request) {

        try {

            // 1. validation
            validateTripFields(request);

            Trip_vo trip = new Trip_vo();

            trip.setName(request.getName().trim());
            trip.setRegion(request.getRegion().trim());
            trip.setStart_date(request.getStartDate());
            trip.setEnd_date(request.getEndDate());
            trip.setBudget(request.getBudget());
            trip.setInvite_code(generateInviteCode());
            trip.setStatus("ongoing");

            trip.setCreated_by(access.userId());

            // 2. 여행 INSERT
            tripRepository.insertTrip(trip);

            // 3. owner 생성
            TripMember_vo owner = new TripMember_vo();

            owner.setTrip_id(trip.getId());
            owner.setUser_id(trip.getCreated_by());

            String creatorName = db.queryForObject("SELECT name FROM users WHERE id=?",String.class,access.userId());

            owner.setDisplay_name(creatorName);
            owner.setShort_name(toShortName(creatorName));
            owner.setColor_code("tp");
            owner.setRole("owner");

            // 4. 멤버 INSERT
            tripRepository.insertMember(owner);

            // 5. 조회
            Trip_vo result = tripRepository.findById(trip.getId());

            // 6. DTO 변환
            preferences(trip.getId(),request);
            if(request.getMemberNames()!=null) for(String name:request.getMemberNames()) {
                var mr=new TripMember_RequestDto();mr.setDisplayName(name);addMember(trip.getId(),mr);
            }
            Trip_ResponseDto response = response(result);

            return response;

        } catch (IllegalArgumentException e) { throw e; } catch (Exception e) {

            throw new IllegalArgumentException(
                    "여행 생성 중 오류가 발생했습니다.",
                    e);
        }
    }

    // ---------- [g] 목록 / 진행중 / 단건 ----------
    @Override
    public List<Trip_ResponseDto> getAllTrips(String status) {
        List<Trip_vo> voList = (status == null || status.isBlank())
                ? tripRepository.findAll()
                : tripRepository.findByStatus(status);
        List<Trip_ResponseDto> result = new ArrayList<>();
        for (Trip_vo vo : voList) {
            if(db.queryForObject("SELECT COUNT(*) FROM trip_members WHERE trip_id=? AND user_id=?",Integer.class,vo.getId(),access.userId())==0)continue;
            result.add(response(vo));
        }
        return result;
    }

    @Override
    public Trip_ResponseDto getActiveTrip() {
        var trips=getAllTrips("ongoing");
        return trips.isEmpty()?null:trips.get(0);
    }

    @Override
    public Trip_ResponseDto getTrip(Long tripId) {
        access.member(tripId);
        Trip_vo vo = tripRepository.findById(tripId);
        if (vo == null) {
            throw new IllegalArgumentException("해당 여행이 존재하지 않습니다.");
        }
        return response(vo);
    }

    // ---------- [h] 수정 / 상태변경 / 삭제 ----------
    @Override
    public Trip_ResponseDto updateTrip(Long tripId, Trip_RequestDto request) {
        access.owner(tripId);
        validateTripFields(request);
        preferences(tripId,request);

        Trip_vo trip = new Trip_vo();
        trip.setId(tripId); // WHERE의 재료!
        trip.setName(request.getName().trim());
        trip.setRegion(request.getRegion().trim());
        trip.setStart_date(request.getStartDate());
        trip.setEnd_date(request.getEndDate());
        trip.setBudget(request.getBudget());

        if (tripRepository.updateTrip(trip) == 0) {
            throw new IllegalArgumentException("해당 여행이 존재하지 않습니다.");
        }
        return response(tripRepository.findById(tripId));
    }

    @Override
    public Trip_ResponseDto changeStatus(Long tripId, String status) {
        // 공식 스키마의 3단계 상태만 허용
        if (!"planned".equals(status) && !"ongoing".equals(status) && !"completed".equals(status)) {
            throw new IllegalArgumentException("status는 planned / ongoing / completed 만 가능합니다.");
        }
        if (tripRepository.updateStatus(tripId, status) == 0) {
            throw new IllegalArgumentException("해당 여행이 존재하지 않습니다.");
        }
        return response(tripRepository.findById(tripId));
    }

    @Override
    public boolean deleteTrip(Long tripId) {
        access.owner(tripId);access.lock(tripId);
        db.update("DELETE s FROM expense_splits s JOIN expenses e ON e.id=s.expense_id WHERE e.trip_id=?",tripId);
        // 멤버/동선/지출은 DB의 ON DELETE CASCADE가 연쇄 정리
        return tripRepository.deleteTrip(tripId) > 0;
    }

    @Override
    public String getInviteCode(Long tripId) {
        Trip_vo vo = tripRepository.findById(tripId);
        if (vo == null) {
            throw new IllegalArgumentException("해당 여행이 존재하지 않습니다.");
        }
        return vo.getInvite_code();
    }

    // ---------- [h-2,3] 멤버 ----------
    @Override
    public TripMember_ResponseDto addMember(Long tripId, TripMember_RequestDto request) {
        access.owner(tripId); access.mutable(tripId);
        if (tripRepository.findById(tripId) == null) {
            throw new IllegalArgumentException("해당 여행이 존재하지 않습니다.");
        }
        if (request.getDisplayName() == null || request.getDisplayName().isBlank()) {
            throw new IllegalArgumentException("멤버 이름은 필수입니다.");
        }

        TripMember_vo member = new TripMember_vo();
        member.setTrip_id(tripId);
        member.setUser_id(request.getUserId()); // 미가입 친구면 null
        String name = request.getDisplayName().trim();
        member.setDisplay_name(name);
        member.setShort_name(toShortName(name));
        member.setColor_code(request.getColorCode() == null ? "tp" : request.getColorCode());
        member.setRole("member");

        tripRepository.insertMember(member);

        // 방금 저장된 멤버를 목록에서 찾아 답장 (id 기준)
        for (TripMember_vo vo : tripRepository.findMembersByTripId(tripId)) {
            if (vo.getId().equals(member.getId())) {
                return TripMember_ResponseDto.from(vo);
            }
        }
        return TripMember_ResponseDto.from(member);
    }

    @Override
    public List<TripMember_ResponseDto> getMembers(Long tripId) {
        List<TripMember_ResponseDto> result = new ArrayList<>();
        for (TripMember_vo vo : tripRepository.findMembersByTripId(tripId)) {
            result.add(TripMember_ResponseDto.from(vo));
        }
        return result;
    }

    @Override
    public boolean removeMember(Long memberId) {
        Long tripId=db.queryForObject("SELECT trip_id FROM trip_members WHERE id=?",Long.class,memberId); access.owner(tripId);access.mutable(tripId);
        if(db.queryForObject("SELECT role FROM trip_members WHERE id=?",String.class,memberId).equals("owner"))throw new IllegalArgumentException("방장은 내보낼 수 없습니다.");
        if(db.queryForObject("SELECT (SELECT COUNT(*) FROM expense_splits WHERE member_id=?)+(SELECT COUNT(*) FROM expenses WHERE payer_member_id=?)+(SELECT COUNT(*) FROM transfers WHERE from_member_id=? OR to_member_id=?)",Integer.class,memberId,memberId,memberId,memberId)>0)throw new IllegalArgumentException("지출 또는 송금에 참여한 멤버는 내보낼 수 없습니다.");
        return tripRepository.deleteMember(memberId) > 0;
    }

    // ---------- 도우미들 ----------

    // 여행 필수값 검사 (생성/수정 공용)
    private void validateTripFields(Trip_RequestDto request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("여행 이름은 필수입니다.");
        }
        if (request.getRegion() == null || request.getRegion().trim().isEmpty()) {
            throw new IllegalArgumentException("여행 지역은 필수입니다.");
        }
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new IllegalArgumentException("여행 시작일과 종료일은 필수입니다.");
        }
        if (!request.getStartDate().matches("\\d{4}-\\d{2}-\\d{2}")
                || !request.getEndDate().matches("\\d{4}-\\d{2}-\\d{2}")) {
            throw new IllegalArgumentException("날짜는 yyyy-MM-dd 형식이어야 합니다.");
        }
        try {java.time.LocalDate.parse(request.getStartDate());java.time.LocalDate.parse(request.getEndDate());} catch(java.time.DateTimeException e){throw new IllegalArgumentException("올바른 날짜를 입력해 주세요.");}
        if (request.getEndDate().compareTo(request.getStartDate()) < 0) {
            throw new IllegalArgumentException("종료일이 시작일보다 빠를 수 없습니다.");
        }
    }

    // 초대 코드 자동 발급: "TT-" + 6글자, UNIQUE 충돌 시 재시도
    private String generateInviteCode() {
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder("TT-");
            for (int i = 0; i < 6; i++) {
                sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            }
            String code = sb.toString();
            if (tripRepository.countByInviteCode(code) == 0) {
                return code; // 아무도 안 쓰는 코드 → 채택
            }
        }
        throw new IllegalStateException("초대 코드 생성에 실패했습니다. 다시 시도해주세요.");
    }

    // 아바타용 축약 이름: 앞 2글자 (스키마 short_name VARCHAR(10))
    private String toShortName(String name) {
        return name.length() <= 2 ? name : name.substring(0, 2);
    }
}
