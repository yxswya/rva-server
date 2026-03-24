export const PasswordUtil = {
  hash: async (password: string): Promise<string> => {
    return Bun.password.hash(password, "bcrypt");
  },

  verify: async (password: string, hash: string): Promise<boolean> => {
    return Bun.password.verify(password, hash);
  },
};
