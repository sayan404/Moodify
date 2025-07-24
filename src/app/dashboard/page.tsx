import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  useEffect(() => {
    redirect("/dashboard/create");
  }, []);
  return null;
}
