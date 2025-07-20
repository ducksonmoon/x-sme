export interface Domain {
  id: string;
  businessId: string;
  domain: string;
  type: "CUSTOM" | "SUBDOMAIN";
  status:
    | "PENDING"
    | "VERIFIED"
    | "ACTIVE"
    | "FAILED"
    | "EXPIRED"
    | "SUSPENDED";
  sslStatus: "PENDING" | "ACTIVE" | "FAILED" | "EXPIRED";
  verifiedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  dnsRecords?: {
    cname?: string;
    txt?: string;
  };
  metadata?: any;
}

export interface DomainInstructions {
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

export interface DomainStats {
  total: number;
  active: number;
  pending: number;
  failed: number;
}

export interface DomainFormData {
  domain: string;
  type: "CUSTOM" | "SUBDOMAIN";
}
