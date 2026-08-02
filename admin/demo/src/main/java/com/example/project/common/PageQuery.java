package com.example.project.common;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PageQuery {

    private int page = 1;   // 1-base
    private int size = 10;

    /** MyBatis LIMIT 절에서 사용할 OFFSET */
    public int getOffset() {
        int p = Math.max(page, 1);
        return (p - 1) * getLimit();
    }

    /** MyBatis LIMIT 절에서 사용할 개수 */
    public int getLimit() {
        return size <= 0 ? 10 : size;
    }

}
    
