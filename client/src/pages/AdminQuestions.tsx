import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

export default function AdminQuestions() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: questions, isLoading } = trpc.manus.getQuestions.useQuery({});

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
    
    if (!loading && user?.role !== "admin") {
      setLocation("/menu");
    }
  }, [loading, isAuthenticated, user, setLocation]);

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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" asChild>
              <Link href="/menu">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">全質問一覧（管理者）</h1>
              <p className="text-muted-foreground mt-1">すべてのユーザーの質問</p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : questions && questions.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {questions.map((question) => (
                <Card key={question.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{question.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {question.createdAt ? new Date(question.createdAt).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }) : ''}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {question.content}
                    </p>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href={`/manus/questions/${question.id}`}>詳細を見る・回答する</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">まだ質問がありません</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

