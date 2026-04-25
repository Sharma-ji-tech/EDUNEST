package com.edunest.config;

import com.edunest.entity.Role;
import com.edunest.entity.RoleName;
import com.edunest.entity.User;
import com.edunest.repository.RoleRepository;
import com.edunest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed all roles
        Arrays.stream(RoleName.values()).forEach(roleName -> {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(Role.builder().name(roleName).build());
            }
        });

        // Seed the one and only Admin account
        if (userRepository.findByEmail("admin@test.com").isEmpty()) {
            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));

            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);

            User admin = User.builder()
                    .name("Admin")
                    .email("admin@test.com")
                    .password(passwordEncoder.encode("test"))
                    .roles(roles)
                    .build();

            userRepository.save(admin);
            System.out.println("✅ Admin account seeded: admin@test.com / test");
        }
    }
}
