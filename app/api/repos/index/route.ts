import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { inngest } from "@/inngest/client";



export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized"}, {status: 401})
    }

    const { repoId , repoName, accountId} = await req.json();
    
    if (!repoId || !repoName || !accountId) {
        return NextResponse.json({
            error: "Missing repoId , repoName , accountId"
        }, 
        { status: 400 })
    }


   const job =  await db.repoIndexJob.create({
        data: {
            repoId: String(repoId),
            userId: session.user.id,
            status: 'PENDING',
        },
    });


    await inngest.send({
        name: "repos/index",
        data: {
            jobId: job.id,
            repoId: String(repoId),
            repoName: repoName,
            accountId: String(accountId),
        },
    });

    return NextResponse.json({
        success: true,
        jobId: job.id,
    })

}