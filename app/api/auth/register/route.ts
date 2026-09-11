import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomUUID } from "crypto";
import { Op } from "sequelize";
import sequelize from "@/lib/database";
import { User, Organization, OrganizationMembership, } from "@/db/models";

const registerSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .min(
      2,
      "Organization name must be at least 2 characters.",
    )
    .max(
      100,
      "Organization name must be 100 characters or less.",
    ),

  name: z
    .string()
    .trim()
    .min(
      2,
      "Name must be at least 2 characters.",
    )
    .max(
      100,
      "Name must be 100 characters or less.",
    ),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(
      8,
      "Password must be at least 8 characters.",
    )
    .max(
      128,
      "Password must be 128 characters or less.",
    ),

  confirmPassword: z
    .string()
    .min(
      1,
      "Please confirm your password.",
    ),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  },
);

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
  "zoho.com",
  "gmx.com",
  "mail.com",
]);

function getEmailDomain(email: string) {
  const atIndex = email.lastIndexOf("@");

  if (atIndex === -1) {
    return null;
  }

  const domain = email
    .slice(atIndex + 1)
    .trim()
    .toLowerCase();

  if (!domain || domain.length > 255) {
    return null;
  }

  return domain;
}

function createSlug(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug}-${randomUUID().slice(0, 8)}`;
}

export async function POST(request: Request) {
  let transaction;

  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the submitted information.",
          errors: parsed.error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    const { organizationName, name, email, password, } = parsed.data;

    const emailDomain = getEmailDomain(email);

    if (!emailDomain) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid organization email address is required.",
        },
        {
          status: 400,
        },
      );
    }


    if (FREE_EMAIL_DOMAINS.has(emailDomain)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please use your organization email address to create an organization.",
        },
        {
          status: 400,
        },
      );
    }

    transaction = await sequelize.transaction();


    const existingUser = await User.findOne({
      where: {
        email,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existingUser) {
      await transaction.rollback();
      transaction = undefined;

      return NextResponse.json(
        {
          success: false,
          message: "Email is already registered.",
        },
        {
          status: 409,
        },
      );
    }


    const existingDomainUser = await User.findOne({
      where: {
        email: {
          [Op.like]: `%@${emailDomain}`,
        },
      },
      include: [
        {
          model: OrganizationMembership,
          as: "memberships",
          include: [
            {
              model: Organization,
              as: "organization",
            },
          ],
        },
      ],
      transaction,
    });

    if (existingDomainUser) {
      await transaction.rollback();
      transaction = undefined;

      return NextResponse.json(
        {
          success: false,
          message: "An organization already exists for this company email domain. Please sign in or request an invitation from your organization administrator.",
        },
        {
          status: 409,
        },
      );
    }


    const hashedPassword = await bcrypt.hash(password, 12,);

    const userId = randomUUID();
    const organizationId = randomUUID();
    const membershipId = randomUUID();

    const organizationSlug = createSlug(organizationName);

    const user = await User.create(
      {
        id: userId,
        name,
        email,
        passwordHash: hashedPassword,
      },
      {
        transaction,
      },
    );


    const organization =
      await Organization.create(
        {
          id: organizationId,
          name: organizationName,
          slug: organizationSlug,
        },
        {
          transaction,
        },
      );


    const organizationMembership =
      await OrganizationMembership.create(
        {
          id: membershipId,
          userId,
          organizationId,
          role: "OWNER",
        },
        {
          transaction,
        },
      );

    await transaction.commit();
    transaction = undefined;

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful.",
        data: {
          user: {
            id: user.id,
            name: user.name,
          },

          organization: {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
          },

          membership: {
            id: organizationMembership.id,
            role: organizationMembership.role,
          },
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Registration rollback error:", rollbackError,);
      }
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your request.",
      },
      {
        status: 500,
      },
    );
  }
}