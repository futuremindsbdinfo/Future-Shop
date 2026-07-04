import { redirect } from "next/navigation";

/**
 * Address Book is now a collapsible section inside Personal Info, not a
 * standalone page. Any old bookmark/link to this route is sent there instead
 * of showing a broken page.
 */
export default function AddressBookPage() {
  redirect("/dashboard/personal-info");
}
