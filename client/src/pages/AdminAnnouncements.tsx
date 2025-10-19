import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminAnnouncements() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editActive, setEditActive] = useState(true);

  const utils = trpc.useUtils();
  const { data: announcements, isLoading } = trpc.admin.getAnnouncements.useQuery();

  const createAnnouncement = trpc.admin.createAnnouncement.useMutation({
    onSuccess: () => {
      toast.success("お知らせを作成しました");
      setNewContent("");
      utils.admin.getAnnouncements.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateAnnouncement = trpc.admin.updateAnnouncement.useMutation({
    onSuccess: () => {
      toast.success("お知らせを更新しました");
      setEditingId(null);
      utils.admin.getAnnouncements.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteAnnouncement = trpc.admin.deleteAnnouncement.useMutation({
    onSuccess: () => {
      toast.success("お知らせを削除しました");
      utils.admin.getAnnouncements.invalidate();
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    createAnnouncement.mutate({ content: newContent });
  };

  const handleUpdate = (id: number) => {
    updateAnnouncement.mutate({ id, content: editContent, isActive: editActive });
  };

  const handleDelete = (id: number) => {
    if (confirm("このお知らせを削除しますか？")) {
      deleteAnnouncement.mutate({ id });
    }
  };

  const startEdit = (id: number, content: string, isActive: boolean) => {
    setEditingId(id);
    setEditContent(content);
    setEditActive(isActive);
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" asChild>
              <Link href="/menu">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">お知らせ管理</h1>
              <p className="text-muted-foreground mt-1">トップメニューに表示されるお知らせを管理</p>
            </div>
          </div>

          {/* 新規作成 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>新しいお知らせを作成</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newContent">お知らせ内容</Label>
                  <Textarea
                    id="newContent"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="お知らせの内容を入力..."
                    rows={3}
                  />
                </div>
                <Button type="submit" disabled={createAnnouncement.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  {createAnnouncement.isPending ? "作成中..." : "お知らせを作成"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* お知らせ一覧 */}
          <div className="space-y-4">
            {announcements?.map((announcement) => (
              <Card key={announcement.id}>
                <CardContent className="pt-6">
                  {editingId === announcement.id ? (
                    <div className="space-y-4">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                      />
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={editActive}
                            onCheckedChange={setEditActive}
                          />
                          <Label>表示する</Label>
                        </div>
                        <div className="flex gap-2 ml-auto">
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(announcement.id)}
                            disabled={updateAnnouncement.isPending}
                          >
                            保存
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            キャンセル
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              {announcement.isActive ? (
                                <span className="text-green-600 font-medium">表示中</span>
                              ) : (
                                <span className="text-gray-500">非表示</span>
                              )}
                            </span>
                            <span>
                              {new Date(announcement.createdAt).toLocaleDateString("ja-JP")}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              startEdit(announcement.id, announcement.content, announcement.isActive)
                            }
                          >
                            編集
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(announcement.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {announcements?.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  お知らせがありません
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

