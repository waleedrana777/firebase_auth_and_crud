import React, { useState, useEffect } from 'react'
import GoogleButton from 'react-google-button';
import { useAuth } from '../auth/AuthProvider';


function Navbar() {
    const { user, userLoading, signIn, signInUsingGoogle, signUp, verifyEmail, logOut, resetPassword, handleConfirmPasswordReset, deleteAccount } = useAuth();

    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ confirmResetPassword, setConfirmResetPassword ] = useState("");
    const [ code, setCode ] = useState("");

    useEffect(() => {
        if (user) {
            user.reload();
        }
    }, []);

    function handleSignInWithPassword(e) {
        e.preventDefault();
        signIn(email, password);
    }

    function handleSignUpWithPassword(e) {
        e.preventDefault();
        signUp(email, password);
    }

    function handleLogOut(e) {
        e.preventDefault();
        logOut();
    }

    function handleResetPasswordRequest(e) {
        e.preventDefault();
        resetPassword(email);
    }

    function handleConfirmPasswordForReset(e) {
        e.preventDefault();
        if (confirmResetPassword.trim() && code) {
            handleConfirmPasswordReset(confirmResetPassword, code)
                //reset the fields 
                .then(() => {
                    setConfirmResetPassword("");
                    setCode(null);
                }).catch(err => {
                    console.log(err);
                    setConfirmResetPassword("");
                    setCode(null);
                });
        }

    }

    function handleVerifyEmail(e) {
        e.preventDefault();
        if (email.trim()) {
            verifyEmail(email);
        }
    }

    function handleGoogleSignIn(e) {
        e.preventDefault();
        signInUsingGoogle();
    }

    function handleDeleteAccount(e) {
        e.preventDefault();
        deleteAccount();
    }



    return (
        <div>
            {userLoading ? (
                <div>Verifying user session ... </div>
            ) : (user ?
                (
                    <React.Fragment>
                        <button onClick={handleLogOut}>Sign Out</button>
                        {!user.emailVerified ? (
                            <>
                                <form onSubmit={handleVerifyEmail}>
                                    <input autoComplete='email' type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                                    <button type="submit">Send Verification Link</button>
                                </form></>) :
                            null
                        }

                        <form onSubmit={handleResetPasswordRequest}>
                            <input autoComplete='email' type="text" placeholder="Email" onChange={
                                (e) => setEmail(e.target.value)
                            } />
                            <button type="submit">Reset Password</button>
                        </form>
                        <button onClick={handleDeleteAccount}>Delete Account</button>
                    </React.Fragment>
                ) :
                (
                    <React.Fragment>
                        {/* email and password input fields */}
                        <form onSubmit={handleSignInWithPassword}>
                            <input type="text" autoComplete='email' placeholder="Email" onChange={
                                (e) => setEmail(e.target.value)
                            } />
                            <input type="password" autoComplete='password' placeholder="Password"
                                onChange={
                                    (e) => setPassword(e.target.value)
                                }
                            />
                            <button type="submit">Sign In</button>
                        </form>
                        <form onSubmit={handleSignUpWithPassword}>
                            <input autoComplete='email' type="text" placeholder="Email" onChange={
                                (e) => setEmail(e.target.value)
                            } />
                            <input autoComplete='password' type="password" placeholder="Password"
                                onChange={
                                    (e) => setPassword(e.target.value)
                                }
                            />
                            <button type="submit">Sign Up</button>
                        </form>
                        <br />

                        <GoogleButton onClick={handleGoogleSignIn}>Sign In with Google</GoogleButton>
                    </React.Fragment>
                ))}
        </div>
    )
}

export default Navbar