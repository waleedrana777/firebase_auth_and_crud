import React from "react";

interface Props {
	key: string;
	id: string;
	text: string;
	completed: boolean;
	onRemove: () => void;
	onToggle: () => void;
}
const TodoItem: React.FC<Props> = ({ id, text, completed, onRemove, onToggle }) => {
	//return striked out text if completed
	const textStyle = completed ? { textDecoration: "line-through" } : {};
	return (
		<div key={id}>
			<span style={completed ? textStyle : {}}> {text}</span>
			<input type='checkbox' checked={completed} onChange={onToggle} />
			<button onClick={onRemove}>Remove</button>
		</div>
	);
};

export default TodoItem;
