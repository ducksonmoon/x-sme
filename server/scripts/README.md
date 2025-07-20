# Domain Instructions Scripts

This directory contains scripts for managing domain verification instructions in the X-SME system (Iranian Platform).

## Scripts Overview

### 1. `set-domain-instructions.js`

Comprehensive script for setting up domain instruction templates and updating existing domains.

**Features:**

- Predefined instruction templates for CUSTOM and SUBDOMAIN types (in Persian)
- Provider-specific instructions for Iranian platforms (Parsijoo, IranHost, Hostinger)
- International provider support (Cloudflare, GoDaddy, Namecheap)
- Updates all pending domains with instructions
- Creates reusable instruction templates

**Usage:**

```bash
cd server/scripts
node set-domain-instructions.js
```

### 2. `add-domain-instructions.js`

Simple script for adding instructions to specific domains or updating all pending domains.

**Features:**

- Add instructions to a specific domain (in Persian)
- Update all pending domains
- Generate instructions on-the-fly
- Command-line interface

**Usage:**

```bash
# Update all pending domains
node add-domain-instructions.js

# Update a specific domain
node add-domain-instructions.js --domain example.com

# Show help
node add-domain-instructions.js --help
```

## Domain Instruction Structure

Each domain instruction contains:

```json
{
  "domain": "example.com",
  "type": "CUSTOM",
  "records": [
    {
      "type": "CNAME",
      "name": "@",
      "value": "widget.x-sme.ir",
      "description": "دامنه شما را به سرور ویجت ما متصل می‌کند"
    },
    {
      "type": "TXT",
      "name": "@",
      "value": "xsme-verification=businessId",
      "description": "مالکیت دامنه را تایید می‌کند"
    }
  ],
  "instructions": [
    "1. وارد پنل مدیریت دامنه یا ارائه‌دهنده DNS خود شوید",
    "2. به بخش مدیریت DNS یا تنظیمات DNS بروید",
    "3. یک رکورد CNAME با جزئیات زیر اضافه کنید:",
    "   - نام: @ (یا برای دامنه اصلی خالی بگذارید)",
    "   - مقدار: widget.x-sme.ir",
    "   - TTL: 3600 (یا پیش‌فرض)",
    "4. یک رکورد TXT با جزئیات زیر اضافه کنید:",
    "   - نام: @ (یا برای دامنه اصلی خالی بگذارید)",
    "   - مقدار: xsme-verification=businessId",
    "   - TTL: 3600 (یا پیش‌فرض)",
    "5. تغییرات را ذخیره کنید و منتظر انتشار DNS بمانید (تا 48 ساعت)",
    "6. روی \"تایید دامنه\" کلیک کنید تا بررسی کنید که رکوردها درست تنظیم شده‌اند"
  ],
  "notes": [
    "تغییرات DNS ممکن است تا 48 ساعت طول بکشد تا در سراسر جهان منتشر شود",
    "مطمئن شوید که رکوردهای A یا CNAME متضاد را حذف کرده‌اید",
    "رکورد TXT فقط برای تایید نیاز است و پس از فعال‌سازی می‌تواند حذف شود"
  ]
}
```

## Supported Domain Types

### CUSTOM Domain

- Used for root domains (example.com)
- Requires CNAME and TXT records at root level
- More complex setup process

### SUBDOMAIN

- Used for subdomains (booking.example.com)
- Requires CNAME and TXT records for the subdomain
- Simpler setup process

## Supported DNS Providers

### Iranian Platforms

#### Parsijoo

- Persian language interface instructions
- DNS management specific steps
- TTL configuration guidance

#### IranHost

- Panel management navigation
- DNS Zone Editor instructions
- Support contact information

#### Hostinger

- Domain management interface
- DNS/Nameservers configuration
- Record management tips

### International Platforms

#### Cloudflare

- Additional steps for proxy settings
- Cache management considerations
- TTL optimization

#### GoDaddy

- Specific UI navigation steps
- Record type selection guidance
- Propagation time expectations

#### Namecheap

- Advanced DNS interface steps
- Automatic TTL recommendations
- Record management tips

## Database Storage

Instructions are stored in the `metadata` field of the `domains` table:

```json
{
  "instructions": {
    /* instruction object */
  },
  "lastInstructionUpdate": "2024-01-15T10:30:00.000Z",
  "otherMetadata": "..."
}
```

## API Integration

The domain instructions are served via the API endpoint:

```
GET /api/domains/:id/instructions
```

The endpoint:

1. Checks for stored instructions in metadata
2. Falls back to generating instructions on-the-fly
3. Stores generated instructions for future use
4. Returns instructions in the expected format

## Frontend Integration

The frontend expects instructions in the following format:

```typescript
interface DomainInstructions {
  domain: string;
  type: string;
  records: Array<{
    type: string;
    name: string;
    value: string;
    description: string;
  }>;
  instructions: string[];
  notes: string[];
}
```

## Environment Variables

The scripts use the following environment variables:

- `MAIN_DOMAIN`: The main domain for the widget service (default: x-sme.ir)
- `DATABASE_URL`: PostgreSQL connection string

## Running the Scripts

### Prerequisites

1. Database is set up and migrations are run
2. Environment variables are configured
3. Node.js dependencies are installed

### Basic Usage

```bash
# Navigate to scripts directory
cd server/scripts

# Set up comprehensive instruction templates
node set-domain-instructions.js

# Add instructions to all pending domains
node add-domain-instructions.js

# Add instructions to a specific domain
node add-domain-instructions.js --domain mydomain.com
```

### Verification

After running the scripts, verify that:

1. Domains have instructions in their metadata
2. API endpoint returns instructions correctly
3. Frontend displays instructions properly

## Troubleshooting

### Common Issues

1. **Domain not found**

   - Check if the domain exists in the database
   - Verify the domain name spelling

2. **Database connection errors**

   - Check DATABASE_URL environment variable
   - Ensure database is running and accessible

3. **Permission errors**
   - Ensure the script has database write permissions
   - Check if the domain belongs to the correct business

### Debug Mode

Add console logging to see detailed information:

```javascript
// In the scripts, add:
console.log("Processing domain:", domain);
console.log("Generated instructions:", instructions);
```

## Contributing

When adding new features:

1. Update the instruction templates
2. Add provider-specific instructions if needed
3. Update this README with new information
4. Test with different domain types and providers

## Future Enhancements

Potential improvements:

1. **More DNS Providers**: Add instructions for additional providers
2. **Dynamic Instructions**: Generate instructions based on domain analysis
3. **Visual Instructions**: Include screenshots or diagrams
4. **Multi-language Support**: Support for Persian (primary) and other languages
5. **Automated Verification**: Check DNS records automatically
