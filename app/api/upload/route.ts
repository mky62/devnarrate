import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import crypto from "crypto"

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary is not configured" },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, JPEG, and PNG formats are allowed" },
        { status: 400 }
      )
    }

    const timestamp = Math.round(Date.now() / 1000)
    const signature = generateSignature({ timestamp }, CLOUDINARY_API_SECRET)

    const uploadFormData = new FormData()
    uploadFormData.append("file", file)
    uploadFormData.append("api_key", CLOUDINARY_API_KEY)
    uploadFormData.append("timestamp", String(timestamp))
    uploadFormData.append("signature", signature)

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

    const cloudinaryResponse = await fetch(cloudinaryUrl, {
      method: "POST",
      body: uploadFormData,
    })

    const result = await cloudinaryResponse.json()

    if (!cloudinaryResponse.ok) {
      return NextResponse.json(
        { error: result.error?.message || "Upload failed" },
        { status: cloudinaryResponse.status }
      )
    }

    return NextResponse.json({ url: result.secure_url })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function generateSignature(
  params: Record<string, string | number>,
  apiSecret: string
): string {
  const sortedKeys = Object.keys(params).sort()
  const toSign = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join("&")
  return crypto
    .createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex")
}
