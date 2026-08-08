package com.example.back.vo.common;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * CodeEnum을 구현한 enum 타입을 DB의 VARCHAR/ENUM 컬럼과 code 기준으로 매핑하는 공통 TypeHandler.
 *
 * 사용법: enum마다 이 클래스를 상속한 구체 TypeHandler를 만들고,
 * MyBatis 매퍼(XML 또는 @Result)에서 typeHandler로 지정한다.
 *
 * 예)
 * public class LoginProviderTypeHandler extends BaseEnumTypeHandler<LoginProvider> {
 *     public LoginProviderTypeHandler() { super(LoginProvider.class); }
 * }
 */
public abstract class BaseEnumTypeHandler<E extends Enum<E> & CodeEnum> extends BaseTypeHandler<E> {

    private final Class<E> type;

    protected BaseEnumTypeHandler(Class<E> type) {
        if (type == null) {
            throw new IllegalArgumentException("Type argument cannot be null");
        }
        this.type = type;
    }

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, E parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.getCode());
    }

    @Override
    public E getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return codeToEnum(rs.getString(columnName));
    }

    @Override
    public E getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return codeToEnum(rs.getString(columnIndex));
    }

    @Override
    public E getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return codeToEnum(cs.getString(columnIndex));
    }

    private E codeToEnum(String code) {
        if (code == null) {
            return null;
        }
        for (E e : type.getEnumConstants()) {
            if (e.getCode().equals(code)) {
                return e;
            }
        }
        throw new IllegalArgumentException("Cannot convert code [" + code + "] to " + type.getSimpleName());
    }
}
