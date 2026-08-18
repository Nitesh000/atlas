export type CreateApiKeyInput = {
  name: string;
  organizationId: string;
  allowedDomains: string[] | null;
};

export type ApiKey = {
  id: string;
  key: string;
  name: string;
  allowedDomains: string[] | null;
  createdAt: Date;
};
