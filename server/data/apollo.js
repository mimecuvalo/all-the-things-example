import { ApolloServer } from 'apollo-server-express';
import createLoaders from './graphql/loaders';
import models from './models';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/schema';

/**
 * The main entry point for our Apollo/GraphQL server.
 * Works by apply middleware to the app.
 */
export default function apolloServer(app) {
  const schema = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req, connection }) => {
      if (connection) {
        // For subscriptions
        return {
          models,
        };
      }

      const currentUser = req.session.user;

      return {
        currentUser,
        loaders: createLoaders(),
        models,
      };
    },
  });
  schema.applyMiddleware({ app });
}
