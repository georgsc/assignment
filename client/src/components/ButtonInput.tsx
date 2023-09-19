import { Button, TextField } from "@mui/material";
import { useState } from "react";

interface IProps {
    buttonName: string;
    inputPlaceholder: string;
    submitText: (name: string) => void;
}

export function ButtonInput(props: IProps): JSX.Element {
    const [text, setText] = useState<string>("");
    const [isAdding, setIsAdding] = useState<boolean>(false);
    function handleButtonClick(e: any){
        e.preventDefault();
        setIsAdding(prevState => !prevState)
        if (isAdding) {
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
            props.submitText(text);
            setText("");
            setIsAdding(false);
        }
        if (e.keyCode === 27) {
            setIsAdding(false);
            setText("");
        }
    }
    return <>
        {
            isAdding && <TextField value={text}
                                   onKeyDown={onTextKeyDown}
                                   onChange={onTextChange}
                                   autoFocus={true}
                                   placeholder={props.inputPlaceholder}/>
        }
        <Button onClick={handleButtonClick}>
            {isAdding ? "Cancel" : props.buttonName}
        </Button>
    </>;
}