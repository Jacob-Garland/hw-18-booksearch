import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'url';
import db from './config/connection.js';
import routes from './routes/index.js';
import { ApolloServer } from '@apollo/server';
import typeDefs from './schemas/typeDefs.js';
import resolvers from './schemas/resolvers.js';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use('/graphql', expressMiddleware(server));

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/dist')));
  }

  app.use(routes);

  db().then(() => {
    app.listen(PORT, () => 
      console.log(`🌍 Now listening on http://localhost:${PORT}`),
    );
  });
}

startApolloServer().catch((err) => console.error("Error starting server:", err));
