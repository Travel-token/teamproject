package com.example.back.vo.common;

/**
 * DB 컬럼 값(코드)과 매핑되는 enum이 구현하는 공통 인터페이스.
 * DB의 ENUM 값이 소문자(예: google, active)이고 Java enum 상수명은
 * 관례상 대문자(GOOGLE, ACTIVE)이기 때문에, 이름이 아닌 code로 매핑하기 위해 사용한다.
 */
public interface CodeEnum {
    String getCode();
}
