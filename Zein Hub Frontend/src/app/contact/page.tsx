import { ContactPageClient } from "@/components/contact/ContactPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تواصل معنا | Contact Us",
  description:
    "تواصل مع فريق Zein Hub للاستفسار عن المسارات التدريبية، طلب الاستشارات الفردية، أو التنسيق للشراكات المؤسسية والأكاديمية في صعيد مصر.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
