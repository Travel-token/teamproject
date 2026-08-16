package com.example.project.dto.user;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserStatusRequest {

    @Pattern(regexp = "active|blocked", message = "status는 active 또는 blocked 여야 합니다.")
    private String status;
}
