package com.example.back.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.back.vo.user.UserSettingsVo;

@Mapper
public interface UserSettingsMapper {

    // 마이페이지 - 알림/기능 설정 조회 (설정을 한 번도 바꾼 적 없으면 null)
    UserSettingsVo selectByUserId(@Param("userId") Long userId);

    // 아래 각 update*는 행이 없으면 새로 만들고(insert), 있으면 해당 값만 갱신(update)한다.
    int updateNotifSettle(@Param("userId") Long userId, @Param("value") Boolean value);

    int updateNotifInvite(@Param("userId") Long userId, @Param("value") Boolean value);

    int updateNotifGps(@Param("userId") Long userId, @Param("value") Boolean value);

    int updateNotifMarketing(@Param("userId") Long userId, @Param("value") Boolean value);

    int updatePaySync(@Param("userId") Long userId, @Param("value") Boolean value);
}
