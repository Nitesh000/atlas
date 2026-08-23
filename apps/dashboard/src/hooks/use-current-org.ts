import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

type Organization = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export function useCurrentOrg() {
  return useQuery({
    queryKey: ["currentOrg"],
    queryFn: async () => {
      const res = await api.get("/orgs");
      const orgs = res.data as Organization[];
      return orgs.length > 0 ? orgs[0] : null;
    },
  });
}
