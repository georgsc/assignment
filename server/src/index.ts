import express from 'express'
import {graphqlHTTP} from 'express-graphql'
import {buildSchema} from 'graphql'
import {readFileSync} from 'fs'
import cors from 'cors'
import {PrismaClient} from "@prisma/client";

const schema = buildSchema(readFileSync('./schema.graphql', 'utf-8'))

const prisma = new PrismaClient();

const root = {
    kanban: async () => {
        return prisma.kanbanColumn.findMany({
            include: {
                items: true
            },
        });
    },
    moveItem: async ({itemId, toListId, index}: {itemId: string, toListId: string, index: number}) => {
        return prisma.kanbanItem.update({
            where: {
                id: parseInt(itemId)
            },
            data: {
                index: index,
                kanbanColumnId: parseInt(toListId),
            },
        });
    },
    addItem: async ({name, columnId, index}: {name: string, columnId: string, index: number}) => {
        return prisma.kanbanItem.create({
            data: {
                name: name,
                done: false,
                index: index,
                kanbanColumnId: parseInt(columnId)
            },
        });
    }
}

const app = express()

//TODO: remove cors?
app.use(cors())

app.use(
    "/graphql",
    graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true,
    })
)

app.listen(4000, () => console.log('Server Started 🔥\nBrowse http://localhost:4000/graphql'))