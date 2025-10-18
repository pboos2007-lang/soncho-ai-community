import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Music, Bot, User, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useEffect } from "react";

export default function Menu() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("ログアウトしました");
      sessionStorage.removeItem("sitePasswordVerified");
      setLocation("/");
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [loading, isAuthenticated, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-blue-100">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                SonchoのAIコミュニティー
              </h1>
              <p className="text-muted-foreground mt-2">
                ようこそ、{user?.nickname || user?.name || "ゲスト"}さん
              </p>
            </div>
            <Button variant="outline" onClick={() => logout.mutate()}>
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </Button>
          </div>

          <div className={`grid ${user?.role === 'admin' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
            {/* Sunoエリア */}
            <Link href="/suno">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/20 mb-4">
                    <Music className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle>Sunoエリア</CardTitle>
                  <CardDescription>
                    作品の投稿・閲覧
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Suno AIやSuno Studioで作成した作品を共有しましょう
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Manusエリア */}
            <Link href="/manus">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Manusエリア</CardTitle>
                  <CardDescription>
                    AIチャット・質問投稿
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    AIチャットボットやSonchoへの質問ができます
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* マイページ */}
            <Link href="/mypage">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mb-4">
                    <User className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle>マイページ</CardTitle>
                  <CardDescription>
                    プロフィール・投稿管理
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    あなたの投稿や質問を確認できます
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* 管理者専用 */}
            {user?.role === "admin" && (
              <Link href="/admin/questions">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 border-primary">
                  <CardHeader>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>管理者</CardTitle>
                    <CardDescription>
                      全質問管理
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      すべてのユーザーの質問を確認・回答できます
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

