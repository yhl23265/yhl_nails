import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChevronLeft, Calendar, Clock, DollarSign, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function MyBookings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: bookings, isLoading, refetch } = trpc.bookings.myBookings.useQuery();
  const cancelBooking = trpc.bookings.cancel.useMutation();
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const handleCancel = async (bookingId: number) => {
    setCancelingId(bookingId);
    try {
      await cancelBooking.mutateAsync({ id: bookingId });
      toast.success("Запись отменена");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Ошибка при отмене записи");
    } finally {
      setCancelingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
        <div className="container max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-6 text-purple-700"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Вернуться
          </Button>
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  const now = new Date();
  const upcomingBookings = bookings?.filter((b) => new Date(b.startTime) > now && b.status === "confirmed") || [];
  const pastBookings = bookings?.filter((b) => new Date(b.startTime) <= now || b.status !== "confirmed") || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="container max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6 text-purple-700"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Вернуться
        </Button>

        <div className="mb-8 animate-fadeInUp">
          <h1 className="text-3xl font-bold text-slate-700 mb-2">Мои записи</h1>
          <p className="text-slate-600">Управляйте своими записями к мастеру</p>
        </div>

        {upcomingBookings.length === 0 && pastBookings.length === 0 ? (
          <Card className="bg-white shadow-soft border-purple-100">
            <CardContent className="pt-6 text-center py-12">
              <Calendar className="w-12 h-12 text-purple-200 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">У вас пока нет записей</p>
              <Button
                onClick={() => setLocation("/")}
                className="bg-gradient-to-r from-purple-400 to-pink-400"
              >
                Записаться на услугу
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {upcomingBookings.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-700">Предстоящие записи</h2>
                {upcomingBookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="bg-white shadow-soft border-purple-100 hover:shadow-lg transition-smooth"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-slate-700">
                            {booking.serviceId === 1
                              ? "Комбинированный маникюр"
                              : booking.serviceId === 2
                              ? "Пусть ногти отдохнут"
                              : booking.serviceId === 3
                              ? "Маникюр и покрытие гель-лаком"
                              : "Наращивание ногтей"}
                          </CardTitle>
                          {booking.hasNailDesign && (
                            <CardDescription className="text-pink-600 font-semibold">
                              + Дизайн ногтей
                            </CardDescription>
                          )}
                        </div>
                        <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Подтверждена
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <span>{new Date(booking.startTime).toLocaleDateString("ru-RU")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span>
                            {new Date(booking.startTime).toLocaleTimeString("ru-RU", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 col-span-2">
                          <DollarSign className="w-4 h-4 text-purple-400" />
                          <span className="font-semibold">{booking.totalPriceBeyn} BYN</span>
                        </div>
                      </div>

                      {booking.clientNotes && (
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                          <p className="text-sm text-slate-600">
                            <span className="font-semibold">Примечание:</span> {booking.clientNotes}
                          </p>
                        </div>
                      )}

                      <Button
                        variant="destructive"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelingId === booking.id}
                        className="w-full"
                      >
                        {cancelingId === booking.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Отмена...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Отменить запись
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {pastBookings.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-700">История</h2>
                {pastBookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="bg-white shadow-soft border-purple-100 opacity-75"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-slate-700">
                            {booking.serviceId === 1
                              ? "Комбинированный маникюр"
                              : booking.serviceId === 2
                              ? "Пусть ногти отдохнут"
                              : booking.serviceId === 3
                              ? "Маникюр и покрытие гель-лаком"
                              : "Наращивание ногтей"}
                          </CardTitle>
                          {booking.hasNailDesign && (
                            <CardDescription className="text-pink-600 font-semibold">
                              + Дизайн ногтей
                            </CardDescription>
                          )}
                        </div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            booking.status === "completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {booking.status === "completed" ? "Завершена" : "Отменена"}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <span>{new Date(booking.startTime).toLocaleDateString("ru-RU")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span>
                            {new Date(booking.startTime).toLocaleTimeString("ru-RU", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <DollarSign className="w-4 h-4 text-purple-400" />
                          <span className="font-semibold">{booking.totalPriceBeyn} BYN</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
