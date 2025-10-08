// src/graphql/client.ts
import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, concat } from '@apollo/client';

export const createApolloClient = (company_id: number, user: string) => {
  const authMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: {
        webkey: 'E0D02A31-7BA4-4A1C-A7FA-0396DDB22EB5',
        empresa_id: company_id,
        user,
      },
    });
    return forward(operation);
  });

  const httpLink = new HttpLink({
    uri: 'https://api-graphql-ogkj.onrender.com/graphql',
  });

  return new ApolloClient({
    link: concat(authMiddleware, httpLink),
    cache: new InMemoryCache(),
  });
};
