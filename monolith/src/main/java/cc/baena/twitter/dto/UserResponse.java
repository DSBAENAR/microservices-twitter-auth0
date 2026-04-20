package cc.baena.twitter.dto;

import cc.baena.twitter.domain.User;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Authenticated user profile")
public record UserResponse(
        Long id,
        String auth0Subject,
        String username,
        String email,
        String pictureUrl,
        boolean onboarded,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getAuth0Subject(),
                user.getUsername(),
                user.getEmail(),
                user.getPictureUrl(),
                user.isOnboarded(),
                user.getCreatedAt()
        );
    }
}
