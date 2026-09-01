async function testSwagger() {
  console.log('=========================================');
  console.log('📖 Testing Swagger UI and OpenAPI Endpoints');
  console.log('=========================================\n');

  // Test 1: Swagger JSON endpoint
  const jsonRes = await fetch('http://localhost:5000/api/docs.json');
  const spec: any = await jsonRes.json();
  if (jsonRes.status === 200 && spec.openapi === '3.0.0' && spec.info?.title) {
    console.log(`   ✅ PASS: OpenAPI 3.0 JSON specification loaded: "${spec.info.title}"`);
    console.log(`      - Version: ${spec.info.version}`);
    console.log(`      - Tags defined: ${spec.tags?.length || 0}`);
  } else {
    console.error('   ❌ FAIL: Swagger JSON failed:', jsonRes.status, spec);
    process.exit(1);
  }

  // Test 2: Swagger UI HTML endpoint
  const uiRes = await fetch('http://localhost:5000/api/docs/');
  const html = await uiRes.text();
  if (uiRes.status === 200 && html.toLowerCase().includes('swagger')) {
    console.log('   ✅ PASS: Interactive Swagger UI rendered successfully at /api/docs');
  } else {
    console.error('   ❌ FAIL: Swagger UI HTML failed:', uiRes.status, html.slice(0, 200));
    process.exit(1);
  }

  console.log('\n=========================================');
  console.log('🎉 ALL SWAGGER TESTS PASSED SUCCESSFULLY!');
  console.log('=========================================\n');
}

testSwagger().catch((err) => {
  console.error('Swagger test error:', err);
  process.exit(1);
});
