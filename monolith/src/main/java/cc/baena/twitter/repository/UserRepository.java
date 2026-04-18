package cc.baena.twitter.repository;

import cc.baena.twitter.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByAuth0Subject(String auth0Subject);
}
