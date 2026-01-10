# 🤖 Tarsit Intelligent Test Agent

An autonomous, intelligent testing agent that comprehensively tests your entire Tarsit platform with smart features like automatic retries, rate limit handling, and detailed reporting.

## Features

### 🎯 Core Capabilities
- **Full Website Testing**: Tests both backend API and frontend application
- **Smart Health Checks**: Validates system health before running tests
- **Intelligent Retries**: Automatically retries failed tests with configurable attempts
- **Rate Limit Handling**: Detects rate limiting and waits appropriately
- **Comprehensive Reports**: Generates beautiful HTML reports with detailed insights
- **Actionable Recommendations**: Provides specific suggestions to fix issues
- **Continuous Monitoring**: Optional continuous testing mode
- **Flexible Configuration**: Extensive CLI options for custom test runs

### 📊 What Gets Tested
- ✅ Backend API (68+ endpoints across 12 test suites)
- ✅ Frontend pages and components
- ✅ Authentication & authorization
- ✅ CRUD operations
- ✅ Search functionality
- ✅ Real-time messaging
- ✅ File uploads
- ✅ Admin functions
- ✅ Database connectivity
- ✅ Error handling

## Quick Start

### Prerequisites
Make sure your services are running:
```bash
# Terminal 1: Start backend
cd apps/api
pnpm dev

# Terminal 2: Start frontend  
cd apps/web
pnpm dev
```

### Run the Test Agent

```bash
# Run all tests (backend + frontend)
cd tarsit-testing
node test-agent.js

# Or use pnpm (add script to package.json)
pnpm test:agent
```

## Usage

### Basic Commands

```bash
# Run all tests
node test-agent.js

# Run backend tests only
node test-agent.js --backend-only

# Run frontend tests only
node test-agent.js --frontend-only

# Show detailed logs
node test-agent.js --verbose

# Skip HTML report generation
node test-agent.js --no-report

# Set custom retry count
node test-agent.js --max-retries 5

# Get help
node test-agent.js --help
```

### Advanced Usage

```bash
# Backend only with verbose logging
node test-agent.js --backend-only --verbose

# Run with more retries (good for rate-limited environments)
node test-agent.js --max-retries 5

# Quick test without report
node test-agent.js --backend-only --no-report
```

## Configuration

### Default Settings
- **Max Retries**: 3 attempts per test suite
- **Retry Delay**: 5 seconds between retries
- **Rate Limit Delay**: 60 seconds after detecting rate limits
- **Health Check Interval**: 10 seconds
- **Report Generation**: Enabled
- **Verbose Logging**: Disabled

### Environment Variables
The agent uses the same environment as your backend:
```env
API_URL=http://localhost:4000/api
FRONTEND_URL=http://localhost:3000
DATABASE_URL=your_database_url
```

## Output

### Terminal Output
The agent provides real-time colored output:
- 🟢 **Green**: Tests passing, system healthy
- 🔴 **Red**: Tests failing, system errors
- 🟡 **Yellow**: Warnings, retries, rate limits
- 🔵 **Cyan**: Information, progress updates
- ⚪ **Gray**: Timestamps, metadata

### HTML Report
Generated at `tarsit-testing/test-report.html`:
- **Summary Dashboard**: Overall test metrics and pass rates
- **System Health**: Status of backend, frontend, and database
- **Test Results**: Detailed breakdown of all test suites
- **Recommendations**: Actionable insights to fix issues
- **Timestamps**: When tests were run and how long they took

Example report structure:
```
📊 Test Summary
   Total Tests: 68
   Passed: 45 (66.2%)
   Failed: 23 (33.8%)
   Duration: 45.3s

💚 System Health
   Backend: ✓ Healthy
   Frontend: ✓ Healthy
   Database: ✓ Healthy

💡 Recommendations
   - Fix 23 failing tests for 100% coverage
   - Rate limiting detected - consider delays
   - Most tests passing - review specific failures
```

## How It Works

### Execution Flow
1. **Initialization**: Loads configuration and prints banner
2. **Health Checks**: Validates backend, frontend, and database
3. **Backend Tests**: Runs comprehensive API test suite
4. **Frontend Tests**: Tests pages and user flows
5. **Report Generation**: Creates HTML report with insights
6. **Summary**: Prints results and recommendations
7. **Exit**: Returns appropriate exit code (0 = pass, 1 = fail)

### Smart Features

#### 🔄 Automatic Retries
If tests fail, the agent:
1. Analyzes the failure reason
2. Waits before retrying (configurable delay)
3. Re-runs the failed suite
4. Reports final results after max retries

#### 🚦 Rate Limit Detection
When rate limits are hit:
1. Detects 429 errors or rate limit messages
2. Waits for extended period (60s by default)
3. Retries with fresh rate limit quota
4. Adds recommendation about rate limits

#### 💡 Smart Recommendations
Based on test results, suggests:
- Starting missing services
- Fixing database connections
- Adjusting rate limits
- Reviewing specific test failures
- Next steps to improve pass rate

## Integration with Existing Tests

The agent uses your existing test infrastructure:
- `backend/test-backend.js` - Backend test runner
- `frontend/test-frontend.js` - Frontend test runner
- All test suites in `backend/tests/`
- Test utilities and helpers

No changes needed to existing tests - just run the agent!

## Troubleshooting

### Backend Not Responding
```
❌ Backend is not responding. Start the backend server.
```
**Solution**: Start backend with `cd apps/api && pnpm dev`

### Rate Limiting Issues
```
⚠️ Rate limiting detected. Consider increasing rate limits for testing.
```
**Solutions**:
- Use `--max-retries 5` for more retry attempts
- Wait a few minutes between test runs
- Increase backend rate limits for test environment
- Use existing users instead of creating new ones

### Database Connection Failed
```
❌ Database connection failed. Check database configuration.
```
**Solution**: Verify DATABASE_URL in `apps/api/.env`

### Frontend Tests Skipped
```
⚠️ Frontend is not responding. Skipping frontend tests.
```
**Solution**: Start frontend with `cd apps/web && pnpm dev`

## Adding to Package.json

Add this script to `tarsit-testing/package.json`:
```json
{
  "scripts": {
    "test:agent": "node test-agent.js",
    "test:agent:backend": "node test-agent.js --backend-only",
    "test:agent:frontend": "node test-agent.js --frontend-only",
    "test:agent:verbose": "node test-agent.js --verbose"
  }
}
```

Then run with:
```bash
pnpm test:agent
pnpm test:agent:backend
pnpm test:agent:verbose
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: pnpm install
      - name: Start services
        run: |
          pnpm dev:backend &
          pnpm dev:frontend &
          sleep 10
      - name: Run test agent
        run: cd tarsit-testing && node test-agent.js
      - name: Upload report
        uses: actions/upload-artifact@v2
        with:
          name: test-report
          path: tarsit-testing/test-report.html
```

## Best Practices

1. **Run regularly**: Use the agent before commits and deployments
2. **Check reports**: Review HTML reports for detailed insights
3. **Fix failures**: Address failing tests promptly
4. **Monitor health**: Use health checks to catch issues early
5. **Use verbose mode**: Enable for debugging specific issues
6. **Adjust retries**: Increase for flaky tests or rate limits
7. **Keep services running**: Ensure backend/frontend are up before testing

## Comparison with Manual Testing

| Feature | Manual Testing | Test Agent |
|---------|---------------|------------|
| Time | 30-60 minutes | 1-2 minutes |
| Coverage | Partial | Complete (68+ tests) |
| Consistency | Variable | Always same |
| Reports | None | Detailed HTML |
| Retries | Manual | Automatic |
| Rate Limits | Manual wait | Auto-handled |
| CI/CD Ready | No | Yes |

## Future Enhancements

- [ ] Continuous monitoring mode
- [ ] Email notifications for failures
- [ ] Performance benchmarking
- [ ] Visual regression testing
- [ ] Load testing capabilities
- [ ] Test result history tracking
- [ ] Slack/Discord integration
- [ ] Custom test scheduling

## Support

For issues or questions:
1. Check the HTML report for detailed error messages
2. Run with `--verbose` flag for more information
3. Review the TESTING_STATUS.md for current issues
4. Check backend/frontend logs for service errors

## License

Part of the Tarsit platform testing suite.
