package com.samikeka.project.Termini.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7).trim();
            if (!token.isEmpty()) {
                try {
                    Claims claims = jwtService.parse(token);
                    long userId = Long.parseLong(claims.getSubject());
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    Object rawRoles = claims.get("roles");
                    if (rawRoles instanceof List<?> list && !list.isEmpty()) {
                        for (Object o : list) {
                            if (o != null) {
                                authorities.add(new SimpleGrantedAuthority(o.toString()));
                            }
                        }
                    }
                    if (authorities.isEmpty()) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                    }
                    var auth = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            authorities);
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } catch (Exception ignored) {
                    SecurityContextHolder.clearContext();
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
