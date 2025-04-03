const ghPages = require('gh-pages');
const path = require('path');

// Configuration object for GitHub Pages deployment
const config = {
  // Branch where the built files will be committed
  branch: 'gh-pages',
  
  // Repository information - change this if you need to deploy to a different repo
  repo: 'https://github.com/investorVOU/Decent-fund.git',
  
  // Directory containing the built files
  dist: path.join(process.cwd(), 'dist'),
  
  // Optional: Message to use for the deployment commit
  message: 'Auto-deploy via deploy.js script',
  
  // Include dotfiles (like .nojekyll to prevent GitHub's Jekyll processing)
  dotfiles: true,
  
  // Log output to the console
  silent: false,
};

// Create a .nojekyll file to prevent GitHub from trying to process the site with Jekyll
require('fs').writeFileSync(path.join(config.dist, '.nojekyll'), '');

console.log('Deploying to GitHub Pages...');
console.log(`Repository: ${config.repo}`);
console.log(`Branch: ${config.branch}`);

// Execute the deployment
ghPages.publish(
  config.dist,
  {
    branch: config.branch,
    repo: config.repo,
    message: config.message,
    dotfiles: config.dotfiles,
    silent: config.silent,
  },
  (err) => {
    if (err) {
      console.error('Deployment error:', err);
      process.exit(1);
    } else {
      console.log('Deployment complete!');
      console.log('Your site should be live at: https://investorVOU.github.io/Decent-fund/');
    }
  }
);