import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBaby,
  faBookOpen,
  faBorderAll,
  faBriefcase,
  faCar,
  faCartShopping,
  faCow,
  faDumbbell,
  faGift,
  faHeartPulse,
  faHouse,
  faLaptop,
  faLeaf,
  faMobileScreen,
  faPills,
  faShirt,
  faStar,
  faSuitcase,
  faTag,
  faUtensils,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import type { Category } from "@/types";

// Map the DB icon string (e.g. "fa-cart-shopping") to the imported icon.
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
};

export function CategoryCard({ category }: { category: Category }) {
  // Fallback: fa-grid-2 is Pro-only, so use the free grid icon (faBorderAll).
  const icon = (category.icon && ICON_MAP[category.icon]) || faBorderAll;

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-all hover:border-[#f47920] hover:bg-orange-50 hover:shadow-md"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f47920]/10 transition-colors group-hover:bg-[#f47920]/20">
        <FontAwesomeIcon
          icon={icon}
          size="lg"
          style={{ color: "#f47920" }}
          className="transition-transform group-hover:scale-110"
        />
      </div>
      <span
        lang="bn"
        className="line-clamp-2 text-xs font-medium group-hover:text-[#f47920]"
      >
        {category.name}
      </span>
    </Link>
  );
}
