package cc.baena.twitter.service;

import cc.baena.twitter.domain.User;
import cc.baena.twitter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User upsertFromJwt(Jwt jwt) {
        String subject = jwt.getSubject();
        return userRepository.findByAuth0Subject(subject)
                .orElseGet(() -> {
                    User created = User.builder()
                            .auth0Subject(subject)
                            .username(resolveUsername(jwt))
                            .email(jwt.getClaimAsString("email"))
                            .pictureUrl(jwt.getClaimAsString("picture"))
                            .build();
                    log.info("Registering new user from Auth0: {}", created.getUsername());
                    return userRepository.save(created);
                });
    }

    private String resolveUsername(Jwt jwt) {
        String nickname = jwt.getClaimAsString("nickname");
        if (nickname != null && !nickname.isBlank()) return nickname;
        String name = jwt.getClaimAsString("name");
        if (name != null && !name.isBlank()) return name;
        String email = jwt.getClaimAsString("email");
        if (email != null && email.contains("@")) return email.substring(0, email.indexOf('@'));
        return "user-" + jwt.getSubject().hashCode();
    }
}
