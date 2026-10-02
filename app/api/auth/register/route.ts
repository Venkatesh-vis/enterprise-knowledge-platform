import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { Op } from "sequelize";
import { z } from "zod";

import {
  User,
  Organization,
  OrganizationMembership,
  Role,
} from "@/db/models";
import sequelize from "@/lib/database";
import { createAccessToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookie";

export const runtime = "nodejs";

const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email(),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(1),
    organizationName: z.string().trim().min(2).max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in",
  "outlook.com", "hotmail.com", "live.com", "msn.com", "icloud.com",
  "me.com", "mac.com", "proton.me", "protonmail.com", "aol.com",
  "zoho.com", "gmx.com", "mail.com",
]);

function getEmailDomain(email: string) {
  return email.slice(email.lastIndexOf("@") + 1).toLowerCase();
}

function createOrganizationSlug(name: string) {
  const base = name.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "organization";
  return base + "-" + randomUUID().slice(0, 8);
}

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  let transaction;

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Please check the submitted information.",
        400,
      );
    }

    const { name, email, password, organizationName } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();
    const emailDomain = getEmailDomain(normalizedEmail);

    if (!emailDomain || FREE_EMAIL_DOMAINS.has(emailDomain)) {
      return errorResponse(
        "Please use your organization email address to create an organization.",
        400,
      );
    }

    transaction = await sequelize.transaction();

    const existingUser = await User.findOne({
      where: { email: normalizedEmail },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existingUser) {
      await transaction.rollback();
      transaction = undefined;
      return errorResponse("Email is already registered.", 409);
    }

    const existingDomainUser = await User.findOne({
      where: { email: { [Op.like]: "%@" + emailDomain } },
      transaction,
    });

    if (existingDomainUser) {
      await transaction.rollback();
      transaction = undefined;
      return errorResponse(
        "An organization already exists for this company email domain. Please sign in or request an invitation from your organization administrator.",
        409,
      );
    }

    const ownerRole = await Role.findOne({
      where: { key: "OWNER", isSystemRole: true },
      attributes: ["id"],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!ownerRole) throw new Error("System OWNER role is not configured.");

    const userId = randomUUID();
    const organizationId = randomUUID();
    const membershipId = randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create(
      { id: userId, name, email: normalizedEmail, passwordHash },
      { transaction },
    );

    const organization = await Organization.create(
      {
        id: organizationId,
        name: organizationName,
        slug: createOrganizationSlug(organizationName),
      },
      { transaction },
    );

    const organizationMembership = await OrganizationMembership.create(
      {
        id: membershipId,
        userId,
        organizationId,
        roleId: ownerRole.id,
      },
      { transaction },
    );

    await transaction.commit();
    transaction = undefined;

    const token = await createAccessToken(user.id);
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful.",
        data: {
          user: { id: user.id, name: user.name, email: user.email },
          organization: {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
          },
          membership: {
            id: organizationMembership.id,
            roleId: ownerRole.id,
            role: "OWNER",
          },
        },
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    console.error("Registration error:", error);
    return errorResponse("Unable to register. Please try again.", 500);
  }
}
