import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function SitePasswordGate() {
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  
  const verifySitePassword = trpc.customAuth.verifySitePassword.useMutation({
    onSuccess: () => {
      // パスワードが正しい場合、sessionStorageに保存してログインページへ
      sessionStorage.setItem("sitePasswordVerified", "true");
      setLocation("/login");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifySitePassword.mutate({ password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-orange-50 to-blue-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
            SonchoのAIコミュニティー
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Manus & Suno
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="共通パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={verifySitePassword.isPending}
            >
              {verifySitePassword.isPending ? "確認中..." : "入場する"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

