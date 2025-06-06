// src/graphql/client.ts
import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { onError } from "@apollo/client/link/error";
import toast from 'react-hot-toast';

const httpLink = createHttpLink({
  // Use relative path for the API route within the same application
  uri: '/api/graphql',
  // You might add fetch options here if needed, like custom headers
  // fetchOptions: { cache: 'no-store' }, // Example: disable caching for HTTP requests
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}, Code: ${extensions?.code}`
      );
      // Show user-friendly toast messages based on error code or message
      let displayMessage = message;
      if (extensions?.code === 'UNAUTHENTICATED') {
          displayMessage = 'Please log in to continue.';
          // Optional: Redirect to login page
          // window.location.href = '/login';
      } else if (extensions?.code === 'FORBIDDEN') {
          displayMessage = 'You do not have permission to perform this action.';
      } else if (extensions?.code === 'BAD_USER_INPUT') {
          // Try to get a more specific message if available
          displayMessage = `Input Error: ${message}`;
      } else if (extensions?.code === 'INTERNAL_SERVER_ERROR') {
           displayMessage = 'An unexpected server error occurred. Please try again later.';
      }

      toast.error(displayMessage);
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    toast.error(`Network error: ${networkError.message}. Please check your connection.`);
  }

  // You can conditionally retry operations here using forward(operation) if needed
});


// Combine links
const link = ApolloLink.from([
    errorLink,
    httpLink,
]);

const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache({
      // Optional: Configure type policies for better cache management
      // typePolicies: {
      //   Query: {
      //     fields: {
      //       // Example: Paginated field policy
      //       posts: {
      //         keyArgs: ["type"], // Separate cache entries based on 'type' argument
      //         merge(existing = [], incoming) {
      //           return [...existing, ...incoming];
      //         },
      //       },
      //     },
      //   },
      //   User: {
      //       keyFields: ["id"], // Default, but good to be explicit
      //   },
      //   // Add policies for other types as needed
      // }
  }),
  // Optional: Default options for queries and mutations
   defaultOptions: {
       watchQuery: {
         fetchPolicy: 'cache-and-network', // Good default: show cached data first, then update from network
         // errorPolicy: 'ignore', // Or 'all' to get partial data and errors
       },
       query: {
           fetchPolicy: 'network-only', // Default for one-off queries: always fetch fresh data
           errorPolicy: 'all',
       },
       mutate: {
           errorPolicy: 'all', // Get potential errors back from mutations
       }
   },
   // Enable connecting to Apollo DevTools in development
   connectToDevTools: process.env.NODE_ENV === 'development',
});

export default client;