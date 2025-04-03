package fr.civipol.civilio.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import fr.civipol.civilio.domain.Principal;
import fr.civipol.civilio.domain.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class User implements Principal {
    @JsonIgnore
    private String passwordHash;

    private String names;

    private String username;

    @Builder.Default
    private UserRole role = UserRole.USER;
}
