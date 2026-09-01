"use client";

import * as React from "react";
import { SITE_CONFIG, TARGET_REGIONS } from "@/lib/constants";
import { getFaqs } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from "lucide-react";

export function ContactFormSection() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [ticketId, setTicketId] = React.useState("");
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(0);
  const { language, t } = useLanguage();
  const isAr = language === 'ar';
  const faqs = getFaqs();

  const [formData, setFormData] = React.useState({
    fullName: "",
    phone: "",
    email: "",
    governorate: "أسيوط",
    inquiryType: "استفسار عن برنامج تدريبي",
    message: "",
  });

  const inquiryTypes = [
    { ar: "استفسار عن برنامج تدريبي", en: "Training Program Inquiry" },
    { ar: "استشارة لتحديد المسار الأنسب لمستواي", en: "Career & Level Consultation" },
    { ar: "طلب شراكة أكاديمية أو تدريب مؤسسي للجامعات", en: "University / Institutional Partnership" },
    { ar: "رعاية ومنح تدريبية لشباب الصعيد", en: "Youth Training Sponsorships & Grants" },
    { ar: "استفسار عام أو اقتراح", en: "General Inquiry / Feedback" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.post<any>('/contact', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        governorate: formData.governorate,
        inquiryType: formData.inquiryType,
        message: formData.message,
      });

      const serverTicket = res.data?.ticketId || `ZH-INQ-${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketId(serverTicket);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(
        err.message || (isAr ? 'تعذر إرسال الاستفسار، يرجى المحاولة لاحقاً' : 'Failed to send inquiry, please try again')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      governorate: "أسيوط",
      inquiryType: "استفسار عن برنامج تدريبي",
      message: "",
    });
  };

  const whatsappMsg = encodeURIComponent(
    isAr
      ? `مرحباً فريق Zein Hub، قمت بتقديم استفسار بخصوص (${formData.inquiryType}) برقم تذكرة: ${ticketId}.`
      : `Hello Zein Hub, I submitted an inquiry regarding (${formData.inquiryType}) with Ticket ID: ${ticketId}.`
  );

  return (
    <div className="space-y-16">
      {/* Contact Grid: Direct Info + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Contact Info (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 sm:p-7 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl space-y-6 shadow-xl text-start">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider">
                {t.directChannelsTitle}
              </span>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                {t.contactHeaderTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.directChannelsSub}
              </p>
            </div>

            {/* Direct Info List */}
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-850">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 text-gold-500 shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">{t.officialEmail}</span>
                  <a href={`mailto:${SITE_CONFIG.email}`} className="font-bold text-slate-900 dark:text-white hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                    {SITE_CONFIG.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-850">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 text-gold-500 shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">{t.phoneAndWhatsapp}</span>
                  <a href={`tel:${SITE_CONFIG.phone}`} className="font-bold text-slate-900 dark:text-white hover:text-gold-600 dark:hover:text-gold-400 transition-colors" dir="ltr">
                    {SITE_CONFIG.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-850">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 text-gold-500 shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">{t.workingHoursTitle}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {t.workingHoursVal}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-850">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 text-gold-500 shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">{t.geoScopeTitle}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {t.geoScopeVal}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp CTA Button */}
            <div className="pt-2">
              <a
                href={`https://wa.me/201000000000?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold py-3.5 gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>{t.whatsappChat}</span>
                </Button>
              </a>
            </div>
          </Card>
        </div>

        {/* Right Column: Interactive Form & Success State (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="p-6 sm:p-10 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl shadow-xl transition-all">
            {isSubmitted ? (
              /* Success Submission Card */
              <div className="py-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 shadow-md">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {t.contactSuccessTitle}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t.contactSuccessDesc}
                  </p>
                </div>

                {/* Ticket ID Box */}
                <div className="inline-block p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                    {t.ticketNumberLabel}
                  </span>
                  <span className="font-mono text-xl font-black text-gold-600 dark:text-gold-400 tracking-wider">
                    {ticketId}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                  <a
                    href={`https://wa.me/201000000000?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="border-green-600/50 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 hover:bg-green-600 hover:text-white font-bold gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{t.whatsappFastTrack}</span>
                    </Button>
                  </a>

                  <Button
                    onClick={handleReset}
                    className="bg-gold-500 hover:bg-gold-600 text-navy-950 font-black"
                  >
                    {t.sendAnotherMessage}
                  </Button>
                </div>
              </div>
            ) : (
              /* Contact Form */
              <div className="space-y-6 text-start">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-gold-700 dark:text-gold-400 text-xs font-semibold">
                    
                    <span>{t.contactFormBadge}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {t.contactFormTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.contactFormSubtitle}
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t.fullNameLabel}
                      </label>
                      <Input
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder={t.fullNamePlaceholder}
                        className="bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-gold-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t.phoneLabel}
                      </label>
                      <Input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={t.phonePlaceholder}
                        className="bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-gold-500"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Email & Governorate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t.emailLabel}
                      </label>
                      <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t.emailPlaceholder}
                        className="bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-gold-500"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t.governorateLabel}
                      </label>
                      <select
                        value={formData.governorate}
                        onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                        className="w-full h-11 rounded-lg border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 px-3 text-sm text-slate-900 dark:text-white focus:border-gold-500 focus:outline-none"
                      >
                        {TARGET_REGIONS.map((region) => (
                          <option key={region.id} value={isAr ? region.nameAr : region.nameEn} className="bg-white dark:bg-navy-950 text-slate-900 dark:text-white">
                            {isAr ? region.nameAr : region.nameEn}
                          </option>
                        ))}
                        <option value={isAr ? "محافظة أخرى" : "Other Governorate"} className="bg-white dark:bg-navy-950 text-slate-900 dark:text-white">
                          {t.otherGovernorate}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Inquiry Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t.inquiryTypeLabel}
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full h-11 rounded-lg border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 px-3 text-sm text-slate-900 dark:text-white focus:border-gold-500 focus:outline-none"
                    >
                      {inquiryTypes.map((type, idx) => (
                        <option key={idx} value={isAr ? type.ar : type.en} className="bg-white dark:bg-navy-950 text-slate-900 dark:text-white">
                          {isAr ? type.ar : type.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message Body */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t.messageLabel}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t.messagePlaceholder}
                      className="w-full rounded-lg border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-gold-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-navy-950 font-black border border-gold-400 shadow-gold-glow px-8 py-3.5 text-base gap-2 disabled:opacity-50"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{isAr ? 'جارٍ الإرسال...' : 'Sending...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{t.sendMessage}</span>
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-8 pt-8 border-t border-slate-200 dark:border-navy-800 text-start">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-gold-700 dark:text-gold-400 text-xs font-semibold">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{t.faqsBadge}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.faqsTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            const q = language === "en" && faq.questionEn ? faq.questionEn : faq.question;
            const a = language === "en" && faq.answerEn ? faq.answerEn : faq.answer;

            return (
              <Card
                key={faq.id}
                className="p-5 sm:p-6 bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-navy-800 rounded-2xl transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 text-start font-bold text-sm sm:text-base text-slate-900 dark:text-white"
                >
                  <span>{q}</span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gold-500 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <p className="mt-3 pt-3 border-t border-slate-100 dark:border-navy-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {a}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
