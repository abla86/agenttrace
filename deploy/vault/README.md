# Vault integration

Vault integration is disabled by default because the current policy-server implementation does not consume an injected secret.

Enable vault.enabled only after the application has a defined secret contract and the injected file is actually consumed by the process.

The application role should be bound to the chart-created ServiceAccount in namespace agenttrace.

The policy above is an application policy only. Vault Kubernetes-auth configuration and role creation are cluster bootstrap operations and must not be granted to the application policy.
