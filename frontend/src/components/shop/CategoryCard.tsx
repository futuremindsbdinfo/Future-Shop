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
      className="group flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-center transition-all hover:border-[#f47920] hover:shadow-md"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FontAwesomeIcon
          icon={icon}
          size="2x"
          style={{ color: "#f47920" }}
          className="transition-transform group-hover:scale-110"
        />
      </div>
      <span className="line-clamp-2 text-sm font-medium group-hover:text-[#f47920]">
        {category.name}
      </span>
    </Link>
  );
}
