const Imap = require('imap');

const imap = new Imap({
  user: 'gale.boetticher.ai@gmail.com',
  password: 'vmzzfacfdozzmsbl',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

function checkSent() {
  return new Promise((resolve, reject) => {
    imap.once('ready', () => {
      imap.openBox('[Gmail]/Sent Mail', true, (err, box) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Search for emails sent in last 5 minutes to Nadia
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        imap.search([['SINCE', fiveMinAgo], ['TO', 'nadia.randello@gmail.com']], (err, results) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (results && results.length > 0) {
            console.log(`✅ Found ${results.length} email(s) to Nadia in Sent folder`);
            console.log('Most recent message IDs:', results.slice(-3));
          } else {
            console.log('❌ No recent email to Nadia found in Sent folder');
          }
          
          imap.end();
          resolve(results);
        });
      });
    });
    
    imap.once('error', reject);
    imap.once('end', () => resolve());
    imap.connect();
  });
}

checkSent().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
