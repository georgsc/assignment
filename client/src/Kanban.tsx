import {Box, Stack} from "@mui/material";
import {DragDropContext, Droppable, DropResult, ResponderProvided} from 'react-beautiful-dnd'
import request from 'graphql-request'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {graphql} from './gql'
import {useCallback} from "react";
import {DraggableKanbanList} from "./components/DraggableKanbanList";
import {KanbanQuery} from "./gql/graphql";
import {ButtonInput} from "./components/ButtonInput";

const GRAPHQL_SERVER = 'http://localhost:4000/graphql';

const KANBAN_QUERY = graphql(/* GraphQL */`
    query Kanban {
        kanban {
            id
            name
            index
            items {
                id
                name
                done
                index
            }
        }
    }
`)

const MUTATE_MOVE_ITEM = graphql(/* GraphQL */`
    mutation MoveItem($itemId: ID!, $toListId: ID!, $index: Int!) {
        moveItem(itemId: $itemId, toListId: $toListId, index: $index) {
            id
            name
            done
            index
        }
    }
`)

const MUTATE_ADD_ITEM = graphql(/* GraphQL */`
    mutation AddItem($name: String!, $columnId: ID!, $index: Int!) {
        addItem(name: $name, columnId: $columnId, index: $index) {
            id
            name
            done
            index
        }
    }
`)

const MUTATE_MOVE_COLUMN = graphql(/* GraphQL */`
    mutation MoveColumn($columnId: ID!,$index: Int!) {
        moveColumn(columnId: $columnId, index: $index) {
            id
            name
            index            
        }
    }
`)

const MUTATE_ADD_COLUMN = graphql(/* GraphQL */`
    mutation AddColumn($name: String!, $index: Int!) {
        addColumn(name: $name,  index: $index) {
            id
            name
            index
        }
    }
`)

export function Kanban() {
    const {data, status} = useQuery({
        queryKey: ['kanban'],
        queryFn: async () =>
            request(
                GRAPHQL_SERVER,
                KANBAN_QUERY,
            ),
    });

    const client = useQueryClient()

    const moveItemMutation = useMutation({
        mutationFn: async (variables: { itemId: string, toListId: string, index: number }) =>
            request(
                GRAPHQL_SERVER,
                MUTATE_MOVE_ITEM,
                variables,
            ),
        //optimistic update
        onMutate: async ({index, itemId, toListId}) => {
            client.setQueryData(['kanban'], (old: KanbanQuery | undefined) => {
                if(!old) return old;
                const kanban = old.kanban
                const columnFrom = kanban.find(column => column.items.find(item => item.id === itemId))
                const columnTo = kanban.find(column => column.id === toListId)
                if (!columnFrom || !columnTo) {
                    throw new Error('Column not found')
                }
                const item = columnFrom.items.find(item => item.id === itemId)
                if (!item) {
                    throw new Error('Item not found')
                }
                item.index = index;
                columnFrom.items = columnFrom.items.filter(item => item.id !== itemId)
                columnTo.items.splice(index, 0, item)
                return {kanban}
            })
        },
        // update
        onSuccess: (data, variables) => {
            client.setQueryData(['kanban'], (old: KanbanQuery | undefined) => {
                    old?.kanban.map((column) => {
                        if (column.id === variables.toListId) {
                            const remainingItems = column.items.filter(item => item.id.toString() !== variables.itemId.toString());
                            remainingItems.push(data.moveItem);
                            return {...column, items: remainingItems}
                        }
                    });
                    return old;
                }
            );
        }
    });

    const moveColumnMutation = useMutation({
        mutationFn: async (variables: { columnId: string, index: number }) =>
            request(
                GRAPHQL_SERVER,
                MUTATE_MOVE_COLUMN,
                variables,
            ),
        //optimistic update
        onMutate: async ({index, columnId}) => {
            client.setQueryData(['kanban'], (old: KanbanQuery | undefined) => {
                    old?.kanban.map((column) => {
                        if (column.id === columnId) {
                            return {...column, index: index}
                        }
                    });
                    return old;
                }
            );
        },
        // update
        onSuccess: (data, variables) => {
            client.setQueryData(['kanban'], (old: KanbanQuery | undefined) => {
                    old?.kanban.map((column) => {
                        if (column.id === variables.columnId) {
                            return data.moveColumn;
                        }
                    });
                    return old;
                }
            );
        }
    });

    const handleOnDragEnd = useCallback(async (result: DropResult, provided: ResponderProvided) => {
        if (!result.destination) return;
        if (result.destination.index === result.source.index && result.source.droppableId === result.destination.droppableId) return;
        if (result.reason === 'CANCEL') return;
        if (result.type === 'item') {
            const index = result.destination.index;
            const itemId = result.draggableId;
            const toListId = result.destination.droppableId;
            const columnFrom = data?.kanban.find(column => column.items.find(item => item.id === itemId))
            const columnTo = data?.kanban.find(column => column.id === toListId)
            if (columnFrom !== undefined && columnTo !== undefined) {
                const item = columnFrom.items.find(item => item.id === itemId)
                columnFrom.items = columnFrom.items.filter(item => item.id !== itemId)
                if (item) {
                    columnTo.items.splice(index, 0, item);
                }
                columnFrom.items.map((item, index) => {
                    moveItemMutation.mutate({
                        index: index,
                        itemId: item.id,
                        toListId: columnFrom.id,
                    });
                })
                columnTo.items.map((item, index) => {
                    moveItemMutation.mutate({
                        index: index,
                        itemId: item.id,
                        toListId: columnTo.id,
                    });
                })
            }
        }
        if(result.type === 'column' && result.destination.droppableId === 'kanban') {
            const newPos = result.destination.index;
            const columnId = result.draggableId.substring(6);
            const columnToMove =  data?.kanban.find(column => column.id === columnId)
            const remaining = data?.kanban.filter(column => column.id !== columnId)
            if (remaining !== undefined && columnToMove !== undefined) {
                remaining.splice(newPos, 0, columnToMove);
                remaining.map((movedColumn, index) => {
                    moveColumnMutation.mutate({
                        index: index,
                        columnId: movedColumn.id
                    });
                    movedColumn.index = index;
                });
            }
        }

    }, [data?.kanban])

    const addItemMutation = useMutation({
        mutationFn: async (variables: { name: string, columnId: string, index: number}) =>
            request(
                GRAPHQL_SERVER,
                MUTATE_ADD_ITEM,
                variables,
            ),
        onSuccess: (data, variables) => {
            client.setQueryData(['kanban'], (old: KanbanQuery | undefined) => {
                    old?.kanban.map((column) => {
                        if (column.id === variables.columnId) {
                            const allItems = column.items;
                            allItems.push(data.addItem);
                            return {...column, items: allItems}
                        }
                    });
                    return old;
                }
            )
        }
    });

    function handleAddItem(name: string, columnId: string, index: number): void {
        addItemMutation.mutate({name, columnId, index});
    }

    const addColumnMutation = useMutation({
        mutationFn: async (variables: { name: string, index: number}) =>
            request(
                GRAPHQL_SERVER,
                MUTATE_ADD_COLUMN,
                variables,
            ),
        onSuccess: (data, variables) => {
            client.setQueryData(['kanban'], (old: KanbanQuery | undefined) => {
                    old?.kanban.push({id: data.addColumn.id,name: data.addColumn.name, index: data.addColumn.index, items: []});
                    return old;
                }
            )
        }
    });

    function submitText(text: string): void {
        const index: number = data?.kanban.length ? data.kanban.length : 0;
        addColumnMutation.mutate({name: text, index: index});
    }

    return (
        <Box sx={{paddingBottom: 4}}>
            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId={'kanban'} direction={'horizontal'} type={'column'}>
                    {(provided) => (
                        <Stack spacing={2} margin={5} direction="row"
                               ref={provided.innerRef}
                               {...provided.droppableProps}
                        >
                            {
                                data?.kanban
                                    .sort((a, b) => a.index > b.index ? 1 : -1)
                                    .map((list, index) => (
                                        <DraggableKanbanList key={list.id}
                                                             id={list.id}
                                                             title={list.name}
                                                             items={list.items}
                                                             handleAddItem={handleAddItem}
                                                             index={index}/>
                                    ))
                            }
                            {provided.placeholder}
                            <ButtonInput buttonName={"Add column"}
                                         inputPlaceholder={"Column name"}
                                         submitText={submitText}/>
                        </Stack>
                    )}
                </Droppable>

            </DragDropContext>
        </Box>
    );
}

export default Kanban;