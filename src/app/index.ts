import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4'
import bodyParser from 'body-parser';
import cors from "cors";
import { GraphqlContext } from "../interface";
import JWTService from "../services/jwt";

// import cors from 'cors';
import express from 'express';
import { User } from './user';
// app.use(bodyParser)
export async function initServer(): Promise<any> {



    const app = express();
    app.use(bodyParser.json());
    app.use(cors());

    app.get("/", (req, res) =>
        res.status(200).json({ message: "Everything is good" })
    );
    // 

    const server = new ApolloServer<GraphqlContext>({
        typeDefs: `
        ${User.types}

            type Query {
                ${User.queries}
            }
    `,
        resolvers: {
            Query: {
                ...User.resolvers.queries,
            }
        },
    });
    // Note you must call `start()` on the `ApolloServer`
    // instance before passing the instance to `expressMiddleware`
    await server.start();

    // Specify the path where we'd like to mount our server
    // //highlight-start
    app.use(
        "/graphql",
        expressMiddleware(server, {
            context: async ({ req, res }) => {
                return {
                    user: req.headers.authorization
                        ? JWTService.decodeToken(
                            req.headers.authorization.split("Bearer ")[1]
                        )
                        : undefined,
                };
            },
        }))
    //highlight-end
    return app
}