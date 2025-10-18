import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

export default function VerifyEmail() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  
  const token = new URLSearchParams(search).get("token");

  const verifyEmail = trpc.customAuth.verifyEmail.useMutation({
    onSuccess: (data) => {
      setVerified(true);
      toast.success(data.message);
    },
    onError: (error) => {
      setError(true);
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (token) {
      verifyEmail.mutate({ token });
    } else {
      setError(true);
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-orange-50 to-blue-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">メールアドレスの確認</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {verifyEmail.isPending && (
            <div className="py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">確認中...</p>
            </div>
          )}
          
          {verified && (
            <div className="py-8 space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <CardDescription className="text-lg">
                メールアドレスが確認されました！
              </CardDescription>
              <Button asChild className="w-full">
                <Link href="/login">ログインページへ</Link>
              </Button>
            </div>
          )}
          
          {error && (
            <div className="py-8 space-y-4">
              <XCircle className="h-16 w-16 text-destructive mx-auto" />
              <CardDescription className="text-lg">
                確認に失敗しました
              </CardDescription>
              <p className="text-sm text-muted-foreground">
                リンクが無効または期限切れの可能性があります
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/register">会員登録ページへ</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

