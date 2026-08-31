# Unified module contract

War-Room
    |
    v
Security API
    |
    +--> PromptGuard
    +--> Taint / IFC
    +--> Tool Integrity
    +--> Policy Engine
    |
    +--> AgentTrace
    |       +--> runtime
    |       +--> evaluation
    |       +--> diagnostics
    |
    +--> AttackLab
            +--> scenarios
            +--> mutation
            +--> sandbox

No frontend module may directly bypass the security engine.

Visual state must be derived from authoritative security events.
