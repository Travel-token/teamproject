package com.example.back.vo.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** terms_agreements : 약관 동의 이력 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TermsAgreementVo {

    private Long id;
    private Long userId;
    private Boolean serviceTerms;
    private Boolean privacyTerms;
    private Boolean marketingTerms;
    private LocalDateTime agreedAt;
}
