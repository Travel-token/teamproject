package com.example.back.auth;

public enum LoginProvider {
    MOCK("mock"),
    GOOGLE("google"),
    KAKAO("kakao"),
    NAVER("naver"),
    APPLE("apple") ; 

    private final String value ; 

    LoginProvider(String value){
        this.value  = value ;
    }

    public String getValue(){
        return value; 
    }
}
