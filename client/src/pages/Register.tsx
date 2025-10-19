import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [, setLocation] = useLocation();

  const register = trpc.customAuth.register.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setLocation("/login");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error("パスワードは8文字以上で入力してください");
      return;
    }
    
    register.mutate({ email, password, nickname });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-orange-50 to-blue-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">会員登録</CardTitle>
          <CardDescription>
            新しいアカウントを作成してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div className="space-y-2">
              <Label htmlFor="nickname">ニックネーム</Label>
              <Input
                id="nickname"
                name="nickname"
                type="text"
                placeholder="ニックネーム"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                autoComplete="nickname"
                maxLength={100}
                required
              />
            </div>
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
                placeholder="8文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <p className="text-xs text-muted-foreground">
                8文字以上で入力してください
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={register.isPending}
            >
              {register.isPending ? "登録中..." : "登録する"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              既にアカウントをお持ちの方は{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                ログイン
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

