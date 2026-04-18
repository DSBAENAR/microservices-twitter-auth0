package cc.baena.twitter.service;

import cc.baena.twitter.domain.Post;
import cc.baena.twitter.domain.User;
import cc.baena.twitter.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    @Transactional
    public Post create(User author, String content) {
        Post post = Post.builder()
                .author(author)
                .content(content)
                .build();
        return postRepository.save(post);
    }

    @Transactional(readOnly = true)
    public Page<Post> stream(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return postRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
