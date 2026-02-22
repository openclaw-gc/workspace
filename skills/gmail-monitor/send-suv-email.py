#!/usr/bin/env python3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import re

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
msg['From'] = 'Gale (for GC) <gale.boetticher.ai@gmail.com>'
msg['To'] = 'n.randello@easygo.io, nadia.randello@gmail.com'
msg['Subject'] = 'Family SUV Deep Dive: Tesla vs Luxury Rivals (+ Novated Lease Game-Changer)'

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
    
    print('✅ Email sent successfully to:')
    print('   - n.randello@easygo.io')
    print('   - nadia.randello@gmail.com')
    print('Subject: Family SUV Deep Dive: Tesla vs Luxury Rivals (+ Novated Lease Game-Changer)')
except Exception as e:
    print(f'❌ Failed to send email: {e}')
    raise
