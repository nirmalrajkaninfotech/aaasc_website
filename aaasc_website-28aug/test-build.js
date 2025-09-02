const { execSync } = require('child_process');

console.log('Starting build test...');
try {
  console.log('Running npm list next...');
  console.log(execSync('npm list next', { encoding: 'utf-8' }));
  
  console.log('\nRunning npx next info...');
  console.log(execSync('npx next info', { encoding: 'utf-8' }));
  
  console.log('\nRunning npx next build --debug...');
  console.log(execSync('npx next build --debug', { encoding: 'utf-8', stdio: 'pipe' }));
} catch (error) {
  console.error('Error during build test:');
  console.error('Error message:', error.message);
  console.error('Error output:', error.stderr?.toString() || error.stdout?.toString());
}
