import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateOrgInput } from "./orgs.types.js";
import { createOrg, listOrgs } from "./orgs.service.js";
import { dbClient, appSchema, authSchema } from "@atlas/database";
import { and, eq } from "drizzle-orm";
import { UnauthorizedError, ConflictError, NotFoundError } from "../../common/errors/index.js";
import { randomBytes } from "crypto";
import { ROLES, type Role } from "@atlas/types";

async function verifyOrgMember(userId: string, orgId: string, requiredRole?: Role) {
  const [member] = await dbClient
    .select()
    .from(appSchema.organizationMember)
    .where(
      and(
        eq(appSchema.organizationMember.userId, userId),
        eq(appSchema.organizationMember.organizationId, orgId),
      ),
    );

  if (!member) {
    throw new UnauthorizedError("Not a member of this organization");
  }

  if (requiredRole === ROLES.OWNER && member.role !== ROLES.OWNER) {
    throw new UnauthorizedError("Must be an owner");
  }
  if (requiredRole === ROLES.ADMIN && member.role === ROLES.MEMBER) {
    throw new UnauthorizedError("Must be an admin");
  }
}

export async function createOrgHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = request.body as Omit<CreateOrgInput, "userId">;

  const organization = await createOrg({
    name: body.name,
    userId: request.user!.id,
  });

  return reply.status(201).send(organization);
}

export async function listOrgsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const orgs = await listOrgs(request.user!.id);
  return reply.status(200).send(orgs);
}

export async function getOrgUsageHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { orgId: string };
  await verifyOrgMember(request.user!.id, params.orgId);

  const monthYear = new Date().toISOString().slice(0, 7);

  const [usage] = await dbClient
    .select()
    .from(appSchema.apiUsage)
    .where(
      and(
        eq(appSchema.apiUsage.organizationId, params.orgId),
        eq(appSchema.apiUsage.monthYear, monthYear),
      ),
    );

  if (!usage) {
    return reply.status(200).send({
      apiCallCount: 0,
      limit: 1000,
      monthYear,
    });
  }

  return reply.status(200).send(usage);
}

export async function createInviteHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { orgId: string };
  const body = request.body as { email: string; role: Role };
  
  await verifyOrgMember(request.user!.id, params.orgId, ROLES.ADMIN);

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days valid

  // Check if user is already a member
  const [existingUser] = await dbClient.select().from(authSchema.user).where(eq(authSchema.user.email, body.email));
  if (existingUser) {
    const [alreadyMember] = await dbClient.select().from(appSchema.organizationMember).where(
      and(
        eq(appSchema.organizationMember.organizationId, params.orgId),
        eq(appSchema.organizationMember.userId, existingUser.id)
      )
    );
    if (alreadyMember) {
      throw new ConflictError("User is already a member of this organization");
    }
  }

  const [invite] = await dbClient.insert(appSchema.organizationInvite).values({
    organizationId: params.orgId,
    email: body.email,
    role: body.role,
    token,
    expiresAt,
  }).returning();

  // TODO: Send actual email here (e.g. Resend)
  request.log.info(`Invite created for ${body.email}. Token: ${token}`);

  return reply.status(201).send(invite);
}

export async function listInvitesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { orgId: string };
  await verifyOrgMember(request.user!.id, params.orgId, ROLES.ADMIN);

  const invites = await dbClient
    .select()
    .from(appSchema.organizationInvite)
    .where(eq(appSchema.organizationInvite.organizationId, params.orgId));

  return reply.status(200).send(invites);
}

export async function acceptInviteHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = request.body as { token: string };
  const userId = request.user!.id;

  const [invite] = await dbClient
    .select()
    .from(appSchema.organizationInvite)
    .where(eq(appSchema.organizationInvite.token, body.token));

  if (!invite) throw new NotFoundError("Invalid invite token");
  if (invite.expiresAt < new Date()) throw new ConflictError("Invite expired");

  // Verify email matches logged in user
  const [user] = await dbClient.select().from(authSchema.user).where(eq(authSchema.user.id, userId));
  if (!user || user.email !== invite.email) {
    throw new UnauthorizedError("This invite was sent to a different email address");
  }

  await dbClient.transaction(async (tx) => {
    await tx.insert(appSchema.organizationMember).values({
      organizationId: invite.organizationId,
      userId: userId,
      role: invite.role,
    });
    
    await tx.delete(appSchema.organizationInvite).where(eq(appSchema.organizationInvite.id, invite.id));
  });

  return reply.status(200).send({
    success: true,
    organizationId: invite.organizationId,
  });
}
