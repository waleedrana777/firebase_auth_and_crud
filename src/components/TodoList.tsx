import React, { useState, useEffect } from "react";
import { useStore } from "../store/store";
import { useAuth } from '../auth/AuthProvider';
import { db } from "../firebase/db";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import Todo from "../models/Todo";
import TodoItem from "./TodoItem";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';



const TodoList: React.FC = () => {
	const { todos, addTodo, setTodos, removeTodo, toggleCompleted } = useStore();
	const { user } = useAuth();

	const [ todoText, setTodoText ] = useState<string>("");
	const [ todosLoading, setTodosLoading ] = useState(false);

	useEffect(() => {
		var unsubscribe = () => { };
		try {
			if (user && user.emailVerified) {
				setTodosLoading(true);
				const todosColl = collection(db, "users", user?.uid, "todos");
				const q = query(todosColl, orderBy("completed"), orderBy("createdAt", "desc"), limit(10));
				unsubscribe = onSnapshot(q, (snapshot) => {
					var fetchedTodos: Todo[] = [];
					snapshot.forEach((doc) => {
						fetchedTodos.push({
							id: doc.id,
							...doc.data(),
						} as Todo);
					});
					setTodos(fetchedTodos);
				});
				setTodosLoading(false);
			}

		} catch (error) {
			toast.error(error.message);
		}
		return () => {
			toast.info("Unsubscribing from todos");
			unsubscribe();
		}
	}, [ user, user.emailVerified ]);

	const handleSubmit = e => {
		e.preventDefault();
		if (todoText.trim()) {
			addTodo(user?.uid, todoText).then(() => {
				toast.success("Todo added successfully");
			}).catch(err => {
				toast.error(err.message);
			});
			setTodoText("");
		}
	}

	const handleKeyPress = e => {
		if (e.key === "Enter") {
			handleSubmit(e);
		}
	}

	return (
		<React.Fragment>
			<h1>Todo List</h1>
			{user && (
				<React.Fragment>
					<input type='text' value={todoText}
						onKeyPress={handleKeyPress}
						onChange={(e) => setTodoText(e.target.value)} />
					<button id="submit" onClick={handleSubmit}>Add Todo</button>

					{todosLoading ?

						(<div>Loading todos...</div>)

						:
						(
							user.emailVerified ?
								(
									todos.length === 0 ? (
										<div>No Todos in account {user?.displayName}</div>
									) : (
										todos.map((item) => {
											return <TodoItem key={item.id} id={item.id} text={item.todo}
												completed={item.completed}
												onRemove={() => removeTodo(user?.uid, item.id)}
												onToggle={() => toggleCompleted(user?.uid, item.id, item.completed)} />;
										})
									)
								)
								:
								(<div>Please verify your email to load todos! </div>)
						)
					}

				</React.Fragment>
			)}
		</React.Fragment>
	);
}

export default TodoList;
