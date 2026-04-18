package cc.baena.twitter.dto;

import cc.baena.twitter.domain.Post;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Post as shown in the public stream")
public record PostResponse(
        Long id,
        String content,
        String authorUsername,
        String authorPictureUrl,
        Instant createdAt
) {
    public static PostResponse from(Post post) {
        return new PostResponse(
                post.getId(),
                post.getContent(),
                post.getAuthor().getUsername(),
                post.getAuthor().getPictureUrl(),
                post.getCreatedAt()
        );
    }
}
