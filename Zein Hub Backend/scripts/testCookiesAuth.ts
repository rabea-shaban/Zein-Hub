const BASE_URL = 'http://localhost:5000/api/v1';

async function runCookieTests() {
  console.log('=========================================');
  console.log('🍪 Testing Complete httpOnly Cookie Authentication Lifecycle');
  console.log('=========================================\n');

  // Step 1: Login and extract Set-Cookie headers
  console.log('🔹 Step 1: Login as Student and verify httpOnly Set-Cookie headers');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student.hardened1@zeinhub.com',
      password: 'StudentPass123!',
    }),
  });

  const loginData: any = await loginRes.json();
  const setCookieHeader = loginRes.headers.get('set-cookie') || '';

  if (
    loginRes.status === 200 &&
    setCookieHeader.includes('zh_access_token=') &&
    setCookieHeader.includes('zh_refresh_token=') &&
    setCookieHeader.toLowerCase().includes('httponly')
  ) {
    console.log('   ✅ PASS: Login returned httpOnly secure cookies:');
    console.log('      - zh_access_token (HttpOnly)');
    console.log('      - zh_refresh_token (HttpOnly)');
  } else {
    console.error('   ❌ FAIL: Set-Cookie header missing or invalid:', setCookieHeader, loginData);
    process.exit(1);
  }

  // Parse cookies from header
  const cookies = setCookieHeader
    .split(',')
    .map((c) => c.trim().split(';')[0])
    .join('; ');

  const accessTokenMatch = setCookieHeader.match(/zh_access_token=([^;]+)/);
  const refreshTokenMatch = setCookieHeader.match(/zh_refresh_token=([^;]+)/);
  const accessTokenCookie = accessTokenMatch ? `zh_access_token=${accessTokenMatch[1]}` : '';
  const refreshTokenCookie = refreshTokenMatch ? `zh_refresh_token=${refreshTokenMatch[1]}` : '';

  // Step 2: Access protected route sending ONLY Cookie (No Authorization header)
  console.log('\n🔹 Step 2: Access protected profile using ONLY httpOnly Cookie (No Bearer Header)');
  const profileRes = await fetch(`${BASE_URL}/auth/profile`, {
    headers: {
      Cookie: accessTokenCookie,
    },
  });
  const profileData: any = await profileRes.json();

  if (profileRes.status === 200 && profileData.data?.user?.email === 'student.hardened1@zeinhub.com') {
    console.log(`   ✅ PASS: Authenticated successfully using ONLY httpOnly Cookie for user: ${profileData.data.user.fullName}`);
  } else {
    console.error('   ❌ FAIL:', profileData);
    process.exit(1);
  }

  // Step 3: Refresh access token using ONLY refresh cookie (No request body)
  console.log('\n🔹 Step 3: Refresh access token using ONLY httpOnly Refresh Cookie (Empty JSON body)');
  const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: refreshTokenCookie,
    },
    body: JSON.stringify({}),
  });
  const refreshData: any = await refreshRes.json();
  const refreshSetCookie = refreshRes.headers.get('set-cookie') || '';

  if (
    refreshRes.status === 200 &&
    refreshSetCookie.includes('zh_access_token=') &&
    refreshSetCookie.toLowerCase().includes('httponly')
  ) {
    console.log('   ✅ PASS: Access token refreshed successfully and new httpOnly cookie issued');
  } else {
    console.error('   ❌ FAIL:', refreshData);
    process.exit(1);
  }

  // Step 4: Logout and clear cookies
  console.log('\n🔹 Step 4: Logout and clear auth session cookies (POST /auth/logout)');
  const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
  });
  const logoutData: any = await logoutRes.json();
  const logoutSetCookie = logoutRes.headers.get('set-cookie') || '';

  if (
    logoutRes.status === 200 &&
    (logoutSetCookie.includes('Expires=') || logoutSetCookie.includes('Max-Age=0'))
  ) {
    console.log('   ✅ PASS: Logout successfully cleared httpOnly cookies');
  } else {
    console.error('   ❌ FAIL:', logoutData);
    process.exit(1);
  }

  // Step 5: Verify access denied with no cookies / expired session
  console.log('\n🔹 Step 5: Access protected route with no cookies after logout');
  const unauthProfileRes = await fetch(`${BASE_URL}/auth/profile`);
  if (unauthProfileRes.status === 401) {
    console.log('   ✅ PASS: Access denied with 401 Unauthorized as expected');
  } else {
    console.error('   ❌ FAIL: Expected 401, got', unauthProfileRes.status);
    process.exit(1);
  }

  console.log('\n=========================================');
  console.log('🎉 ALL httpOnly COOKIE AUTH TESTS PASSED 100% SUCCESSFULLY!');
  console.log('=========================================\n');
}

runCookieTests().catch((err) => {
  console.error('Cookie test failed:', err);
  process.exit(1);
});
