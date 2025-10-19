import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminSettings() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [sitePassword, setSitePassword] = useState("");
  const [sunoActive, setSunoActive] = useState(true);
  const [manusActive, setManusActive] = useState(true);

  const { data: settings, isLoading: settingsLoading } = trpc.admin.getSettings.useQuery();
  const updateSettings = trpc.admin.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("設定を更新しました");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      setLocation("/menu");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  useEffect(() => {
    if (settings) {
      setSitePassword(settings.sitePassword);
      setSunoActive(settings.sunoActive);
      setManusActive(settings.manusActive);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({
      sitePassword,
      sunoActive,
      manusActive,
    });
  };

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-blue-100">
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" asChild>
              <Link href="/menu">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">管理者設定</h1>
              <p className="text-muted-foreground mt-1">サイトの基本設定を管理</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>サイト設定</CardTitle>
              <CardDescription>
                サイトのパスワードと機能の有効/無効を設定できます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sitePassword">サイトパスワード</Label>
                  <Input
                    id="sitePassword"
                    type="text"
                    value={sitePassword}
                    onChange={(e) => setSitePassword(e.target.value)}
                    placeholder="新しいパスワード"
                  />
                  <p className="text-sm text-muted-foreground">
                    トップページで入力するパスワードを変更できます
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sunoActive">Suno機能</Label>
                      <p className="text-sm text-muted-foreground">
                        Suno作品投稿・閲覧機能の有効/無効
                      </p>
                    </div>
                    <Switch
                      id="sunoActive"
                      checked={sunoActive}
                      onCheckedChange={setSunoActive}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="manusActive">Manus機能</Label>
                      <p className="text-sm text-muted-foreground">
                        Manus質問・AIチャット機能の有効/無効
                      </p>
                    </div>
                    <Switch
                      id="manusActive"
                      checked={manusActive}
                      onCheckedChange={setManusActive}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={updateSettings.isPending} className="w-full">
                  {updateSettings.isPending ? "保存中..." : "設定を保存"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

