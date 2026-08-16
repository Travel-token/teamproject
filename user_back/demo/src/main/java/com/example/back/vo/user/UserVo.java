package com.example.back.vo.user;

import com.example.back.vo.enums.LoginProvider;
import com.example.back.vo.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** users : 회원 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserVo {

    private Long id;
    private String name;
    private String email;
    private LoginProvider loginProvider;
    private String providerUid;
    private String profileEmoji;
    private Boolean darkMode;
    private String bankName;
    private String accountNumber;
    private UserStatus status;
    private LocalDateTime withdrawnAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
