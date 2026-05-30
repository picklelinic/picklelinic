import type { DefaultSession } from "next-auth";

type AppRole = "admin" | "manager" | "user";

declare module "next-auth" {
  interface User {
    role: AppRole;
    departmentId?: number | null;
    teamId?: number | null;
    isSecretary?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: AppRole;
      departmentId: number | null;
      teamId: number | null;
      isSecretary: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AppRole;
    departmentId?: number | null;
    teamId?: number | null;
    isSecretary?: boolean;
  }
}
