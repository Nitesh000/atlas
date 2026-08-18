export type CreateWebsiteInput = {
  url: string;
  organizationId: string;
};

export type Website = {
  id: string;
  url: string;
  status: "pending" | "crawling" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
};
