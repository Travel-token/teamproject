package com.example.back.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AccountUpdateRequest {
    private String bank;
    private String accountNumber;
}
