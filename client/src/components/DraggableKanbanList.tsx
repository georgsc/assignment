import {Draggable, Droppable} from "react-beautiful-dnd";
import {KanbanList} from "./KanbanList";
import {Button, Stack} from "@mui/material";
import {DraggableKanbanItem} from "./DraggableKanbanItem";

interface IProps {
    index: any;
    title: string;
    items: { id: string, name: string, done: boolean }[];
    id: string;
    handleAddItem: (name: string, columnId:string) => void;
}

export function DraggableKanbanList(props: IProps): JSX.Element {
    function handleButtonClick(e: any){
        e.preventDefault();
        props.handleAddItem("Card" + new Date().getSeconds().toString(), props.id);
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
                                props.items.map((item, index) => (
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