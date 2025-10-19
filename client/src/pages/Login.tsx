import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [, setLocation] = useLocation();

  const login = trpc.customAuth.login.useMutation({
    onSuccess: () => {
      toast.success("ログインしました");
      setLocation("/menu");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resendVerification = trpc.customAuth.resendVerificationEmail.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setResendDialogOpen(false);
      setResendEmail("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  const handleResend = (e: React.FormEvent) => {
    e.preventDefault();
    resendVerification.mutate({ email: resendEmail });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-orange-50 to-blue-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">ログイン</CardTitle>
          <CardDescription>
            アカウントにログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={login.isPending}
            >
              {login.isPending ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
          
          <div className="mt-6 space-y-3 text-center text-sm">
            <p className="text-muted-foreground">
              アカウントをお持ちでない方は{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                会員登録
              </Link>
            </p>
            
            <Dialog open={resendDialogOpen} onOpenChange={setResendDialogOpen}>
              <DialogTrigger asChild>
                <button className="text-primary hover:underline text-sm">
                  確認メールが届かない場合
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>確認メールを再送信</DialogTitle>
                  <DialogDescription>
                    登録したメールアドレスを入力してください
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleResend} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resendEmail">メールアドレス</Label>
                    <Input
                      id="resendEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={resendVerification.isPending}
                      className="flex-1"
                    >
                      {resendVerification.isPending ? "送信中..." : "再送信"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setResendDialogOpen(false)}
                    >
                      キャンセル
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

