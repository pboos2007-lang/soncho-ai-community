import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ManusQuestionDetail() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const questionId = params.id ? parseInt(params.id) : 0;
  const [answerContent, setAnswerContent] = useState("");

  const { data: question, isLoading: questionLoading } = trpc.manus.getQuestion.useQuery({ id: questionId });
  const { data: answers, isLoading: answersLoading } = trpc.manus.getAnswers.useQuery({ questionId });

  const utils = trpc.useUtils();
  const createAnswer = trpc.manus.createAnswer.useMutation({
    onSuccess: () => {
      toast.success("回答を投稿しました");
      setAnswerContent("");
      utils.manus.getAnswers.invalidate({ questionId });
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

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("ログインしてください");
      return;
    }

    if (user.role !== "admin") {
      toast.error("管理者のみ回答できます");
      return;
    }

    createAnswer.mutate({
      questionId,
      userId: user.id,
      content: answerContent,
    });
  };

  if (loading || questionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-blue-100">
        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">質問が見つかりません</p>
                <Button asChild className="mt-4">
                  <Link href="/manus/questions">一覧に戻る</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-blue-100">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" asChild>
              <Link href="/manus/questions">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">質問詳細</h1>
            </div>
          </div>

          <div className="space-y-6">
            {/* 質問カード */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{question.title}</CardTitle>
                <CardDescription>
                  {question.createdAt ? new Date(question.createdAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {question.content}
                </p>
              </CardContent>
            </Card>

            {/* 回答一覧 */}
            <Card>
              <CardHeader>
                <CardTitle>回答</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {answersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : answers && answers.length > 0 ? (
                  answers.map((answer) => (
                    <div key={answer.id} className="border-l-4 border-primary pl-4 py-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        {answer.createdAt ? new Date(answer.createdAt).toLocaleDateString('ja-JP') : ''}
                      </p>
                      <p className="whitespace-pre-wrap">{answer.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    まだ回答がありません
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 管理者用回答フォーム */}
            {user?.role === "admin" && (
              <Card>
                <CardHeader>
                  <CardTitle>回答を投稿（管理者のみ）</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitAnswer} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="answer">回答内容</Label>
                      <Textarea
                        id="answer"
                        placeholder="回答を入力してください"
                        value={answerContent}
                        onChange={(e) => setAnswerContent(e.target.value)}
                        required
                        rows={6}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={createAnswer.isPending}
                    >
                      {createAnswer.isPending ? "投稿中..." : "回答を投稿"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

