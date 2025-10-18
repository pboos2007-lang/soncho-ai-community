import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

export default function Suno() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<"Suno AI" | "Suno Studio" | undefined>(undefined);

  const { data: posts, isLoading } = trpc.suno.getPosts.useQuery({ 
    category: selectedCategory 
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/menu">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Sunoエリア</h1>
                <p className="text-muted-foreground mt-1">作品を投稿・閲覧できます</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/suno/post">
                <Plus className="mr-2 h-4 w-4" />
                作品を投稿
              </Link>
            </Button>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all" onClick={() => setSelectedCategory(undefined)}>
                すべて
              </TabsTrigger>
              <TabsTrigger value="ai" onClick={() => setSelectedCategory("Suno AI")}>
                Suno AI
              </TabsTrigger>
              <TabsTrigger value="studio" onClick={() => setSelectedCategory("Suno Studio")}>
                Suno Studio
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {posts.map((post) => {
                    const videoId = extractYouTubeVideoId(post.youtubeUrl);
                    return (
                      <Card key={post.id} className="overflow-hidden">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{post.category}</CardTitle>
                            <span className="text-xs text-muted-foreground">
                              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ja-JP') : ''}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {videoId && (
                            <div className="aspect-video rounded-lg overflow-hidden">
                              <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {post.comment}
                          </p>
                          <Button variant="outline" size="sm" asChild className="w-full">
                            <Link href={`/suno/${post.id}`}>詳細を見る</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">まだ投稿がありません</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {posts.map((post) => {
                    const videoId = extractYouTubeVideoId(post.youtubeUrl);
                    return (
                      <Card key={post.id} className="overflow-hidden">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{post.category}</CardTitle>
                            <span className="text-xs text-muted-foreground">
                              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ja-JP') : ''}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {videoId && (
                            <div className="aspect-video rounded-lg overflow-hidden">
                              <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {post.comment}
                          </p>
                          <Button variant="outline" size="sm" asChild className="w-full">
                            <Link href={`/suno/${post.id}`}>詳細を見る</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">まだ投稿がありません</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="studio" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {posts.map((post) => {
                    const videoId = extractYouTubeVideoId(post.youtubeUrl);
                    return (
                      <Card key={post.id} className="overflow-hidden">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{post.category}</CardTitle>
                            <span className="text-xs text-muted-foreground">
                              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ja-JP') : ''}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {videoId && (
                            <div className="aspect-video rounded-lg overflow-hidden">
                              <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {post.comment}
                          </p>
                          <Button variant="outline" size="sm" asChild className="w-full">
                            <Link href={`/suno/${post.id}`}>詳細を見る</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">まだ投稿がありません</p>
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

