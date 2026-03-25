import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function PATCH(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { stageName, description, socialLinks } = body

        // Validate stageName uniqueness (if provided)
        if (stageName) {
            const existingUser = await db.user.findFirst({
                where: {
                    stageName,
                    NOT: {
                        id: session.user.id
                    }
                }
            })

            if (existingUser) {
                return NextResponse.json(
                    { error: "Stage name already taken" },
                    { status: 409 }
                )
            }
        }

        // Update user profile
        const updatedUser = await db.user.update({
            where: { id: session.user.id },
            data: {
                ...(stageName !== undefined && { stageName: stageName || null }),
                ...(description !== undefined && { description: description || null }),
                ...(socialLinks !== undefined && { socialLinks: socialLinks || null }),
            }
        })

        return NextResponse.json({
            success: true,
            user: updatedUser
        })
    } catch (error) {
        console.error("Profile update error:", error)
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        )
    }
}
