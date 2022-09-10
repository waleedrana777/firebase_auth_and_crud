// import libraries
import * as functions from "firebase-functions";
const admin = require("firebase-admin");
import * as express from "express";
import * as bodyParser from "body-parser";
import User from "./models/User";

// initialize firebase inorder to access its services
admin.initializeApp(admin.credential.applicationDefault());

// initialize express server
const app = express();

// Create new user
app.post("/users", async (req, res) => {
	try {
		const user: User = {
			firstName: req.body["firstName"],
			lastName: req.body["lastName"],
			email: req.body["email"],
			areaNumber: req.body["areaNumber"],
			department: req.body["department"],
			id: req.body["id"],
			contactNumber: req.body["contactNumber"],
		};

		const newDoc = await db.collection(userCollection).add(user);
		res.status(201).send(`Created a new user: ${newDoc.id}`);
	} catch (error) {
		res.status(400).send(`User should cointain firstName, lastName, email, areaNumber, department, id and contactNumber!!!`);
	}
});

// get all users
app.get("/users", async (req, res) => {
	try {
		const userQuerySnapshot = await db.collection(userCollection).get();
		const users: any[] = [];
		userQuerySnapshot.forEach((doc) => {
			users.push({
				id: doc.id,
				data: doc.data(),
			});
		});
		res.status(200).json(users);
	} catch (error) {
		res.status(500).send(error);
	}
});

//  get a single contact
app.get("/users/:userId", (req, res) => {
	const userId = req.params.userId;
	db.collection(userCollection)
		.doc(userId)
		.get()
		.then((user) => {
			if (!user.exists) throw new Error("User not found");
			res.status(200).json({ id: user.id, data: user.data() });
		})
		.catch((error) => res.status(500).send(error));
});

// Delete a user
app.delete("/users/:userId", (req, res) => {
	db.collection(userCollection)
		.doc(req.params.userId)
		.delete()
		.then(() => res.status(204).send("Document successfully deleted!"))
		.catch(function (error) {
			res.status(500).send(error);
		});
});

// Update user
app.put("/users/:userId", async (req, res) => {
	await db
		.collection(userCollection)
		.doc(req.params.userId)
		.set(req.body, { merge: true })
		.then(() => res.json({ id: req.params.userId }))
		.catch((error) => res.status(500).send(error));
});

const main = express();

// add the path to receive request and set json as bodyParser to process the body
main.use("/api/v1", app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

//initialize the database and the collection
const db = admin.firestore();
const userCollection = "users";

// define google cloud function name
export const webApi = functions.https.onRequest(main);

//create a user in the users collection with uid same as auth on new auth user creation and store all its details in the database and also create todos subcollection for the user

export const createUser = functions.auth.user().onCreate((user) => {
	const userRef = db.collection(userCollection).doc(user.uid);
	return userRef.set({
		id: user.uid,
		firstName: user.displayName,
		lastName: "",
		email: user.email,
		contactNumber: "",
	}); 	

});

export const deleteUser = functions.auth.user().onDelete((user) => {
	//delete the subcollection first cuz deleting the document will not delete the subcollection as well
	//iterate over todos subcollection and delete each todo document one by one
	const todosRef = db.collection(userCollection).doc(user.uid).collection("todos");
	return todosRef.get().then((snapshot) => {
		snapshot.forEach((doc) => {
			doc.ref.delete();
		}
		);
	}).then(() => {
		//delete the user document from users collection
		const userRef = db.collection(userCollection).doc(user.uid);
		return userRef.delete();
	}).catch((error) => {
		console.log(error);
	});

});

// export const sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
	
// 	const email = user.email;
// 	const displayName = user.displayName;
// 	const emailMessage = `Welcome to the Firebase app, ${displayName}! Your email is: ${email}`;
// 	const emailSubject = "Welcome to the Firebase app";
// 	const emailOptions = {
// 		from: "Firebase App <" + "functions.config().gmail.email" + ">",
// 		to: email,
// 		subject: emailSubject,
// 		text: emailMessage,
// 	};
// 	return admin.firestore().collection("emails").add(emailOptions);


// });
  
// export const sendByeEmail = functions.auth.user().onDelete(async (user) => {
// 	// ...
// 	const email = user.email;
// 	const displayName = user.displayName;
// 	const emailMessage = `Goodbye, ${displayName}! Your email is: ${email}`;
// 	const emailSubject = "Goodbye from the Firebase app";
// 	const emailOptions = {
// 		from: "Firebase App <" + "functions.config().gmail.email" + ">",
// 		to: email,
// 		subject: emailSubject,
// 		text: emailMessage,
// 	};
// 	return admin.firestore().collection("emails").add(emailOptions);
// });


// exports.helloAuth = event => {
// 	try {
// 	  console.log(`Function triggered by change to user: ${event.uid}`);
// 	  console.log(`Created at: ${event.metadata.createdAt}`);
  
// 	  if (event.email) {
// 		console.log(`Email: ${event.email}`);
// 	  }
// 	} catch (err) {
// 	  console.error(err);
// 	}
//   };