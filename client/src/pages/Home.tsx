import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar, Sparkles, Users } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useTelegramApp } from "@/hooks/useTelegramApp";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { webApp, isReady } = useTelegramApp();

  // Expand app on load
  useEffect(() => {
    if (webApp && isReady) {
      webApp.expand();
    }
  }, [webApp, isReady]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
        <div className="container max-w-md">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 text-4xl">✨</div>
            <h1 className="text-4xl font-bold text-slate-700 mb-2" style={{ fontFamily: "Playfair Display" }}>
              Nail Beauty
            </h1>
            <p className="text-slate-600">Запишитесь на маникюр прямо сейчас</p>
          </div>

          <div className="space-y-4 mb-8">
            <Card className="bg-white shadow-soft border-purple-100">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Calendar className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-700">Удобное время</p>
                    <p className="text-sm text-slate-600">Выбирайте удобное для вас время</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-soft border-purple-100">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-700">Качественный сервис</p>
                    <p className="text-sm text-slate-600">Профессиональный маникюр и дизайн</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-soft border-purple-100">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Users className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-700">Персональный подход</p>
                    <p className="text-sm text-slate-600">Индивидуальная работа с каждым клиентом</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-lg shadow-lg transition-all"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Войти и записаться
          </Button>

          <p className="text-center text-xs text-slate-500 mt-4">
            Вход через Telegram
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="container max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 text-4xl">✨</div>
          <h1 className="text-4xl font-bold text-slate-700 mb-2" style={{ fontFamily: "Playfair Display" }}>
            Nail Beauty
          </h1>
          <p className="text-slate-600">Добро пожаловать, {user?.name}!</p>
        </div>

        <div className="space-y-3 mb-6">
          <Button
            className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-lg shadow-lg transition-all"
            onClick={() => setLocation("/booking")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Записаться на маникюр
          </Button>

          <Button
            variant="outline"
            className="w-full border-purple-200 text-slate-700 hover:bg-purple-50 font-semibold py-3 rounded-lg transition-all"
            onClick={() => setLocation("/my-bookings")}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Мои записи
          </Button>

          {user?.role === "admin" && (
            <Button
              variant="outline"
              className="w-full border-pink-200 text-slate-700 hover:bg-pink-50 font-semibold py-3 rounded-lg transition-all"
              onClick={() => setLocation("/admin")}
            >
              <Users className="w-4 h-4 mr-2" />
              Админ-панель
            </Button>
          )}
        </div>

        <Card className="bg-white shadow-soft border-purple-100 mb-6">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-4">
              <strong className="text-slate-700">Наши услуги:</strong>
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-700">Комбинированный маникюр</span>
                <span className="font-semibold text-purple-600">10 BYN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700">Пусть ногти отдохнут</span>
                <span className="font-semibold text-purple-600">20 BYN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700">Маникюр + гель-лак</span>
                <span className="font-semibold text-purple-600">30 BYN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700">Наращивание ногтей</span>
                <span className="font-semibold text-purple-600">40 BYN</span>
              </div>
              <div className="flex justify-between border-t border-purple-100 pt-2 mt-2">
                <span className="text-slate-700">+ Дизайн ногтей</span>
                <span className="font-semibold text-pink-600">+5 BYN</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-slate-500 mb-2">
            Вопросы? Напишите нам в Telegram
          </p>
          <Button
            variant="ghost"
            className="text-purple-600 hover:text-purple-700 text-sm"
            onClick={() => {
              if (webApp) {
                webApp.openTelegramLink("https://t.me/nailbeauty");
              }
            }}
          >
            @nailbeauty
          </Button>
        </div>
      </div>
    </div>
  );
}
