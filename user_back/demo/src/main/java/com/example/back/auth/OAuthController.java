package com.example.back.auth;

import java.net.URI;
import java.time.Duration;
import java.util.*;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/auth/oauth")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class OAuthController {
    private final JdbcTemplate db;
    private final SessionService sessions;
    @Value("${auth.oauth.app-redirect-uri:travelsettle://oauth}") private String appRedirect;
    @Value("${auth.oauth.public-base-url:}") private String publicBase;
    @Value("${auth.oauth.google.client-id:}") private String googleId;
    @Value("${auth.oauth.google.client-secret:}") private String googleSecret;
    @Value("${auth.oauth.kakao.client-id:}") private String kakaoId;
    @Value("${auth.oauth.kakao.client-secret:}") private String kakaoSecret;
    @Value("${auth.oauth.naver.client-id:}") private String naverId;
    @Value("${auth.oauth.naver.client-secret:}") private String naverSecret;

    public record Start(@NotBlank String appRedirectUri) {}
    public record Exchange(@NotBlank String ticket) {}
    private record Provider(String id,String secret,String auth,String token,String user,String scope) {}

    private Provider provider(String name) {
        return switch(name) {
            case "google" -> new Provider(googleId,googleSecret,"https://accounts.google.com/o/oauth2/v2/auth","https://oauth2.googleapis.com/token","https://openidconnect.googleapis.com/v1/userinfo","openid email profile");
            // Kakao rejects scopes which are not enabled in the Kakao console. Basic login
            // already returns the stable account id, so do not require an optional scope.
            case "kakao" -> new Provider(kakaoId,kakaoSecret,"https://kauth.kakao.com/oauth/authorize","https://kauth.kakao.com/oauth/token","https://kapi.kakao.com/v2/user/me","");
            case "naver" -> new Provider(naverId,naverSecret,"https://nid.naver.com/oauth2.0/authorize","https://nid.naver.com/oauth2.0/token","https://openapi.naver.com/v1/nid/me","name email nickname");
            default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        };
    }

    @PostMapping("/{provider}/start")
    public Map<String,String> start(@PathVariable String provider,@Valid @RequestBody Start body) {
        Provider p=provider(provider);
        if(p.id().isBlank() || publicBase.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"소셜 로그인 환경 설정이 필요합니다.");
        if(!appRedirect.equals(body.appRedirectUri())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"허용되지 않은 앱 복귀 주소입니다.");
        String state=UUID.randomUUID().toString();
        db.update("DELETE FROM oauth_login_attempts WHERE expires_at<NOW() OR used_at IS NOT NULL");
        db.update("INSERT INTO oauth_login_attempts(state,provider,app_redirect_uri,expires_at) VALUES(?,?,?,NOW()+INTERVAL 5 MINUTE)",state,provider,appRedirect);
        String callback=publicBase.replaceAll("/+$","")+"/api/auth/oauth/"+provider+"/callback";
        var builder=UriComponentsBuilder.fromUriString(p.auth()).queryParam("response_type","code").queryParam("client_id",p.id())
                .queryParam("redirect_uri",callback).queryParam("state",state);
        if(!p.scope().isBlank()) builder.queryParam("scope",p.scope());
        String url=builder.build().encode().toUriString();
        return Map.of("authorizationUrl",url);
    }

    @GetMapping("/{provider}/callback")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Void> callback(@PathVariable String provider,@RequestParam(required=false) String code,
            @RequestParam String state,@RequestParam(required=false) String error,
            @RequestParam(name="error_description",required=false) String errorDescription) {
        try {
            if(error!=null || code==null)
                throw new IllegalArgumentException(errorDescription==null?"로그인이 취소됐어요.":errorDescription);
            var rows=db.queryForList("SELECT * FROM oauth_login_attempts WHERE state=? AND provider=? AND used_at IS NULL AND expires_at>NOW() FOR UPDATE",state,provider);
            if(rows.size()!=1) throw new IllegalArgumentException("로그인 요청이 만료됐어요.");
            Provider p=provider(provider);
            String callback=publicBase.replaceAll("/+$","")+"/api/auth/oauth/"+provider+"/callback";
            var form=new LinkedMultiValueMap<String,String>(); form.add("grant_type","authorization_code"); form.add("code",code);
            form.add("client_id",p.id()); form.add("redirect_uri",callback); if(!p.secret().isBlank()) form.add("client_secret",p.secret());
            JsonNode token=RestClient.create().post().uri(p.token()).contentType(MediaType.APPLICATION_FORM_URLENCODED).body(form).retrieve().body(JsonNode.class);
            String access=token==null?"":token.path("access_token").asText(); if(access.isBlank()) throw new IllegalArgumentException("공급자 토큰을 받지 못했어요.");
            JsonNode raw=RestClient.create().get().uri(p.user()).header("Authorization","Bearer "+access).retrieve().body(JsonNode.class);
            JsonNode u="naver".equals(provider)?raw.path("response"):raw;
            // Google OpenID userinfo calls its stable identifier `sub`; Kakao/Naver use `id`.
            String uid="google".equals(provider)?u.path("sub").asText():u.path("id").asText();
            String email="kakao".equals(provider)?u.path("kakao_account").path("email").asText():u.path("email").asText();
            String name="kakao".equals(provider)?u.path("kakao_account").path("profile").path("nickname").asText():u.path("name").asText(u.path("nickname").asText());
            if(uid.isBlank()) throw new IllegalArgumentException("소셜 계정 식별자를 받지 못했어요.");
            if(email.isBlank() && "kakao".equals(provider)) email=uid+"@kakao.local";
            if(email.isBlank()) throw new IllegalArgumentException("이메일 제공 동의가 필요해요.");
            Long userId=upsertUser(provider,uid,email,name);
            String ticket=UUID.randomUUID().toString();
            db.update("UPDATE oauth_login_attempts SET user_id=?,ticket_hash=SHA2(?,256),used_at=NOW() WHERE state=?",userId,ticket,state);
            return ResponseEntity.status(302).location(URI.create(appRedirect+"?ticket="+ticket)).build();
        } catch(Exception e) {
            log.warn("OAuth callback failed for provider {}: {}", provider, e.getMessage());
            String message=java.net.URLEncoder.encode(e instanceof IllegalArgumentException?e.getMessage():"소셜 로그인 처리에 실패했어요.",java.nio.charset.StandardCharsets.UTF_8);
            return ResponseEntity.status(302).location(URI.create(appRedirect+"?error="+message)).build();
        }
    }

    private Long upsertUser(String provider,String uid,String email,String name) {
        var found=db.queryForList("SELECT id,status FROM users WHERE login_provider=? AND provider_uid=?",provider,uid);
        if(!found.isEmpty()) {
            if(!"active".equals(found.get(0).get("status").toString())) throw new IllegalArgumentException("탈퇴하거나 비활성화된 계정입니다.");
            return ((Number)found.get(0).get("id")).longValue();
        }
        if(db.queryForObject("SELECT COUNT(*) FROM users WHERE email=?",Integer.class,email)>0) throw new IllegalArgumentException("같은 이메일 계정이 이미 있어요. 기존 로그인 방식을 이용해 주세요.");
        db.update("INSERT INTO users(name,email,login_provider,provider_uid,profile_emoji,is_dark_mode,status) VALUES(?,?,?,?,?,0,'active')",
                name==null||name.isBlank()?"여행자":name,email,provider,uid,"😀");
        return db.queryForObject("SELECT id FROM users WHERE login_provider=? AND provider_uid=?",Long.class,provider,uid);
    }

    @PostMapping("/exchange")
    @org.springframework.transaction.annotation.Transactional
    public LoginResponseDto exchange(@Valid @RequestBody Exchange body) {
        var rows=db.queryForList("SELECT user_id FROM oauth_login_attempts WHERE ticket_hash=SHA2(?,256) AND used_at IS NOT NULL AND exchanged_at IS NULL AND expires_at>NOW() FOR UPDATE",body.ticket());
        if(rows.size()!=1) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"로그인 확인 코드가 만료됐어요.");
        Long uid=((Number)rows.get(0).get("user_id")).longValue();
        db.update("UPDATE oauth_login_attempts SET exchanged_at=NOW() WHERE ticket_hash=SHA2(?,256)",body.ticket());
        return sessions.issue(uid);
    }
}
