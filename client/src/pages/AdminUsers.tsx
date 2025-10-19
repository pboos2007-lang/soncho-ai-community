import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminUsers() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: users, isLoading } = trpc.admin.getUsers.useQuery();

  const sendEmail = trpc.admin.sendUserEmail.useMutation({
    onSuccess: () => {
      toast.success("メールを送信しました");
      setEmailSubject("");
      setEmailContent("");
      setDialogOpen(false);
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

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !emailSubject.trim() || !emailContent.trim()) return;
    
    sendEmail.mutate({
      userId: selectedUserId,
      subject: emailSubject,
      content: emailContent,
    });
  };

  const openEmailDialog = (userId: string) => {
    setSelectedUserId(userId);
    setDialogOpen(true);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-blue-100">
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" asChild>
              <Link href="/menu">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">メンバー管理</h1>
              <p className="text-muted-foreground mt-1">登録ユーザーの管理と連絡</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>登録ユーザー一覧 ({users?.length || 0}名)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users?.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">
                          {u.nickname || u.name || "名前なし"}
                        </h3>
                        {u.role === "admin" && (
                          <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
                            管理者
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{u.email}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>登録: {new Date(u.createdAt!).toLocaleDateString("ja-JP")}</span>
                        <span>
                          最終ログイン:{" "}
                          {u.lastSignedIn
                            ? new Date(u.lastSignedIn).toLocaleDateString("ja-JP")
                            : "なし"}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEmailDialog(u.id)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      メール送信
                    </Button>
                  </div>
                ))}

                {users?.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    登録ユーザーがいません
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* メール送信ダイアログ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザーにメール送信</DialogTitle>
            <DialogDescription>
              選択したユーザーに直接メールを送信します
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">件名</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="メールの件名"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">本文</Label>
              <Textarea
                id="content"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="メールの本文"
                rows={6}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={sendEmail.isPending} className="flex-1">
                {sendEmail.isPending ? "送信中..." : "送信"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

