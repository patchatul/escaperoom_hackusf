import computer from "../../public/pics/computer.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
//login and signup form (input fields, buttons, remember me, forgot password)
//click submit button sends data to backend, backend checks if credentials are correct
//if correct then redirect to escaperoom, if incorrect then show error message
function LogIn() {
  const navigate = useNavigate();
  const handleClick = (e: any) => {
    e.preventDefault();
    navigate("/escaperoom");
  };
  const handleSignup = () => {
    setIsSignup(!isSignup);
  };
  const [isSignup, setIsSignup] = useState(false);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setZoom(true);
    }, 2500); // 2.5 seconds after page load

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
         {/* Flicker light layer */}
      <div className="absolute inset-0 bg-gray-800/10 flicker-bg pointer-events-none"></div>

      {/* Static noise layer */}
      <div className="absolute inset-0 static-bg pointer-events-none mix-blend-overlay"></div>

<div
        className={` relative w-225
          transition-transform duration-1500 ease-out
          ${zoom ? "scale-100" : "scale-60"}
        `}
      >
        {/* Computer image */}
 <img src={computer} className="w-full" />
        {/* SCREEN AREA (overlay) */}
        <div
          className="absolute top-[16%] left-[16%] w-[68%] h-[42%] 
                    flex flex-col items-center justify-center"
        >
          <div className="w-[80%] mb-1 flex flex-col items-center ">
            <h1 className="animate-flicker">ESCAPE ROOM</h1>
          </div>
          <div>
            <form className="flex flex-col items-center justify-center "
            onSubmit={handleClick}>
              <label htmlFor="username">
                <b>Username</b>
              </label>
              <input type="email" placeholder="peduncle" name="username" />
              {isSignup && (
                <>
                  <label>Email</label>
                  <input type="email" placeholder="peduncle@email.com" />
                </>
              )}

              <label htmlFor="password">Password</label>
              <input type="password" placeholder="xxxxxxx" name="password" />
              {isSignup && (
                <>
                  <label>Confirm Password</label>
                  <input type="password" placeholder="xxxxxxx" />
                </>
              )}

              <div>
                <button onClick={handleClick}>Login</button>
                <button type="button" onClick={handleSignup}>
                  Signup
                </button>
              </div>
              {/* <button onSubmit={() => navigate('/escaperoom') }>Login</button> */}
              <div className="flex justify-between text-xs">
                <label className="flex items-center">
                  <input type="checkbox" />
                  remember me
                </label>
              </div>
            </form>
          </div>
        </div>
      </div>
      </div>
    
  );
}

export default LogIn;
