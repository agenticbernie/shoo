# Release tooling

Owner: platform engineer. Scope per docs/65 "CI pipeline" and "Release channels".

Required before the first signed release:

- SBOM and provenance generation for release candidates;
- image publication to GHCR by digest for Web/API/Worker, promoted as the same immutable
  artifact across preview, staging and production;
- signature verification and a signing-key rotation drill (FIT-014);
- Shoo Local signed host package channels: internal, canary, stable;
- compatibility manifest emission into `docs/compatibility/`.

Database migration is a separate, visible stage before the compatible app rollout; it is
never bundled into the application deploy step.
