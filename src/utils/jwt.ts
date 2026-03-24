import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface JwtPayload {
  userId: string;
  username: string;
}

export const JwtUtil = {
  /**
   * 生成 JWT token
   */
  sign(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  },

  /**
   * 验证并解析 JWT token
   * @returns 解析后的 payload，验证失败返回 null
   */
  verify(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return null;
    }
  },

  /**
   * 解析 JWT token（不验证签名）
   */
  decode(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  },
};
