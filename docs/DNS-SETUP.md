# DNS Configuration for LeanScale Multi-Tenant Setup

## Overview

The LeanScale sales app uses **subdomain-based routing** under `clients.leanscale.team` for multi-tenant customer portals:
- `parafimy.clients.leanscale.team` → Customer "Parafimy"
- `acme.clients.leanscale.team` → Customer "Acme"
- `demo.clients.leanscale.team` → Demo instance

**This approach keeps the main `leanscale.team` domain completely separate** - no risk of conflicts with existing subdomains like gtm, docs, culture, etc.

## DNS Configuration

### Step 1: Add `clients` Subdomain

Add a single DNS record for the `clients` subdomain that points to your Netlify app:

| Type | Name | Value | Notes |
|------|------|-------|-------|
| CNAME | `clients` | `leanscale-sales-app.netlify.app` | Base for customer portals |

### Step 2: Add Wildcard Under `clients`

Add a wildcard record specifically for `*.clients.leanscale.team`:

| Type | Name | Value | Notes |
|------|------|-------|-------|
| CNAME | `*.clients` | `leanscale-sales-app.netlify.app` | Catches all customer subdomains |

### Step 3: Configure Netlify

1. Go to **Netlify > Site > Domain settings**
2. Add domain: `clients.leanscale.team`
3. Add domain: `*.clients.leanscale.team` (wildcard)
4. Ensure HTTPS is enabled for both

### How It Works

```
DNS Resolution:

parafimy.clients.leanscale.team
  → Matches wildcard "*.clients"
  → Routes to: leanscale-sales-app.netlify.app
  → Middleware extracts "parafimy" as customer slug ✓

gtm.leanscale.team
  → Matches explicit CNAME record for "gtm"
  → Routes to: gtm-diagnostic-app.netlify.app ✓
  → Completely unaffected by clients wildcard

leanscale.team (root)
  → Matches @ A record
  → Routes to main website ✓
```

## Why `clients.leanscale.team`?

| Approach | Risk | Maintenance |
|----------|------|-------------|
| `*.leanscale.team` | Could conflict with future subdomains | Must maintain reserved list |
| `*.clients.leanscale.team` | Zero risk to main domain | No reserved list needed |

By using a dedicated subdomain (`clients`), customer portals are completely isolated from your main domain infrastructure.

## Existing Subdomains (Unchanged)

Your existing subdomains continue to work exactly as before:

| Subdomain | Purpose |
|-----------|---------|
| `gtm.leanscale.team` | GTM diagnostic app |
| `go.leanscale.team` | Link shortener |
| `docs.leanscale.team` | Documentation |
| `playbooks.leanscale.team` | Docusaurus playbooks |
| `culture.leanscale.team` | Culture site |
| `montecarlo.leanscale.team` | Monte Carlo site |
| `www.leanscale.team` | Main website |

These don't need any changes - they're on a completely different subdomain path.

## Testing

### Test Customer Subdomains

```bash
# Should route to sales app with customer context
curl -I https://parafimy.clients.leanscale.team
curl -I https://demo.clients.leanscale.team

# Check the customer slug is being set
curl -I https://parafimy.clients.leanscale.team | grep "set-cookie"
# Should see: set-cookie: customer-slug=parafimy
```

### Test Existing Subdomains Still Work

```bash
# Should route to your existing apps (unaffected)
curl -I https://gtm.leanscale.team
curl -I https://docs.leanscale.team
curl -I https://culture.leanscale.team
```

### Local Development Testing

No DNS changes needed for local dev. Use query parameters:

```bash
# Test different customers locally
http://localhost:3000?customer=demo
http://localhost:3000?customer=parafimy
http://localhost:3000?customer=newcustomer
```

## Adding a New Customer

1. **Add to Supabase:**
   ```sql
   INSERT INTO customers (slug, name, password, ...)
   VALUES ('newcustomer', 'New Customer', 'securepass123', ...);
   ```

2. **That's it!** No DNS changes needed - the wildcard handles it.

3. **Access via:** `https://newcustomer.clients.leanscale.team`

## Troubleshooting

### Customer subdomain not loading

1. Check DNS propagation: `dig parafimy.clients.leanscale.team`
2. Should resolve to your Netlify app IP
3. If not resolving, ensure both `clients` CNAME and `*.clients` wildcard are configured

### Customer not found in database

1. Check Supabase: customer should have matching `slug` value
2. Slugs are case-insensitive (converted to lowercase)
3. New customer? Add them to the `customers` table first

### SSL certificate errors

1. Netlify needs time to provision wildcard SSL
2. Wait a few minutes after adding `*.clients.leanscale.team` domain
3. Check Netlify dashboard for certificate status

## Example DNS Zone File

```
; leanscale.team DNS Zone

; Root domain and main site
@            A      75.2.60.5
www          CNAME  main-site.netlify.app.

; Existing subdomains (unchanged)
gtm          CNAME  gtm-app.netlify.app.
go           CNAME  go-redirects.netlify.app.
docs         CNAME  docs.netlify.app.
playbooks    CNAME  playbooks.netlify.app.
culture      CNAME  culture-site.netlify.app.
montecarlo   CNAME  montecarlo-site.netlify.app.

; Customer portal subdomain (NEW)
clients      CNAME  leanscale-sales-app.netlify.app.
*.clients    CNAME  leanscale-sales-app.netlify.app.
```
