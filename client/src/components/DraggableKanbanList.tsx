import {Draggable, Droppable} from "react-beautiful-dnd";
import {KanbanList} from "./KanbanList";
import {Button, Stack, TextField} from "@mui/material";
import {DraggableKanbanItem} from "./DraggableKanbanItem";
import {KanbanItem} from "../gql/graphql";
import {useRef, useState} from "react";

interface IProps {
    index: any;
    title: string;
    items: KanbanItem[];
    id: string;
    handleAddItem: (name: string, columnId: string, index: number) => void;
}

export function DraggableKanbanList(props: IProps): JSX.Element {
    const [text, setText] = useState<string>("");
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const inputRef = useRef<any>(null);
    function handleButtonClick(e: any){
        e.preventDefault();
        setIsAdding(prevState => !prevState)
        if (!isAdding) {
            if (inputRef.current !== null) {
                inputRef.current.focus();
            }
        } else {
            setText("");
        }
    }

    function onTextChange(e: any): void {
        e.preventDefault();
        const text: string = e.target.value;
        setText(text);
        setIsAdding(true);
    }

    function onTextKeyDown(e: any): void {
        if (e.keyCode === 13 && text.length > 0) {
            props.handleAddItem(text, props.id, props.items.length);
            setText("");
        }
        if (e.keyCode === 27) {
            setIsAdding(false);
            setText("");
        }
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
                {isAdding && <TextField value={text}
                                        onKeyDown={onTextKeyDown}
                                        onChange={onTextChange}
                                        placeholder={"Card name"}
                                        inputRef={inputRef}/>}

                <Button onClick={handleButtonClick}>
                    {isAdding ? "Cancel" : "Add item"}
                </Button>
            </KanbanList>
        )}
    </Draggable>;
}