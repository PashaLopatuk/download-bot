import z from "zod";

export const validateUrl = (payload: any): payload is string => {
  const value = z.url().validate(payload, {});

  return value;
};
