import React, { useContext, useEffect, useState } from 'react'
import { auth } from '../firebase/db';
import { confirmPasswordReset, GoogleAuthProvider } from "firebase/auth";
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { nanoid } from 'nanoid';

const provider = new GoogleAuthProvider();
const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPasswordBeingReset, setIsPasswordBeingReset] = useState(false);

    function signUp(email, password) {
        setUserLoading(true);
        setError(null);
        createUserWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                setUser(userCredential.user);
                setUserLoading(false);
                verifyEmail();
            }).catch(error => {
                setError(error);
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
            .then(() => {
                setIsPasswordBeingReset(true);
                toast.success("Email sent at " + email);
                setUserLoading(false);
            }).catch(error => {
                setError(error);
                setUserLoading(false);
            }
            );
    }

    function handleConfirmPasswordReset(code, password) {
        confirmPasswordReset(auth, code, password)
            .then(() => {
                setIsPasswordBeingReset(false);
                toast.success("Password reset");
                setUserLoading(false);
            }).catch(error => {
                setError(error);
                setUserLoading(false);
            }
            );
    }

    async function sendVerificationEmail(userEmail) {
        // if (user) {
        // if (user.emailVerified) {
        console.log(process.env.REACT_APP_EMAIL_VERIFICATION_REDIRECT_URL);
        const res = await fetch(
            process.env.REACT_APP_EMAIL_VERIFICATION_LINK + "/send-custom-verification-email",
            {
                method: 'POST',
                // mode: 'no-cors', //used to avoid cors error and no options request
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
        console.log(res)
        const resBody = await res.json();

        if (res.status === 401) {
            throw new Error("Server_err:" + resBody.message);
        }
        if (res.status !== 200) {
            throw Error("Server_err :" + resBody.message);
        }

        return resBody
        // }
        // }
    }



    function verifyEmail(userEmail) {
        setError(null);
        sendVerificationEmail(userEmail)
            .then(
                () => {
                    toast.success("Email sent");
                    setUserLoading(false);
                }).catch(error => {
                    setError(error.message);
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
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                setError(errorMessage);
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
                setError(error);
                setUserLoading(false);
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

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setUser(user);
            setUserLoading(false);
        }, error => {
            setError(error);
            setUserLoading(false);
        }
        );
        return () => unsubscribe();
    }, []);

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
        isPasswordBeingReset,
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