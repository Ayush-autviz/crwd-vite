import ProfileNavbar from "@/components/profile/ProfileNavbar";
import Footer from "@/components/Footer";
import React from "react";
import NotificationTabs from "../components/notificatons/NotificationTabs";

export default function NotificationsPage() {
  return (
    <section className="bg-white w-full ">
      <ProfileNavbar title="Notifications" />
      <NotificationTabs />
      <div className="hidden md:block md:mt-10">
        <Footer />
      </div>
    </section>
  );
}
