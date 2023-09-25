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
    moveItem: async ({itemId, toListId, order}: {itemId: string, toListId: string, order: number}) => {
        return prisma.kanbanItem.update({
            where: {
                id: parseInt(itemId)
            },
            data: {
                order: order,
                kanbanColumnId: parseInt(toListId),
            },
        });
    },
    addItem: async ({name, columnId, order}: {name: string, columnId: string, order: number}) => {
        return prisma.kanbanItem.create({
            data: {
                name: name,
                done: false,
                order: order,
                kanbanColumnId: parseInt(columnId)
            },
        });
    },
    moveColumn: async ({columnId, order}: {columnId: string, order: number}) => {
        return prisma.kanbanColumn.update({
            where: {
                id: parseInt(columnId)
            },
            data: {
                order: order
            },
        });
    },
    addColumn: async ({name, order}: {name: string, order: number}) => {
        return prisma.kanbanColumn.create({
            data: {
                name: name,
                order: order
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