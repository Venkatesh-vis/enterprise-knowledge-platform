import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import User from "@/db/models/user";
import OrganizationMembership from "@/db/models/organization-membership";
import { createAccessToken, } from "@/lib/auth/jwt";
import { setAuthCookie, } from "@/lib/auth/cookie";

export const runtime = "nodejs";

const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Enter a valid email address.")
        .max(255),

    password: z
        .string()
        .min(1)
        .max(128),
});

function jsonResponse(
    body: unknown,
    status = 200,
) {
    return NextResponse.json(
        body,
        {
            status,
            headers: {
                "Cache-Control": "no-store",
                Pragma: "no-cache",
            },
        },
    );
}

export async function POST(
    request: Request,
) {
    try {
        let body: unknown;

        try {
            body = await request.json();
        }
        catch {
            return jsonResponse(
                {
                    success: false,
                    message: "Invalid request body.",
                },
                400,
            );
        }

        const parsed =
            loginSchema.safeParse(body);

        if (!parsed.success) {
            return jsonResponse(
                {
                    success: false,
                    message: "Invalid email or password.",
                },
                401,
            );
        }

        const {
            email,
            password,
        } = parsed.data;

        const user =
            await User.findOne({
                where: {
                    email,
                },
            });

        if (!user) {
            return jsonResponse(
                {
                    success: false,
                    message: "Invalid email or password.",
                },
                401,
            );
        }

        const passwordHash = user.get("passwordHash");

        if (
            typeof passwordHash !== "string" ||
            passwordHash.length === 0
        ) {
            console.error("User account has no valid password hash.");

            return jsonResponse(
                {
                    success: false,
                    message: "Unable to sign in.",
                },
                500,
            );
        }

        const passwordMatches = await bcrypt.compare(password,passwordHash);

        if (!passwordMatches) {
            return jsonResponse(
                {
                    success: false,
                    message:"Invalid email or password.",
                },
                401,
            );
        }

        const userId = user.get("id");

        if (
            typeof userId !== "string"
        ) {
            console.error("User record has an invalid id.");

            return jsonResponse(
                {
                    success: false,
                    message:"Unable to sign in.",
                },
                500,
            );
        }

        
        const membership = await OrganizationMembership.findOne({
                where: {
                    userId,
                },
                order: [
                    ["createdAt", "ASC"],
                ],
            });

        if (!membership) {
            return jsonResponse(
                {
                    success: false,
                    message: "Your account is not associated with an organization.",
                },
                403,
            );
        }

        const organizationId = membership.get("organizationId");

        const membershipId = membership.get("id");

        const role = membership.get("role");

        if (
            typeof organizationId !== "string" ||
            typeof membershipId !== "string" ||
            typeof role !== "string"
        ) {
            console.error("User membership contains invalid authentication data.");

            return jsonResponse(
                {
                    success: false,
                    message:"Unable to sign in.",
                },
                500,
            );
        }

        const token =
            await createAccessToken({
                userId,
                organizationId,
                membershipId,
                role,
            });

        await setAuthCookie(token);

        return jsonResponse({
            success: true,
            message: "Login successful.",
        });
    } catch (error) {
        console.error(
            "Login error:",
            error instanceof Error
                ? error.message
                : "Unknown error",
        );

        return jsonResponse(
            {
                success: false,
                message: "Unable to complete login.",
            },
            500,
        );
    }
}