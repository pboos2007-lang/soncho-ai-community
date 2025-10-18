import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SunoPost() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState<"Suno AI" | "Suno Studio">("Suno AI");

  const utils = trpc.useUtils();
  const createPost = trpc.suno.createPost.useMutation({
    onSuccess: () => {
      toast.success("作品を投稿しました");
      utils.suno.getPosts.invalidate();
      setLocation("/suno");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [loading, isAuthenticated, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("ログインしてください");
      return;
    }

    if (comment.length > 300) {
      toast.error("コメントは300文字以内で入力してください");
      return;
    }

    createPost.mutate({
      userId: user.id,
      youtubeUrl,
      comment,
      category,
    });
  };

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
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" asChild>
              <Link href="/suno">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">作品を投稿</h1>
              <p className="text-muted-foreground mt-1">Suno作品を共有しましょう</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>投稿フォーム</CardTitle>
              <CardDescription>
                YouTube URLとコメントを入力してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category">カテゴリ</Label>
                  <Select value={category} onValueChange={(value) => setCategory(value as "Suno AI" | "Suno Studio")}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Suno AI">Suno AI</SelectItem>
                      <SelectItem value="Suno Studio">Suno Studio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube URL</Label>
                  <Input
                    id="youtubeUrl"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    YouTubeの動画URLを入力してください
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">コメント</Label>
                  <Textarea
                    id="comment"
                    placeholder="作品について説明してください"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    maxLength={300}
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {comment.length} / 300文字
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>投稿者</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.nickname || user?.name || "ゲスト"}
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createPost.isPending}
                  >
                    {createPost.isPending ? "投稿中..." : "投稿する"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    asChild
                  >
                    <Link href="/suno">キャンセル</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

