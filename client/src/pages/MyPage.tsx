import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ArrowLeft, User, Music, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

export default function MyPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: sunoPosts, isLoading: sunoLoading } = trpc.suno.getPosts.useQuery({});
  const { data: questions, isLoading: questionsLoading } = trpc.manus.getQuestions.useQuery(
    { userId: user?.id },
    { enabled: !!user }
  );

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

  const myPosts = sunoPosts?.filter(post => post.userId === user?.id) || [];

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
              <h1 className="text-3xl font-bold text-foreground">マイページ</h1>
              <p className="text-muted-foreground mt-1">あなたの情報と投稿</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mx-auto mb-4">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-center">{user?.nickname || user?.name || "ゲスト"}</CardTitle>
                <CardDescription className="text-center">
                  {user?.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">役割:</span>
                  <span className="font-medium">
                    {user?.role === "admin" ? "管理者" : "ユーザー"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">登録日:</span>
                  <span className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ja-JP') : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-secondary/10 rounded-lg">
                    <Music className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{myPosts.length}</p>
                    <p className="text-sm text-muted-foreground">Suno投稿</p>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{questions?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">質問</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="suno" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="suno">Suno投稿</TabsTrigger>
              <TabsTrigger value="questions">質問</TabsTrigger>
            </TabsList>

            <TabsContent value="suno" className="space-y-4">
              {sunoLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : myPosts.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {myPosts.map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{post.category}</CardTitle>
                        <CardDescription>
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ja-JP') : ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {post.comment}
                        </p>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link href={`/suno/${post.id}`}>詳細を見る</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground mb-4">まだ投稿がありません</p>
                    <Button asChild>
                      <Link href="/suno/post">投稿する</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              {questionsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : questions && questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <Card key={question.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{question.title}</CardTitle>
                        <CardDescription>
                          {question.createdAt ? new Date(question.createdAt).toLocaleDateString('ja-JP') : ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {question.content}
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/manus/questions/${question.id}`}>詳細を見る</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground mb-4">まだ質問がありません</p>
                    <Button asChild>
                      <Link href="/manus/questions/new">質問する</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

