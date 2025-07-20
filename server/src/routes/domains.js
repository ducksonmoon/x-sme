const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const dns = require('dns').promises;
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateDomain = [
  body('domain')
    .trim()
    .isLength({ min: 3, max: 253 })
    .matches(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)
    .withMessage('Domain must be a valid domain name'),
  body('type')
    .optional()
    .isIn(['CUSTOM', 'SUBDOMAIN'])
    .withMessage('Type must be either CUSTOM or SUBDOMAIN'),
];

// @desc    Get all domains for a business
// @route   GET /api/domains/business/:businessId
// @access  Private (Business owners and staff only)
router.get('/business/:businessId', authenticate, authorize('BUSINESS_OWNER', 'STAFF'), async (req, res, next) => {
  try {
    const { businessId } = req.params;

    // Check if user has access to this business
    if (req.user.businessId !== businessId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this business',
      });
    }

    const domains = await prisma.domain.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: domains,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add a new domain
// @route   POST /api/domains
// @access  Private (Business owners only)
router.post('/', authenticate, authorize('BUSINESS_OWNER'), validateDomain, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { domain, type = 'CUSTOM' } = req.body;
    const businessId = req.user.businessId;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: 'Business not found',
      });
    }

    // Check if domain already exists
    const existingDomain = await prisma.domain.findUnique({
      where: { domain },
    });

    if (existingDomain) {
      return res.status(400).json({
        success: false,
        error: 'Domain already exists',
      });
    }

    // Check if business already has too many domains (limit to 5)
    const domainCount = await prisma.domain.count({
      where: { businessId },
    });

    if (domainCount >= 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum number of domains (5) reached',
      });
    }

    // Create domain record
    const newDomain = await prisma.domain.create({
      data: {
        businessId,
        domain: domain.toLowerCase(),
        type,
        status: 'PENDING',
        sslStatus: 'PENDING',
        dnsRecords: {
          cname: `widget.${process.env.MAIN_DOMAIN || 'x-sme.ir'}`,
          txt: `xsme-verification=${businessId}`,
        },
      },
    });

    res.status(201).json({
      success: true,
      data: newDomain,
      message: 'Domain added successfully. Please configure DNS records to verify ownership.',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify domain ownership
// @route   POST /api/domains/:id/verify
// @access  Private (Business owners only)
router.post('/:id/verify', authenticate, authorize('BUSINESS_OWNER'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;

    // Get domain
    const domain = await prisma.domain.findFirst({
      where: { id, businessId },
    });

    if (!domain) {
      return res.status(404).json({
        success: false,
        error: 'Domain not found',
      });
    }

    // Verify DNS records
    const verificationResult = await verifyDomainDNS(domain);

    if (verificationResult.success) {
      // Update domain status
      const updatedDomain = await prisma.domain.update({
        where: { id },
        data: {
          status: 'VERIFIED',
          verifiedAt: new Date(),
          metadata: {
            ...domain.metadata,
            lastVerification: new Date(),
            verificationMethod: 'DNS',
          },
        },
      });

      res.json({
        success: true,
        data: updatedDomain,
        message: 'Domain verified successfully',
      });
    } else {
      // Update domain with verification failure
      await prisma.domain.update({
        where: { id },
        data: {
          status: 'FAILED',
          metadata: {
            ...domain.metadata,
            lastVerification: new Date(),
            verificationError: verificationResult.error,
          },
        },
      });

      res.status(400).json({
        success: false,
        error: 'Domain verification failed',
        details: verificationResult.error,
      });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Activate domain
// @route   POST /api/domains/:id/activate
// @access  Private (Business owners only)
router.post('/:id/activate', authenticate, authorize('BUSINESS_OWNER'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;

    // Get domain
    const domain = await prisma.domain.findFirst({
      where: { id, businessId },
    });

    if (!domain) {
      return res.status(404).json({
        success: false,
        error: 'Domain not found',
      });
    }

    if (domain.status !== 'VERIFIED') {
      return res.status(400).json({
        success: false,
        error: 'Domain must be verified before activation',
      });
    }

    // Check SSL certificate
    const sslResult = await checkSSLCertificate(domain.domain);

    // Update domain status
    const updatedDomain = await prisma.domain.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        sslStatus: sslResult.success ? 'ACTIVE' : 'FAILED',
        metadata: {
          ...domain.metadata,
          activatedAt: new Date(),
          sslInfo: sslResult.info,
        },
      },
    });

    res.json({
      success: true,
      data: updatedDomain,
      message: 'Domain activated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete domain
// @route   DELETE /api/domains/:id
// @access  Private (Business owners only)
router.delete('/:id', authenticate, authorize('BUSINESS_OWNER'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;

    // Get domain
    const domain = await prisma.domain.findFirst({
      where: { id, businessId },
    });

    if (!domain) {
      return res.status(404).json({
        success: false,
        error: 'Domain not found',
      });
    }

    // Delete domain
    await prisma.domain.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Domain deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get domain verification instructions
// @route   GET /api/domains/:id/instructions
// @access  Private (Business owners only)
router.get('/:id/instructions', authenticate, authorize('BUSINESS_OWNER'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;

    // Get domain
    const domain = await prisma.domain.findFirst({
      where: { id, businessId },
    });

    if (!domain) {
      return res.status(404).json({
        success: false,
        error: 'Domain not found',
      });
    }

    // Check if instructions are stored in metadata
    let instructions;
    if (domain.metadata && domain.metadata.instructions) {
      instructions = domain.metadata.instructions;
    } else {
      // Fallback to generating instructions on the fly
      instructions = generateDNSInstructions(domain);
      
      // Store the generated instructions for future use
      await prisma.domain.update({
        where: { id },
        data: {
          metadata: {
            ...domain.metadata,
            instructions: instructions,
            lastInstructionUpdate: new Date()
          }
        }
      });
    }

    res.json({
      success: true,
      data: instructions,
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to verify DNS records
async function verifyDomainDNS(domain) {
  try {
    const dnsRecords = domain.dnsRecords;
    
    // Verify CNAME record
    if (dnsRecords.cname) {
      try {
        const cnameRecords = await dns.resolveCname(domain.domain);
        const expectedCname = dnsRecords.cname;
        
        if (!cnameRecords.some(record => record === expectedCname)) {
          return {
            success: false,
            error: `CNAME record not found. Expected: ${expectedCname}`,
          };
        }
      } catch (error) {
        return {
          success: false,
          error: `CNAME verification failed: ${error.message}`,
        };
      }
    }

    // Verify TXT record for ownership
    if (dnsRecords.txt) {
      try {
        const txtRecords = await dns.resolveTxt(domain.domain);
        const expectedTxt = dnsRecords.txt;
        
        if (!txtRecords.some(records => records.some(record => record === expectedTxt))) {
          return {
            success: false,
            error: `TXT record not found. Expected: ${expectedTxt}`,
          };
        }
      } catch (error) {
        return {
          success: false,
          error: `TXT verification failed: ${error.message}`,
        };
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `DNS verification failed: ${error.message}`,
    };
  }
}

// Helper function to check SSL certificate
async function checkSSLCertificate(domain) {
  try {
    // This is a simplified SSL check
    // In production, you'd want to use a proper SSL certificate validation library
    const https = require('https');
    
    return new Promise((resolve) => {
      const req = https.request({
        hostname: domain,
        port: 443,
        method: 'HEAD',
        timeout: 5000,
      }, (res) => {
        resolve({
          success: true,
          info: {
            statusCode: res.statusCode,
            headers: res.headers,
          },
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          error: error.message,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          error: 'SSL check timeout',
        });
      });

      req.end();
    });
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Helper function to generate DNS instructions
function generateDNSInstructions(domain) {
  const dnsRecords = domain.dnsRecords;
  const mainDomain = process.env.MAIN_DOMAIN || 'x-sme.ir';

  return {
    domain: domain.domain,
    type: domain.type,
    records: [
      {
        type: 'CNAME',
        name: domain.domain,
        value: dnsRecords.cname,
        description: 'Points your domain to our widget server',
      },
      {
        type: 'TXT',
        name: domain.domain,
        value: dnsRecords.txt,
        description: 'Verifies domain ownership',
      },
    ],
    instructions: [
      '1. Log in to your domain registrar or DNS provider',
      '2. Add the CNAME record to point your domain to our server',
      '3. Add the TXT record to verify domain ownership',
      '4. Wait for DNS propagation (can take up to 48 hours)',
      '5. Click "Verify Domain" to check if records are configured correctly',
    ],
    notes: [
      'DNS changes can take up to 48 hours to propagate globally',
      'Make sure to remove any conflicting A or CNAME records',
      'The TXT record is only needed for verification and can be removed after activation',
    ],
  };
}

module.exports = router; 