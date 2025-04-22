import React from 'react';

function Dashboard() {
    return (
        <div className="container mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h1>
            <p className="text-gray-700 mb-4">Welcome back! You are now logged in.</p>
            {/* Add your dashboard content here */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Recent Activity</h2>
                <ul className="list-disc pl-5 text-gray-600">
                    <li>Started a new quiz: "General Knowledge"</li>
                    <li>Completed quiz: "Science Basics" - Score: 8/10</li>
                    {/* Add more activity items */}
                </ul>
            </div>
            {/* Add buttons or links to other parts of your app */}
        </div>
    );
}

export default Dashboard;