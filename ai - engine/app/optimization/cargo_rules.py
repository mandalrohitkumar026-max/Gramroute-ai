"""
Cargo Compatibility and Agricultural Segregation Rules Engine.
Prevents cross-contamination between hazardous agrochemicals and food/dairy cargo.
"""
from typing import List, Tuple, Set

FOOD_CATEGORIES: Set[str] = {
    "PERISHABLE_PRODUCE",
    "FRESH_VEGETABLES",
    "FRESH_FRUITS",
    "DAIRY",
    "MILK_PRODUCTS",
    "DRY_GRAIN",
    "PULSES_AND_OILSEEDS",
    "FOOD_STUFF"
}

HAZARDOUS_CATEGORIES: Set[str] = {
    "CHEMICAL_PESTICIDES",
    "HAZARDOUS_AGROCHEMICAL",
    "INSECTICIDES",
    "CHEMICAL_FERTILIZERS",
    "TOXIC_SUBSTANCES"
}

ANIMAL_LIVESTOCK_CATEGORIES: Set[str] = {
    "LIVESTOCK",
    "POULTRY",
    "LIVE_ANIMALS"
}

def are_cargo_categories_compatible(cat1: str, cat2: str) -> Tuple[bool, str]:
    """
    Evaluates whether two cargo categories can be safely co-loaded in the same vehicle compartment.
    Returns: (is_compatible, reason_if_incompatible)
    """
    c1 = (cat1 or "").upper().strip()
    c2 = (cat2 or "").upper().strip()

    if c1 == c2:
        return True, "Identical cargo types"

    # Food vs Toxic Chemical Prohibition
    if (c1 in FOOD_CATEGORIES and c2 in HAZARDOUS_CATEGORIES) or (c2 in FOOD_CATEGORIES and c1 in HAZARDOUS_CATEGORIES):
        return False, f"Strict biosecurity violation: Incompatible food cargo '{c1}' cannot be co-loaded with toxic agrochemical '{c2}'"

    # Live Animals vs Fresh Food
    if (c1 in ANIMAL_LIVESTOCK_CATEGORIES and c2 in FOOD_CATEGORIES) or (c2 in ANIMAL_LIVESTOCK_CATEGORIES and c1 in FOOD_CATEGORIES):
        return False, f"Sanitary contamination risk: Live animals '{c1}' cannot share vehicle compartment with fresh produce '{c2}'"

    # Chemical Fertilizers with Fresh Milk / Dairy
    if ("DAIRY" in c1 or "MILK" in c1) and ("FERTILIZER" in c2 or "CHEMICAL" in c2):
        return False, "Dairy products require sterile transport and cannot share space with fertilizer compounds"
    if ("DAIRY" in c2 or "MILK" in c2) and ("FERTILIZER" in c1 or "CHEMICAL" in c1):
        return False, "Dairy products require sterile transport and cannot share space with fertilizer compounds"

    return True, "Compatible cargo classes"


def validate_shipment_group_compatibility(categories: List[str]) -> Tuple[bool, List[str]]:
    """
    Validates that all shipments assigned to a single vehicle route are mutually compatible.
    """
    warnings: List[str] = []
    n = len(categories)
    for i in range(n):
        for j in range(i + 1, n):
            compatible, reason = are_cargo_categories_compatible(categories[i], categories[j])
            if not compatible:
                return False, [reason]

    return True, []
