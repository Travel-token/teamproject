package com.example.back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private String name;
    private String handle;
    private String bank;
    private String accountNumber;
    private boolean notifSettle;
    private boolean notifInvite;
    private boolean notifGps;
    private boolean notifMarketing;
    private boolean paySync;
    private boolean darkMode;
}
