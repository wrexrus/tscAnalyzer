import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css'
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from './utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Signup = () => {
    const [signupInfo,setSignupInfo] = useState({
        name: '',
        email: '',
        password: '',
    });
    const navigate = useNavigate();
    const handleChange = (e)=>{
        const {name,value} = e.target;
        const copySignUpInfo = {...signupInfo};
        copySignUpInfo[name] = value;    
        setSignupInfo(copySignUpInfo);
    }
    
    const handleSignUp = async (e)=>{
        e.preventDefault();
        const { name, email, password } = signupInfo;
        if(!name || !email || !password){
            return handleError('Field must not be empty');
        }
        try{
            const url = `${API_URL}/auth/signup`;
            const response = await fetch(url,{
                method: "POST",
                headers:{
                    'Content-Type':'application/json'
                },
                body: JSON.stringify(signupInfo)
            });
            const result = await response.json();
            const { success,message,error } = result;
            if(success){
                handleSuccess(message);
                setTimeout(()=>{
                    navigate('/login');
                },1000)
            }else if(error){
                const details = error?.details[0].message;
                handleError(details);
            }else if(!success){
                handleError(message);
            }
        }catch(err){
            handleError(err);
        }
    }

    return (
        <div className='container'>
            <div className="signup-container">
                <h1>Create Account</h1>
                <form onSubmit={handleSignUp}>
                    <div className="input-group">
                        <label htmlFor="name">Name</label>
                        <input
                            onChange={handleChange}
                            type="text"
                            name="name"
                            autoFocus
                            placeholder="Enter your Name..."
                            value={signupInfo.name}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={handleChange}
                            type="email"
                            name="email"
                            placeholder="Enter your Email..."
                            value={signupInfo.email}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={handleChange}
                            type="password"
                            name="password"
                            placeholder="Enter your Password..."
                            value={signupInfo.password}
                        />
                    </div>

                    <button className="btn">Sign Up</button>

                    <p className="redirect-text">
                        Already have an account? <Link to="/login" id='login'>Login</Link>
                    </p>
                </form>


                <ToastContainer />
            </div>
        </div>
    )
}

export default Signup
