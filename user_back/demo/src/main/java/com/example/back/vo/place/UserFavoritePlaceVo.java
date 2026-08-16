package com.example.back.vo.place;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** user_favorite_places : 사용자 즐겨찾기 장소 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFavoritePlaceVo {

    private Long id;
    private Long userId;
    private Long placeId;
    private LocalDateTime createdAt;
}
