import React from 'react';
import { Link } from 'react-router-dom';

const CauseDonateBar: React.FC = () => (
  <div className="fixed bottom-24 left-0 w-full p-3 z-20 md:hidden">
    <Link to="/donation">
      <button className="w-full bg-blue-600 text-white rounded-xl py-5 font-semibold text-lg shadow-lg hover:bg-blue-700 transition">Donate</button>
    </Link>
  </div>
);

export default CauseDonateBar;