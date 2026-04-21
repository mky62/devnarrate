
import { getAuthCallbackUrl } from "@/lib/auth-redirect"
import SignInForm from "../components/SignInForm"

interface SignInPageProps {
  searchParams?: Promise<{ next?: string }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await searchParams
  const callbackURL = getAuthCallbackUrl(resolvedSearchParams?.next)

  return (
    <SignInForm callbackURL={callbackURL} />
  )

}
