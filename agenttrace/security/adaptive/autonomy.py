from enum import IntEnum


class AutonomyLevel(IntEnum):
    MANUAL = 0
    SUGGEST = 1
    SIMULATE = 2
    VALIDATE = 3
    PROMOTE = 4


class AutonomyController:
    """
    Autonomy is deliberately bounded.

    The system may generate and evaluate proposals.
    Production source/policy changes require explicit promotion.
    """

    def __init__(self, level: AutonomyLevel = AutonomyLevel.SUGGEST):
        self.level = level

    def can_generate(self) -> bool:
        return self.level >= AutonomyLevel.SUGGEST

    def can_simulate(self) -> bool:
        return self.level >= AutonomyLevel.SIMULATE

    def can_validate(self) -> bool:
        return self.level >= AutonomyLevel.VALIDATE

    def can_promote(self) -> bool:
        return self.level >= AutonomyLevel.PROMOTE
