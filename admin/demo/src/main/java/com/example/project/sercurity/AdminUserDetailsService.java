package com.example.project.sercurity;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.project.domain.Admin;
import com.example.project.mapper.AdminMapper;

@Service
@RequiredArgsConstructor
public class AdminUserDetailsService implements UserDetailsService {

    private final AdminMapper adminMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Admin admin = adminMapper.findByUsername(username);
        if (admin == null) {
            throw new UsernameNotFoundException("관리자 계정을 찾을 수 없습니다: " + username);
        }
        return new AdminPrincipal(admin);
    }
}
