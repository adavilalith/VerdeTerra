import { Link, useLocation } from "react-router-dom";

export default function Header () {
  const location = useLocation();

  return (
    <header className="bg-gradient-to-r from-green-700 to-green-600 text-white p-6 sm:p-8 rounded-t-xl shadow-lg">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center tracking-tight drop-shadow-md">
        VerdeTerra Dashboard 🌳
      </h1>
      <p className="text-center mt-2 text-green-100 text-lg font-light">
        Real-time Garden Monitoring
      </p>
      <nav className="mt-6 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
        <Link
          to="/"
          className={`
            !text-white !no-underline                            
            px-6 py-2 rounded-full text-base font-semibold transition-all duration-300 ease-in-out
            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300
            ${location.pathname === "/" 
              ? "bg-green-800 border-2 border-green-300 transform scale-105" 
              : "bg-green-500 hover:bg-green-700 border-2 border-transparent"
            }
          `}
        >
          Live Data
        </Link>
        <Link
          to="/model"
          className={`
            !text-white !no-underline                             
            px-6 py-2 rounded-full text-base font-semibold transition-all duration-300 ease-in-out
            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300
            ${location.pathname === "/model" 
              ? "bg-green-800 border-2 border-green-300 transform scale-105" 
              : "bg-green-500 hover:bg-green-700 border-2 border-transparent"
            }
          `}
        >
          Model
        </Link>
      </nav>
    </header>
  );
};
