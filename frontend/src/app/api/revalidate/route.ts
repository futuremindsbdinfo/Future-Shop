import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * On-demand cache revalidation, called by the Laravel backend when admin
 * content changes. Verifies a shared secret, then marks the given tags stale
 * (Next 16: revalidateTag requires a profile — "max" = stale-while-revalidate).
 *
 * Body: { secret: string, tags: string[] }
 */
export async function POST(request: Request) {
  let body: { secret?: string; tags?: string[] };
  try {
    body = (await request.json()) as { secret?: string; tags?: string[] };
  } catch {
    return NextResponse.json({ revalidated: false, message: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.secret || body.secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ revalidated: false, message: "Invalid secret" }, { status: 401 });
  }

  const tags = Array.isArray(body.tags) ? body.tags : [];
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ revalidated: true, tags });
}
