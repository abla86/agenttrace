# War-Room integration

The War-Room is the visual operator layer for AgentTrace. It renders authoritative security events; it does not implement an independent policy engine.

Source repository integrated from `abla86/My-own-war-room` (React/Vite). The original repository remains unchanged as a source/rollback copy.

Visual components include attack simulation, threat mapping, firewall animation, security layers, forensic chain, battle arena/log, radar views, export and live console. These components must be connected to the shared AgentTrace event model rather than maintaining duplicate security state.
