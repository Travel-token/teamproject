package com.example.back.service;

import java.math.BigDecimal;
import java.util.*;
import com.example.back.dto.PlaceSearchResponse;
import com.example.back.mapper.PlaceMapper;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service @RequiredArgsConstructor
public class PlaceService {
    private final PlaceMapper placeMapper;
    private final JdbcTemplate db;
    @Value("${tour-api.service-key:}") private String serviceKey;
    @Value("${tour-api.base-url:https://apis.data.go.kr/B551011/KorService2}") private String baseUrl;
    @Value("${tour-api.mobile-os:AND}") private String mobileOs;
    @Value("${tour-api.app-name:TravelSettle}") private String appName;

    public List<PlaceSearchResponse> search(String query) {
        if(query==null || query.trim().isBlank()) return List.of();
        String keyword=query.trim();
        if(serviceKey.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"관광공사 API 키 설정이 필요합니다.");
        try {
            java.net.URI url=UriComponentsBuilder.fromUriString(baseUrl.replaceAll("/+$","")+"/searchKeyword2")
                    .queryParam("serviceKey",serviceKey).queryParam("MobileOS",mobileOs).queryParam("MobileApp",appName)
                    .queryParam("_type","json").queryParam("numOfRows",20).queryParam("pageNo",1)
                    .queryParam("arrange","O").queryParam("keyword",keyword).build().encode().toUri();
            JsonNode json=tourClient().get().uri(url).retrieve().body(JsonNode.class);
            JsonNode header=json==null?null:json.path("response").path("header");
            if(header==null || !"0000".equals(header.path("resultCode").asText()))
                throw new IllegalStateException("관광공사 API 오류: "+(header==null?"응답 없음":header.path("resultMsg").asText()));
            JsonNode items=json.path("response").path("body").path("items").path("item");
            if(items==null || !items.isArray()) return List.of();
            List<PlaceSearchResponse> result=new ArrayList<>();
            for(JsonNode item:items) {
                String contentId=item.path("contentid").asText();
                String title=item.path("title").asText();
                if(contentId.isBlank() || title.isBlank()) continue;
                String address=(item.path("addr1").asText()+" "+item.path("addr2").asText()).trim();
                BigDecimal lat=decimal(item.path("mapy").asText()), lng=decimal(item.path("mapx").asText());
                PlaceSearchResponse p=new PlaceSearchResponse(); p.setId(null); p.setExternalApiId("tour:"+contentId); p.setName(title); p.setAddress(address);
                p.setCategory(item.path("cat1").asText(null)); p.setLatitude(lat); p.setLongitude(lng); p.setThumbnailUrl(item.path("firstimage").asText(null)); result.add(p);
            }
            return result;
        } catch(Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"관광공사 장소 검색에 실패했습니다. 잠시 후 다시 시도해 주세요.",e);
        }
    }
    private RestClient tourClient() {
        var factory = new org.springframework.http.client.JdkClientHttpRequestFactory(
                java.net.http.HttpClient.newBuilder().connectTimeout(java.time.Duration.ofSeconds(5)).build());
        factory.setReadTimeout(java.time.Duration.ofSeconds(15));
        return RestClient.builder().requestFactory(factory).build();
    }
    private String category(String value) {
        return switch(value) { case "A05" -> "food"; case "A02" -> "heritage"; case "A01" -> "nature"; default -> "wellness"; };
    }
    private BigDecimal decimal(String value){ try{return value==null||value.isBlank()?null:new BigDecimal(value);}catch(NumberFormatException e){return null;} }

    public Long resolveTourPlace(String externalId) {
        if(externalId==null || !externalId.matches("tour:[0-9]+")) throw new IllegalArgumentException("관광공사 장소 식별자가 올바르지 않습니다.");
        var existing=db.queryForList("SELECT id FROM places WHERE external_api_id=?",Long.class,externalId);
        if(!existing.isEmpty()) return existing.get(0);
        if(serviceKey.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"관광공사 API 키 설정이 필요합니다.");
        String contentId=externalId.substring(5);
        try {
            java.net.URI url=UriComponentsBuilder.fromUriString(baseUrl.replaceAll("/+$","")+"/detailCommon2")
                    .queryParam("serviceKey",serviceKey).queryParam("MobileOS",mobileOs).queryParam("MobileApp",appName)
                    .queryParam("_type","json").queryParam("contentId",contentId).build().encode().toUri();
            JsonNode items=tourClient().get().uri(url).retrieve().body(JsonNode.class).path("response").path("body").path("items").path("item");
            if(!items.isArray() || items.isEmpty()) throw new IllegalArgumentException("관광공사에서 장소를 찾지 못했습니다.");
            JsonNode item=items.get(0); String title=item.path("title").asText();
            if(title.isBlank()) throw new IllegalArgumentException("관광공사 장소 정보가 올바르지 않습니다.");
            String address=(item.path("addr1").asText()+" "+item.path("addr2").asText()).trim();
            try { db.update("INSERT INTO places(external_api_id,name,address,category,latitude,longitude) VALUES(?,?,?,?,?,?)",externalId,title,address,category(item.path("cat1").asText()),decimal(item.path("mapy").asText()),decimal(item.path("mapx").asText())); }
            catch(org.springframework.dao.DuplicateKeyException ignored) {}
            return db.queryForObject("SELECT id FROM places WHERE external_api_id=?",Long.class,externalId);
        } catch(IllegalArgumentException|ResponseStatusException e){throw e;}
        catch(Exception e){throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"관광공사 장소 확인에 실패했습니다.");}
    }

    public Long resolveTourPlace(String externalId, String name, String address, String category,
            BigDecimal latitude, BigDecimal longitude) {
        if(externalId==null || !externalId.matches("tour:[0-9]+"))
            throw new IllegalArgumentException("관광공사 장소 식별자가 올바르지 않습니다.");
        if(name==null || name.isBlank())
            throw new IllegalArgumentException("관광공사 장소 이름이 올바르지 않습니다.");
        var existing=db.queryForList("SELECT id FROM places WHERE external_api_id=?",Long.class,externalId);
        if(!existing.isEmpty()) return existing.get(0);
        String normalizedCategory=switch(category==null?"":category) {
            case "A05" -> "food";
            case "A02" -> "heritage";
            case "A01" -> "nature";
            default -> "wellness";
        };
        try {
            db.update("INSERT INTO places(external_api_id,name,address,category,latitude,longitude) VALUES(?,?,?,?,?,?)",
                    externalId,name.trim(),address,normalizedCategory,latitude,longitude);
        } catch(org.springframework.dao.DuplicateKeyException ignored) { }
        return db.queryForObject("SELECT id FROM places WHERE external_api_id=?",Long.class,externalId);
    }

    public Long resolveRoutePlace(String name, String address, Double latitude, Double longitude) {
        if (name == null || name.isBlank() || address == null || address.isBlank())
            throw new IllegalArgumentException("장소명과 주소는 필수입니다.");
        if (latitude == null || longitude == null || !Double.isFinite(latitude) || !Double.isFinite(longitude)
                || Math.abs(latitude) > 90 || Math.abs(longitude) > 180)
            throw new IllegalArgumentException("주소의 지도 좌표가 올바르지 않습니다.");
        String source = address.trim() + "|" + latitude + "|" + longitude;
        String externalId = "route:" + java.util.UUID.nameUUIDFromBytes(
                source.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        var existing = db.queryForList("SELECT id FROM places WHERE external_api_id=?", Long.class, externalId);
        if (!existing.isEmpty()) return existing.get(0);
        try {
            db.update("INSERT INTO places(external_api_id,name,address,category,latitude,longitude) VALUES(?,?,?,?,?,?)",
                    externalId, name.trim(), address.trim(), "wellness", latitude, longitude);
        } catch (org.springframework.dao.DuplicateKeyException ignored) { }
        return db.queryForObject("SELECT id FROM places WHERE external_api_id=?", Long.class, externalId);
    }
}

