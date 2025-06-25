import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { GET_USER } from "../Private/private";
import axios from "axios";
import { setUser } from "../redux/userSlice";

const useIsloggedIn = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${GET_USER}/current`, {
          withCredentials: true,
        });
        dispatch(setUser(result?.data));
      } catch (err) {
        console.log("User fetch error:", err.message);
        dispatch(setUser(null));
      }
    };

    fetchUser();
  }, [dispatch]); // ✅ no userData dependency
};

export default useIsloggedIn;
