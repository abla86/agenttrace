import re, unicodedata, urllib.parse, base64
from typing import Tuple, List

class AdvancedNormalizer:
    HOMOGLYPH_MAP = {
        'а': 'a', 'с': 'c', 'е': 'e', 'о': 'o', 'р': 'p', 'ѕ': 's', 'х': 'x', 'у': 'y',
        'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'Н': 'H', 'І': 'I', 'Ј': 'J', 'К': 'K',
        'М': 'M', 'О': 'O', 'Р': 'P', 'Ѕ': 'S', 'Т': 'T', 'Х': 'X', 'Ү': 'Y', 'һ': 'h'
    }
    EVIL_UNICODE = re.compile(r"[\u200B-\u200F\uFEFF\u00AD\u2060-\u206F\u202A-\u202E\u180E]")

    @classmethod
    def clean(cls, text: str) -> Tuple[str, bool, bool]:
        cleaned, count = cls.EVIL_UNICODE.subn("", text)
        chars = []
        had_homo = False
        for ch in cleaned:
            if ch in cls.HOMOGLYPH_MAP:
                chars.append(cls.HOMOGLYPH_MAP[ch])
                had_homo = True
            else:
                chars.append(ch)
        return "".join(chars), count > 0, had_homo

    @classmethod
    def recursive_decode(cls, text: str) -> List[Tuple[str, str]]:
        layers = []
        b64_matches = re.findall(r"[A-Za-z0-9+/=]{20,}", text)
        for m in b64_matches:
            try:
                raw = base64.b64decode(m)
                for enc in ["utf-8", "utf-16le", "ascii"]:
                    try:
                        dec = raw.decode(enc)
                        if any(k in dec.lower() for k in ["ignore", "system", "http", "curl"]):
                            layers.append((f"base64_{enc}", dec))
                            break
                    except Exception:
                        continue
            except Exception:
                continue
        return layers
