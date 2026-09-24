import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, resolveDataClient } from "@/lib/admin-server";
import {
  mapSeasonRow,
  newId,
  parseSeason,
  seasonToRow,
  SeasonRow,
  type Season,
} from "@/lib/season";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TABLE = "season_collections";

/** Every season, newest first (published plus the archive). */
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const client = await resolveDataClient(request);
    if (!client) {
      return NextResponse.json({
        configured: false,
        error: "Sign in with Google to manage the seasonal collection.",
      });
    }

    const { data, error } = await client.supabase
      .from(TABLE)
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);

    const seasons = (data ?? [])
      .map((row) => mapSeasonRow(row as unknown as SeasonRow))
      .filter((season): season is Season => season !== null);

    return NextResponse.json({ configured: true, seasons });
  } catch (error) {
    return NextResponse.json({
      configured: false,
      error: error instanceof Error ? error.message : "Supabase not configured",
    });
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: { action?: string; season?: unknown; id?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const client = await resolveDataClient(request);
    if (!client) {
      return NextResponse.json({
        configured: false,
        error: "Sign in with Google to manage the seasonal collection.",
      });
    }
    const { supabase } = client;

    switch (body.action) {
      case "save": {
        const season = parseSeason(body.season);
        if (!season) return NextResponse.json({ error: "Invalid season" }, { status: 400 });

        // Never trust a client-supplied primary key.
        const id = UUID_RE.test(season.id) ? season.id : newId();
        const row = { ...seasonToRow({ ...season, id }) };

        const { error } = await supabase.from(TABLE).upsert(row);
        if (error) throw new Error(error.message);

        // One live season at a time — retire the others only after this one saved.
        if (season.published) {
          const { error: retireError } = await supabase
            .from(TABLE)
            .update({ published: false, updated_at: new Date().toISOString() })
            .neq("id", id);
          if (retireError) throw new Error(retireError.message);
        }

        return NextResponse.json({ ok: true, id });
      }
      case "delete": {
        const id = typeof body.id === "string" ? body.id.trim() : "";
        if (!UUID_RE.test(id)) {
          return NextResponse.json({ error: "Missing season id" }, { status: 400 });
        }
        const { error } = await supabase.from(TABLE).delete().eq("id", id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      configured: false,
      error: error instanceof Error ? error.message : "Supabase not configured",
    });
  }
}
