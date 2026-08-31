import html, re, secrets
from typing import List
from .models import TrustLevel, ThreatCategory, EnforcementAction, SecurityViolation, TaintReport
from .normalizer import AdvancedNormalizer
from .semantic import SemanticJailbreakDetector

class PromptGuardEngine:
    DELIMITERS = [r"<\|im_start\|>", r"<\|im_end\|>", r"\[INST\]", r"\[/INST\]", r"```\s*system"]
    HIJACKS = [r"(?i)(?:ignore\s+all\s+previous\s+instructions|system\s*override:|you\s+are\s+now\s+in\s+developer\s+mode)"]
    EXFILS = [r"!\[.*?\]\(https?://[^\s\)]+[\?&](?:data|token|key)=.*?[\)\s]"]

    def __init__(self):
        self.sem = SemanticJailbreakDetector()

    def inspect_and_contain(self, raw_text: str, trust: TrustLevel = TrustLevel.UNTRUSTED_EXTERNAL) -> TaintReport:
        violations: List[SecurityViolation] = []
        cleaned, had_zw, had_homo = AdvancedNormalizer.clean(raw_text)
        
        if had_zw or had_homo:
            violations.append(SecurityViolation(ThreatCategory.HOMOGLYPH_OBFUSCATION, "NORM-01", 0.85, "Homoglyfer eller usynlige tegn detektert.", "[OBFUSCATED]"))

        layers = [("raw", cleaned)] + AdvancedNormalizer.recursive_decode(cleaned)
        for lname, ltext in layers:
            for d in self.DELIMITERS:
                if re.search(d, ltext, re.I):
                    violations.append(SecurityViolation(ThreatCategory.SPECIAL_TOKEN_INJECTION, "DELIM-01", 1.0, f"Token fluktforsøk ({lname})", d))
            for h in self.HIJACKS:
                if re.search(h, ltext, re.I):
                    violations.append(SecurityViolation(ThreatCategory.INDIRECT_ROLE_HIJACK, "HIJACK-01", 0.95, f"Instruksjonsoverstyring ({lname})", h))
            for e in self.EXFILS:
                if re.search(e, ltext, re.I):
                    violations.append(SecurityViolation(ThreatCategory.MARKDOWN_EXFILTRATION, "EXFIL-01", 0.90, "Markdown eksfiltrering", e))

        sim, seed = self.sem.check(cleaned)
        if sim >= 0.70:
            violations.append(SecurityViolation(ThreatCategory.SEMANTIC_JAILBREAK, "SEM-01", sim, f"Semantisk likhet ({sim:.2f}) med '{seed}'", cleaned[:30]))

        max_risk = max([v.risk_score for v in violations], default=0.0)
        action = EnforcementAction.BLOCK if max_risk >= 0.85 and trust == TrustLevel.UNTRUSTED_EXTERNAL else (EnforcementAction.SANITIZE_AND_WRAP if max_risk > 0.3 else EnforcementAction.ALLOW)
        
        boundary = f"DATA_CONTAINER_{secrets.token_hex(4).upper()}"
        wrapped = f"<{boundary} trust=\"{trust.name}\" action=\"{action.value}\">\n{html.escape(cleaned)}\n</{boundary}>"
        
        return TaintReport(
            is_safe=(action == EnforcementAction.ALLOW),
            action=action,
            sanitized_text=wrapped,
            boundary_token=boundary,
            max_risk=max_risk,
            trust_level=trust,
            violations=violations
        )
