import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

// We import the core CSS manually above, so disable Font Awesome's runtime
// CSS injection — this prevents the large-icon flash (FOUC) in the App Router.
config.autoAddCss = false;
