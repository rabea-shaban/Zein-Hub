import { connectDB } from '../src/config/db.config.js';
import { ContactMessage, ContactMessageStatus } from '../src/models/contactMessage.model.js';

const sampleMessages = [
  {
    ticketId: 'ZH-INQ-1082',
    fullName: 'محمود عبد الرحيم أحمد',
    email: 'mahmoud.qena@gmail.com',
    phone: '+201098765432',
    governorate: 'قنا',
    inquiryType: 'استفسار عن برنامج تدريبي',
    message: 'أرغب في الاستفسار عن مواعيد الدفعة القادمة لبرنامج التعليق الصوتي والفوكاليز الرقمي في مقر استوديو قنا، وهل تتوفر تدريبات مسائية للموظفين؟',
    status: ContactMessageStatus.NEW,
  },
  {
    ticketId: 'ZH-INQ-2419',
    fullName: 'د. منى عبد الكريم الهواري',
    email: 'm.elhawary@aun.edu.eg',
    phone: '+201123456789',
    governorate: 'أسيوط',
    inquiryType: 'طلب شراكة أكاديمية أو تدريب مؤسسي للجامعات',
    message: 'نود بحث إمكانية تنظيم ورشة تدريبية متخصصة لطلاب كلية الإعلام بجامعة أسيوط حول صحافة الذكاء الاصطناعي وكشف التزييف العميق بالتنسيق مع استوديوهات Zein Hub.',
    status: ContactMessageStatus.IN_PROGRESS,
    adminNotes: 'تم التواصل هاتفياً لترتيب اجتماع مع عميد الكلية الأسبوع القادم.',
  },
  {
    ticketId: 'ZH-INQ-3591',
    fullName: 'كريم حسني الأقصري',
    email: 'kareem.luxor@outlook.com',
    phone: '+201011223344',
    governorate: 'الأقصر',
    inquiryType: 'استشارة لتحديد المسار الأنسب لمستواي',
    message: 'لدي خبرة سنة في إعداد التقارير الميدانية بالأقصر، وأحتاج استشارة لاختيار ما إذا كان الأنسب لي دبلوم التقديم والإلقاء الإخباري أم صحافة الموبايل المؤتمتة.',
    status: ContactMessageStatus.REPLIED,
    adminNotes: 'تم إرسال التوجيه المهني وروابط تفاصيل المحتوى عبر واتساب والبريد.',
    repliedAt: new Date(Date.now() - 24 * 3600 * 1000),
  },
  {
    ticketId: 'ZH-INQ-4820',
    fullName: 'هند محمد سوهاج',
    email: 'hend.sohag@gmail.com',
    phone: '+201288990011',
    governorate: 'سوهاج',
    inquiryType: 'رعاية ومنح تدريبية لشباب الصعيد',
    message: 'أنا خريجة إعلام سوهاج بتقدير امتياز، هل تتوفر منح تدريبية أو خصومات للطلبة المتفوقين في برامج إنتاج البودكاست؟',
    status: ContactMessageStatus.NEW,
  },
];

async function seed() {
  await connectDB();
  console.log('🌱 Seeding Contact Messages...');

  for (const item of sampleMessages) {
    await ContactMessage.findOneAndUpdate(
      { ticketId: item.ticketId },
      item,
      { upsert: true, new: true }
    );
    console.log(`✅ Seeded message: ${item.ticketId} (${item.fullName})`);
  }

  console.log('🎉 Contact Messages Seeded Successfully!');
  process.exit(0);
}

seed();
