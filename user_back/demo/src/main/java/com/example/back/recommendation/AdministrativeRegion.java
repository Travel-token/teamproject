package com.example.back.recommendation;

/** 추천 서버에는 상세 주소 대신 시·도/시·군·구까지만 전달한다. */
public final class AdministrativeRegion {
    private AdministrativeRegion() { }
    public static String fromAddress(String address) {
        if (address == null || address.isBlank()) return "";
        String[] parts = address.trim().replaceAll("\\s+", " ").split(" ");
        String first = parts[0];
        if (first.startsWith("세종") || parts.length == 1) return first;
        String second = parts[1];
        return second.matches(".*(시|군|구)$") ? first + " " + second : first;
    }
}
