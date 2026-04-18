package cc.baena.twitter.controller;

import cc.baena.twitter.dto.UserResponse;
import cc.baena.twitter.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
@Tag(name = "User", description = "Current authenticated user")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(
            summary = "Retrieve the current authenticated user",
            description = "Protected endpoint. Upserts the user from the Auth0 JWT claims on first call.",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    public UserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return UserResponse.from(userService.upsertFromJwt(jwt));
    }
}
