import { GrResources } from "react-icons/gr";
import { FaUser, FaBook } from "react-icons/fa";
import { BiSolidMessageSquareDetail } from "react-icons/bi";
import { TiTick } from "react-icons/ti";
import { FaLaptopCode } from "react-icons/fa6";
import { MdBackup } from "react-icons/md";
import Tooltip from "../utils/Tooltip";
import { IconContext } from "react-icons";
import { Link } from "react-router-dom";


const Navbar = () => {
  return (
    <nav className='flex justify-between px-16 py-4 mb-6 bg-indigo-600 text-white'>
        <header className='flex gap-2 justify-center items-center font-bold uppercase'>
            <IconContext.Provider value={{ color: "#FFFFFF", className: "contactIcon" }}>
                <FaLaptopCode className="text-2xl"/>
            </IconContext.Provider> 
            <h2>Lab Resource Booking System</h2>
        </header>

        <ul className='flex gap-x-6'>
            <Link to='/'>
                <Tooltip message="Users">
                    <IconContext.Provider value={{ color: "#FFFFFF", className: "contactIcon" }}>
                        <FaUser />
                    </IconContext.Provider> 
                </Tooltip>
            </Link>
            <Link to='/resource'>
                <Tooltip message="Resources">
                    <IconContext.Provider value={{ color: "#FFFFFF", className: "contactIcon" }}>
                        <GrResources /> 
                    </IconContext.Provider> 
                </Tooltip>
            </Link>
            <Link to='/upcoming-resource'>
                <Tooltip message="Upcoming Resources">
                    <IconContext.Provider value={{ color: "#FFFFFF", className: "contactIcon" }}>
                        <FaBook />
                    </IconContext.Provider> 
                </Tooltip>
            </Link>
            <Link to='/messages'>
                <Tooltip message="Message Center">
                    <IconContext.Provider value={{ color: "#FFFFFF", className: "contactIcon" }}>
                        <BiSolidMessageSquareDetail />
                    </IconContext.Provider> 
                </Tooltip>
            </Link>
            <Link to='/resource-approvals'>
                <Tooltip message="Resources Approvals">
                    <IconContext.Provider value={{ color: "#FFFFFF", className: "contactIcon" }}>
                        <TiTick />
                    </IconContext.Provider> 
                </Tooltip>
            </Link>
            <Link to='/backups'>
                <Tooltip message="Backups">
                    <IconContext.Provider value={{ color: "#FFFFFF", className: "contactIcon" }}>
                        <MdBackup />
                    </IconContext.Provider>    
                </Tooltip>
            </Link>
        </ul>
    </nav>
  )
}

export default Navbar
