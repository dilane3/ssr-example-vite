import handler from "../server.prod";

export default async (req, res) => {
  return await handler(req, res);
};
