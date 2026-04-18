package cc.baena.twitter.controller;

import cc.baena.twitter.dto.PostResponse;
import cc.baena.twitter.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stream")
@RequiredArgsConstructor
@Tag(name = "Stream", description = "Single global public stream")
public class StreamController {

    private final PostService postService;

    @GetMapping
    @Operation(
            summary = "Get the global public stream",
            description = "Public endpoint. Alias of GET /api/posts returning the newest posts first.",
            security = {}
    )
    public List<PostResponse> stream(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return postService.stream(page, size).map(PostResponse::from).getContent();
    }
}
