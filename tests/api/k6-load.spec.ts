import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as fs from 'fs';
import 'dotenv/config'; // Automatically loads the .env file from your project root

test.describe('k6 Performance Integration', () => {

  test('Execute k6 Load Test via Playwright', async () => {
    // Increase timeout since performance tests often run longer than Playwright's 30s default
    test.setTimeout(60000); 

    const k6Script = './load-tests/booker-k6-load.js';
    const k6Summary = './load-tests/k6-summary.json';

    // Remove the previous run's summary to prevent false-positive assertions
    if (fs.existsSync(k6Summary)) {
      fs.unlinkSync(k6Summary);
    }

    // Capture the target URL from your .env file, providing the sandbox as a fallback
    const targetUrl = process.env.QA_API_BASE_URL || 'https://restful-booker.herokuapp.com';
    
    console.log(`Starting k6 load test against: ${targetUrl}`);
    
    try {
      // Execute k6 synchronously, passing the dynamic URL and generating the summary JSON
      execSync(`k6 run -e BASE_URL=${targetUrl} ${k6Script} --summary-export=${k6Summary}`, { 
        stdio: 'inherit' 
      });
    } catch (error) {
      console.error('k6 execution failed. Ensure k6 is installed and accessible via system PATH.');
      throw error;
    }

    // Validate the test ran to completion by checking for the newly generated output file
    expect(fs.existsSync(k6Summary)).toBeTruthy();
  });

});