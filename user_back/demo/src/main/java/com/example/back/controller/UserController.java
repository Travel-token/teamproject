package com.example.back.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back.service.UserService;

import lombok.RequiredArgsConstructor;

import org.apache.ibatis.annotations.Delete;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;




@RestController
@RequestMapping("/users/me")
@RequiredArgsConstructor
public class UserController {
    

    private final UserService userService ; 


    @GetMapping("/feeds") // 본인 피드 불러오기
    public String fetchMyFeeds(@RequestParam String param) {
        return new String();
    }

    @PostMapping("/feeds/{id}") // 피드 만들기
    public String createMyFeed(@RequestBody String entity) {

        return entity;
    }
    
    @PutMapping("/feeds/{id}") // 피드수정
    public String updateMyFeed(@PathVariable String id, @RequestBody String entity) {
        
        return entity;
    }

    @Delete("/feeds/{id}") // 피드 삭제
    public String deleteMyFeed(@PathVariable String id){

        
        return  id ;
    }


    @GetMapping("/history/stats") // 지출 관련
    public String fetchHistoryStats(@RequestParam String param) {
        return new String();
    }

    @GetMapping("/history") // 여행 관련 
    public String fetchHistoryTrips(@RequestParam String param) {
        return new String();
    }



    // 로그 아웃


    // 회원 탈퇴
    
    
}
