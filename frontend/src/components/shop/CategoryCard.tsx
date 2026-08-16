"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBaby,
  faBolt,
  faBookOpen,
  faBorderAll,
  faBriefcase,
  faBroom,
  faBug,
  faCar,
  faCartShopping,
  faCookieBite,
  faCow,
  faDumbbell,
  faGift,
  faHeart,
  faHeartPulse,
  faHouse,
  faLaptop,
  faLeaf,
  faLightbulb,
  faMobileScreen,
  faPepperHot,
  faPersonDress,
  faPills,
  faScroll,
  faShieldHeart,
  faShieldVirus,
  faShirt,
  faSoap,
  faStar,
  faSuitcase,
  faTag,
  faUtensils,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import type { Category } from "@/types";

// Explicit icon string mapping from database (e.g. "fa-cart-shopping")
const ICON_MAP: Record<string, IconDefinition> = {
  "fa-cart-shopping": faCartShopping,
  "fa-cow": faCow,
  "fa-pills": faPills,
  "fa-heart-pulse": faHeartPulse,
  "fa-shirt": faShirt,
  "fa-laptop": faLaptop,
  "fa-mobile-screen": faMobileScreen,
  "fa-house": faHouse,
  "fa-baby": faBaby,
  "fa-book-open": faBookOpen,
  "fa-gift": faGift,
  "fa-tag": faTag,
  "fa-star": faStar,
  "fa-car": faCar,
  "fa-briefcase": faBriefcase,
  "fa-suitcase": faSuitcase,
  "fa-leaf": faLeaf,
  "fa-utensils": faUtensils,
  "fa-dumbbell": faDumbbell,
  "fa-wrench": faWrench,
  "fa-lightbulb": faLightbulb,
  "fa-bolt": faBolt,
  "fa-broom": faBroom,
  "fa-soap": faSoap,
  "fa-cookie": faCookieBite,
  "fa-pepper-hot": faPepperHot,
  "fa-bug": faBug,
  "fa-person-dress": faPersonDress,
  "fa-shield-virus": faShieldVirus,
  "fa-scroll": faScroll,
};

// Automatic intelligent icon resolver by Category Slug / Keywords
const SLUG_ICON_MAP: Record<string, IconDefinition> = {
  "baby-care": faBaby,
  "baby": faBaby,
  "electrical-lighting": faLightbulb,
  "electronics": faLaptop,
  "lighting": faLightbulb,
  "household-cleaning": faBroom,
  "cleaning": faBroom,
  "personal-care-hygiene": faSoap,
  "personal-care": faSoap,
  "snacks-confectionery": faCookieBite,
  "snacks": faCookieBite,
  "cooking-essentials-spices": faPepperHot,
  "spices": faPepperHot,
  "grocery-drinks": faCartShopping,
  "grocery": faCartShopping,
  "livestock-agriculture": faCow,
  "agriculture": faLeaf,
  "medicine-health": faPills,
  "medicine": faPills,
  "health": faHeartPulse,
  "pest-control": faShieldVirus,
  "womens-care": faPersonDress,
  "women": faPersonDress,
  "sexual-wellness": faShieldHeart,
  "home-appliances": faHouse,
  "appliances": faHouse,
  "tissue-paper-products": faScroll,
  "tissue": faScroll,
  "fashion": faShirt,
  "clothing": faShirt,
  "gadgets": faMobileScreen,
};

export function resolveCategoryIcon(category: Category): IconDefinition {
  // 1. Direct DB icon match
  if (category.icon && ICON_MAP[category.icon]) {
    return ICON_MAP[category.icon];
  }

  // 2. Slug match
  if (category.slug && SLUG_ICON_MAP[category.slug]) {
    return SLUG_ICON_MAP[category.slug];
  }

  // 3. Name keyword matching
  const lowerName = (category.name || "").toLowerCase();
  if (lowerName.includes("baby") || lowerName.includes("শিশু")) return faBaby;
  if (lowerName.includes("electric") || lowerName.includes("light") || lowerName.includes("বাতি")) return faLightbulb;
  if (lowerName.includes("clean") || lowerName.includes("পরিষ্কার")) return faBroom;
  if (lowerName.includes("soap") || lowerName.includes("hygiene") || lowerName.includes("সাবান")) return faSoap;
  if (lowerName.includes("snack") || lowerName.includes("বিস্কুট") || lowerName.includes("চিপস")) return faCookieBite;
  if (lowerName.includes("cook") || lowerName.includes("spice") || lowerName.includes("মশলা") || lowerName.includes("তেল")) return faPepperHot;
  if (lowerName.includes("pest") || lowerName.includes("পোকামাকড়")) return faShieldVirus;
  if (lowerName.includes("women") || lowerName.includes("নারী")) return faPersonDress;
  if (lowerName.includes("tissue") || lowerName.includes("টিস্যু")) return faScroll;
  if (lowerName.includes("appliance") || lowerName.includes("হোম")) return faHouse;
  if (lowerName.includes("medicine") || lowerName.includes("ঔষধ") || lowerName.includes("ওষুধ")) return faPills;
  if (lowerName.includes("cow") || lowerName.includes("গরু") || lowerName.includes("কৃষি")) return faCow;
  if (lowerName.includes("grocery") || lowerName.includes("মুদি")) return faCartShopping;

  // 4. Clean fallback
  return faCartShopping;
}

export function CategoryCard({ category }: { category: Category }) {
  const icon = resolveCategoryIcon(category);

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3 sm:p-4 text-center transition-all hover:border-[#f47920] hover:shadow-md hover:bg-orange-50/50"
    >
      <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f47920]/15 to-[#f47920]/5 transition-all duration-300 group-hover:scale-105 group-hover:bg-[#f47920] group-hover:shadow-sm">
        <FontAwesomeIcon
          icon={icon}
          className="text-lg sm:text-xl text-[#f47920] transition-colors duration-300 group-hover:text-white"
        />
      </div>
      <span
        lang="bn"
        className="line-clamp-2 text-[11px] sm:text-xs font-semibold text-gray-800 transition-colors group-hover:text-[#f47920]"
      >
        {category.name}
      </span>
    </Link>
  );
}
