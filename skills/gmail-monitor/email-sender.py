#!/usr/bin/env python3
"""
Email sender with duplicate prevention
Tracks all sends and prevents duplicates within 24h window
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
import os
import re
from datetime import datetime, timedelta
import hashlib

SEND_LOG = '/data/.openclaw/workspace/memory/email-sends.jsonl'

def load_credentials():
    """Load Gmail credentials"""
    env_path = '/data/.openclaw/workspace/.env.gale'
    with open(env_path, 'r') as f:
        content = f.read()
        match = re.search(r'GMAIL_APP_PASSWORD=(.+)', content)
        if not match:
            raise ValueError("GMAIL_APP_PASSWORD not found")
        return match.group(1).strip()

def get_email_hash(to, subject):
    """Generate unique hash for email (to + subject)"""
    key = f"{to}||{subject}".lower()
    return hashlib.sha256(key.encode()).hexdigest()[:16]

def check_recent_send(email_hash, hours=24):
    """Check if this email was sent recently"""
    if not os.path.exists(SEND_LOG):
        return None
    
    cutoff = datetime.now() - timedelta(hours=hours)
    
    with open(SEND_LOG, 'r') as f:
        for line in f:
            try:
                record = json.loads(line.strip())
                if record['hash'] == email_hash:
                    sent_at = datetime.fromisoformat(record['timestamp'])
                    if sent_at > cutoff:
                        return record
            except:
                continue
    return None

def log_send(to, cc, subject, email_hash):
    """Log successful send"""
    os.makedirs(os.path.dirname(SEND_LOG), exist_ok=True)
    
    record = {
        'timestamp': datetime.now().isoformat(),
        'to': to,
        'cc': cc,
        'subject': subject,
        'hash': email_hash,
        'from': 'gale.boetticher.ai@gmail.com'
    }
    
    with open(SEND_LOG, 'a') as f:
        f.write(json.dumps(record) + '\n')

def send_email(to, cc, subject, body, force=False):
    """
    Send email with duplicate prevention
    
    Args:
        to: Comma-separated recipient list
        cc: Comma-separated CC list (always includes GC)
        subject: Email subject
        body: Plain text body
        force: Skip duplicate check if True
    
    Returns:
        dict with status and message
    """
    # Always ensure GC is CC'd
    cc_list = [c.strip() for c in cc.split(',') if c.strip()]
    if 'giancarlo.cudrig@gmail.com' not in cc_list:
        cc_list.append('giancarlo.cudrig@gmail.com')
    cc = ', '.join(cc_list)
    
    # Check for duplicates
    email_hash = get_email_hash(to, subject)
    
    if not force:
        recent = check_recent_send(email_hash, hours=24)
        if recent:
            return {
                'status': 'duplicate',
                'message': f"Email already sent at {recent['timestamp']}",
                'previous_send': recent
            }
    
    # Send email
    try:
        app_password = load_credentials()
        
        msg = MIMEMultipart()
        msg['From'] = 'gale.boetticher.ai@gmail.com'
        msg['To'] = to
        msg['Cc'] = cc
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login('gale.boetticher.ai@gmail.com', app_password)
        server.send_message(msg)
        server.quit()
        
        # Log success
        log_send(to, cc, subject, email_hash)
        
        return {
            'status': 'sent',
            'message': 'Email sent successfully',
            'to': to,
            'cc': cc,
            'subject': subject,
            'hash': email_hash
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 4:
        print("Usage: email-sender.py <to> <subject> <body_file> [--force]")
        sys.exit(1)
    
    to = sys.argv[1]
    subject = sys.argv[2]
    body_file = sys.argv[3]
    force = '--force' in sys.argv
    
    with open(body_file, 'r') as f:
        body = f.read()
    
    result = send_email(to, '', subject, body, force=force)
    print(json.dumps(result, indent=2))
