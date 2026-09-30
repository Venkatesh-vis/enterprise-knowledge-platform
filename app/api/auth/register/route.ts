import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { User, Organization, OrganizationMembership, Role } from "@/db/models";
import sequelize from "@/lib/database";
import { signAuthToken } from "@/lib/auth";

export async function POST(request: Request) {
  const transaction = await sequelize.transaction();

  try {
    const body = await request.json();
    const { name, email, password, organizationName } = body;

    if (!name || !email || !password || !organizationName) {
      return NextResponse.json(
        { message: "Name, email, password and organization name are required." },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({
      where: { email: normalizedEmail },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existingUser) {
      await transaction.rollback();
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = randomUUID();
    const organizationId = randomUUID();
    const membershipId = randomUUID();

    const user = await User.create(
      {
        id: userId,
        name: String(name).trim(),
        email: normalizedEmail,
        password: passwordHash,
      },
      { transaction },
    );

    const organization = await Organization.create(
      {
        id: organizationId,
        name: String(organizationName).trim(),
      },
      { transaction },
    );

    const ownerRole = await Role.findOne({
      where: {
        key: "OWNER",
        isSystemRole: true,
      },
      attributes: ["id", "key"],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!ownerRole) {
      throw new Error("System OWNER role is not configured.");
    }

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

    const token = await signAuthToken({
      userId,
      organizationId,
      membershipId,
      role: "OWNER",
    });

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        organization: {
          id: organization.id,
          name: organization.name,
        },
        membership: {
          id: organizationMembership.id,
          role: "OWNER",
        },
      },
      { status: 201 },
    );

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      { message: "Unable to register." },
      { status: 500 },
    );
  }
}
