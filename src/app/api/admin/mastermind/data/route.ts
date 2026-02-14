import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ORG_LAYERS, MISSION_MAPPINGS, getAllInvocations, getAllPlaybooks } from "@/lib/mastermind";

// GET /api/admin/mastermind/data - Return mastermind config data for client components
// This avoids bundling 2,825 lines of static data into the client bundle
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invocations = getAllInvocations()
    .filter((inv) => inv.mode === "single")
    .slice(0, 8)
    .map(({ trigger, description }) => ({ trigger, description }));

  const playbooks = getAllPlaybooks().map(({ id, name, description, promptOptions }) => ({
    id,
    name,
    description,
    scenario: promptOptions.scenario,
    mission: promptOptions.mission || "",
    invocation: promptOptions.invocation || "",
  }));

  const missions = MISSION_MAPPINGS.map(({ domain, label, description, keyAdvisorIds, agentIds }) => ({
    domain,
    label,
    description,
    keyAdvisorIds,
    agentIds,
  }));

  const layers = ORG_LAYERS.map(({ id, name, subtitle, description, icon, roles, principles, relevantAgents }) => ({
    id,
    name,
    subtitle,
    description,
    icon,
    roles,
    principles,
    relevantAgents,
  }));

  return NextResponse.json({
    invocations,
    playbooks,
    missions,
    layers,
  });
}
