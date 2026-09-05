package com.example.back.controller;
import java.util.*;
import java.math.BigDecimal;
import java.net.URI;
import java.time.Duration;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.jdbc.core.JdbcTemplate;
import lombok.RequiredArgsConstructor;
@RestController @RequiredArgsConstructor public class IntegrationController {
    private final JdbcTemplate db;
    @Value("${integrations.ocr.url:}") private String ocrUrl;
    @Value("${integrations.ocr.api-key:}") private String ocrKey;
    @Value("${integrations.payment.link-url:}") private String paymentUrl;
    public record ReceiptResult(String name,BigDecimal amount,String spentAt,String categoryCode,Double confidence){
    }
    private ResponseStatusException unavailable(String message){
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,message);
    }
    @GetMapping("/api/integrations") public Map<String,Boolean> capabilities(){
        return Map.of("ocr",!ocrUrl.isBlank(),"payment",!paymentUrl.isBlank(),"socialLogin",false,"paySync",false);
    }
    @PostMapping(value="/api/trips/{tripId}/receipts/parse",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) public ReceiptResult parse(@PathVariable Long tripId,@RequestPart("file") MultipartFile file){
        if(ocrUrl.isBlank())throw unavailable("OCR 서비스 주소 설정 후 사용할 수 있습니다.");
        if(file.isEmpty() || file.getSize()>10*1024*1024)throw new IllegalArgumentException("10MB 이하 영수증 사진을 선택해 주세요.");
        try(var input=file.getInputStream()){
            if(javax.imageio.ImageIO.read(input)==null)throw new IllegalArgumentException("지원하는 이미지가 아닙니다.");
        }
        catch(java.io.IOException e){
            throw new IllegalArgumentException("영수증을 읽지 못했습니다.");
        }
        URI uri=URI.create(ocrUrl);
        if(!List.of("http","https").contains(uri.getScheme()))throw unavailable("OCR 서비스 주소가 올바르지 않습니다.");
        var factory=new JdkClientHttpRequestFactory(java.net.http.HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build());
        factory.setReadTimeout(Duration.ofSeconds(30));
        var form=new LinkedMultiValueMap<String,Object>();
        form.add("file",file.getResource());
        ReceiptResult result;
        try {
            var request=RestClient.builder().requestFactory(factory).build().post().uri(uri).contentType(MediaType.MULTIPART_FORM_DATA);
            if(!ocrKey.isBlank())request.header("Authorization","Bearer "+ocrKey);
            result=request.body(form).retrieve().body(ReceiptResult.class);
        }
        catch(org.springframework.web.client.RestClientException e){
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"OCR 서비스 응답을 받지 못했습니다. 다시 시도해 주세요.");
        }
        if(result==null || result.amount()==null || result.amount().signum()<=0 || result.name()==null || result.name().isBlank())throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"OCR 응답에 상호명 또는 금액이 없습니다.");
        if(result.spentAt()!=null)try{
            LocalDateTime.parse(result.spentAt());
        }
        catch(java.time.DateTimeException e){
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"OCR 날짜 형식이 올바르지 않습니다.");
        }
        return result;
    }
    @GetMapping("/api/trips/{tripId}/settlements/routes/{routeId}/payment-link") public Map<String,String> payment(@PathVariable Long tripId,@PathVariable Long routeId){
        if(paymentUrl.isBlank())throw unavailable("카카오페이 연동 설정 후 사용할 수 있습니다.");
        if(!paymentUrl.startsWith("https://"))throw unavailable("결제 연결 주소는 HTTPS여야 합니다.");
        var rows=db.queryForList("SELECT r.amount FROM settlement_routes r JOIN settlements s ON s.id=r.settlement_id WHERE r.id=? AND s.trip_id=? AND r.status='requested'",routeId,tripId);
        if(rows.isEmpty())throw new IllegalArgumentException("송금 대기 경로가 없습니다.");
        // Configured integration URL is responsible for the provider's actual payment flow.
        String url=org.springframework.web.util.UriComponentsBuilder.fromUriString(paymentUrl).queryParam("routeId",routeId).queryParam("tripId",tripId).build().encode().toUriString();
        return Map.of("url",url);
    }
}
