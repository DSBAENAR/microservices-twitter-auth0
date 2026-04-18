package cc.baena.twitter.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Payload to update the authenticated user's profile")
public record UserUpdateRequest(
        @NotBlank
        @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
        @Pattern(regexp = "^[A-Za-z0-9_]+$",
                message = "Username may contain letters, numbers and underscore only")
        @Schema(description = "New username", example = "alvaro")
        String username
) {}
