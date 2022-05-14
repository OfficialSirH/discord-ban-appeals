import * as jwt from "jsonwebtoken";

export interface UserDataPayload {
  id: string;
  avatar: string;
  username: string;
  discriminator: string;
  email: string;
}

export const createJwt = (data: UserDataPayload, duration: number) => {
  const options: jwt.SignOptions = {
    issuer: "ban-appeals-backend",
  };

  if (duration) {
    options.expiresIn = duration;
  }

  return jwt.sign(data, <string>process.env.JWT_SECRET, options);
};

export const decodeJwt = (token: string) => {
  return <jwt.JwtPayload>jwt.verify(token, <string>process.env.JWT_SECRET);
};
