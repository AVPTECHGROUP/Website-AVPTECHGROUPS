import {Outlet,Navigate,useLocation} from 'react-router-dom';

const Protectedroutes = ()=>{
    const token=localStorage.getItem("token");
    const location=useLocation();

    if(!token){
        return <Navigate to="/login" replace state={{from:location}}/>; 
    }

    return <Outlet/>;
};

export default Protectedroutes;