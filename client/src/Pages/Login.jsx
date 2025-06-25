import { useState } from "react";
import axios from 'axios'
import { authUrl } from "../Private/private";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";

const Login = () => {

    const dispatch = useDispatch()

    const [email, setEmail] = useState("anand975@gmail.com")
    const [password, setPassword] = useState("Subrat@(1)")

    const handleLogin = async(e)=>{
        e.preventDefault()
        try{
            const result = await axios.post(`${authUrl}/login`, {
                email, password
            }, {withCredentials: true})
            dispatch(setUser(result?.data?.user))
        }
        catch(err){
            console.log(err)
        }
    }


  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="hero-content flex-col">
        <div className="text-center">
          <h1 className="text-5xl font-bold">Login now!</h1>
          <p className="py-6">Access your account to continue</p>
        </div>

        <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body" onSubmit={handleLogin}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input type="text" placeholder="email" className="input input-bordered" required 
                onChange={(e)=> setEmail(e.target.value)} value={email}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input type="password" placeholder="password" className="input input-bordered" required 
                onChange={(e)=> setPassword(e.target.value)} value={password}
              />
              <label className="label">
                <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
              </label>
            </div>

            <div className="form-control mt-6">
              <button className="btn btn-primary">Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
