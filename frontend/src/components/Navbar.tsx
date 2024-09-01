import { GrResources } from "react-icons/gr";
import { FaUser, FaBook } from "react-icons/fa";
import { BiSolidMessageSquareDetail } from "react-icons/bi";
import { TiTick } from "react-icons/ti";
import { FaFlaskVial } from "react-icons/fa6";
import { MdBackup } from "react-icons/md";
import Tooltip from "../utils/Tooltip";


const Navbar = () => {
  return (
    <nav className='flex justify-between px-12 py-4 mb-6 bg-indigo-600 text-white'>
        <header className='flex gap-2 justify-center items-center font-bold uppercase'>
            <FaFlaskVial />
            <h2>Lab Resource Booking System</h2>
        </header>

        <ul className='flex gap-x-6'>
            <li>
                <Tooltip message="Users">
                    <FaUser fill="hover:bg-black"/>
                </Tooltip>
            </li>
            <li>
                <Tooltip message="Resources">
                    <GrResources />
                </Tooltip>
            </li>
            <li>
                <Tooltip message="Upcoming Resources">
                    <FaBook />
                </Tooltip>
            </li>
            <li>
                <Tooltip message="Message Center">
                    <BiSolidMessageSquareDetail />
                </Tooltip>
            </li>
            <li>
                <Tooltip message="Resources Approvals">
                    <TiTick />
                </Tooltip>
            </li>
            <li>
                <Tooltip message="Backups">
                    <MdBackup />
                </Tooltip>
            </li>
        </ul>
    </nav>
  )
}

export default Navbar
