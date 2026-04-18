package cc.baena.twitter.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Payload to create a new post")
public record PostRequest(
        @NotBlank
        @Size(max = 140, message = "Post content must be at most 140 characters")
        @Schema(description = "Post content, up to 140 characters", example = "Hello world from Auth0-secured backend!")
        String content
) {}
