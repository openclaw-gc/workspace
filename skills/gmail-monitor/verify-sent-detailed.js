const Imap = require('imap');
const { simpleParser } = require('mailparser');

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
        
        console.log(`📬 Total messages in Sent folder: ${box.messages.total}`);
        
        // Get last 5 messages
        const fetch = imap.seq.fetch(`${Math.max(1, box.messages.total - 4)}:*`, {
          bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
          struct: true
        });
        
        const messages = [];
        
        fetch.on('message', (msg, seqno) => {
          msg.on('body', (stream, info) => {
            simpleParser(stream, (err, parsed) => {
              if (parsed) {
                messages.push({
                  seqno,
                  from: parsed.from?.text,
                  to: parsed.to?.text,
                  subject: parsed.subject,
                  date: parsed.date
                });
              }
            });
          });
        });
        
        fetch.once('end', () => {
          console.log('\n📧 Last 5 sent emails:');
          messages.sort((a, b) => b.seqno - a.seqno).forEach(m => {
            console.log(`\nSeq ${m.seqno}:`);
            console.log(`  To: ${m.to}`);
            console.log(`  Subject: ${m.subject}`);
            console.log(`  Date: ${m.date}`);
          });
          
          const nadiaEmail = messages.find(m => 
            m.subject?.includes('SUV') || 
            m.to?.includes('nadia.randello')
          );
          
          if (nadiaEmail) {
            console.log('\n✅ FOUND: SUV email to Nadia');
          } else {
            console.log('\n❌ NOT FOUND: No SUV email to Nadia in recent messages');
          }
          
          imap.end();
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
