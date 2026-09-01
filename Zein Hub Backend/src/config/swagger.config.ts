import { ENV } from './env.config.js';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Zein Hub Media LMS — REST API Documentation',
    version: '1.0.0',
    description: `
# 🎙️ Zein Hub Media LMS — Backend API Specifications
منظومة واجهات برمجة التطبيقات المتخصصة في التدريب والإنتاج الإعلامي والصوتي والتقنيات الرقمية (Voice-Over, Smart Podcasting, Audio Production, Media Presentation).

---

### 🔐 طرق المصادقة المعتمدة (Authentication Modes):
1. **httpOnly Secure Cookies (الموصى بها للـ Web & Browsers):**
   - \`zh_access_token\` (صلاحية 15 دقيقة)
   - \`zh_refresh_token\` (صلاحية 7 أيام)
   - يتم إرسالها واستقبالها تلقائياً مع المتصفح.
2. **Authorization Header (لتطبيقات الموبايل وأدوات الـ API):**
   - \`Bearer <accessToken>\`

---

### 🛡️ مصفوفة الصلاحيات (Role-Based Access Control):
- **Super Admin:** صلاحيات إدارية شاملة على المنصة بالكامل.
- **Instructor:** إدارة وتقييم وتحليلات البرامج المسندة إليه فقط (\`assignedPrograms\`).
- **Student:** الوصول للدروس والاختبارات والتكليفات والشهادات الخاصة بالبرامج المشترك بها (\`active enrollment\`).
- **Public / Guest:** تصفح المسارات والبرامج المفتوحة والتحقق من الشهادات والآراء المعتمدة.
    `,
    contact: {
      name: 'Zein Hub Engineering Team',
      email: 'dev@zeinhub.com',
      url: 'https://zeinhub.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${ENV.PORT}/api/v1`,
      description: 'Local Development Server',
    },
    {
      url: 'https://api.zeinhub.com/api/v1',
      description: 'Production API Server',
    },
  ],
  tags: [
    { name: '01. Authentication', description: 'التسجيل، تسجيل الدخول، تجديد الجلسة عبر الكوكيز، وتسجيل الخروج' },
    { name: '02. Tracks / Categories', description: 'إدارة المسارات التدريبية والتخصصات' },
    { name: '03. Programs', description: 'دليل البرامج التدريبية، الحالات، وإسناد المحاضرين' },
    { name: '04. Instructors', description: 'الملف الشخصي للمحاضر، لوحة التحكم، وإدارة المحاضرين' },
    { name: '05. Applications & Enrollments', description: 'طلبات التقديم ومراجعة الإدارة واشتراكات الطلاب' },
    { name: '06. Course Modules & Lessons', description: 'المناهج والوحدات والدروس وحماية الوسائط المدفوعة' },
    { name: '07. Quizzes & Questions', description: 'الاختبارات القصيرة، التصحيح الآلي، والتشفير ضد الغش' },
    { name: '08. Practical Assignments & Grading', description: 'التكليفات العملية الصوتية والمرئية وتصحيح المحاضر' },
    { name: '09. Progress & Grade Tracking', description: 'تتبع نسب الإنجاز واحتساب المعدل الأكاديمي والتخرج' },
    { name: '10. Certificates & Verification', description: 'إصدار الشهادات الرقمية المعتمدة والتحقق العام' },
    { name: '11. Live Interactive Sessions', description: 'الجلسات التفاعلية المباشرة وحماية روابط الاجتماعات' },
    { name: '12. Attendance Management', description: 'رصد الحضور والغياب وحساب معدلات التفاعل' },
    { name: '13. Reviews & Testimonials', description: 'تقييمات الطلاب ونظام النجوم وطابور التدقيق والاعتماد' },
    { name: '14. Admin Dashboard & Analytics', description: 'مؤشرات الأداء KPIs، تحليلات التجميع، والتقارير التفصيلية' },
    { name: '15. Health & System', description: 'فحص جاهزية الخادم وقاعدة البيانات' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'zh_access_token',
        description: 'httpOnly access token cookie set upon successful login or registration.',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Access Token passed in Authorization header for API testing/mobile clients.',
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication required or token expired',
        content: {
          'application/json': {
            example: {
              success: false,
              statusCode: 401,
              errorCode: 'UNAUTHORIZED',
              message: 'Authentication required: Missing access token or cookie session',
              errors: [],
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Access denied due to insufficient permissions or unassigned program',
        content: {
          'application/json': {
            example: {
              success: false,
              statusCode: 403,
              errorCode: 'FORBIDDEN',
              message: 'Forbidden: Insufficient role permissions or unassigned program',
              errors: [],
            },
          },
        },
      },
      ValidationError: {
        description: 'Input validation failed',
        content: {
          'application/json': {
            example: {
              success: false,
              statusCode: 400,
              errorCode: 'VALIDATION_FAILED',
              message: 'Validation Error',
              errors: ['Full name must be at least 2 characters long'],
            },
          },
        },
      },
    },
  },
  paths: {
    // =========================================================================
    // 01. AUTHENTICATION
    // =========================================================================
    '/auth/register': {
      post: {
        tags: ['01. Authentication'],
        summary: 'تسجيل حساب طالب جديد (Register Student)',
        description: 'إنشاء حساب طالب وتثبيت كوكيز المصادقة الآمنة httpOnly تلقائياً في المتصفح.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password'],
                properties: {
                  fullName: { type: 'string', example: 'Ahmed Samy' },
                  email: { type: 'string', example: 'ahmed.samy@example.com' },
                  password: { type: 'string', example: 'StudentPass123!' },
                  phone: { type: 'string', example: '+201012345678' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Student registration successful',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 201,
                  message: 'Student registered successfully',
                  data: {
                    user: {
                      id: '6a966961a065f0074a856190',
                      fullName: 'Ahmed Samy',
                      email: 'ahmed.samy@example.com',
                      role: 'student',
                      avatarUrl: null,
                      isActive: true,
                    },
                    tokens: {
                      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          409: {
            description: 'Email already in use',
            content: {
              'application/json': {
                example: {
                  success: false,
                  statusCode: 409,
                  errorCode: 'EMAIL_ALREADY_EXISTS',
                  message: 'User with this email already exists',
                  errors: [],
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['01. Authentication'],
        summary: 'تسجيل الدخول وتثبيت الكوكيز (Login User)',
        description: 'التحقق من بيانات المستخدم وإصدار وتثبيت كوكيز zh_access_token و zh_refresh_token الآمنة.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@zeinhub.com' },
                  password: { type: 'string', example: 'Admin@ZeinHub2026!' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            headers: {
              'Set-Cookie': {
                schema: { type: 'string' },
                description: 'Sets zh_access_token and zh_refresh_token httpOnly cookies',
              },
            },
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  message: 'Login successful',
                  data: {
                    user: {
                      id: '6a95ab62d2f46d39d6b86c71',
                      fullName: 'Super Admin',
                      email: 'admin@zeinhub.com',
                      role: 'super_admin',
                      isActive: true,
                    },
                    tokens: {
                      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                example: {
                  success: false,
                  statusCode: 401,
                  errorCode: 'INVALID_CREDENTIALS',
                  message: 'Invalid email or password',
                  errors: [],
                },
              },
            },
          },
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['01. Authentication'],
        summary: 'تجديد الجلسة والتوكن (Refresh Access Token)',
        description: 'تجديد الـ Access Token تلقائياً بقراءة كوكيز zh_refresh_token دون الحاجة لتمرير body.',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string', description: 'اختياري: يمكن تمريره في الـ body أو الاعتماد على الكوكيز تلقائياً' },
                },
              },
              example: {},
            },
          },
        },
        responses: {
          200: {
            description: 'Access token refreshed successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  message: 'Access token refreshed successfully',
                  data: {
                    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['01. Authentication'],
        summary: 'تسجيل الخروج وتفريغ الكوكيز (Logout)',
        description: 'حذف وتفريغ جميع كوكيز المصادقة فوراً من المتصفح وإنهاء الجلسة.',
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  message: 'Logged out successfully and auth session cleared',
                  data: null,
                },
              },
            },
          },
        },
      },
    },
    '/auth/profile': {
      get: {
        tags: ['01. Authentication'],
        summary: 'الملف الشخصي للمستخدم الحالي (Get Current Profile)',
        description: 'استرجاع بيانات المستخدم المسجل بناءً على كوكيز الجلسة الحالية.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Profile retrieved successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  message: 'User profile retrieved successfully',
                  data: {
                    user: {
                      id: '6a95ab62d2f46d39d6b86c71',
                      fullName: 'Super Admin',
                      email: 'admin@zeinhub.com',
                      role: 'super_admin',
                      avatarUrl: null,
                      isActive: true,
                      createdAt: '2026-08-31T15:00:00.000Z',
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },

    // =========================================================================
    // 02. TRACKS / CATEGORIES
    // =========================================================================
    '/tracks': {
      get: {
        tags: ['02. Tracks / Categories'],
        summary: 'استعراض كافة المسارات التدريبية (Get All Tracks)',
        responses: {
          200: {
            description: 'Tracks retrieved successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  message: 'Tracks retrieved successfully',
                  data: [
                    {
                      _id: '6a95ab62d2f46d39d6b86c72',
                      nameAr: 'مسار التقديم التلفزيوني والإذاعي',
                      nameEn: 'Media & TV Presentation Track',
                      slug: 'media-presentation',
                      descriptionAr: 'تدريب شامل على التقديم الإخباري والحواري وصناعة البودكاست.',
                      order: 1,
                      isActive: true,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['02. Tracks / Categories'],
        summary: 'إنشاء مسار تدريبي جديد (Create Track - Super Admin)',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nameAr', 'nameEn', 'slug'],
                properties: {
                  nameAr: { type: 'string', example: 'مسار الإنتاج الصوتي والهندسة' },
                  nameEn: { type: 'string', example: 'Audio Production & Engineering Track' },
                  slug: { type: 'string', example: 'audio-production-track' },
                  descriptionAr: { type: 'string', example: 'تخصصات هندسة الصوت والمكساج والدوبلاج.' },
                  descriptionEn: { type: 'string', example: 'Audio engineering, mixing and dubbing masterclass.' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Track created successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 201,
                  message: 'Track created successfully',
                  data: {
                    _id: '6a966961a065f0074a856195',
                    nameAr: 'مسار الإنتاج الصوتي والهندسة',
                    nameEn: 'Audio Production & Engineering Track',
                    slug: 'audio-production-track',
                  },
                },
              },
            },
          },
          403: { $ref: '#/components/responses/ForbiddenError' },
        },
      },
    },

    // =========================================================================
    // 03. PROGRAMS
    // =========================================================================
    '/programs': {
      get: {
        tags: ['03. Programs'],
        summary: 'دليل البرامج التدريبية المتاحة (Get All Programs)',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['open', 'coming-soon', 'closed'] } },
          { name: 'trackId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Programs retrieved successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  message: 'Programs retrieved successfully',
                  data: [
                    {
                      _id: '6a95ab62d2f46d39d6b86c73',
                      titleAr: 'دبلوم التعليق الصوتي والفوكاليز الرقمي',
                      titleEn: 'Voice-Over & Digital Vocalise',
                      slug: 'voice-over-digital-vocalise',
                      status: 'open',
                      level: 'intermediate',
                      price: 3500,
                      durationHours: 36,
                      durationWeeks: 6,
                      isFeatured: true,
                    },
                  ],
                  meta: { page: 1, limit: 10, total: 13, totalPages: 2 },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['03. Programs'],
        summary: 'إنشاء برنامج تدريبي جديد (Create Program - Super Admin)',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['titleAr', 'titleEn', 'slug', 'trackId', 'descriptionAr', 'descriptionEn', 'durationHours', 'durationWeeks', 'level', 'price'],
                properties: {
                  titleAr: { type: 'string', example: 'برنامج هندسة الصوت والمكساج المتقدم' },
                  titleEn: { type: 'string', example: 'Advanced Audio Engineering & Mixing' },
                  slug: { type: 'string', example: 'advanced-audio-engineering-mixing' },
                  trackId: { type: 'string', example: '6a95ab62d2f46d39d6b86c72' },
                  descriptionAr: { type: 'string', example: 'تدريب عملي على برامج Pro Tools واستوديوهات الصوت.' },
                  descriptionEn: { type: 'string', example: 'Hands-on training with Pro Tools and studio mastering.' },
                  durationHours: { type: 'number', example: 40 },
                  durationWeeks: { type: 'number', example: 8 },
                  level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], example: 'intermediate' },
                  price: { type: 'number', example: 4500 },
                  status: { type: 'string', enum: ['open', 'coming-soon', 'closed'], example: 'open' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Program created successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 201,
                  message: 'Program created successfully',
                  data: {
                    _id: '6a966961a065f0074a856199',
                    titleAr: 'برنامج هندسة الصوت والمكساج المتقدم',
                    slug: 'advanced-audio-engineering-mixing',
                    status: 'open',
                  },
                },
              },
            },
          },
          403: { $ref: '#/components/responses/ForbiddenError' },
        },
      },
    },
    '/programs/{idOrSlug}': {
      get: {
        tags: ['03. Programs'],
        summary: 'تفاصيل برنامج تدريبي بالـ ID أو الـ Slug',
        parameters: [{ name: 'idOrSlug', in: 'path', required: true, schema: { type: 'string' }, example: 'voice-over-digital-vocalise' }],
        responses: {
          200: {
            description: 'Program details retrieved',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  data: {
                    _id: '6a95ab62d2f46d39d6b86c73',
                    titleAr: 'دبلوم التعليق الصوتي والفوكاليز الرقمي',
                    titleEn: 'Voice-Over & Digital Vocalise',
                    slug: 'voice-over-digital-vocalise',
                    track: { nameAr: 'مسار التقديم التلفزيوني والإذاعي' },
                    instructors: [{ fullName: 'Dr. Tarek Voice' }],
                  },
                },
              },
            },
          },
          404: { description: 'Program not found' },
        },
      },
    },

    // =========================================================================
    // 04. INSTRUCTORS
    // =========================================================================
    '/instructors': {
      post: {
        tags: ['04. Instructors'],
        summary: 'إنشاء حساب وتعيين محاضر جديد (Create Instructor - Super Admin)',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password', 'trackId'],
                properties: {
                  fullName: { type: 'string', example: 'Dr. Tarek Voice' },
                  email: { type: 'string', example: 'tarek.voice@zeinhub.com' },
                  password: { type: 'string', example: 'InstructorPass123!' },
                  phone: { type: 'string', example: '+201099998888' },
                  trackId: { type: 'string', example: '6a95ab62d2f46d39d6b86c72' },
                  specializations: { type: 'array', items: { type: 'string' }, example: ['Voice Over', 'Vocal Acoustics'] },
                  bio: { type: 'string', example: 'خبير إذاعي ومدرب صوتي معتمد لأكثر من 15 عاماً.' },
                  assignedPrograms: { type: 'array', items: { type: 'string' }, example: ['6a95ab62d2f46d39d6b86c73'] },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Instructor created successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 201,
                  message: 'Instructor created successfully',
                  data: {
                    user: { id: '6a966961a065f0074a856191', fullName: 'Dr. Tarek Voice', email: 'tarek.voice@zeinhub.com', role: 'instructor' },
                    profile: { specializations: ['Voice Over', 'Vocal Acoustics'], assignedPrograms: ['6a95ab62d2f46d39d6b86c73'] },
                  },
                },
              },
            },
          },
          403: { $ref: '#/components/responses/ForbiddenError' },
        },
      },
    },
    '/instructors/me/profile': {
      get: {
        tags: ['04. Instructors'],
        summary: 'استعراض الملف الشخصي للمحاضر الحالي (Get My Profile)',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Instructor profile retrieved',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  data: {
                    user: {
                      id: '6a966961a065f0074a856191',
                      fullName: 'Dr. Tarek Voice',
                      email: 'tarek.voice@zeinhub.com',
                      phone: '+201099998888',
                      role: 'instructor',
                      avatarUrl: 'https://cdn.zeinhub.com/avatars/dr_tarek.jpg',
                    },
                    instructorProfile: {
                      bio: 'خبير إذاعي ومدرب صوتي معتمد لأكثر من 15 عاماً.',
                      specializations: ['Voice Over', 'Vocal Acoustics'],
                      experienceYears: 15,
                      photoUrl: 'https://cdn.zeinhub.com/avatars/dr_tarek.jpg',
                      reelUrl: 'https://cdn.zeinhub.com/reels/dr_tarek_reel.mp4',
                      socialLinks: {
                        linkedin: 'https://linkedin.com/in/drtarekvoice',
                        youtube: 'https://youtube.com/@drtarekvoice',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['04. Instructors'],
        summary: 'تعديل بيانات المحاضر الشخصية والصورة وكلمة المرور (Update My Profile & Password)',
        description: 'يتيح للمحاضر تعديل بياناته الشخصية مثل الصورة، النبذة، روابط التواصل، وسنوات الخبرة وتغيير كلمة المرور بحرية.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string', example: 'Dr. Tarek Voice' },
                  phone: { type: 'string', example: '+201099998888' },
                  avatarUrl: { type: 'string', example: 'https://cdn.zeinhub.com/avatars/dr_tarek.jpg' },
                  photoUrl: { type: 'string', example: 'https://cdn.zeinhub.com/avatars/dr_tarek.jpg' },
                  currentPassword: { type: 'string', example: 'OldPassword123!', description: 'اختياري للتحقق من كلمة المرور الحالية' },
                  newPassword: { type: 'string', example: 'NewSecretPass2026!', description: 'كلمة المرور الجديدة (8 أحرف على الأقل)' },
                  bio: { type: 'string', example: 'خبير إذاعي ومعلق صوتي معتمد لدى كبرى القنوات الفضائية والمنصات الرقمية.' },
                  specializations: { type: 'array', items: { type: 'string' }, example: ['Voice Over', 'Vocal Acoustics', 'Smart Podcasting'] },
                  experienceYears: { type: 'number', example: 16 },
                  reelUrl: { type: 'string', example: 'https://cdn.zeinhub.com/reels/dr_tarek_showreel.mp4' },
                  socialLinks: {
                    type: 'object',
                    properties: {
                      linkedin: { type: 'string', example: 'https://linkedin.com/in/drtarekvoice' },
                      twitter: { type: 'string', example: 'https://twitter.com/drtarekvoice' },
                      youtube: { type: 'string', example: 'https://youtube.com/@drtarekvoice' },
                      portfolio: { type: 'string', example: 'https://drtarekvoice.com' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Profile updated successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  message: 'Instructor profile updated successfully',
                  data: {
                    user: {
                      id: '6a966961a065f0074a856191',
                      fullName: 'Dr. Tarek Voice',
                      avatarUrl: 'https://cdn.zeinhub.com/avatars/dr_tarek.jpg',
                    },
                    instructorProfile: {
                      bio: 'خبير إذاعي ومعلق صوتي معتمد...',
                      specializations: ['Voice Over', 'Vocal Acoustics', 'Smart Podcasting'],
                      experienceYears: 16,
                      photoUrl: 'https://cdn.zeinhub.com/avatars/dr_tarek.jpg',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/instructors/me/dashboard': {
      get: {
        tags: ['04. Instructors'],
        summary: 'لوحة تحكم المحاضر (Instructor Dashboard)',
        description: 'استرجاع إحصائيات البرامج والطلاب المسندين للمحاضر الحالي.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard metrics',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  data: {
                    assignedProgramsCount: 2,
                    totalEnrolledStudents: 45,
                    pendingSubmissionsCount: 3,
                    upcomingLiveSessionsCount: 1,
                  },
                },
              },
            },
          },
          403: { $ref: '#/components/responses/ForbiddenError' },
        },
      },
    },

    // =========================================================================
    // 05. APPLICATIONS & ENROLLMENTS
    // =========================================================================
    '/applications': {
      post: {
        tags: ['05. Applications & Enrollments'],
        summary: 'تقديم طلب التحاق ببرنامج مفتوح (Submit Application - Student)',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['programId', 'motivation'],
                properties: {
                  programId: { type: 'string', example: '6a95ab62d2f46d39d6b86c73' },
                  motivation: { type: 'string', example: 'أتطلع لتطوير مهاراتي الصوتية والعمل في مجال الدوبلاج الاحترافي.' },
                  experienceLevel: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], example: 'beginner' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Application submitted successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 201,
                  message: 'Application submitted successfully',
                  data: {
                    _id: '6a966961a065f0074a856192',
                    programId: '6a95ab62d2f46d39d6b86c73',
                    status: 'pending',
                    submittedAt: '2026-09-01T08:00:00.000Z',
                  },
                },
              },
            },
          },
          409: { description: 'Active application already exists for this program' },
        },
      },
      get: {
        tags: ['05. Applications & Enrollments'],
        summary: 'استعراض كافة طلبات التقديم (Super Admin)',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Applications list',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  data: [{ _id: '6a966961a065f0074a856192', student: { fullName: 'Ahmed Samy' }, status: 'pending' }],
                },
              },
            },
          },
        },
      },
    },
    '/applications/{id}/review': {
      patch: {
        tags: ['05. Applications & Enrollments'],
        summary: 'مراجعة طلب التقديم وقبوله أو رفضه (Review Application - Super Admin)',
        description: 'عند القبول (status: accepted)، يتم إنشاء سجل اشتراك Enrollment وسجل تقدم Progress تلقائياً للطالب.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['accepted', 'rejected'], example: 'accepted' },
                  reviewNotes: { type: 'string', example: 'تمت مراجعة الطلب والموافقة على الالتحاق بالدفعة الحالية.' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Application reviewed and enrollment initiated',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  message: 'Application reviewed successfully',
                  data: {
                    application: { _id: '6a966961a065f0074a856192', status: 'accepted' },
                    enrollment: { _id: '6a966961a065f0074a856193', status: 'active' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // =========================================================================
    // 06. COURSE MODULES & LESSONS
    // =========================================================================
    '/lessons/{id}': {
      get: {
        tags: ['06. Course Modules & Lessons'],
        summary: 'تفاصيل الدرس والوسائط (Protected Paid Content)',
        description: 'الدروس المجانية (isFreePreview: true) متاحة للجميع، بينما الدروس المدفوعة تتطلب اشتراكاً فعالاً للطالب.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '6a95bc927ad0d5ee3d1b1841' }],
        responses: {
          200: {
            description: 'Lesson content unlocked',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  data: {
                    _id: '6a95bc927ad0d5ee3d1b1841',
                    title: 'Lesson 1: Vocal Anatomy & Studio Microphone Drills',
                    contentType: 'video',
                    contentUrl: 'https://cdn.zeinhub.com/secure/audio-mastery.mp4',
                    durationMinutes: 45,
                    isFreePreview: false,
                  },
                },
              },
            },
          },
          403: {
            description: 'Lesson locked: active enrollment required',
            content: {
              'application/json': {
                example: {
                  success: false,
                  statusCode: 403,
                  errorCode: 'FORBIDDEN',
                  message: 'Active enrollment required to access this lesson',
                  errors: [],
                },
              },
            },
          },
        },
      },
    },
    '/lessons/{lessonId}/complete': {
      post: {
        tags: ['06. Course Modules & Lessons'],
        summary: 'تسجيل إتمام الدرس (Complete Lesson - Student)',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [{ name: 'lessonId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Lesson marked complete and progress recalculated',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  message: 'Lesson marked as completed',
                  data: {
                    completionPercentage: 50,
                    completedLessonsCount: 1,
                    totalLessons: 2,
                  },
                },
              },
            },
          },
        },
      },
    },

    // =========================================================================
    // 07. QUIZZES & QUESTIONS
    // =========================================================================
    '/quizzes/{id}/submit': {
      post: {
        tags: ['07. Quizzes & Questions'],
        summary: 'تسليم إجابات الاختبار والتصحيح الآلي (Submit Quiz - Student)',
        description: 'يقوم الخادم بمطابقة الإجابات مع بنك الأسئلة المشفر وحساب الدرجة والنجاح فورياً.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['answers'],
                properties: {
                  answers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['questionId', 'selectedOptionIndex'],
                      properties: {
                        questionId: { type: 'string', example: '6a966bed65906b71ed78b032' },
                        selectedOptionIndex: { type: 'integer', example: 0 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Quiz auto-graded successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  message: 'Quiz submitted and graded successfully',
                  data: {
                    score: 100,
                    totalPoints: 100,
                    passed: true,
                    passingScore: 70,
                    attemptNumber: 1,
                  },
                },
              },
            },
          },
        },
      },
    },

    // =========================================================================
    // 08. PRACTICAL ASSIGNMENTS & GRADING
    // =========================================================================
    '/assignments/{id}/submit': {
      post: {
        tags: ['08. Practical Assignments & Grading'],
        summary: 'تسليم التكليف العملي الصوتي/المرئي (Submit Assignment - Student)',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['mediaUrl'],
                properties: {
                  mediaUrl: { type: 'string', example: 'https://cdn.zeinhub.com/submissions/student_voiceover_take1.mp3' },
                  textNotes: { type: 'string', example: 'تم تسجيل العينة باستخدام ميكروفون Shure SM7B مع المعالجة الصوتية الأولية.' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Assignment submitted for instructor review',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 201,
                  message: 'Assignment submitted successfully',
                  data: {
                    _id: '6a966bed65906b71ed78b049',
                    status: 'submitted',
                    submittedAt: '2026-09-01T08:30:00.000Z',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/submissions/{id}/grade': {
      patch: {
        tags: ['08. Practical Assignments & Grading'],
        summary: 'تصحيح ورصد درجة التكليف العملي (Grade Submission - Instructor)',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['grade'],
                properties: {
                  grade: { type: 'number', minimum: 0, maximum: 100, example: 95 },
                  feedback: { type: 'string', example: 'أداء صوتي ممتاز، ومخارج حروف واضحة جداً مع تحكم ممتاز في طبقات الصوت.' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Submission graded successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  message: 'Submission graded successfully',
                  data: {
                    _id: '6a966bed65906b71ed78b049',
                    grade: 95,
                    status: 'graded',
                    feedback: 'أداء صوتي ممتاز...',
                  },
                },
              },
            },
          },
          403: { description: 'Instructor not assigned to this program' },
        },
      },
    },

    // =========================================================================
    // 09. PROGRESS & GRADE TRACKING
    // =========================================================================
    '/progress/me': {
      get: {
        tags: ['09. Progress & Grade Tracking'],
        summary: 'تقدم الطالب في جميع البرامج المشترك بها (My Progress All)',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Progress list',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  data: [
                    {
                      program: { titleAr: 'دبلوم التعليق الصوتي والفوكاليز الرقمي' },
                      completionPercentage: 100,
                      finalGrade: 95,
                      isCompleted: true,
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },

    // =========================================================================
    // 10. CERTIFICATES & VERIFICATION
    // =========================================================================
    '/certificates/verify/{certificateNumber}': {
      get: {
        tags: ['10. Certificates & Verification'],
        summary: 'التحقق العام من صحة الشهادة برقمها المرجعي (Public Certificate Verification)',
        description: 'متاح للعامة دون الحاجة لأي تسجيل دخول للتأكد من مصداقية شهادات الخريجين.',
        parameters: [{ name: 'certificateNumber', in: 'path', required: true, schema: { type: 'string' }, example: 'ZH-VOI-2026-FC1505' }],
        responses: {
          200: {
            description: 'Certificate is authentic and valid',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  message: 'Certificate verified successfully',
                  data: {
                    isValid: true,
                    certificateNumber: 'ZH-VOI-2026-FC1505',
                    studentName: 'Youssef Reviewer',
                    programTitleAr: 'دبلوم التعليق الصوتي والفوكاليز الرقمي',
                    programTitleEn: 'Voice-Over & Digital Vocalise Masterclass',
                    finalGrade: 95,
                    issuedAt: '2026-08-31T17:42:00.000Z',
                  },
                },
              },
            },
          },
          404: {
            description: 'Certificate not found or invalid',
            content: {
              'application/json': {
                example: {
                  success: false,
                  statusCode: 404,
                  errorCode: 'NOT_FOUND',
                  message: 'Certificate not found or invalid certificate number',
                  errors: [],
                },
              },
            },
          },
        },
      },
    },

    // =========================================================================
    // 11. LIVE INTERACTIVE SESSIONS
    // =========================================================================
    '/programs/{programId}/sessions': {
      get: {
        tags: ['11. Live Interactive Sessions'],
        summary: 'استعراض جلسات البرنامج المباشرة (Live Sessions List)',
        description: 'روابط الاجتماعات الفعلية (Meeting URLs) يتم إخفاؤها تلقائياً عن غير المشتركين في البرنامج.',
        parameters: [{ name: 'programId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Sessions list retrieved',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  data: [
                    {
                      _id: '6a966be465906b71ed78b022',
                      title: 'جلسة تدريب عملي: نبرات الصوت ومحاكاة الإعلانات',
                      provider: 'zoom',
                      meetingUrl: 'https://zoom.us/j/9876543210',
                      startTime: '2026-09-15T18:00:00.000Z',
                      durationMinutes: 90,
                      status: 'scheduled',
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['11. Live Interactive Sessions'],
        summary: 'جدولة جلسة تفاعلية مباشرة (Schedule Session - Admin / Instructor)',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [{ name: 'programId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'provider', 'meetingUrl', 'startTime', 'durationMinutes'],
                properties: {
                  title: { type: 'string', example: 'جلسة استوديو تفاعلية: هندسة الفوكاليز ومخارج الحروف' },
                  provider: { type: 'string', enum: ['zoom', 'google_meet', 'teams', 'custom'], example: 'zoom' },
                  meetingUrl: { type: 'string', example: 'https://zoom.us/j/9876543210' },
                  meetingPassword: { type: 'string', example: 'ZeinLive2026' },
                  startTime: { type: 'string', format: 'date-time', example: '2026-09-15T18:00:00.000Z' },
                  durationMinutes: { type: 'number', example: 90 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Live Session scheduled successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 201,
                  message: 'Live session scheduled successfully',
                  data: {
                    _id: '6a966be465906b71ed78b022',
                    status: 'scheduled',
                  },
                },
              },
            },
          },
        },
      },
    },

    // =========================================================================
    // 12. ATTENDANCE MANAGEMENT
    // =========================================================================
    '/sessions/{sessionId}/attendance': {
      post: {
        tags: ['12. Attendance Management'],
        summary: 'رصد وتحديث حضور الطالب (Mark Attendance - Instructor / Admin)',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['studentId', 'status'],
                properties: {
                  studentId: { type: 'string', example: '6a966961a065f0074a856190' },
                  status: { type: 'string', enum: ['present', 'late', 'absent', 'excused'], example: 'present' },
                  attendanceMinutes: { type: 'number', example: 90 },
                  notes: { type: 'string', example: 'تفاعل ممتاز وأداء تطبيقي رائع خلال الجلسة المباشرة.' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Attendance recorded successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  message: 'Attendance recorded successfully',
                  data: {
                    status: 'present',
                    attendanceMinutes: 90,
                  },
                },
              },
            },
          },
        },
      },
    },

    // =========================================================================
    // 13. REVIEWS & TESTIMONIALS
    // =========================================================================
    '/programs/{programId}/reviews': {
      post: {
        tags: ['13. Reviews & Testimonials'],
        summary: 'إرسال تقييم للبرنامج (Submit Review - Enrolled Student)',
        description: 'التقييم يبدأ في حالة pending ويدخل طابور التدقيق الإداري قبل الظهور للعامة.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [{ name: 'programId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rating', 'comment'],
                properties: {
                  rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
                  comment: { type: 'string', example: 'دبلوم متميز جداً واستفدت بشكل هائل من التدريبات العملية واستوديوهات التسجيل.' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Review submitted and entered moderation queue',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 201,
                  message: 'Review submitted successfully and is pending moderation',
                  data: {
                    _id: '6a966bb38facc8dd9643f4cf',
                    rating: 5,
                    status: 'pending',
                  },
                },
              },
            },
          },
          409: { description: 'Duplicate review for the same program' },
        },
      },
      get: {
        tags: ['13. Reviews & Testimonials'],
        summary: 'استعراض التقييمات المعتمدة للبرنامج ومتوسط النجوم (Public Program Reviews)',
        parameters: [{ name: 'programId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Approved reviews with average rating and star breakdown',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  data: {
                    averageRating: 5.0,
                    totalReviews: 12,
                    starBreakdown: { '5': 10, '4': 2, '3': 0, '2': 0, '1': 0 },
                    reviews: [
                      {
                        _id: '6a966bb38facc8dd9643f4cf',
                        student: { fullName: 'Youssef Reviewer' },
                        rating: 5,
                        comment: 'دبلوم متميز جداً...',
                        isFeatured: true,
                        createdAt: '2026-09-01T07:00:00.000Z',
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    '/reviews/{id}/moderate': {
      patch: {
        tags: ['13. Reviews & Testimonials'],
        summary: 'تدقيق واعتماد أو رفض التقييم (Moderate Review - Super Admin)',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['approved', 'rejected'], example: 'approved' },
                  isFeatured: { type: 'boolean', example: true },
                  moderationNotes: { type: 'string', example: 'تقييم مفصل وموثق من خريج الدفعة الأولى.' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Review moderation updated',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  message: 'Review moderated successfully',
                  data: {
                    _id: '6a966bb38facc8dd9643f4cf',
                    status: 'approved',
                    isFeatured: true,
                  },
                },
              },
            },
          },
        },
      },
    },

    // =========================================================================
    // 14. ADMIN DASHBOARD & ANALYTICS
    // =========================================================================
    '/admin/dashboard/overview': {
      get: {
        tags: ['14. Admin Dashboard & Analytics'],
        summary: 'مؤشرات الأداء الإجمالية للمنصة (Dashboard Overview KPIs)',
        description: 'استرجاع مؤشرات شاملة للمنصة (Super Admin) أو مقيدة بالبرامج المسندة (Scoped Instructor).',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard KPIs retrieved successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  message: 'Dashboard overview KPIs retrieved successfully',
                  data: {
                    users: { totalStudents: 22, totalInstructors: 2, activeStudents: 22 },
                    programs: { total: 13, open: 10, comingSoon: 2, closed: 1 },
                    applications: { total: 12, pending: 2, accepted: 8, rejected: 2 },
                    enrollments: { total: 6, active: 5, completed: 1, cancelled: 0 },
                    academic: { averageCompletionRate: 100, averageFinalGrade: 92, totalCertificatesIssued: 1 },
                    attendance: { overallAttendanceRate: 100, totalLiveSessions: 4 },
                    reviews: { averagePlatformRating: 5.0, totalReviews: 1, pendingModerationCount: 0 },
                  },
                },
              },
            },
          },
          403: { $ref: '#/components/responses/ForbiddenError' },
        },
      },
    },
    '/admin/analytics/progress': {
      get: {
        tags: ['14. Admin Dashboard & Analytics'],
        summary: 'تحليلات تقدم الطلاب وتوزيع الشرائح (Progress & Tiers Analytics)',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Progress Tiers breakdown',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  data: {
                    averageCompletionPercentage: 100,
                    tiersDistribution: {
                      tier0To25: 0,
                      tier26To50: 0,
                      tier51To75: 0,
                      tier76To99: 0,
                      tier100Completed: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // =========================================================================
    // 15. HEALTH & SYSTEM
    // =========================================================================
    '/health': {
      get: {
        tags: ['15. Health & System'],
        summary: 'فحص جاهزية الخادم وقاعدة البيانات (Root Health Check)',
        responses: {
          200: {
            description: 'Server and Database are operational',
            content: {
              'application/json': {
                example: {
                  success: true,
                  statusCode: 200,
                  message: 'Zein Hub Backend API is running smoothly',
                  data: {
                    status: 'UP',
                    environment: 'development',
                    timestamp: '2026-09-01T09:15:00.000Z',
                    database: {
                      status: 'connected',
                      name: 'zein_hub',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
