package com.example.back.common;
import java.util.Map;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
@RestControllerAdvice public class ApiErrors {
    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class) public ResponseEntity<?> status(org.springframework.web.server.ResponseStatusException e){
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("message",e.getReason()==null?"요청을 처리할 수 없습니다.":e.getReason()));
    }
    @ExceptionHandler(IllegalArgumentException.class) public ResponseEntity<?> invalid(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class) public ResponseEntity<?> validation(MethodArgumentNotValidException e) {
        return ResponseEntity.badRequest().body(Map.of("message","입력값을 확인해 주세요."));
    }
}
