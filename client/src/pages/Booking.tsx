import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ChevronLeft, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type BookingStep = "service" | "date" | "time" | "confirm";

export default function Booking() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const serviceId = parseInt(new URLSearchParams(searchParams).get("serviceId") || "0");

  const [step, setStep] = useState<BookingStep>("service");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [hasNailDesign, setHasNailDesign] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: services } = trpc.services.list.useQuery();
  const { data: schedule } = trpc.schedule.get.useQuery();
  const createBooking = trpc.bookings.create.useMutation();

  const selectedService = useMemo(
    () => services?.find((s) => s.id === serviceId),
    [services, serviceId]
  );

  // Generate available time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate || !schedule || !selectedService) return [];

    const dayOfWeek = selectedDate.getDay();
    const daySchedule = (schedule.weekSchedule as any)?.[dayOfWeek];

    if (!daySchedule || !daySchedule.enabled) return [];

    const slots: string[] = [];
    const [startHour, startMin] = daySchedule.startTime.split(":").map(Number);
    const [endHour, endMin] = daySchedule.endTime.split(":").map(Number);
    const [breakStart, breakEnd] = (schedule.breakStartTime && schedule.breakEndTime)
      ? [schedule.breakStartTime.split(":").map(Number), schedule.breakEndTime.split(":").map(Number)]
      : [null, null];

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const breakStartMinutes = breakStart ? breakStart[0] * 60 + breakStart[1] : null;
    const breakEndMinutes = breakEnd ? breakEnd[0] * 60 + breakEnd[1] : null;

    const durationMinutes = selectedService.durationMinutes;

    for (let time = startMinutes; time + durationMinutes <= endMinutes; time += 30) {
      // Skip if slot overlaps with break
      if (breakStartMinutes !== null && breakEndMinutes !== null) {
        if (!(time + durationMinutes <= breakStartMinutes || time >= breakEndMinutes)) {
          continue;
        }
      }

      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      slots.push(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
    }

    return slots;
  }, [selectedDate, schedule, selectedService]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("confirm");
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error("Пожалуйста, выберите все параметры");
      return;
    }

    setIsSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + selectedService.durationMinutes);

      await createBooking.mutateAsync({
        serviceId: selectedService.id,
        startTime,
        endTime,
        hasNailDesign,
      });

      toast.success("Запись успешно создана!");
      setLocation("/my-bookings");
    } catch (error: any) {
      toast.error(error.message || "Ошибка при создании записи");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
        <div className="container max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-6 text-purple-700"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Вернуться
          </Button>
          <Card className="bg-white shadow-soft border-purple-100">
            <CardContent className="pt-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-slate-600 mt-4">Загрузка...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalPrice = parseFloat(selectedService.priceBeyn.toString()) + (hasNailDesign ? 5 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="container max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6 text-purple-700"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Вернуться
        </Button>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          {(["service", "date", "time", "confirm"] as const).map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                ["service", "date", "time", "confirm"].indexOf(step) >= i
                  ? "bg-gradient-to-r from-purple-400 to-pink-400"
                  : "bg-purple-100"
              }`}
            />
          ))}
        </div>

        <Card className="bg-white shadow-soft border-purple-100">
          <CardHeader>
            <CardTitle className="text-slate-700">{selectedService.name}</CardTitle>
            <CardDescription className="text-slate-600">{selectedService.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === "service" && (
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <p className="text-sm text-slate-600">Длительность</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.floor(selectedService.durationMinutes / 60)}ч {selectedService.durationMinutes % 60}м
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <p className="text-sm text-slate-600">Стоимость</p>
                  <p className="text-2xl font-bold text-purple-600">{selectedService.priceBeyn} BYN</p>
                </div>
                <Button
                  onClick={() => setStep("date")}
                  className="w-full bg-gradient-to-r from-purple-400 to-pink-400"
                >
                  Выбрать дату
                </Button>
              </div>
            )}

            {step === "date" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 font-semibold">Выберите дату</p>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i);

                    const daySchedule = (schedule?.weekSchedule as any)?.[date.getDay()];
                    const isAvailable = daySchedule?.enabled;

                    return (
                      <button
                        key={i}
                        onClick={() => isAvailable && handleDateSelect(date)}
                        disabled={!isAvailable}
                        className={`p-2 rounded-lg text-center transition-colors ${
                          selectedDate?.toDateString() === date.toDateString()
                            ? "bg-gradient-to-r from-purple-400 to-pink-400 text-white"
                            : isAvailable
                            ? "bg-purple-50 border border-purple-100 hover:bg-purple-100"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <p className="text-xs font-semibold">{date.toLocaleDateString("ru-RU", { weekday: "short" })}</p>
                        <p className="text-lg font-bold">{date.getDate()}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === "time" && selectedDate && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 font-semibold">
                  Выберите время для {selectedDate.toLocaleDateString("ru-RU")}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`p-3 rounded-lg text-center transition-colors font-semibold ${
                        selectedTime === time
                          ? "bg-gradient-to-r from-purple-400 to-pink-400 text-white"
                          : "bg-purple-50 border border-purple-100 hover:bg-purple-100 text-slate-700"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === "confirm" && (
              <div className="space-y-6">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Услуга</span>
                    <span className="font-semibold text-slate-700">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Дата</span>
                    <span className="font-semibold text-slate-700">
                      {selectedDate?.toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Время</span>
                    <span className="font-semibold text-slate-700">{selectedTime}</span>
                  </div>
                  <div className="border-t border-purple-200 pt-3 flex justify-between">
                    <span className="text-slate-600">Итого</span>
                    <span className="text-xl font-bold text-purple-600">{totalPrice.toFixed(2)} BYN</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-pink-50 rounded-lg p-4 border border-pink-100">
                  <Checkbox
                    id="nailDesign"
                    checked={hasNailDesign}
                    onCheckedChange={(checked) => setHasNailDesign(checked as boolean)}
                  />
                  <label htmlFor="nailDesign" className="cursor-pointer flex-1">
                    <p className="font-semibold text-slate-700">Добавить дизайн ногтей</p>
                    <p className="text-sm text-slate-600">+5 BYN</p>
                  </label>
                </div>

                <Button
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-400 to-pink-400"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Создание записи...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Подтвердить запись
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
