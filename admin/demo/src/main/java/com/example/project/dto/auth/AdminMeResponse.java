package com.example.project.dto.auth; 

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminMeResponse {
    private Long adminId;
    private String username;
    private String name;
}
