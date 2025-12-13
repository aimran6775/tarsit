#!/usr/bin/env node

/**
 * Website Health Check Script
 * 
 * Runs complete E2E test suite and generates comprehensive health report
 * Run with: node scripts/health-check.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🏥 Starting Website Health Check...\n');
console.log('=' .repeat(60));

const startTime = Date.now();

try {
  // Run Playwright tests
  console.log('\n📋 Running E2E Test Suite...\n');
  
  const result = execSync('npx playwright test --reporter=json', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8',
    stdio: 'pipe'
  });
  
  // Parse results
  const resultsPath = path.join(__dirname, '../test-results/test-results.json');
  
  if (fs.existsSync(resultsPath)) {
    const testResults = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
    
    const duration = Date.now() - startTime;
    
    // Generate report
    console.log('\n' + '='.repeat(60));
    console.log('📊 HEALTH CHECK REPORT');
    console.log('='.repeat(60));
    
    const stats = testResults.suites.reduce((acc, suite) => {
      suite.specs.forEach(spec => {
        spec.tests.forEach(test => {
          if (test.results[0].status === 'passed') acc.passed++;
          else if (test.results[0].status === 'failed') acc.failed++;
          else acc.skipped++;
        });
      });
      return acc;
    }, { passed: 0, failed: 0, skipped: 0 });
    
    const total = stats.passed + stats.failed + stats.skipped;
    const passRate = total > 0 ? ((stats.passed / total) * 100).toFixed(1) : 0;
    
    console.log(`\n✅ Passed: ${stats.passed}`);
    console.log(`❌ Failed: ${stats.failed}`);
    console.log(`⏭️  Skipped: ${stats.skipped}`);
    console.log(`📈 Pass Rate: ${passRate}%`);
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(1)}s`);
    
    // Health score
    let health = 'EXCELLENT';
    let emoji = '💚';
    if (passRate < 90) { health = 'GOOD'; emoji = '💛'; }
    if (passRate < 75) { health = 'FAIR'; emoji = '🧡'; }
    if (passRate < 60) { health = 'POOR'; emoji = '❤️'; }
    if (passRate < 40) { health = 'CRITICAL'; emoji = '🔴'; }
    
    console.log(`\n${emoji} Overall Health: ${health}`);
    
    // Show failures
    if (stats.failed > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('❌ FAILED TESTS:');
      console.log('='.repeat(60));
      
      testResults.suites.forEach(suite => {
        suite.specs.forEach(spec => {
          spec.tests.forEach(test => {
            if (test.results[0].status === 'failed') {
              console.log(`\n❌ ${spec.title}`);
              console.log(`   File: ${spec.file}`);
              console.log(`   Error: ${test.results[0].error?.message || 'Unknown error'}`);
            }
          });
        });
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📄 Full report available at: test-results/html-report/index.html');
    console.log('='.repeat(60) + '\n');
    
    // Exit with appropriate code
    process.exit(stats.failed > 0 ? 1 : 0);
    
  } else {
    console.log('\n⚠️  No test results found. Tests may not have run.');
    process.exit(1);
  }
  
} catch (error) {
  console.error('\n❌ Health Check Failed!\n');
  console.error('Error:', error.message);
  
  // Try to show test output
  if (error.stdout) {
    console.log('\nTest Output:');
    console.log(error.stdout);
  }
  
  if (error.stderr) {
    console.log('\nErrors:');
    console.log(error.stderr);
  }
  
  console.log('\n💡 Common Issues:');
  console.log('   • Make sure the dev server is running (pnpm dev)');
  console.log('   • Check if port 3000 is available');
  console.log('   • Verify all dependencies are installed (pnpm install)');
  console.log('   • Run tests manually: npx playwright test\n');
  
  process.exit(1);
}
