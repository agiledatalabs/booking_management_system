import { FaLaptopCode } from 'react-icons/fa';
import { Button } from './ui/button';

const Footer = () => {
  return (
    <footer className="bg-indigo-600 text-white py-2 fixed bottom-0 w-full">
      <div className="container mx-auto flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <FaLaptopCode className="text-2xl" />
          <span className="font-bold">LAB RESOURCE BOOKING SYSTEM</span>
        </div>
        <div className="text-sm">
          &copy; {new Date().getFullYear()} Lab Resource Booking System. All rights reserved.
        </div>
        <Button variant="lab">
          <span>Contact Us</span>
        </Button>
      </div>
    </footer>
  );
};

export default Footer;
