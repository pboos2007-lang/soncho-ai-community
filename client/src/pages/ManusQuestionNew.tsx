import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ManusQuestionNew() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const utils = trpc.useUtils();
  const createQuestion = trpc.manus.createQuestion.useMutation({
    onSuccess: () => {
      toast.success("質問を投稿しました");
      utils.manus.getQuestions.invalidate();
      setLocation("/manus/questions");
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

    createQuestion.mutate({
      userId: user.id,
      title,
      content,
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
              <Link href="/manus/questions">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sonchoに質問</h1>
              <p className="text-muted-foreground mt-1">質問を投稿してください</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>質問フォーム</CardTitle>
              <CardDescription>
                タイトルと本文を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">タイトル</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="質問のタイトル"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {title.length} / 200文字
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">本文</Label>
                  <Textarea
                    id="content"
                    placeholder="質問の詳細を入力してください"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={10}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createQuestion.isPending}
                  >
                    {createQuestion.isPending ? "投稿中..." : "投稿する"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    asChild
                  >
                    <Link href="/manus/questions">キャンセル</Link>
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

