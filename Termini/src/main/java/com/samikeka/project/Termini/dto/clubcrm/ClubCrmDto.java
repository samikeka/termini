package com.samikeka.project.Termini.dto.clubcrm;

import com.samikeka.project.Termini.clubcrm.ClubMemberRole;
import com.samikeka.project.Termini.clubcrm.ClubMemberStatus;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class ClubCrmDto {
    Long id;
    String name;
    String logoUrl;
    String sportType;
    Long ownerUserId;
    String location;
    String subscriptionPlan;
    Instant createdAt;
    /** Caller's role in this club (null if not a member row — for list from ownership only we set OWNER) */
    ClubMemberRole myRole;
    ClubMemberStatus myStatus;
}
