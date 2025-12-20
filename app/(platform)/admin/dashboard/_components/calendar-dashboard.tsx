import { CalendarDesktop, CalendarMobile } from "@/components/calendar";


export function DashboardCalendar() {
  return (
    <>
      {/* Desktop: lịch đầy đủ */}
      <div className="hidden lg:block">
        <CalendarDesktop />
      </div>

      {/* Mobile / Tablet: dải ngang */}
      <div className="block lg:hidden">
        <CalendarMobile />
      </div>
    </>
  );
}
