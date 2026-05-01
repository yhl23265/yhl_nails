import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Calendar, Users } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: services, isLoading: servicesLoading } = trpc.services.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6 animate-fadeInUp">
          <div className="space-y-2">
            <Sparkles className="w-12 h-12 mx-auto text-purple-400" />
            <h1 className="text-4xl font-bold text-slate-700">Nail Beauty</h1>
            <p className="text-slate-600">Запишитесь на маникюр прямо сейчас</p>
          </div>

          <div className="space-y-3 text-left bg-white rounded-xl p-6 shadow-soft">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-700">Удобное время</p>
                <p className="text-sm text-slate-600">Выбирайте удобное для вас время</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-700">Качественный сервис</p>
                <p className="text-sm text-slate-600">Профессиональный маникюр и дизайн</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-700">Персональный подход</p>
                <p className="text-sm text-slate-600">Индивидуальная работа с каждым клиентом</p>
              </div>
            </div>
          </div>

          <a href={getLoginUrl()}>
            <Button size="lg" className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:shadow-lg">
              Войти и записаться
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="container max-w-4xl">
        <div className="text-center mb-12 animate-fadeInUp">
          <h1 className="text-4xl font-bold text-slate-700 mb-2">Добро пожаловать, {user?.name}!</h1>
          <p className="text-slate-600">Выберите услугу для записи</p>
        </div>

        {servicesLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !services || services.length === 0 ? (
          <Card className="bg-white shadow-soft border-purple-100">
            <CardContent className="pt-6 text-center">
              <p className="text-slate-600">Услуги пока не загружены. Пожалуйста, попробуйте позже.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className="bg-white shadow-soft border-purple-100 hover:shadow-lg transition-smooth cursor-pointer group"
                onClick={() => setLocation(`/booking?serviceId=${service.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-slate-700 group-hover:text-purple-600 transition-colors">
                    {service.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-slate-600">Длительность</p>
                      <p className="text-lg font-semibold text-slate-700">
                        {Math.floor(service.durationMinutes / 60)}ч {service.durationMinutes % 60}м
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Цена</p>
                      <p className="text-2xl font-bold text-purple-600">{service.priceBeyn} BYN</p>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:shadow-lg">
                    Выбрать
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 text-center space-y-4">
          <Button
            variant="outline"
            onClick={() => setLocation("/my-bookings")}
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            Мои записи
          </Button>
        </div>
      </div>
    </div>
  );
}
