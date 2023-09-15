import {Draggable} from "react-beautiful-dnd";
import {KanbanItem} from "./KanbanItem";

interface IProps {
    index: any;
    item: { id: string, name: string};
}

export function DraggableKanbanItem(props: IProps): JSX.Element {
    return <Draggable draggableId={props.item.id}
                      index={props.index}
    >
        {(provided) => (
            <KanbanItem {...provided.draggableProps} {...provided.dragHandleProps}
                        title={props.item.name}
                        ref={provided.innerRef}/>
        )}
    </Draggable>;
}