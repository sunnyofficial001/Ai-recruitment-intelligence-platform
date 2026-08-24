import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'screenshots');
const BASE_URL = 'http://localhost:3000';

const PRESET_TEXT_RESUME = `ALEXANDER CHEN
Email: alex.chen@email.com | Phone: 555-0199 | GitHub: github.com/alexchen

PROFESSIONAL SUMMARY
Senior Backend Engineer with 5+ years of experience designing scalable microservices in Python, FastAPI, and PostgreSQL.

TECHNICAL SKILLS
Languages: Python, TypeScript, SQL, Bash
Frameworks: FastAPI, Django, PostgreSQL, Redis, Docker, Kubernetes

PROFESSIONAL EXPERIENCE
Senior Backend Engineer - CloudScale Inc. | 2022 - Present
- Architected REST microservices using Python 3.11 and FastAPI, handling 5M+ daily requests.
- Optimized PostgreSQL query latency by 45%.

EDUCATION
B.S. in Computer Science - UC Berkeley, 2020`;

const PRESET_JD = `Position: Senior Software Backend Engineer
Required: Python 3.10+, FastAPI, SQLAlchemy, PostgreSQL, Docker, Kubernetes, REST APIs, CI/CD`;

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  
  console.log('Navigating to app...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await sleep(1500);

  // Screenshot 1: Dashboard
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-dashboard.png'), fullPage: false });
  console.log('✅ 01-dashboard.png');

  // Load preset data by filling the textareas directly
  await page.fill('textarea:first-of-type', PRESET_TEXT_RESUME);
  await page.evaluate((jd) => {
    const textareas = document.querySelectorAll('textarea');
    if (textareas[1]) {
      textareas[1].value = jd;
      textareas[1].dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, PRESET_JD);
  await sleep(500);

  // Screenshot 2: Resume Ingestion with preset
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-resume-ingestion.png'), fullPage: false });
  console.log('✅ 02-resume-ingestion.png');

  // Click "Execute Hybrid ATS Audit"
  const btn = page.getByText(/Execute Hybrid ATS Audit/i);
  await btn.click();
  console.log('Running ATS audit...');
  await sleep(6000);

  // Screenshot 3: ATS Score ring + verdict
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-ats-analysis.png'), fullPage: false });
  console.log('✅ 03-ats-analysis.png');

  // Scroll down to dimensions progress bars
  await page.evaluate(() => window.scrollBy(0, 600));
  await sleep(500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-ats-breakdown.png'), fullPage: false });
  console.log('✅ 04-ats-breakdown.png');

  // Scroll to keyword gap matrix
  await page.evaluate(() => window.scrollBy(0, 600));
  await sleep(500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-skill-gap-analysis.png'), fullPage: false });
  console.log('✅ 05-skill-gap-analysis.png');

  // Scroll to recommendations
  await page.evaluate(() => window.scrollBy(0, 600));
  await sleep(500);
  // Click first improvement item to expand
  const improvItems = page.locator('[class*="cursor-pointer"][class*="rounded-xl"]').first();
  try { await improvItems.click({ timeout: 2000 }); } catch (_) {}
  await sleep(300);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-ai-recommendations.png'), fullPage: false });
  console.log('✅ 06-ai-recommendations.png');

  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);

  // Applications tab
  const appTab = page.getByText(/Applications/i);
  await appTab.click();
  await sleep(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-application-tracker.png'), fullPage: false });
  console.log('✅ 07-application-tracker.png');

  // AI Benchmark tab
  const benchTab = page.getByText(/AI Benchmark/i);
  await benchTab.click();
  await sleep(3000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-benchmark.png'), fullPage: false });
  console.log('✅ 08-benchmark.png');

  // Architecture tab
  const archTab = page.getByText(/Architecture/i);
  await archTab.click();
  await sleep(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-architecture.png'), fullPage: false });
  console.log('✅ 09-architecture.png');

  // Versions tab
  const versTab = page.getByText(/Versions/i);
  await versTab.click();
  await sleep(800);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10-version-comparison.png'), fullPage: false });
  console.log('✅ 10-version-comparison.png');

  await browser.close();
  console.log('\nAll screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
