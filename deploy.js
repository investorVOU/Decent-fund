import ghpages from 'gh-pages';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Build directory path
const buildDir = path.join(__dirname, 'dist');

// Deploy options
const options = {
  branch: 'gh-pages',
  repo: 'https://github.com/investorVOU/Decent-fund.git', // Already correct!
  message: 'Auto-generated deployment to GitHub Pages',
  user: {
    name: 'GitHub Pages Deployer',
    email: 'github-pages-deployer@example.com'
  }
};

console.log('Deploying to GitHub Pages...');

ghpages.publish(buildDir, options, (err) => {
  if (err) {
    console.error('Deployment error:', err);
    process.exit(1);
  } else {
    console.log('Successfully deployed to GitHub Pages!');
    console.log('Your site will be available at: https://investorVOU.github.io/Decent-fund/');
  }
});