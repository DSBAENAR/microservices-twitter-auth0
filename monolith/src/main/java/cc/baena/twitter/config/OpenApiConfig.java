package cc.baena.twitter.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Twitter-like API (Monolith)")
                        .description("""
                                Secure Twitter-like backend built with Spring Boot 3 and Auth0.
                                Users can publish posts up to 140 characters; all posts appear in a single
                                global stream. Authentication uses OAuth2 Bearer tokens (JWT) issued by Auth0.
                                """)
                        .version("v1")
                        .contact(new Contact().name("AREM Students").url("https://github.com/DSBAENAR"))
                        .license(new License().name("MIT").url("https://opensource.org/licenses/MIT"))
                )
                .components(new Components().addSecuritySchemes(SECURITY_SCHEME_NAME,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT access token issued by Auth0")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME));
    }
}
