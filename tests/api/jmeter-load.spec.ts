import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as fs from 'fs';

test.describe('Performance Testing Integration', () => {

  test('Execute JMeter Load Test via Playwright', async () => {
    // Increase timeout since load tests typically exceed Playwright's 30-second default
    test.setTimeout(60000);

    const jmxFile = './load-tests/booker-load.jmx';
    const resultsFile = './load-tests/results.jtl';

    // Delete previous results to prevent JMeter from appending and corrupting the new run
    if (fs.existsSync(resultsFile)) {
      fs.unlinkSync(resultsFile);
    }

    // Dynamically select the command: Windows local vs. Ubuntu GitHub Actions runner
    const jmeterCmd = process.platform === 'win32' 
      ? 'C:\\apache-jmeter\\bin\\jmeter.bat' 
      : 'jmeter';

    console.log(`Starting JMeter load test using command: ${jmeterCmd}`);
    
    // Execute the Non-GUI load test synchronously
    execSync(`${jmeterCmd} -n -t ${jmxFile} -l ${resultsFile}`, { stdio: 'inherit' });

    // Validate the test completed successfully by verifying the output file exists
    expect(fs.existsSync(resultsFile)).toBeTruthy();
  });

});