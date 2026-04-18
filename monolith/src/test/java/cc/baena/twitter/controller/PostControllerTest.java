package cc.baena.twitter.controller;

import cc.baena.twitter.config.SecurityConfig;
import cc.baena.twitter.domain.Post;
import cc.baena.twitter.domain.User;
import cc.baena.twitter.service.PostService;
import cc.baena.twitter.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Unit test of the web layer only — does not load the full application context,
 * so no Auth0 issuer or audience values are needed. JwtDecoder is mocked out.
 */
@WebMvcTest(controllers = {PostController.class, StreamController.class, UserController.class})
@Import(SecurityConfig.class)
@TestPropertySource(properties = {
        "spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost",
        "auth0.audience=test",
        "app.cors.allowed-origins=http://localhost"
})
class PostControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean PostService postService;
    @MockitoBean UserService userService;
    @MockitoBean JwtDecoder jwtDecoder;

    @Test
    void publicStreamIsAccessibleWithoutAuth() throws Exception {
        Page<Post> empty = new PageImpl<>(List.of());
        when(postService.stream(anyInt(), anyInt())).thenReturn(empty);

        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk());
    }

    @Test
    void createPostRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"Hello\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createPostAcceptsValidJwt() throws Exception {
        User author = User.builder()
                .id(1L)
                .auth0Subject("auth0|abc")
                .username("alvaro")
                .createdAt(Instant.now())
                .build();
        Post saved = Post.builder()
                .id(10L)
                .content("Hello Auth0")
                .author(author)
                .createdAt(Instant.now())
                .build();
        when(userService.upsertFromJwt(any())).thenReturn(author);
        when(postService.create(any(), any())).thenReturn(saved);

        mockMvc.perform(post("/api/posts")
                        .with(jwt().jwt(j -> j.subject("auth0|abc")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"Hello Auth0\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void createPostRejectsOver140Chars() throws Exception {
        String longContent = "x".repeat(141);
        mockMvc.perform(post("/api/posts")
                        .with(jwt().jwt(j -> j.subject("auth0|abc")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"" + longContent + "\"}"))
                .andExpect(status().isBadRequest());
    }
}
