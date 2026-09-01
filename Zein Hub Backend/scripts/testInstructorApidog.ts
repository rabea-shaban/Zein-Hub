const BASE_URL = 'http://localhost:5000/api/v1';

async function testCreateInstructorEdgeCase() {
  console.log('Testing Create Instructor with unset Postman/Apidog variables...');

  // 1. Login as Super Admin
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@zeinhub.com', password: 'Admin@ZeinHub2026!' }),
  });
  const cookie = loginRes.headers.get('set-cookie')?.split(';')[0] || '';

  // 2. Post with empty strings as sent when variables are unassigned in Postman/Apidog
  const uniqueEmail = `dr.tarek.${Date.now()}@zeinhub.com`;
  const res = await fetch(`${BASE_URL}/instructors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({
      fullName: 'Dr. Tarek Voice',
      email: uniqueEmail,
      password: 'InstructorPass123!',
      phone: '+201099998888',
      trackId: '',
      specializations: ['Voice Over', 'Acoustics'],
      bio: 'Over 15 years in radio broadcasting and vocal training.',
      assignedPrograms: [''],
    }),
  });

  const data: any = await res.json();
  console.log('Response status:', res.status);
  console.log('Response body:', data);

  if (res.status === 201 && data.success) {
    console.log('✅ PASS: Instructor created successfully even with unassigned Postman variables!');
  } else {
    console.error('❌ FAIL:', data);
    process.exit(1);
  }
}

testCreateInstructorEdgeCase().catch(console.error);
