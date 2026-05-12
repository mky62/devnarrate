
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAuthCallbackUrl } from "@/lib/auth-redirect"
import SignInForm from "../components/SignInForm"

interface SignInPageProps {
  searchParams?: Promise<{ next?: string }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session?.user?.id) {
    redirect("/dashboard")
  }

  const resolvedSearchParams = await searchParams
  const callbackURL = getAuthCallbackUrl(resolvedSearchParams?.next)

  return (
    <SignInForm callbackURL={callbackURL} />
  )

}
