import Todo from "../models/Todo";
import { db } from "../firebase/db";
import {
	collection,
	addDoc,
	doc,
	updateDoc,
	deleteDoc,
} from "firebase/firestore";
import create from "zustand";
import { devtools, persist } from "zustand/middleware";

interface TodosInterface {
	todos: Todo[];
	addTodo: (uid: string, todo: string) => void;
	setTodos: (todos: Todo[]) => void;
	removeTodo: (uid: string, id: string) => void;
	toggleCompleted: (uid: string, id: string, completed: boolean) => void;
}

const log = config => (set, get, api) =>
	config(
		(...args) => {
			console.log("  applying", args);
			set(...args);
			console.log("  new state", get());
		},
		get,
		api
	);

const store = set => ({
	todos: [],
	addTodo: async (uid, todo: string) => {
		// const nanoID = nanoid();

		//follow the coll, doc, coll, doc pattern
		await addDoc(collection(db, `users`, uid, "todos"), {
			// Document Data
			todo: todo,
			completed: false,
			createdAt: new Date(),
		});
	},
	setTodos: (todos: Todo[]) => {
		set(state => ({
			todos: todos,
		}));
	},
	removeTodo: async (uid: string, id: string) => {
		await deleteDoc(doc(db, `users`, uid, "todos", id));
	},
	toggleCompleted: async (uid, id, completed) => {
		const todosRef = doc(db, `users`, uid, "todos", id);
		await updateDoc(todosRef, {
			completed: !completed,
		});
	},
});

export const useStore = create(
	persist(
		devtools(
			// log(
			store
			// )
		),
		{ name: "user_todos" }
	)
);
