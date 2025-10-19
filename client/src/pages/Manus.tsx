import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Bot, MessageCircle } from "lucide-react";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function Manus() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: settings } = trpc.customAuth.getPublicSettings.useQuery();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [loading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (!loading && settings && !settings.manusActive) {
      setLocation("/menu");
    }
  }, [loading, settings, setLocation]);

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
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" asChild>
              <Link href="/menu">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Manusエリア</h1>
              <p className="text-muted-foreground mt-1">AIチャットと質問投稿</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* AIチャットボット */}
            <Link href="/manus/chat">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">AIチャットボット</CardTitle>
                  <CardDescription>
                    自動応答で質問に答えます
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Manusの使い方に関する基本的な質問に、AIが自動で回答します。
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Sonchoに質問 */}
            <Link href="/manus/questions">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary/20 mb-4">
                    <MessageCircle className="h-8 w-8 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">Sonchoに質問</CardTitle>
                  <CardDescription>
                    個別対応で質問できます
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    より詳しい質問や個別の相談は、Sonchoに直接質問できます。
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

