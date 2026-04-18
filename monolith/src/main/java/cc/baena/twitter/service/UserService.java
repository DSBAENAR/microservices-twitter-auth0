package cc.baena.twitter.service;

import cc.baena.twitter.domain.User;
import cc.baena.twitter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * No outer @Transactional: each repository call opens its own tx. This lets
 * a failed save roll back cleanly and be followed by a fresh query that
 * finds the row the concurrent request just inserted.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private static final String CLAIMS_NAMESPACE = "https://chirp.baena.cc/";

    private final UserRepository userRepository;

    public User updateUsername(Jwt jwt, String newUsername) {
        User user = upsertFromJwt(jwt);
        user.setUsername(newUsername);
        user.setOnboarded(true);
        return userRepository.save(user);
    }

    public User upsertFromJwt(Jwt jwt) {
        String subject = jwt.getSubject();
        String email = claim(jwt, "email");
        String picture = claim(jwt, "picture");

        Optional<User> existing = userRepository.findByAuth0Subject(subject);
        if (existing.isPresent()) {
            User user = existing.get();
            boolean changed = false;
            if (email != null && !email.equals(user.getEmail())) {
                user.setEmail(email);
                changed = true;
            }
            if (picture != null && !picture.equals(user.getPictureUrl())) {
                user.setPictureUrl(picture);
                changed = true;
            }
            return changed ? userRepository.save(user) : user;
        }

        User candidate = User.builder()
                .auth0Subject(subject)
                .username(resolveUsername(jwt))
                .email(email)
                .pictureUrl(picture)
                .build();
        try {
            log.info("Registering new user from Auth0: {}", candidate.getUsername());
            return userRepository.save(candidate);
        } catch (DataIntegrityViolationException e) {
            return userRepository.findByAuth0Subject(subject)
                    .orElseThrow(() -> e);
        }
    }

    private String resolveUsername(Jwt jwt) {
        String nickname = claim(jwt, "nickname");
        if (nickname != null && !nickname.isBlank()) return nickname;
        String name = claim(jwt, "name");
        if (name != null && !name.isBlank()) return name;
        String email = claim(jwt, "email");
        if (email != null && email.contains("@")) return email.substring(0, email.indexOf('@'));
        return "user-" + Math.abs(jwt.getSubject().hashCode());
    }

    /** Reads a claim by its plain name, or falls back to the namespaced version
     *  that an Auth0 Post-Login Action may have added to the access token. */
    private static String claim(Jwt jwt, String name) {
        String plain = jwt.getClaimAsString(name);
        if (plain != null && !plain.isBlank()) return plain;
        return jwt.getClaimAsString(CLAIMS_NAMESPACE + name);
    }
}
