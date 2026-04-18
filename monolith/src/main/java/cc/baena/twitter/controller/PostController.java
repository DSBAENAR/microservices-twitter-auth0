package cc.baena.twitter.controller;

import cc.baena.twitter.domain.User;
import cc.baena.twitter.dto.PostRequest;
import cc.baena.twitter.dto.PostResponse;
import cc.baena.twitter.service.PostService;
import cc.baena.twitter.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Posts", description = "Create and list posts")
public class PostController {

    private final PostService postService;
    private final UserService userService;

    @GetMapping
    @Operation(
            summary = "List public posts (paged)",
            description = "Public endpoint. Returns the global stream as pages, newest first.",
            security = {}
    )
    public List<PostResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PostResponse> result = postService.stream(page, size).map(PostResponse::from);
        return result.getContent();
    }

    @PostMapping
    @Operation(
            summary = "Create a new post",
            description = "Protected endpoint. Requires a valid JWT access token issued by Auth0.",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Post created"),
            @ApiResponse(responseCode = "400", description = "Validation error"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
            @ApiResponse(responseCode = "403", description = "JWT valid but lacks permissions")
    })
    public ResponseEntity<PostResponse> create(
            @Valid @RequestBody PostRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        User author = userService.upsertFromJwt(jwt);
        PostResponse response = PostResponse.from(postService.create(author, request.content()));
        return ResponseEntity.created(URI.create("/api/posts/" + response.id())).body(response);
    }
}
