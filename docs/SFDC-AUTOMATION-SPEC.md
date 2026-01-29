# Salesforce → Customer Site Automation Spec

## Overview

Automatically create personalized sales app instances when a new Opportunity is created in Salesforce, enriching the customer record with logo and branding via Clay.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Salesforce    │────▶│  n8n / GitHub   │────▶│    Supabase     │
│  Opp Created    │     │    Actions      │     │  Customer DB    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │      Clay       │
                        │   Enrichment    │
                        └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  Slack Notif    │
                        │  + Sales Link   │
                        └─────────────────┘
```

## Trigger

**Salesforce Opportunity Created** with:
- Stage = "Discovery" or "Meeting Booked" (configurable)
- Record Type = "New Business"

## Data Flow

### 1. SFDC Webhook/Trigger

**Option A: n8n with Salesforce Trigger**
- Use n8n's Salesforce node with "Record Created" trigger
- Filter: `RecordType.Name = 'New Business' AND StageName = 'Meeting Booked'`

**Option B: GitHub Actions via Salesforce Outbound Message**
- Configure Salesforce Outbound Message on Opportunity create
- Webhook hits GitHub Actions workflow dispatch endpoint

### 2. Extract Required Fields

From the Opportunity and related Account:
```json
{
  "accountId": "001xxxxxxxx",
  "accountName": "Acme Corp",
  "accountDomain": "acme.com",
  "oppId": "006xxxxxxxx",
  "oppName": "Acme Corp - Growth Package",
  "ownerEmail": "ae@leanscale.team",
  "ownerName": "John Smith"
}
```

### 3. Clay Enrichment

Call Clay API to enrich account data:

**Input:** Company domain (e.g., `acme.com`)

**Output:**
- Company logo URL
- Company description
- Industry
- Employee count
- Funding stage
- LinkedIn URL
- Twitter handle

**Clay Table Setup:**
1. Create Clay table with webhook trigger
2. Columns: domain, logo_url, description, industry, employee_count
3. Use Clay's built-in enrichment providers (Clearbit, Apollo, etc.)
4. Return enriched data via webhook response or poll

### 4. Generate Customer Slug

Convert company name to URL-safe slug:
```javascript
function generateSlug(accountName) {
  return accountName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with dashes
    .replace(/^-|-$/g, '')        // Trim leading/trailing dashes
    .substring(0, 50);            // Max length
}

// "Acme Corp, Inc." → "acme-corp-inc"
// "AI-Powered Solutions" → "ai-powered-solutions"
```

### 5. Create Supabase Customer Record

Insert into `customers` table:
```sql
INSERT INTO customers (
  slug,
  name,
  logo_url,
  nda_link,
  intake_form_link,
  youtube_video_id,
  google_slides_embed_url,
  assigned_team,
  sfdc_account_id,
  sfdc_opp_id,
  created_at
) VALUES (
  'acme-corp',
  'Acme Corp',
  'https://logo.clearbit.com/acme.com',
  'https://powerforms.docusign.net/...', -- Default NDA
  'https://forms.fillout.com/t/...', -- Default intake form
  'M7oECb8xsy0', -- Default video
  'https://docs.google.com/presentation/d/e/...', -- Default slides
  '["izzy", "brian", "dave"]', -- Default or from Opp owner
  '001xxxxxxxx',
  '006xxxxxxxx',
  NOW()
);
```

### 6. Send Notifications

**Slack Message to Sales Rep:**
```
🎉 New Sales Site Created for Acme Corp

📎 Customer Portal: https://clients.leanscale.team/c/acme-corp
📋 Admin Dashboard: https://clients.leanscale.team/admin

Opportunity: Acme Corp - Growth Package
Owner: John Smith

Actions:
• Share portal link with prospect
• Customize presentation deck if needed
• Update NDA link once signed
```

**Optional: Update SFDC Opportunity**
- Add custom field `Sales_Portal_URL__c` with the generated link

## Implementation Options

### Option A: n8n Workflow (Recommended)

**Advantages:**
- Visual workflow builder
- Built-in Salesforce and Supabase nodes
- Easy to modify and debug
- Already using n8n for other workflows

**Workflow Steps:**
1. Salesforce Trigger (Opportunity Created)
2. IF node (check Stage)
3. HTTP Request to Clay webhook
4. Wait/Webhook node for Clay response
5. Code node (generate slug)
6. Supabase Insert
7. Slack Message
8. Salesforce Update (optional)

### Option B: GitHub Actions

**Advantages:**
- Version controlled
- No additional infrastructure
- Free for public repos

**Workflow File:** `.github/workflows/create-customer-site.yml`
```yaml
name: Create Customer Site

on:
  repository_dispatch:
    types: [sfdc-opp-created]

jobs:
  create-site:
    runs-on: ubuntu-latest
    steps:
      - name: Enrich with Clay
        run: |
          curl -X POST https://api.clay.com/v1/tables/${{ secrets.CLAY_TABLE_ID }}/rows \
            -H "Authorization: Bearer ${{ secrets.CLAY_API_KEY }}" \
            -d '{"domain": "${{ github.event.client_payload.domain }}"}'

      - name: Create Customer in Supabase
        run: |
          curl -X POST '${{ secrets.SUPABASE_URL }}/rest/v1/customers' \
            -H "apikey: ${{ secrets.SUPABASE_SERVICE_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{...}'

      - name: Send Slack Notification
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {"text": "New site created for ${{ github.event.client_payload.account }}"}
```

## Configuration

### Environment Variables

```
# Salesforce
SFDC_CLIENT_ID=xxx
SFDC_CLIENT_SECRET=xxx
SFDC_USERNAME=xxx
SFDC_PASSWORD=xxx
SFDC_SECURITY_TOKEN=xxx

# Clay
CLAY_API_KEY=xxx
CLAY_TABLE_ID=xxx

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx

# Slack
SLACK_WEBHOOK_URL=xxx
```

### Default Values

Store in Supabase `config` table or environment:
```json
{
  "default_nda_link": "https://powerforms.docusign.net/...",
  "default_intake_form": "https://forms.fillout.com/t/...",
  "default_video_id": "M7oECb8xsy0",
  "default_slides_url": "https://docs.google.com/...",
  "default_team": ["izzy", "brian", "dave", "kavean"]
}
```

## Database Schema Updates

Add SFDC reference fields to `customers` table:
```sql
ALTER TABLE customers ADD COLUMN sfdc_account_id TEXT;
ALTER TABLE customers ADD COLUMN sfdc_opp_id TEXT;
ALTER TABLE customers ADD COLUMN enrichment_data JSONB;
CREATE INDEX idx_customers_sfdc_account ON customers(sfdc_account_id);
```

## Error Handling

1. **Duplicate slug**: Append random suffix (e.g., `acme-corp-a1b2`)
2. **Clay enrichment fails**: Use placeholder logo, proceed with creation
3. **Supabase insert fails**: Retry 3x, then alert via Slack
4. **SFDC update fails**: Log error, don't block site creation

## Monitoring

- Log all automation runs to `automation_logs` table
- Slack alert on failures
- Weekly digest of sites created

## Security Considerations

- Use Supabase service role key (not anon key) for inserts
- Validate incoming SFDC webhook signatures
- Rate limit Clay API calls
- Don't expose SFDC IDs in public URLs

## Future Enhancements

1. **Custom branding**: Pull brand colors from Clay/Clearbit
2. **Custom deck generation**: Auto-create Google Slides from template
3. **Meeting scheduler**: Auto-add Calendly link based on Opp owner
4. **Deactivation**: Archive customer when Opp marked Closed Lost
5. **Usage tracking**: Log portal visits back to SFDC
