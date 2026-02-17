# Security Audit Report - Hostinger VPS
**Date:** 2026-02-16  
**Time:** 18:12 GMT+8  
**Audit Type:** Read-only security assessment  

---

## Executive Summary

**Environment:** Docker containerized OpenClaw installation on Debian 13 (trixie)  
**Security Posture:** ⚠️ **MODERATE RISK**  
**Critical Issues:** 1  
**Warnings:** 1  
**Informational:** 1  

---

## 1. System Information

### Operating System
```
PRETTY_NAME="Debian GNU/Linux 13 (trixie)"
VERSION_ID="13"
VERSION_CODENAME=trixie
DEBIAN_VERSION_FULL=13.3
Kernel: Linux 6.8.0-100-generic #100-Ubuntu SMP PREEMPT_DYNAMIC
Architecture: x86_64
```

### Container Environment
- **Container ID:** f9cd5d8db6b5
- **Base OS:** Debian GNU/Linux 13 (trixie)
- **Kernel:** Ubuntu 6.8.0-100-generic (host kernel)
- **Running User:** `node` (non-root) ✅

---

## 2. Network & Firewall Status

### Listening Ports
❌ **Tools not available:** `ss` and `netstat` commands not found in container  
⚠️ **Recommendation:** Install `iproute2` or `net-tools` package for network diagnostics

### Firewall Status
❌ **No traditional firewall detected:**
- `ufw` not installed/available
- `iptables` not accessible (requires root or not installed)

**Analysis:** Container environment relies on host-level firewall and Docker network isolation. This is typical for containerized deployments, but:
- ✅ Container isolation provides network security
- ⚠️ Host firewall status unknown (requires host-level audit)
- ⚠️ Port exposure depends on Docker port mappings

---

## 3. OpenClaw Security Audit Results

### 🔴 CRITICAL (1 issue)

**gateway.control_ui.insecure_auth - Control UI allows insecure HTTP auth**
```
gateway.controlUi.allowInsecureAuth=true allows token-only auth over HTTP 
and skips device identity.
```
**Impact:** Authentication tokens transmitted over unencrypted HTTP connections can be intercepted  
**Fix:** 
- Disable `allowInsecureAuth`
- Switch to HTTPS (e.g., Tailscale Serve)
- Restrict to localhost only

---

### ⚠️ WARN (1 issue)

**fs.auth_profiles.perms_readable - auth-profiles.json is readable by others**
```
File: /data/.openclaw/agents/main/agent/auth-profiles.json
Current permissions: 644 (rw-r--r--)
Contains: API keys and OAuth tokens
```
**Impact:** Sensitive credentials readable by any user on the system  
**Fix:** 
```bash
chmod 600 /data/.openclaw/agents/main/agent/auth-profiles.json
```

---

### ℹ️ INFO - Attack Surface Summary
```
groups: open=0, allowlist=2
tools.elevated: enabled
hooks: disabled
browser control: enabled
```

**Analysis:**
- ✅ No open security groups
- ✅ Allowlist mode active (2 groups)
- ⚠️ Elevated tools enabled (review if necessary)
- ✅ Hooks disabled (reduces attack surface)
- ℹ️ Browser control enabled (verify if needed)

---

## 4. Software Updates

### OpenClaw Status
```
Current Install: pnpm
Channel: stable (default)
Status: Update available (npm 2026.2.15)
```

⚠️ **Action Required:** Update available
```bash
openclaw update
```

---

## 5. SSH Configuration

❌ **SSH not configured in container**
- `/etc/ssh/sshd_config` does not exist
- Container accessed via Docker exec or host SSH

**Analysis:** This is normal for containerized deployments. SSH security depends on:
1. Host VPS SSH configuration (requires separate host audit)
2. Docker socket access controls
3. Container access restrictions

---

## 6. Automatic Updates

### Unattended Upgrades Status
❌ **Not installed:** `unattended-upgrades` package not found

**Impact:** Security updates not automatically applied  
**Recommendation for container:** 
- Container updates should be managed via image rebuilds
- Host system should have unattended-upgrades enabled
- Consider automated container image updates

---

## 7. Process & User Analysis

### Current User
```
User: node (non-root)
```
✅ **Good:** OpenClaw not running as root (principle of least privilege)

### Running Processes
```
root     1 - docker-init (PID 1)
root     7 - runuser wrapper
node     9 - node server.mjs (OpenClaw main)
node    21 - openclaw CLI
node    28 - openclaw-gateway (768MB memory)
```

**Analysis:**
- ✅ Main processes running as `node` user
- ✅ Proper process isolation
- ℹ️ Gateway consuming 768MB memory (normal)

### Environment Security
⚠️ **Gateway token in environment variables:**
```
OPENCLAW_GATEWAY_TOKEN=GxEMyiutAf5zEji0NkH2rBxQQyDhStbu
OPENCLAW_GATEWAY_PORT=18789
```
**Note:** Environment variables visible to all processes running as same user. This is acceptable in single-user container but worth noting.

---

## 8. Risk Assessment Matrix

| Category | Risk Level | Notes |
|----------|-----------|-------|
| Authentication | 🔴 HIGH | Insecure HTTP auth enabled |
| File Permissions | 🟡 MEDIUM | Credentials readable by others |
| Network Exposure | 🟡 MEDIUM | Cannot verify without host audit |
| Updates | 🟡 MEDIUM | Update available, no auto-updates |
| User Privileges | 🟢 LOW | Running as non-root |
| SSH Security | ⚠️ N/A | Container-based (host dependent) |

---

## 9. Immediate Action Items

### Priority 1 (Critical - Fix Immediately)
1. **Disable insecure HTTP auth** or move to HTTPS/localhost
   - Review OpenClaw gateway configuration
   - Set `gateway.controlUi.allowInsecureAuth=false`

### Priority 2 (High - Fix Within 24h)
2. **Fix auth-profiles.json permissions**
   ```bash
   chmod 600 /data/.openclaw/agents/main/agent/auth-profiles.json
   ```

3. **Apply OpenClaw update**
   ```bash
   openclaw update
   ```

### Priority 3 (Medium - Review & Plan)
4. **Verify host firewall configuration**
   - Audit host VPS firewall rules
   - Ensure only necessary ports exposed

5. **Review elevated tools usage**
   - Verify if `tools.elevated` is required
   - Consider disabling if not needed

6. **Install network diagnostic tools** (optional)
   ```bash
   apt-get update && apt-get install -y iproute2 net-tools
   ```

---

## 10. Container-Specific Considerations

### Security Model
✅ **Strengths:**
- Process isolation via containers
- Non-root execution
- Limited attack surface in container

⚠️ **Dependencies:**
- Host security is paramount
- Docker daemon security critical
- Volume mount permissions important

### Recommendations
1. Verify host SSH hardening (PermitRootLogin=no, key-only auth)
2. Ensure Docker socket not exposed unnecessarily
3. Review Docker port mappings for minimal exposure
4. Consider using Docker secrets for sensitive data
5. Implement host-level firewall rules (ufw/iptables on host)

---

## 11. Compliance Notes

- **OWASP Top 10:** Address insecure transport (A02:2021)
- **CIS Docker Benchmark:** Verify host meets container security guidelines
- **Data Protection:** Credentials in world-readable file violates least privilege

---

## Conclusion

The OpenClaw installation is running in a reasonably secure containerized environment with **one critical security issue** that requires immediate attention. The insecure HTTP authentication configuration poses a significant risk of credential interception. File permission issues and pending updates should be addressed promptly.

The container architecture provides good isolation, but security ultimately depends on proper host configuration, which should be audited separately.

**Overall Grade:** C+ (Functional but needs security hardening)

---

**Auditor Note:** This audit was read-only as requested. No changes were made to the system.
