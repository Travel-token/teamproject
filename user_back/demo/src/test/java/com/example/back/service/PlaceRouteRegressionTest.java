package com.example.back.service;

import com.example.back.dto.PlaceLog_RequestDto;
import com.example.back.mapper.PlaceMapper;
import com.example.back.repository.PlaceLog_repository;
import com.example.back.repository.Trip_repository;
import com.example.back.vo.Trip_vo;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PlaceRouteRegressionTest {
    @Test void koreanKeywordIsEncodedOnlyOnce() throws Exception {
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        var query = new AtomicReference<String>();
        var method = new AtomicReference<String>();
        server.createContext("/searchKeyword2", exchange -> {
            method.set(exchange.getRequestMethod());
            query.set(exchange.getRequestURI().getRawQuery());
            byte[] body = "{\"response\":{\"header\":{\"resultCode\":\"0000\"},\"body\":{\"items\":{\"item\":[{\"contentid\":\"123\",\"title\":\"Jeju\",\"mapy\":\"33.4\",\"mapx\":\"126.5\"}]}}}}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        server.start();
        try {
            var service = new PlaceService(mock(PlaceMapper.class), mock(JdbcTemplate.class));
            ReflectionTestUtils.setField(service, "baseUrl", "http://127.0.0.1:" + server.getAddress().getPort());
            ReflectionTestUtils.setField(service, "serviceKey", "test-key");
            ReflectionTestUtils.setField(service, "mobileOs", "AND");
            ReflectionTestUtils.setField(service, "appName", "TravelSettle");
            var result = service.search("제주 여행");
            assertEquals("GET", method.get());
            assertTrue(URLDecoder.decode(query.get(), StandardCharsets.UTF_8).contains("keyword=제주 여행"));
            assertEquals("tour:123", result.get(0).getExternalApiId());
            assertEquals(33.4, result.get(0).getLatitude().doubleValue());
        } finally { server.stop(0); }
    }

    @Test void externalTourPlaceIsLinkedBeforeSavingRoute() {
        var logs = mock(PlaceLog_repository.class);
        var trips = mock(Trip_repository.class);
        var places = mock(PlaceService.class);
        when(trips.findById(1L)).thenReturn(new Trip_vo());
        when(places.resolveTourPlace("tour:123")).thenReturn(42L);
        var request = new PlaceLog_RequestDto();
        request.setName("Jeju");
        request.setExternalApiId("tour:123");
        var result = new PlaceLog_serviceImpl(logs, trips, places).addLog(1L, request);
        assertEquals(42L, result.getPlaceId());
        verify(logs).insertLog(argThat(log -> Long.valueOf(42).equals(log.getPlace_id())));
    }
}
