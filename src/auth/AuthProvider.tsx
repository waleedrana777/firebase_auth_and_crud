import React, { useContext, useEffect, useState } from 'react'
import { auth } from '../firebase/db';
import { useStore } from "../store/store";
import { confirmPasswordReset, GoogleAuthProvider } from "firebase/auth";
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { nanoid } from 'nanoid';
import { useParams } from "react-router-dom";

const provider = new GoogleAuthProvider();
const AuthContext = React.createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

function AuthProvider({ children }) {
    const { reload } = useParams();
    const { todos, addTodo, setTodos, removeTodo, toggleCompleted } = useStore();

    const [ user, setUser ] = useState(null);
    const [ userLoading, setUserLoading ] = useState(true);
    const [ error, setError ] = useState(null);

    useEffect(() => {
        if (reload && user) {
            setUser(auth.currentUser);
            window.location.reload();
        }
    }, [ reload, user ]);

    useEffect(() => {
        // if (user) {
        // user.getIdTokenResult().then(idTokenResult => {
        //     setUserLoading(false);
        //     setUser(idTokenResult.claims);
        // }).catch(error => {
        //     setError(error);
        //     setUserLoading(false);
        // }
        // );
        // }
        const unsubscribe = auth.onAuthStateChanged(user => {
            setUser(user);
            setUserLoading(false);
        }, error => {
            setError(error);
            setUserLoading(false);
        }
        );
        return () => {
            setError(null);
            unsubscribe();
        }
    }, []);

    function signUp(email, password) {
        setUserLoading(true);
        setError(null);
        createUserWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                setUser(userCredential.user);
                setUserLoading(false);
                if (!userCredential.user.emailVerified) {
                    verifyEmail(
                        userCredential.user.email,
                    );
                }
            }).catch(error => {
                setError("hereee" + error);
                setUserLoading(false);
            }
            );
    }

    function signIn(email, password) {
        setUserLoading(true);
        setError(null);
        signInWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                setUser(userCredential.user);
                setUserLoading(false);
            }).catch(error => {
                setError(error);
                setUserLoading(false);
            }
            );
    }

    function logOut() {
        signOut(auth).then(() => {
            setTodos([]);
            setUser(null);
            setError(null);
        }).catch(error => {
            setError(error);
        }
        );
    }

    const actionCodeSettings = {
        url: 'http://firebase-auth-and-crud.vercel.app',
        // url: 'http://localhost:3000',
        // handleCodeInApp: true
    };

    function resetPassword(email) {
        setError(null);
        sendPasswordResetEmail(auth, email, actionCodeSettings)
            .then(
                //on resolve
                () => {
                    toast.success("Email sent at " + email);
                    setUserLoading(false);
                }
            ).catch(error => {
                setError(error);
                setUserLoading(false);
            });
    }

    function handleConfirmPasswordReset(code, password) {
        confirmPasswordReset(auth, code, password)
            .then(() => {
                toast.success("Password reset");
                setUserLoading(false);
            }).catch(error => {
                setError(error);
                setUserLoading(false);
            }
            );
    }

    async function sendVerificationEmail(userEmail) {
        if (user?.emailVerified) {
            toast.error("User already verified");
            return;
        }

        //if mode: cors not specified, it will give
        //Access to fetch at _______________ from origin ______________
        // has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is
        // present on the requested resource. If an opaque response serves your needs,
        // set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
        // https://www.stackhawk.com/blog/react-cors-guide-what-it-is-and-how-to-enable-it/

        const res = await fetch(
            process.env.REACT_APP_EMAIL_VERIFICATION_LINK + "/send-custom-verification-email",
            {
                method: 'POST',
                //no-cors used to avoid cors error and send non options request but that is a hack
                // and prevents you from using other http methods like PUT, DELETE, etc
                mode: 'cors',
                body: JSON.stringify(
                    {
                        userEmail,
                        redirectUrl: process.env.REACT_APP_EMAIL_VERIFICATION_REDIRECT_URL
                    }
                ),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=UTF-8',
                },
            },
        );

        //if no response, it gives unexpected end of input error when parsing json and when cors is not setup, so no cors error is thrown but no response is received
        const resBody = await res.json();

        if (res.status === 401) {
            throw new Error("Server_err:" + resBody.message);
        }
        if (res.status !== 200) {
            throw Error("Server_err :" + resBody.message);
        }

        return resBody;

    }

    function verifyEmail(userEmail) {
        setError(null);
        sendVerificationEmail(userEmail)
            .then(
                () => {
                    toast.success("Verification Email sent at " + userEmail);
                    setUserLoading(false);
                }).catch(error => {
                    setError("verify:" + error.message);
                    setUserLoading(false);
                }
                );
    }

    function signInUsingGoogle() {
        setUserLoading(true);
        setError(null);
        provider.addScope('profile');
        provider.addScope('email');
        signInWithPopup(auth, provider)
            .then(result => {
                const userCredential = GoogleAuthProvider.credentialFromResult(result);
                const token = userCredential.accessToken;
                // The signed-in user info.
                const user = result.user;
                setUser(user);
                setUserLoading(false);
            }).catch(error => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                // const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                setError(error);
                setUserLoading(false);
            }
            );
    }

    function deleteAccount() {
        setUserLoading(true);
        setError(null);
        user.delete()
            .then(() => {
                setUser(null);
                setUserLoading(false);
            }).catch(error => {
                setUserLoading(false);
                if (error.code === "auth/requires-recent-login") {
                    logOut();
                    setError("Session too old! Please login again to delete account");
                }
                else {
                    setError(error);
                }
            }
            );
    }

    function showError(err) {
        toast(err.toString(), {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            toastId: nanoid()
        },
        );
        return null;
    }

    const value = {
        user,
        userLoading,
        error,
        setError,
        signIn,
        signInUsingGoogle,
        signUp,
        verifyEmail,
        logOut,
        resetPassword,
        handleConfirmPasswordReset,
        deleteAccount,
        provider
    };

    return (
        <AuthContext.Provider value={value} >
            <ToastContainer />
            {children}
            {error && showError(error)}
        </AuthContext.Provider>
    );

}

export default AuthProvider