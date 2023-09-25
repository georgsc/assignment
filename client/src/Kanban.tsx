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
            order
            items {
                id
                name
                done
                order
            }
        }
    }
`)

const MUTATE_MOVE_ITEM = graphql(/* GraphQL */`
    mutation MoveItem($itemId: ID!, $toListId: ID!, $order: Int!) {
        moveItem(itemId: $itemId, toListId: $toListId, order: $order) {
            id
            name
            done
            order
        }
    }
`)

const MUTATE_ADD_ITEM = graphql(/* GraphQL */`
    mutation AddItem($name: String!, $columnId: ID!, $order: Int!) {
        addItem(name: $name, columnId: $columnId, order: $order) {
            id
            name
            done
            order
        }
    }
`)

const MUTATE_MOVE_COLUMN = graphql(/* GraphQL */`
    mutation MoveColumn($columnId: ID!,$order: Int!) {
        moveColumn(columnId: $columnId, order: $order) {
            id
            name
            order            
        }
    }
`)

const MUTATE_ADD_COLUMN = graphql(/* GraphQL */`
    mutation AddColumn($name: String!, $order: Int!) {
        addColumn(name: $name, order: $order) {
            id
            name
            order
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
        mutationFn: async (variables: { itemId: string, toListId: string, order: number }) =>
            request(
                GRAPHQL_SERVER,
                MUTATE_MOVE_ITEM,
                variables,
            ),
        onMutate: async (variables) => {
            await client.cancelQueries({ queryKey: ['kanban'] });
            client.setQueryData(['kanban'], (old: KanbanQuery | undefined) => {
                if (!old) {
                    return old;
                }
                const newColumns = old.kanban.map((column) => {
                    const newItems = column.items.map((item) => {
                        if (item.id === variables.itemId) {
                            return {...item, order: variables.order}
                        }
                        return item;
                    });
                    return {...column, items: newItems};
                });
                return {...old, kanban: newColumns}
            });
        },
        onSuccess: (data, variables) => {
            client.setQueryData(['kanban'], (old: KanbanQuery | undefined) => {
                    return old;
                }
            );
        }
    });

    const moveColumnMutation = useMutation({
        mutationFn: async (variables: { columnId: string, order: number }) =>
            request(
                GRAPHQL_SERVER,
                MUTATE_MOVE_COLUMN,
                variables,
            ),
        onMutate: async ({order, columnId}) => {
            await client.cancelQueries({ queryKey: ['kanban'] })
            client.setQueryData(['kanban'], (old: KanbanQuery | undefined) => {
                if (!old) {
                    return old;
                }
                const newColumns= old.kanban.map((column) => {
                    if (column.id === columnId) {
                        return {...column, order: order}
                    }
                    return column;
                });
                return {...old, kanban: newColumns};
            });
        },
        onSuccess: (data, variables) => {
            client.setQueryData(['kanban'], (old: KanbanQuery | undefined) => {
                return old;
            });
        }
    });

    const addItemMutation = useMutation({
        mutationFn: async (variables: { name: string, columnId: string, order: number}) =>
            request(
                GRAPHQL_SERVER,
                MUTATE_ADD_ITEM,
                variables,
            ),
        onMutate: async (variables) => {
            await client.cancelQueries({ queryKey: ['kanban'] });
            const optimisticItem = { id: crypto.randomUUID(), name: variables.name, order: variables.order, done: false };
            client.setQueryData(['kanban'], (old: KanbanQuery | undefined) => {
                if (!old) {
                    return old;
                }
                const newColumns = old.kanban.map((column) => {
                    if (column.id === variables.columnId) {
                        column.items.push(optimisticItem);
                    }
                    return column;
                });
                return {...old, kanban: newColumns};
            });
            return { optimisticItem };
        },
        onSuccess: (result, variables, context) => {
            client.setQueryData(['kanban'], (old: KanbanQuery | undefined) => {
                if (!old) {
                    return old;
                }
                const newColumn = old.kanban.map((column) => {
                    if (column.id === variables.columnId && context !== undefined) {
                        const allItems = column.items.filter((item) => item.id !== context.optimisticItem.id);
                        allItems.push(result.addItem);
                        return {...column, items: allItems}
                    }
                    return column;
                });
                return {...old, kanban: newColumn};
            });
        },
        onError: (error, variables, context) => {
            client.setQueryData(['kanban'], (old: KanbanQuery | undefined) => {
                if (!old) {
                    return old;
                }
                const newColumn = old.kanban.map((column) => {
                    if (column.id === variables.columnId && context !== undefined) {
                        const oldItems = column.items.filter((item) => item.id !== context.optimisticItem.id);
                        return {...column, items: oldItems}
                    }
                    return column;
                });
                return {...old, kanban: newColumn};
            });
        }
    });

    const addColumnMutation = useMutation({
        mutationFn: async (variables: { name: string, order: number}) =>
            request(
                GRAPHQL_SERVER,
                MUTATE_ADD_COLUMN,
                variables,
            ),
        onMutate: async (variables) => {
            await client.cancelQueries({ queryKey: ['kanban'] })
            const optimisticColumn = { id: crypto.randomUUID(), name: variables.name, order: variables.order, items: [] };
            client.setQueryData(['kanban'], (old: KanbanQuery | undefined) => {
                if (!old) {
                    return old;
                }
                old.kanban.push(optimisticColumn);
                return old;
            });
            return { optimisticColumn };
        },
        onSuccess: (data, variables, context) => {
            client.setQueryData(['kanban'], (old: KanbanQuery | undefined) => {
                if (old) {
                    const allColumns = old?.kanban.filter((column) => column.id !== context?.optimisticColumn.id);
                    allColumns.push({id: data.addColumn.id,name: data.addColumn.name, order: data.addColumn.order, items: []});
                    return {...old, kanban: allColumns}
                }
                return old;
            });
        },
        onError: (error, variables, context) => {
            client.setQueryData(['kanban'], (old: KanbanQuery | undefined) => {
                if (old) {
                    const oldColumns = old?.kanban.filter((column) => column.id !== context?.optimisticColumn.id);
                    return {...old, kanban: oldColumns}
                }
                return old;
            });
        }
    });

    const handleOnDragEnd = useCallback(async (result: DropResult, provided: ResponderProvided) => {
        if (!result.destination) return;
        if (result.destination.index === result.source.index && result.source.droppableId === result.destination.droppableId) return;
        if (result.reason === 'CANCEL') return;
        if (result.type === 'item') {
            const itemId = result.draggableId;
            const toListId = result.destination.droppableId;
            const columnFrom = data?.kanban.find(column => column.items.find(item => item.id === itemId))
            const columnTo = data?.kanban.find(column => column.id === toListId)
            if (columnFrom !== undefined && columnTo !== undefined) {
                const item = columnFrom.items.find(item => item.id === itemId)
                columnFrom.items = columnFrom.items.filter(item => item.id !== itemId)
                if (item) {
                    columnTo.items.splice(result.destination.index, 0, item);
                }
                if (result.source.droppableId !== toListId) {
                    columnFrom.items.map((item, index) => {
                        moveItemMutation.mutate({
                            order: index,
                            itemId: item.id,
                            toListId: columnFrom.id,
                        });
                    })
                }
                columnTo.items.map((item, index) => {
                    moveItemMutation.mutate({
                        order: index,
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
                        order: index,
                        columnId: movedColumn.id
                    });
                    movedColumn.order = index;
                });
            }
        }

    }, [data?.kanban])

    function handleAddItem(name: string, columnId: string, order: number): void {
        addItemMutation.mutate({name, columnId, order});
    }

    function submitText(text: string): void {
        const currentPosition: number = data?.kanban.length ? data.kanban.length : 0;
        addColumnMutation.mutate({name: text, order: currentPosition});
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
                                    .sort((a, b) => a.order > b.order ? 1 : -1)
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