package com.disasterrelief.config;

import com.disasterrelief.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/dashboard/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER", "CAMP_REPRESENTATIVE")
                .requestMatchers(HttpMethod.GET, "/api/campaigns/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER", "CAMP_REPRESENTATIVE")
                .requestMatchers("/api/campaigns/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/hubs/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER")
                .requestMatchers("/api/hubs/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/camps/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER", "CAMP_REPRESENTATIVE")
                .requestMatchers("/api/camps/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER")
                .requestMatchers("/api/products/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER")
                .requestMatchers("/api/inventory/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER")
                .requestMatchers("/api/suppliers/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER")
                .requestMatchers("/api/purchase-orders/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER")
                .requestMatchers("/api/vendor-bills/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER")
                .requestMatchers("/api/dispatches/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER")
                .requestMatchers("/api/resource-requests/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER", "CAMP_REPRESENTATIVE")
                .requestMatchers("/api/budgets/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER")
                .requestMatchers("/api/fund-accounts/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER")
                .requestMatchers("/api/journal/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER")
                .requestMatchers("/api/ledger/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER")
                .requestMatchers("/api/reports/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER")
                .requestMatchers("/api/notifications/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER", "CAMP_REPRESENTATIVE")
                .requestMatchers("/api/audit-logs/**").hasRole("ADMIN")
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
