const BASE_URL = 'http://localhost:5000/api/v1';
const ROOT_URL = 'http://localhost:5000';

async function runFinalSmokeTest() {
  console.log('=========================================');
  console.log('🚀 Executing Zein Hub API Final Smoke Test');
  console.log('=========================================\n');

  let passedCases = 0;
  const totalCases = 12;

  // 1. Health Check
  console.log('🔹 1. Root & API Health Check');
  const healthRes = await fetch(`${ROOT_URL}/health`);
  const healthData: any = await healthRes.json();
  if (healthRes.status === 200 && healthData.data?.status === 'UP') {
    console.log('   ✅ PASS: Health check endpoint working (Status: UP)');
    passedCases++;
  } else {
    console.error('   ❌ FAIL: Health check failed:', healthData);
  }

  // 2. Cookie Authentication (Login)
  console.log('\n🔹 2. Cookie Authentication (Login & Set-Cookie)');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@zeinhub.com',
      password: 'Admin@ZeinHub2026!',
    }),
  });
  const loginData: any = await loginRes.json();
  const setCookieHeader = loginRes.headers.get('set-cookie') || '';
  const accessTokenMatch = setCookieHeader.match(/zh_access_token=([^;]+)/);
  const refreshTokenMatch = setCookieHeader.match(/zh_refresh_token=([^;]+)/);
  const adminCookie = accessTokenMatch ? `zh_access_token=${accessTokenMatch[1]}` : '';
  const refreshCookie = refreshTokenMatch ? `zh_refresh_token=${refreshTokenMatch[1]}` : '';

  if (loginRes.status === 200 && adminCookie) {
    console.log('   ✅ PASS: Login returned httpOnly cookies');
    passedCases++;
  } else {
    console.error('   ❌ FAIL: Login failed:', loginData);
  }

  // 3. Protected Profile via Cookie
  console.log('\n🔹 3. Protected Profile via httpOnly Cookie');
  const profileRes = await fetch(`${BASE_URL}/auth/profile`, {
    headers: { Cookie: adminCookie },
  });
  const profileData: any = await profileRes.json();
  if (profileRes.status === 200 && profileData.data?.user?.email === 'admin@zeinhub.com') {
    console.log('   ✅ PASS: Profile accessed successfully using httpOnly Cookie');
    passedCases++;
  } else {
    console.error('   ❌ FAIL: Profile access failed:', profileData);
  }

  // 4. Public Programs Catalog
  console.log('\n🔹 4. Public Programs Catalog');
  const progsRes = await fetch(`${BASE_URL}/programs?limit=5`);
  const progsData: any = await progsRes.json();
  if (progsRes.status === 200 && Array.isArray(progsData.data) && progsData.data.length > 0) {
    console.log(`   ✅ PASS: Public programs retrieved (Count: ${progsData.data.length})`);
    passedCases++;
  } else {
    console.error('   ❌ FAIL: Programs fetch failed:', progsData);
  }

  // 5. Public Tracks Catalog
  console.log('\n🔹 5. Public Tracks Catalog');
  const tracksRes = await fetch(`${BASE_URL}/tracks`);
  const tracksData: any = await tracksRes.json();
  if (tracksRes.status === 200 && Array.isArray(tracksData.data) && tracksData.data.length > 0) {
    console.log(`   ✅ PASS: Public tracks retrieved (Count: ${tracksData.data.length})`);
    passedCases++;
  } else {
    console.error('   ❌ FAIL: Tracks fetch failed:', tracksData);
  }

  // 6. Public Approved Testimonials
  console.log('\n🔹 6. Public Approved Testimonials');
  const revsRes = await fetch(`${BASE_URL}/reviews/approved`);
  const revsData: any = await revsRes.json();
  if (revsRes.status === 200 && Array.isArray(revsData.data)) {
    console.log('   ✅ PASS: Public approved testimonials queried safely');
    passedCases++;
  } else {
    console.error('   ❌ FAIL:', revsData);
  }

  // 7. Public Certificate Verification
  console.log('\n🔹 7. Public Certificate Verification');
  const certRes = await fetch(`${BASE_URL}/certificates/verify/ZH-INVALID-NUMBER`);
  if (certRes.status === 404) {
    console.log('   ✅ PASS: Certificate verification endpoint functioning correctly');
    passedCases++;
  } else {
    console.error('   ❌ FAIL: Expected 404, got', certRes.status);
  }

  // 8. Super Admin Dashboard KPIs (RBAC)
  console.log('\n🔹 8. Super Admin Dashboard KPIs');
  const dashRes = await fetch(`${BASE_URL}/admin/dashboard/overview`, {
    headers: { Cookie: adminCookie },
  });
  const dashData: any = await dashRes.json();
  if (dashRes.status === 200 && dashData.data?.users) {
    console.log('   ✅ PASS: Dashboard KPIs retrieved successfully for Admin');
    passedCases++;
  } else {
    console.error('   ❌ FAIL: Dashboard fetch failed:', dashData);
  }

  // 9. Unauthorized Request Security Check
  console.log('\n🔹 9. Unauthorized Request Security Check');
  const unauthRes = await fetch(`${BASE_URL}/admin/dashboard/overview`);
  if (unauthRes.status === 401) {
    console.log('   ✅ PASS: Unauthorized request safely blocked with 401');
    passedCases++;
  } else {
    console.error('   ❌ FAIL: Expected 401, got', unauthRes.status);
  }

  // 10. Joi Validation Error Format Check
  console.log('\n🔹 10. Joi Validation Error Format Check');
  const valRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bad-email-format' }),
  });
  const valData: any = await valRes.json();
  if (valRes.status === 400 && valData.success === false && Array.isArray(valData.errors)) {
    console.log('   ✅ PASS: Standardized validation error structure returned');
    passedCases++;
  } else {
    console.error('   ❌ FAIL:', valData);
  }

  // 11. Undefined Route 404 Check
  console.log('\n🔹 11. Undefined Route Standardized 404 Check');
  const notFoundRes = await fetch(`${BASE_URL}/undefined-route-check`);
  const notFoundData: any = await notFoundRes.json();
  if (notFoundRes.status === 404 && notFoundData.success === false) {
    console.log('   ✅ PASS: Standardized 404 response returned');
    passedCases++;
  } else {
    console.error('   ❌ FAIL:', notFoundData);
  }

  // 12. Logout & Cookie Clearing
  console.log('\n🔹 12. Logout & Session Invalidation');
  const logoutRes = await fetch(`${BASE_URL}/auth/logout`, { method: 'POST' });
  const logoutSetCookie = logoutRes.headers.get('set-cookie') || '';
  if (
    logoutRes.status === 200 &&
    (logoutSetCookie.includes('Expires=') || logoutSetCookie.includes('Max-Age=0'))
  ) {
    console.log('   ✅ PASS: Logout successfully cleared session cookies');
    passedCases++;
  } else {
    console.error('   ❌ FAIL: Logout failed:', logoutSetCookie);
  }

  console.log('\n=========================================');
  console.log(`🎉 FINAL SMOKE TEST: ${passedCases}/${totalCases} PASSED`);
  console.log('=========================================\n');

  if (passedCases === totalCases) {
    return;
  } else {
    process.exit(1);
  }
}

runFinalSmokeTest().catch((err) => {
  console.error('Smoke test error:', err);
  process.exit(1);
});
