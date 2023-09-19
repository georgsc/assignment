import {Draggable, Droppable} from "react-beautiful-dnd";
import {KanbanList} from "./KanbanList";
import {Button, Stack} from "@mui/material";
import {DraggableKanbanItem} from "./DraggableKanbanItem";
import {KanbanItem} from "../gql/graphql";

interface IProps {
    index: any;
    title: string;
    items: KanbanItem[];
    id: string;
    handleAddItem: (name: string, columnId: string, index: number) => void;
}

export function DraggableKanbanList(props: IProps): JSX.Element {
    function handleButtonClick(e: any){
        e.preventDefault();
        props.handleAddItem("Card" + new Date().getSeconds().toString(), props.id, props.items.length);
    }

    return <Draggable draggableId={"column" + props.id} index={props.index}>
        {(provided) => (
            <KanbanList
                title={props.title}
                {...provided.draggableProps} {...provided.dragHandleProps}
                ref={provided.innerRef}>
                <Droppable droppableId={props.id}
                           direction={'vertical'} type={'item'}>
                    {(provided) => (
                        <Stack spacing={2} ref={provided.innerRef}
                               {...provided.droppableProps}>
                            {
                                props.items
                                    .sort((a, b) => a.index > b.index ? 1 : -1)
                                    .map((item, index) => (
                                    <DraggableKanbanItem key={item.id} item={item} index={index}/>
                                ))
                            }
                            {provided.placeholder}
                        </Stack>
                    )}
                </Droppable>
                <Button onClick={handleButtonClick}>
                    Add item
                </Button>
            </KanbanList>
        )}
    </Draggable>;
}