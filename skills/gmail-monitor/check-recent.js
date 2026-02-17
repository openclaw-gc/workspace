const Imap = require('imap');
const { simpleParser } = require('mailparser');

const imap = new Imap({
  user: 'gale.boetticher.ai@gmail.com',
  password: 'vmzzfacfdozzmsbl',
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

imap.once('ready', () => {
  imap.openBox('INBOX', false, (err, box) => {
    if (err) throw err;
    
    // Search for ALL emails from last 2 hours
    const since = new Date(Date.now() - 2 * 3600000);
    const searchCriteria = [['SINCE', since]];
    
    imap.search(searchCriteria, (err, results) => {
      if (err) throw err;
      console.log(`Found ${results.length} emails in last 2 hours`);
      
      if (results.length === 0) {
        imap.end();
        return;
      }
      
      const fetch = imap.fetch(results, { bodies: '' });
      fetch.on('message', (msg) => {
        msg.on('body', (stream) => {
          simpleParser(stream, (err, parsed) => {
            console.log(`From: ${parsed.from?.text}, Subject: ${parsed.subject}`);
          });
        });
      });
      fetch.once('end', () => {
        imap.end();
      });
    });
  });
});

imap.once('error', (err) => {
  console.error('Error:', err);
});

imap.connect();
