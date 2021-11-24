import "reflect-metadata";

import { ApolloServer } from "apollo-server-micro";
import { buildSchema } from "type-graphql";
import { IncomingMessage, ServerResponse } from "http";

import { CategoryResolver } from "../../../entity/Category.entity";
import connectionWrapper from "../../../lib/typeorm";


export interface Context {
}

// register 3rd party IOC container
// TypeORM.useContainer(Container);

export const config = {
  api: {
    bodyParser: false,
  },
};

let apolloServerHandler: (req: any, res: any) => Promise<void>;

/**
 * Create the Apollo Server.
 */
const getApolloServerHandler = async () => {
  if (!apolloServerHandler) {
    await connectionWrapper()
    const schema = await buildSchema({
      resolvers: [CategoryResolver],
    });
    const server = new ApolloServer({ schema })
    await server.start().then(() => {
        apolloServerHandler = server.createHandler({path: "/api/graphql",})
    });
  }
  return apolloServerHandler;
};

const serverHandler = async (req: IncomingMessage, res: ServerResponse) => {
  const apolloServerHandler = await getApolloServerHandler();
  return apolloServerHandler(req, res);
};

export default serverHandler
