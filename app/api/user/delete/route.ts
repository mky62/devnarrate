import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function DELETE() {
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

        const userId = session.user.id

        // Delete user's repos first (due to foreign key constraints)
        await db.repo.deleteMany({
            where: { userId }
        })

        // Delete user's posts
        await db.post.deleteMany({
            where: { userId }
        })

        // Delete user's accounts (GitHub OAuth, etc)
        await db.account.deleteMany({
            where: { userId }
        })

        // Delete user's sessions
        await db.session.deleteMany({
            where: { userId }
        })

        // Finally delete the user
        await db.user.delete({
            where: { id: userId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete account error:", error)
        return NextResponse.json(
            { error: "Failed to delete account" },
            { status: 500 }
        )
    }
}
