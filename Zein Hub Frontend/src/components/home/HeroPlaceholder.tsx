import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { ArrowLeft, Video, Mic, Award } from "lucide-react";

export function HeroPlaceholder() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-brand-50/50 via-white to-slate-50 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 border-b border-slate-200/60 dark:border-slate-800">
      <Container className="text-center max-w-4xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-900 text-xs font-semibold dark:bg-brand-950 dark:border-brand-800 dark:text-brand-300">
          
          <span>المنصة الأولى للتدريب الإعلامي الاحترافي في صعيد مصر</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-navy-950 dark:text-white leading-[1.25]">
          نبني جيلًا جديدًا من <span className="text-brand-500">صنّاع الإعلام</span> والقصص المؤثرة
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          برامج تدريبية تطبيقية في صحافة الموبايل، التقديم التلفزيوني، صناعة البودكاست، والتحقيقات الصحفية تحت إشراف نخبة من كبار الإعلاميين.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
          <Link href="/programs">
            <Button size="lg" className="shadow-lg shadow-brand-500/20 gap-2">
              <span>استكشف المسارات التدريبية</span>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg">
              عن Zein Hub
            </Button>
          </Link>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-right">
          <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">تدريب عملي ميداني</h3>
              <p className="text-xs text-slate-500 mt-0.5">تطبيقات ومشاريع إنتاج حقيقية</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">استوديوهات ومعدات حديثة</h3>
              <p className="text-xs text-slate-500 mt-0.5">محاكاة لبيئة العمل الإعلامي الفعلية</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">شهادات مهنية معتمدة</h3>
              <p className="text-xs text-slate-500 mt-0.5">توجيه وإشراف مباشر من خبراء الإعلام</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
