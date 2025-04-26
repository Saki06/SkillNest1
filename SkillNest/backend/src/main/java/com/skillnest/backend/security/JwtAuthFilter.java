package com.skillnest.backend.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        System.out.println("🔍 Incoming Auth Header: " + authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("🔑 Extracted Token: " + token);

            String userId = jwtUtil.validateToken(token);
            System.out.println("✅ Parsed userId from token: " + userId);

            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(userId, null, null);
                SecurityContextHolder.getContext().setAuthentication(auth);
                System.out.println("✅ SecurityContext authentication set for userId: " + userId);
            } else if (userId == null) {
                System.out.println("⛔ Invalid or expired token");
            } else {
                System.out.println("ℹ️ Authentication already exists in context");
            }
        } else {
            System.out.println("⛔ No Authorization header or doesn't start with Bearer");
        }

        filterChain.doFilter(request, response);
    }
}
