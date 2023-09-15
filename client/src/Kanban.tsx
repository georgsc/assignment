import {Box, Stack} from "@mui/material";
import {DragDropContext, Droppable, DropResult, ResponderProvided} from 'react-beautiful-dnd'
import request from 'graphql-request'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {graphql} from './gql'
import {useCallback} from "react";
import {DraggableKanbanList} from "./components/DraggableKanbanList";
import {KanbanQuery} from "./gql/graphql";

const GRAPHQL_SERVER = 'http://localhost:4000/graphql';

const KANBAN_QUERY = graphql(/* GraphQL */`
    query Kanban {
        kanban {
            id
            name
            items {
                id
                name
                done
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
        }
    }
`)

const MUTATE_ADD_ITEM = graphql(/* GraphQL */`
    mutation AddItem($name: String!, $columnId: ID!) {
        addItem(name: $name, columnId: $columnId) {
            id
            name
            done
        }
    }
`)

export function Kanban() {
    const {data} = useQuery({
        queryKey: ['kanban'],
        queryFn: async () =>
            request(
                GRAPHQL_SERVER,
                KANBAN_QUERY,
            ),
    });

    const client = useQueryClient()

    const mutation = useMutation({
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

    const handleOnDragEnd = useCallback(async (result: DropResult, provided: ResponderProvided) => {
        if (!result.destination) return;
        if (result.destination.index === result.source.index && result.source.droppableId === result.destination.droppableId) return;
        if (result.reason === 'CANCEL') return;
        if (result.type === 'item') {
            await mutation.mutate({
                index: result.destination.index,
                itemId: result.draggableId,
                toListId: result.destination.droppableId,
            });
        }
        if(result.type === 'column' && result.destination.droppableId === 'kanban') {
            //TODO: move column
        }

    }, [])

    const addMutation = useMutation({
        mutationFn: async (variables: { name: string, columnId: string}) =>
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

    function handleAddItem(name: string, columnId: string): void {
        addMutation.mutate({name, columnId});
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
                                    .sort((a, b) => a.id > b.id ? 1 : -1)
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
                        </Stack>
                    )}
                </Droppable>
            </DragDropContext>
        </Box>
    );
}

export default Kanban;