"""Configuration for multi-country press monitoring system."""

from typing import Dict, List, Set
from enum import Enum


class QueryType(Enum):
    """Types of queries supported by the system."""
    ABOUT = "about"  # News about selected countries
    IN = "in"  # News from selected countries
    CROSS_REFERENCE = "cross_reference"  # News about X in Y


# Country codes following ISO 3166-1 alpha-2
COUNTRIES = {
    # Europe
    "AL": "Albania",
    "AD": "Andorra", 
    "AM": "Armenia",
    "AT": "Austria",
    "AZ": "Azerbaijan",
    "BY": "Belarus",
    "BE": "Belgium",
    "BA": "Bosnia and Herzegovina",
    "BG": "Bulgaria",
    "HR": "Croatia",
    "CY": "Cyprus",
    "CZ": "Czech Republic",
    "DK": "Denmark",
    "EE": "Estonia",
    "FI": "Finland",
    "FR": "France",
    "GE": "Georgia",
    "DE": "Germany",
    "GR": "Greece",
    "HU": "Hungary",
    "IS": "Iceland",
    "IE": "Ireland",
    "IT": "Italy",
    "KZ": "Kazakhstan",
    "XK": "Kosovo",
    "LV": "Latvia",
    "LI": "Liechtenstein",
    "LT": "Lithuania",
    "LU": "Luxembourg",
    "MK": "North Macedonia",
    "MT": "Malta",
    "MD": "Moldova",
    "MC": "Monaco",
    "ME": "Montenegro",
    "NL": "Netherlands",
    "NO": "Norway",
    "PL": "Poland",
    "PT": "Portugal",
    "RO": "Romania",
    "RU": "Russia",
    "SM": "San Marino",
    "RS": "Serbia",
    "SK": "Slovakia",
    "SI": "Slovenia",
    "ES": "Spain",
    "SE": "Sweden",
    "CH": "Switzerland",
    "TR": "Turkey",
    "UA": "Ukraine",
    "GB": "United Kingdom",
    "VA": "Vatican City",
    
    # Asia
    "AF": "Afghanistan",
    "BH": "Bahrain",
    "BD": "Bangladesh",
    "BT": "Bhutan",
    "BN": "Brunei",
    "KH": "Cambodia",
    "CN": "China",
    "IN": "India",
    "ID": "Indonesia",
    "IR": "Iran",
    "IQ": "Iraq",
    "IL": "Israel",
    "JP": "Japan",
    "JO": "Jordan",
    "KW": "Kuwait",
    "KG": "Kyrgyzstan",
    "LA": "Laos",
    "LB": "Lebanon",
    "MY": "Malaysia",
    "MV": "Maldives",
    "MN": "Mongolia",
    "MM": "Myanmar",
    "NP": "Nepal",
    "KP": "North Korea",
    "OM": "Oman",
    "PK": "Pakistan",
    "PS": "Palestine",
    "PH": "Philippines",
    "QA": "Qatar",
    "SA": "Saudi Arabia",
    "SG": "Singapore",
    "KR": "South Korea",
    "LK": "Sri Lanka",
    "SY": "Syria",
    "TW": "Taiwan",
    "TJ": "Tajikistan",
    "TH": "Thailand",
    "TL": "Timor-Leste",
    "TM": "Turkmenistan",
    "AE": "United Arab Emirates",
    "UZ": "Uzbekistan",
    "VN": "Vietnam",
    "YE": "Yemen",
    
    # Americas
    "US": "United States",
    "CA": "Canada",
    "MX": "Mexico",
    "BR": "Brazil",
    "AR": "Argentina",
    "CL": "Chile",
    "CO": "Colombia",
    "PE": "Peru",
    "VE": "Venezuela",
    "EC": "Ecuador",
    "BO": "Bolivia",
    "PY": "Paraguay",
    "UY": "Uruguay",
    "GY": "Guyana",
    "SR": "Suriname",
    "GF": "French Guiana",
    
    # Africa (major countries)
    "DZ": "Algeria",
    "EG": "Egypt",
    "ET": "Ethiopia",
    "GH": "Ghana",
    "KE": "Kenya",
    "LY": "Libya",
    "MA": "Morocco",
    "NG": "Nigeria",
    "ZA": "South Africa",
    "SD": "Sudan",
    "TN": "Tunisia",
    "UG": "Uganda",
    "ZW": "Zimbabwe",
    
    # Oceania
    "AU": "Australia",
    "NZ": "New Zealand",
    "FJ": "Fiji",
    "PG": "Papua New Guinea",
}


# Regional groupings
REGIONS = {
    "CAUCASUS": ["AZ", "GE", "AM"],
    "CIS": ["RU", "BY", "KZ", "KG", "TJ", "TM", "UZ", "MD", "AM", "AZ"],
    "EU": ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", 
           "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", 
           "RO", "SK", "SI", "ES", "SE"],
    "MIDDLE_EAST": ["SA", "AE", "QA", "KW", "BH", "OM", "YE", "JO", "LB", 
                    "SY", "IQ", "IR", "IL", "PS"],
    "CENTRAL_ASIA": ["KZ", "KG", "TJ", "TM", "UZ"],
    "SOUTH_ASIA": ["IN", "PK", "BD", "LK", "NP", "BT", "MV"],
    "SOUTHEAST_ASIA": ["TH", "VN", "MY", "SG", "ID", "PH", "MM", "KH", "LA", "BN"],
    "EAST_ASIA": ["CN", "JP", "KR", "TW", "MN"],
    "NORTH_AMERICA": ["US", "CA", "MX"],
    "SOUTH_AMERICA": ["BR", "AR", "CL", "CO", "PE", "VE", "EC", "BO", "PY", "UY"],
    "MAJOR_POWERS": ["US", "CN", "RU", "GB", "FR", "DE", "JP", "IN"],
}


# Preset configurations
PRESETS = {
    "azerbaijan_focus": {
        "name": "Azerbaijan Focus",
        "description": "News about Azerbaijan in all countries",
        "query_type": QueryType.ABOUT,
        "target_countries": ["AZ"],
        "source_countries": [],  # All countries
        "is_default": True
    },
    "regional_caucasus": {
        "name": "Caucasus Region",
        "description": "News about and from Caucasus countries",
        "query_type": QueryType.ABOUT,
        "target_countries": ["AZ", "GE", "AM"],
        "source_countries": []
    },
    "cis_coverage": {
        "name": "CIS Countries",
        "description": "Post-Soviet states coverage",
        "query_type": QueryType.ABOUT,
        "target_countries": REGIONS["CIS"],
        "source_countries": []
    },
    "global_major": {
        "name": "Major Powers",
        "description": "Coverage from major world powers",
        "query_type": QueryType.IN,
        "target_countries": [],
        "source_countries": REGIONS["MAJOR_POWERS"]
    },
    "custom": {
        "name": "Custom Selection",
        "description": "User-defined country selection",
        "query_type": QueryType.ABOUT,
        "target_countries": [],
        "source_countries": []
    }
}


# Country name translations for search queries
COUNTRY_TRANSLATIONS = {
    "AZ": {
        "en": ["Azerbaijan", "Azerbaijani", "Azeri", "Baku"],
        "ru": ["Азербайджан", "азербайджанский", "азербайджанец", "Баку"],
        "tr": ["Azerbaycan", "Azeri", "Azerbaycanlı", "Bakü"],
        "fa": ["آذربایجان", "آذری", "باکو"],
        "ar": ["أذربيجان", "أذربيجاني", "باكو"],
        "fr": ["Azerbaïdjan", "azerbaïdjanais", "Bakou"],
        "de": ["Aserbaidschan", "aserbaidschanisch", "Baku"],
        "es": ["Azerbaiyán", "azerbaiyano", "Bakú"],
        "pt": ["Azerbaijão", "azerbaijano", "Baku"],
        "it": ["Azerbaigian", "azerbaigiano", "Baku"],
        "zh": ["阿塞拜疆", "阿塞拜疆人", "巴库"],
        "ja": ["アゼルバイジャン", "アゼルバイジャン人", "バクー"],
        "ko": ["아제르바이잔", "아제르바이잔인", "바쿠"],
        "hi": ["अज़रबैजान", "अज़रबैजानी", "बाकू"],
        "he": ["אזרבייג'ן", "אזרבייג'ני", "באקו"],
        "ka": ["აზერბაიჯანი", "აზერბაიჯანული", "ბაქო"],
        "hy": ["Ադրբեջան", "ադրբեջանական", "Բաքու"],
    },
    # Add more country translations as needed
    "GE": {
        "en": ["Georgia", "Georgian", "Tbilisi"],
        "ru": ["Грузия", "грузинский", "Тбилиси"],
        "ka": ["საქართველო", "ქართული", "თბილისი"],
    },
    "AM": {
        "en": ["Armenia", "Armenian", "Yerevan"],
        "ru": ["Армения", "армянский", "Ереван"],
        "hy": ["Հայաստան", "հայկական", "Երևան"],
    },
    "TR": {
        "en": ["Turkey", "Turkish", "Ankara", "Istanbul"],
        "ru": ["Турция", "турецкий", "Анкара", "Стамбул"],
        "tr": ["Türkiye", "Türk", "Ankara", "İstanbul"],
    },
    "RU": {
        "en": ["Russia", "Russian", "Moscow"],
        "ru": ["Россия", "российский", "Москва"],
    },
    "US": {
        "en": ["United States", "USA", "American", "Washington"],
        "ru": ["США", "Соединенные Штаты", "американский", "Вашингтон"],
    },
    # Will be expanded with more countries
}


def get_country_name(code: str) -> str:
    """Get country name by ISO code."""
    return COUNTRIES.get(code, code)


def get_country_translations(code: str, language: str = "en") -> List[str]:
    """Get country name translations for a specific language."""
    if code in COUNTRY_TRANSLATIONS:
        return COUNTRY_TRANSLATIONS[code].get(language, [get_country_name(code)])
    return [get_country_name(code)]


def get_preset(preset_name: str) -> Dict:
    """Get preset configuration by name."""
    return PRESETS.get(preset_name, PRESETS["custom"])


def get_default_preset() -> Dict:
    """Get the default preset configuration."""
    for preset in PRESETS.values():
        if preset.get("is_default"):
            return preset
    return PRESETS["azerbaijan_focus"]


def get_countries_by_region(region: str) -> List[str]:
    """Get list of country codes for a region."""
    return REGIONS.get(region, [])