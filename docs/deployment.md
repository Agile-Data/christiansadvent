# Web CI and Dev deployment

CI checks PRs and main once each, runs shared secret scanning, typechecks, tests, and production/container builds. CD is manual from main and requires successful push CI for the exact commit. No production deployment is configured.

Before enabling:
1. Publish @agile-data/advent from agile-ui and replace the local file dependency with its registry version; regenerate the lockfile. CI deliberately rejects local package references.
2. Allow this repository to read the shared GitHub Actions repository and private npm packages. GITHUB_TOKEN requires package Actions read access; an existing organization AGILE_DATA_PACKAGES_READ_TOKEN is an optional fallback.
3. In the infrastructure repository, provision the Dev ECR repository, ECS web service/task definition, private ALB target/listener, certificate/DNS, logging, and runtime/task execution roles. Container port is 3000. Configure Secrets Manager references in the task definition for the Auth0 and Familiator API configuration. Secrets are never build arguments.
4. Configure an OIDC role in Agile Dev (878021512734), restricted to repo:Agile-Data/christiansadvent:environment:dev. Scope ECR/ECS permissions to this application and iam:PassRole to its task roles.
5. Create the GitHub `dev` environment, restrict deployments to main, and set AWS_DEPLOY_ROLE_ARN, ECR_REPOSITORY, ECS_CLUSTER, ECS_SERVICE, ECS_CONTAINER. Add required reviewers if desired.
6. After local review, commit/push; wait for CI, then manually run Deploy Web to AWS. CD preserves the existing service configuration and replaces only the named container image, deployed by digest. It waits for service stability.

These workflow files do not provision AWS infrastructure. They require an existing service and do not load local AWS SSO credentials. Existing services must enable appropriate ECS deployment rollback/health checks in infrastructure.
