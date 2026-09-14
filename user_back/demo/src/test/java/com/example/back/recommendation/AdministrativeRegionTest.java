package com.example.back.recommendation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

class AdministrativeRegionTest {
    @Test void removesDetailedAddress() {
        assertEquals("서울특별시 종로구", AdministrativeRegion.fromAddress("서울특별시 종로구 사직로 161"));
        assertEquals("경상북도 경주시", AdministrativeRegion.fromAddress("경상북도 경주시 불국로 385"));
        assertEquals("세종특별자치시", AdministrativeRegion.fromAddress("세종특별자치시 한누리대로 2130"));
    }
}
