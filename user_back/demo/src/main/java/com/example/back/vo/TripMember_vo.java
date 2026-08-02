package com.example.back.vo;

// ============================================================
// TripMember_vo : trip_members 테이블 한 줄 상자
// 특징: user_id가 NULL 가능 = "가입 안 한 친구도 이름만으로 멤버"
// ============================================================
public class TripMember_vo {

    private Long id;
    private Long trip_id;
    private Long user_id;         // 가입 회원이면 연결, 이름만 초대면 NULL
    private String display_name;  // 여행 내 표시 이름
    private String short_name;    // 아바타용 축약 (예: 박찬)
    private String color_code;    // 아바타 컬러 키 (tp/tt/ta/tc/tb)
    private String role;          // owner / member
    private String joined_at;

    public TripMember_vo() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTrip_id() { return trip_id; }
    public void setTrip_id(Long trip_id) { this.trip_id = trip_id; }
    public Long getUser_id() { return user_id; }
    public void setUser_id(Long user_id) { this.user_id = user_id; }
    public String getDisplay_name() { return display_name; }
    public void setDisplay_name(String display_name) { this.display_name = display_name; }
    public String getShort_name() { return short_name; }
    public void setShort_name(String short_name) { this.short_name = short_name; }
    public String getColor_code() { return color_code; }
    public void setColor_code(String color_code) { this.color_code = color_code; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getJoined_at() { return joined_at; }
    public void setJoined_at(String joined_at) { this.joined_at = joined_at; }
}
