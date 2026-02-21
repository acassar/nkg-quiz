export type AuthenticatedRequest = Request & {
  user: {
    sub: number;
    email: string;
  };
};
