#!/usr/bin/env python3
import smtplib
import imaplib
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import re
from datetime import datetime

# Read credentials
with open('/data/.openclaw/workspace/.env.gale', 'r') as f:
    content = f.read()
    app_password = re.search(r'GMAIL_APP_PASSWORD=(.+)', content).group(1).strip()

# Read email body
with open('/data/.openclaw/workspace/drafts/nadia-suv-analysis-draft.md', 'r') as f:
    email_body = f.read()

# Remove header section
sections = email_body.split('---')
email_body = '---'.join(sections[2:]).strip()

# Basic markdown cleanup
email_body = re.sub(r'^#{1,6}\s+', '', email_body, flags=re.MULTILINE)
email_body = re.sub(r'\*\*(.+?)\*\*', r'\1', email_body)
email_body = re.sub(r'\*(.+?)\*', r'\1', email_body)
email_body = re.sub(r'`(.+?)`', r'\1', email_body)

# Create message
msg = MIMEMultipart()
msg['From'] = 'gale.boetticher.ai@gmail.com'
msg['To'] = 'n.randello@easygo.io, nadia.randello@gmail.com'
msg['Subject'] = 'Family SUV Deep Dive: Tesla vs Luxury Rivals (+ Novated Lease Game-Changer)'
msg['Date'] = email.utils.formatdate(localtime=True)

msg.attach(MIMEText(email_body, 'plain'))

# Send via Gmail SMTP
try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login('gale.boetticher.ai@gmail.com', app_password)
    
    text = msg.as_string()
    server.sendmail('gale.boetticher.ai@gmail.com', 
                   ['n.randello@easygo.io', 'nadia.randello@gmail.com'], 
                   text)
    server.quit()
    
    print('✅ Email sent via SMTP')
    
    # Now save to Sent folder via IMAP
    imap = imaplib.IMAP4_SSL('imap.gmail.com')
    imap.login('gale.boetticher.ai@gmail.com', app_password)
    imap.append('[Gmail]/Sent Mail', '\\Seen', imaplib.Time2Internaldate(datetime.now()), text.encode('utf-8'))
    imap.logout()
    
    print('✅ Copy saved to Sent folder')
    print('To: n.randello@easygo.io, nadia.randello@gmail.com')
    print('Subject: Family SUV Deep Dive: Tesla vs Luxury Rivals (+ Novated Lease Game-Changer)')
    
except Exception as e:
    print(f'❌ Failed: {e}')
    raise
