#!/usr/bin/env ts-node

/**
 * 🤖 Tarsit Intelligent Test Agent
 * 
 * An autonomous testing agent that:
 * - Tests the entire website (backend + frontend)
 * - Handles rate limiting intelligently
 * - Retries failed tests automatically
 * - Generates comprehensive reports
 * - Monitors system health
 * - Provides actionable insights
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync, exec } from 'child_process';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../apps/api/.env') });

const API_URL = process.env.API_URL || 'http://localhost:4000/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Configuration
interface TestAgentConfig {
  maxRetries: number;
  retryDelay: number; // seconds
  rateLimitDelay: number; // seconds to wait after rate limit
  healthCheckInterval: number; // seconds
  generateReport: boolean;
  runFrontendTests: boolean;
  runBackendTests: boolean;
  continuousMode: boolean;
  verboseLogging: boolean;
}

const DEFAULT_CONFIG: TestAgentConfig = {
  maxRetries: 3,
  retryDelay: 5,
  rateLimitDelay: 60,
  healthCheckInterval: 10,
  generateReport: true,
  runFrontendTests: true,
  runBackendTests: true,
  continuousMode: false,
  verboseLogging: false,
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

function log(message: string, color: string = colors.reset) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`${colors.gray}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log();
  log('═'.repeat(70), colors.cyan);
  log(`  ${title}`, colors.bold + colors.cyan);
  log('═'.repeat(70), colors.cyan);
  console.log();
}

interface TestResult {
  passed: boolean;
  failed: boolean;
  total: number;
  duration: number;
  errors: string[];
  output: string;
}

interface SystemHealth {
  backend: boolean;
  frontend: boolean;
  database: boolean;
  timestamp: Date;
}

interface AgentReport {
  startTime: Date;
  endTime: Date;
  duration: number;
  systemHealth: SystemHealth;
  backendResults: TestResult | null;
  frontendResults: TestResult | null;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  passRate: number;
  recommendations: string[];
}

class TestAgent {
  private config: TestAgentConfig;
  private report: AgentReport;
  
  constructor(config: Partial<TestAgentConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.report = this.initializeReport();
  }
  
  private initializeReport(): AgentReport {
    return {
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      systemHealth: {
        backend: false,
        frontend: false,
        database: false,
        timestamp: new Date(),
      },
      backendResults: null,
      frontendResults: null,
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      passRate: 0,
      recommendations: [],
    };
  }
  
  async run() {
    this.printBanner();
    
    try {
      // Step 1: Health checks
      await this.performHealthChecks();
      
      // Step 2: Run backend tests
      if (this.config.runBackendTests) {
        await this.runBackendTests();
      }
      
      // Step 3: Run frontend tests
      if (this.config.runFrontendTests) {
        await this.runFrontendTests();
      }
      
      // Step 4: Generate report
      this.finalizeReport();
      
      if (this.config.generateReport) {
        this.generateHtmlReport();
      }
      
      // Step 5: Print summary
      this.printSummary();
      
      // Exit with appropriate code
      process.exit(this.report.totalFailed === 0 ? 0 : 1);
    } catch (error) {
      log(`Fatal error: ${error}`, colors.red);
      process.exit(1);
    }
  }
  
  private printBanner() {
    console.log();
    log('╔════════════════════════════════════════════════════════════════════╗', colors.magenta);
    log('║              🤖 TARSIT INTELLIGENT TEST AGENT                      ║', colors.magenta);
    log('║         Autonomous Testing • Smart Retries • Full Coverage         ║', colors.magenta);
    log('╚════════════════════════════════════════════════════════════════════╝', colors.magenta);
    console.log();
    log(`API: ${API_URL}`, colors.gray);
    log(`Frontend: ${FRONTEND_URL}`, colors.gray);
    log(`Backend Tests: ${this.config.runBackendTests ? 'YES' : 'NO'}`, colors.gray);
    log(`Frontend Tests: ${this.config.runFrontendTests ? 'YES' : 'NO'}`, colors.gray);
    log(`Max Retries: ${this.config.maxRetries}`, colors.gray);
    console.log();
  }
  
  private async performHealthChecks() {
    logSection('SYSTEM HEALTH CHECKS');
    
    // Check backend
    log('Checking backend...', colors.cyan);
    const backendHealthy = await this.checkBackend();
    this.report.systemHealth.backend = backendHealthy;
    log(
      backendHealthy ? '✓ Backend is healthy' : '✗ Backend is not responding',
      backendHealthy ? colors.green : colors.red
    );
    
    // Check frontend
    log('Checking frontend...', colors.cyan);
    const frontendHealthy = await this.checkFrontend();
    this.report.systemHealth.frontend = frontendHealthy;
    log(
      frontendHealthy ? '✓ Frontend is healthy' : '✗ Frontend is not responding',
      frontendHealthy ? colors.green : colors.red
    );
    
    // Check database
    log('Checking database...', colors.cyan);
    const databaseHealthy = await this.checkDatabase();
    this.report.systemHealth.database = databaseHealthy;
    log(
      databaseHealthy ? '✓ Database is healthy' : '✗ Database is not responding',
      databaseHealthy ? colors.green : colors.red
    );
    
    // Abort if critical services are down
    if (!backendHealthy && this.config.runBackendTests) {
      throw new Error('Backend is not responding. Please start the backend before running tests.');
    }
    
    if (!frontendHealthy && this.config.runFrontendTests) {
      log('Frontend is not responding. Skipping frontend tests.', colors.yellow);
      this.config.runFrontendTests = false;
    }
  }
  
  private async checkBackend(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  private async checkFrontend(): Promise<boolean> {
    try {
      const response = await fetch(FRONTEND_URL);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  private async checkDatabase(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/health/db`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  private async runBackendTests() {
    logSection('BACKEND TESTS');
    
    let attempt = 0;
    let success = false;
    
    while (attempt < this.config.maxRetries && !success) {
      attempt++;
      
      if (attempt > 1) {
        log(`Retry attempt ${attempt}/${this.config.maxRetries}`, colors.yellow);
        await this.sleep(this.config.retryDelay * 1000);
      }
      
      try {
        log(`Running backend tests (attempt ${attempt})...`, colors.cyan);
        const result = await this.executeBackendTests();
        
        this.report.backendResults = result;
        
        if (result.passed) {
          success = true;
          log(`✓ Backend tests completed successfully`, colors.green);
        } else {
          log(`✗ Backend tests failed with ${result.failed} failures`, colors.red);
          
          // Check for rate limiting
          if (this.detectRateLimiting(result.output)) {
            log('Rate limiting detected. Waiting before retry...', colors.yellow);
            await this.sleep(this.config.rateLimitDelay * 1000);
          }
        }
      } catch (error: any) {
        log(`Backend test execution error: ${error.message}`, colors.red);
        
        if (attempt === this.config.maxRetries) {
          this.report.backendResults = {
            passed: false,
            failed: true,
            total: 0,
            duration: 0,
            errors: [error.message],
            output: error.toString(),
          };
        }
      }
    }
  }
  
  private async executeBackendTests(): Promise<TestResult> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const testPath = path.join(__dirname, 'backend/test-backend.js');
      
      exec(`node ${testPath}`, { cwd: __dirname }, (error, stdout, stderr) => {
        const duration = Date.now() - startTime;
        const output = stdout + stderr;
        
        if (this.config.verboseLogging) {
          console.log(output);
        }
        
        // Parse test results from output
        const result = this.parseTestOutput(output, duration);
        
        resolve(result);
      });
    });
  }
  
  private async runFrontendTests() {
    logSection('FRONTEND TESTS');
    
    let attempt = 0;
    let success = false;
    
    while (attempt < this.config.maxRetries && !success) {
      attempt++;
      
      if (attempt > 1) {
        log(`Retry attempt ${attempt}/${this.config.maxRetries}`, colors.yellow);
        await this.sleep(this.config.retryDelay * 1000);
      }
      
      try {
        log(`Running frontend tests (attempt ${attempt})...`, colors.cyan);
        const result = await this.executeFrontendTests();
        
        this.report.frontendResults = result;
        
        if (result.passed) {
          success = true;
          log(`✓ Frontend tests completed successfully`, colors.green);
        } else {
          log(`✗ Frontend tests failed with ${result.failed} failures`, colors.red);
        }
      } catch (error: any) {
        log(`Frontend test execution error: ${error.message}`, colors.red);
        
        if (attempt === this.config.maxRetries) {
          this.report.frontendResults = {
            passed: false,
            failed: true,
            total: 0,
            duration: 0,
            errors: [error.message],
            output: error.toString(),
          };
        }
      }
    }
  }
  
  private async executeFrontendTests(): Promise<TestResult> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const testPath = path.join(__dirname, 'frontend/test-frontend.js');
      
      exec(`node ${testPath}`, { cwd: __dirname }, (error, stdout, stderr) => {
        const duration = Date.now() - startTime;
        const output = stdout + stderr;
        
        if (this.config.verboseLogging) {
          console.log(output);
        }
        
        const result = this.parseTestOutput(output, duration);
        
        resolve(result);
      });
    });
  }
  
  private parseTestOutput(output: string, duration: number): TestResult {
    // Extract test counts from output
    const totalMatch = output.match(/Total Tests:\s*(\d+)/);
    const passedMatch = output.match(/Passed:\s*(\d+)/);
    const failedMatch = output.match(/Failed:\s*(\d+)/);
    
    const total = totalMatch ? parseInt(totalMatch[1]) : 0;
    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    
    // Extract errors
    const errorMatches = output.match(/Error:.*$/gm) || [];
    const errors = errorMatches.map(e => e.trim());
    
    return {
      passed: failed === 0 && total > 0,
      failed: failed > 0,
      total,
      duration,
      errors,
      output,
    };
  }
  
  private detectRateLimiting(output: string): boolean {
    return output.includes('429') || output.includes('rate limit') || output.includes('too many requests');
  }
  
  private finalizeReport() {
    this.report.endTime = new Date();
    this.report.duration = this.report.endTime.getTime() - this.report.startTime.getTime();
    
    // Calculate totals
    if (this.report.backendResults) {
      this.report.totalTests += this.report.backendResults.total;
      const backendPassed = this.report.backendResults.total - (this.report.backendResults.errors?.length || 0);
      this.report.totalPassed += backendPassed;
      this.report.totalFailed += (this.report.backendResults.errors?.length || 0);
    }
    
    if (this.report.frontendResults) {
      this.report.totalTests += this.report.frontendResults.total;
      const frontendPassed = this.report.frontendResults.total - (this.report.frontendResults.errors?.length || 0);
      this.report.totalPassed += frontendPassed;
      this.report.totalFailed += (this.report.frontendResults.errors?.length || 0);
    }
    
    this.report.passRate = this.report.totalTests > 0
      ? (this.report.totalPassed / this.report.totalTests) * 100
      : 0;
    
    // Generate recommendations
    this.generateRecommendations();
  }
  
  private generateRecommendations() {
    const recommendations: string[] = [];
    
    if (!this.report.systemHealth.backend) {
      recommendations.push('❌ Backend is not responding. Start the backend server.');
    }
    
    if (!this.report.systemHealth.frontend) {
      recommendations.push('⚠️ Frontend is not responding. Start the frontend server.');
    }
    
    if (!this.report.systemHealth.database) {
      recommendations.push('❌ Database connection failed. Check database configuration.');
    }
    
    if (this.report.backendResults?.output.includes('429')) {
      recommendations.push('⚠️ Rate limiting detected. Consider increasing rate limits for testing or adding delays between tests.');
    }
    
    if (this.report.passRate < 50) {
      recommendations.push('🔴 Pass rate is critically low. Review system configuration and test setup.');
    } else if (this.report.passRate < 80) {
      recommendations.push('🟡 Pass rate could be improved. Review failed tests for patterns.');
    } else if (this.report.passRate < 100) {
      recommendations.push('🟢 Most tests passing. Fix remaining failures for 100% coverage.');
    } else {
      recommendations.push('🎉 All tests passing! System is fully functional.');
    }
    
    if (this.report.totalFailed > 0) {
      recommendations.push(`Fix ${this.report.totalFailed} failing test(s) to achieve 100% pass rate.`);
    }
    
    this.report.recommendations = recommendations;
  }
  
  private printSummary() {
    logSection('TEST SUMMARY');
    
    log(`Total Tests: ${this.report.totalTests}`, colors.cyan);
    log(`Passed: ${this.report.totalPassed}`, colors.green);
    log(`Failed: ${this.report.totalFailed}`, this.report.totalFailed > 0 ? colors.red : colors.green);
    log(`Pass Rate: ${this.report.passRate.toFixed(1)}%`, 
      this.report.passRate >= 80 ? colors.green : colors.yellow);
    log(`Duration: ${(this.report.duration / 1000).toFixed(2)}s`, colors.gray);
    
    console.log();
    log('System Health:', colors.cyan);
    log(`  Backend: ${this.report.systemHealth.backend ? '✓' : '✗'}`, 
      this.report.systemHealth.backend ? colors.green : colors.red);
    log(`  Frontend: ${this.report.systemHealth.frontend ? '✓' : '✗'}`, 
      this.report.systemHealth.frontend ? colors.green : colors.red);
    log(`  Database: ${this.report.systemHealth.database ? '✓' : '✗'}`, 
      this.report.systemHealth.database ? colors.green : colors.red);
    
    if (this.report.recommendations.length > 0) {
      console.log();
      log('Recommendations:', colors.yellow);
      this.report.recommendations.forEach(rec => {
        log(`  ${rec}`, colors.yellow);
      });
    }
    
    console.log();
  }
  
  private generateHtmlReport() {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Tarsit Test Report - ${this.report.startTime.toISOString()}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .metric { display: inline-block; margin: 10px 20px; }
    .metric-label { font-weight: bold; color: #666; }
    .metric-value { font-size: 24px; margin-left: 10px; }
    .passed { color: #4CAF50; }
    .failed { color: #f44336; }
    .warning { color: #ff9800; }
    .health { margin: 20px 0; }
    .health-item { margin: 10px 0; }
    .recommendations { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .timestamp { color: #999; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🤖 Tarsit Test Agent Report</h1>
    <p class="timestamp">Generated: ${this.report.endTime.toISOString()}</p>
    
    <h2>Summary</h2>
    <div class="metric">
      <span class="metric-label">Total Tests:</span>
      <span class="metric-value">${this.report.totalTests}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Passed:</span>
      <span class="metric-value passed">${this.report.totalPassed}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Failed:</span>
      <span class="metric-value failed">${this.report.totalFailed}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Pass Rate:</span>
      <span class="metric-value ${this.report.passRate >= 80 ? 'passed' : 'warning'}">${this.report.passRate.toFixed(1)}%</span>
    </div>
    <div class="metric">
      <span class="metric-label">Duration:</span>
      <span class="metric-value">${(this.report.duration / 1000).toFixed(2)}s</span>
    </div>
    
    <h2>System Health</h2>
    <div class="health">
      <div class="health-item">Backend: <span class="${this.report.systemHealth.backend ? 'passed' : 'failed'}">${this.report.systemHealth.backend ? '✓ Healthy' : '✗ Down'}</span></div>
      <div class="health-item">Frontend: <span class="${this.report.systemHealth.frontend ? 'passed' : 'failed'}">${this.report.systemHealth.frontend ? '✓ Healthy' : '✗ Down'}</span></div>
      <div class="health-item">Database: <span class="${this.report.systemHealth.database ? 'passed' : 'failed'}">${this.report.systemHealth.database ? '✓ Healthy' : '✗ Down'}</span></div>
    </div>
    
    ${this.report.recommendations.length > 0 ? `
    <div class="recommendations">
      <h3>Recommendations</h3>
      <ul>
        ${this.report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
    
    ${this.report.backendResults ? `
    <h2>Backend Tests</h2>
    <p>Total: ${this.report.backendResults.total} | Duration: ${this.report.backendResults.duration}ms</p>
    ${this.report.backendResults.errors.length > 0 ? `
      <h3>Errors</h3>
      <ul>
        ${this.report.backendResults.errors.map(err => `<li>${err}</li>`).join('')}
      </ul>
    ` : '<p class="passed">All backend tests passed! ✓</p>'}
    ` : ''}
    
    ${this.report.frontendResults ? `
    <h2>Frontend Tests</h2>
    <p>Total: ${this.report.frontendResults.total} | Duration: ${this.report.frontendResults.duration}ms</p>
    ${this.report.frontendResults.errors.length > 0 ? `
      <h3>Errors</h3>
      <ul>
        ${this.report.frontendResults.errors.map(err => `<li>${err}</li>`).join('')}
      </ul>
    ` : '<p class="passed">All frontend tests passed! ✓</p>'}
    ` : ''}
  </div>
</body>
</html>
    `;
    
    const reportPath = path.join(__dirname, 'test-report.html');
    fs.writeFileSync(reportPath, html);
    log(`HTML report generated: ${reportPath}`, colors.green);
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const config: Partial<TestAgentConfig> = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--backend-only':
        config.runBackendTests = true;
        config.runFrontendTests = false;
        break;
      case '--frontend-only':
        config.runBackendTests = false;
        config.runFrontendTests = true;
        break;
      case '--no-report':
        config.generateReport = false;
        break;
      case '--verbose':
        config.verboseLogging = true;
        break;
      case '--continuous':
        config.continuousMode = true;
        break;
      case '--max-retries':
        config.maxRetries = parseInt(args[++i]);
        break;
      case '--help':
        printHelp();
        process.exit(0);
    }
  }
  
  const agent = new TestAgent(config);
  await agent.run();
}

function printHelp() {
  console.log(`
🤖 Tarsit Intelligent Test Agent

Usage: pnpm test:agent [options]

Options:
  --backend-only      Run only backend tests
  --frontend-only     Run only frontend tests
  --no-report         Skip HTML report generation
  --verbose           Show detailed test output
  --continuous        Run tests continuously
  --max-retries <n>   Set maximum retry attempts (default: 3)
  --help              Show this help message

Examples:
  pnpm test:agent                    # Run all tests
  pnpm test:agent --backend-only     # Test backend only
  pnpm test:agent --verbose          # Show detailed logs
  `);
}

// Run the agent
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
