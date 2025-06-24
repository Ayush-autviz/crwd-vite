import { Link } from 'react-router-dom';
import React from 'react';

const GroupCrwdBottomBar: React.FC = () => (
  // <div className="fixed bottom-24 left-0 w-full bg-white p-3 z-20  md:hidden flex justify-center">
  //   <button className="w-full max-w-md bg-blue-600 text-white rounded-xl py-3 font-semibold text-lg shadow-lg hover:bg-blue-700 transition">Donate</button>
  // </div>
  <div className="fixed bottom-24 left-0 w-full p-3 z-20 md:hidden">
  <Link to="/donation">
    <button className="w-full bg-blue-600 text-white rounded-xl py-5 font-semibold text-lg shadow-lg hover:bg-blue-700 transition">Join</button>
  </Link>
</div>
);

export default GroupCrwdBottomBar; 