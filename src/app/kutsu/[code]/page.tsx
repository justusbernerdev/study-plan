"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useUser, SignIn } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import {
  Loader2,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
} from "lucide-react";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  const [isAccepting, setIsAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const invitation = useQuery(api.invitations.getByCode, { code });
  const getOrCreateUser = useMutation(api.users.getOrCreate);
  const acceptInvite = useMutation(api.invitations.accept);

  const handleAccept = async () => {
    if (!clerkUser || !invitation) return;

    setIsAccepting(true);
    try {
      // Create/get user
      const userId = await getOrCreateUser({
        clerkId: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || "Käyttäjä",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        imageUrl: clerkUser.imageUrl,
      });

      // Accept the invite
      await acceptInvite({
        inviteCode: code,
        userId,
      });

      setAccepted(true);
      toast({
        title: "Tervetuloa!",
        description: "Olet nyt kaveri kutsun lähettäjän kanssa!",
        variant: "success",
      });

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Virhe",
        description: error.message || "Kutsun hyväksyminen epäonnistui",
        variant: "destructive",
      });
    }
    setIsAccepting(false);
  };

  // Loading
  if (!isClerkLoaded || invitation === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center pattern-bg">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Ladataan kutsua...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired
  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center pattern-bg p-4">
        <Card className="w-full max-w-md card-shadow">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Kutsua ei löydy</h2>
            <p className="text-muted-foreground mb-6">
              Tämä kutsu on virheellinen tai vanhentunut.
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              Siirry etusivulle
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already used
  if (invitation.status !== "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center pattern-bg p-4">
        <Card className="w-full max-w-md card-shadow">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Kutsu on jo käytetty</h2>
            <p className="text-muted-foreground mb-6">
              Tämä kutsu on jo hyväksytty tai vanhentunut.
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              Siirry etusivulle
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in
  if (!clerkUser) {
    return (
      <div className="min-h-screen flex items-center justify-center pattern-bg p-4">
        <Card className="w-full max-w-md card-shadow">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Sinut on kutsuttu!</CardTitle>
            <p className="text-muted-foreground">
              Kirjaudu sisään tai luo tili hyväksyäksesi kutsun
            </p>
          </CardHeader>
          <CardContent>
            <SignIn
              afterSignInUrl={`/kutsu/${code}`}
              afterSignUpUrl={`/kutsu/${code}`}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Accepted
  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center pattern-bg p-4">
        <Card className="w-full max-w-md card-shadow">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Tervetuloa!</h2>
            <p className="text-muted-foreground mb-6">
              Olet nyt yhdistetty opiskelukaveriisi. Sinut ohjataan pian etusivulle...
            </p>
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ready to accept
  return (
    <div className="min-h-screen flex items-center justify-center pattern-bg p-4">
      <Card className="w-full max-w-md card-shadow">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl">Opiskeluseurantakutsu</CardTitle>
          <p className="text-muted-foreground">
            Sinut on kutsuttu opiskelemaan yhdessä!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">Kutsuja:</p>
            <p className="font-medium">{invitation.toEmail}</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleAccept}
              disabled={isAccepting}
              className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
              size="lg"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Hyväksytään...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Hyväksy kutsu
                </>
              )}
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full"
            >
              Peruuta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

