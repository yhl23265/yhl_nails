import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChevronLeft, Calendar, Users, DollarSign, Plus, Edit2, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

type AdminTab = "bookings" | "services" | "schedule" | "stats";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>("bookings");
  const [editingService, setEditingService] = useState<any>(null);

  const { data: bookings, isLoading: bookingsLoading } = trpc.bookings.allBookings.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const { data: services, isLoading: servicesLoading } = trpc.services.list.useQuery();
  const { data: schedule } = trpc.schedule.get.useQuery();
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const { data: stats } = trpc.stats.summary.useQuery(
    { startDate, endDate },
    {
      enabled: user?.role === "admin",
    }
  );

  const cancelBooking = trpc.bookings.cancel.useMutation();

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
        <div className="container max-w-4xl">
          <Card className="bg-white shadow-soft border-purple-100">
            <CardContent className="pt-6 text-center py-12">
              <p className="text-slate-600 mb-4">У вас нет доступа к админ-панели</p>
              <Button onClick={() => setLocation("/")} className="bg-gradient-to-r from-purple-400 to-pink-400">
                Вернуться на главную
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleDeleteService = async (serviceId: number) => {
    toast.info("Функция удаления услуг будет доступна в следующей версии");
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("Отменить запись?")) return;
    try {
      await cancelBooking.mutateAsync({ id: bookingId });
      toast.success("Запись отменена");
    } catch (error: any) {
      toast.error(error.message || "Ошибка при отмене");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="container max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6 text-purple-700"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Вернуться
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-700 mb-2">Админ-панель</h1>
          <p className="text-slate-600">Управление записями, услугами и расписанием</p>
        </div>

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-white shadow-soft border-purple-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Всего записей</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalBookings}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>



            <Card className="bg-white shadow-soft border-purple-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Доход (BYN)</p>
                    <p className="text-3xl font-bold text-green-600">{stats.totalRevenue}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-purple-100">
          {(["bookings", "services", "schedule", "stats"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === tab
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-slate-600 hover:text-purple-600"
              }`}
            >
              {tab === "bookings" && "Записи"}
              {tab === "services" && "Услуги"}
              {tab === "schedule" && "Расписание"}
              {tab === "stats" && "Статистика"}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {bookingsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !bookings || bookings.length === 0 ? (
              <Card className="bg-white shadow-soft border-purple-100">
                <CardContent className="pt-6 text-center py-8">
                  <p className="text-slate-600">Нет записей</p>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id} className="bg-white shadow-soft border-purple-100">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold text-slate-700">Клиент #{booking.clientId}</p>
                        <p className="text-sm text-slate-600">
                          {new Date(booking.startTime).toLocaleString("ru-RU")}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {booking.status === "confirmed" ? "Подтверждена" : "Отменена"}
                      </span>
                    </div>
                    <p className="text-slate-700 mb-4">{booking.totalPriceBeyn} BYN</p>
                    {booking.status === "confirmed" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Отменить
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <div className="space-y-4">
            <Button className="bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
              <Plus className="w-4 h-4 mr-2" />
              Добавить услугу
            </Button>

            {servicesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !services || services.length === 0 ? (
              <Card className="bg-white shadow-soft border-purple-100">
                <CardContent className="pt-6 text-center py-8">
                  <p className="text-slate-600">Нет услуг</p>
                </CardContent>
              </Card>
            ) : (
              services.map((service) => (
                <Card key={service.id} className="bg-white shadow-soft border-purple-100">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold text-slate-700">{service.name}</p>
                        <p className="text-sm text-slate-600">{service.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{service.priceBeyn} BYN</p>
                        <p className="text-sm text-slate-600">
                          {Math.floor(service.durationMinutes / 60)}ч {service.durationMinutes % 60}м
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingService(service)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Редактировать
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <Card className="bg-white shadow-soft border-purple-100">
            <CardHeader>
              <CardTitle className="text-slate-700">Расписание работы</CardTitle>
              <CardDescription className="text-slate-600">
                Настройте дни и часы работы
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schedule ? (
                <div className="space-y-4">
                  {Object.entries(schedule.weekSchedule as any).map(([day, daySchedule]: any) => {
                    const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
                    return (
                      <div key={day} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                        <span className="font-semibold text-slate-700">{dayNames[day]}</span>
                        <span className="text-slate-600">
                          {daySchedule.enabled
                            ? `${daySchedule.startTime} - ${daySchedule.endTime}`
                            : "Выходной"}
                        </span>
                      </div>
                    );
                  })}
                  <Button className="w-full bg-gradient-to-r from-purple-400 to-pink-400 mt-4">
                    Редактировать расписание
                  </Button>
                </div>
              ) : (
                <p className="text-slate-600">Расписание не загружено</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <Card className="bg-white shadow-soft border-purple-100">
            <CardHeader>
              <CardTitle className="text-slate-700">Статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {stats && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600">Всего записей</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.totalBookings}</p>
                    </div>
   
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-2">Записи по дням</p>
                    <div className="space-y-1">
                      {Object.entries(stats.bookingsByDay).map(([date, count]) => (
                        <div key={date} className="flex justify-between text-slate-700">
                          <span>{date}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
