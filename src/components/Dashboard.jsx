import React, { useState, useEffect } from 'react';
import questionApi from '../api/questionApi';
import testApi from '../api/testApi';
import Notifier from '../components/Notifier'; // Adjust the import path

function Dashboard() {
    const [questions, setQuestions] = useState([]);
    const [questionError, setQuestionError] = useState(null);
    const [tests, setTests] = useState([]);
    const [testGistData, setTestGistData] = useState([]);
    const [testError, setTestError] = useState(null);
    const [showQuestionsList, setShowQuestionsList] = useState(false);
    const [showTestsList, setShowTestsList] = useState(false);
    const [testGistDataForQuestion, setTestGistDataForQuestion] = useState({});
    const [testGistErrorForQuestion, setTestGistErrorForQuestion] = useState({});
    const [addingQuestionToTest, setAddingQuestionToTest] = useState({}); // Track loading state for add button
    const [addQuestionSuccess, setAddQuestionSuccess] = useState(null);
    const [notifierMessage, setNotifierMessage] = useState(null);
    const [notifierType, setNotifierType] = useState(null);
    const showQuestion = async (e) => {
        e.preventDefault();
        setShowQuestionsList(!showQuestionsList);
        setShowTestsList(false);
        if(!showQuestionsList){
            try {
                const data = await questionApi.getAllQuestions();
                setQuestions(data);
                setQuestionError(null);
            } catch (err) {
                console.error("Error fetching questions:", err);
                setQuestions([]);
                setQuestionError("Failed to fetch questions.");
            }
        }
    };
    // const showTests = async (e) => {
    //     e.preventDefault();
    //     setShowTestsList(!showTestsList);
    //     setShowQuestionsList(false);
    //     if(!showTestsList){
    //         try {
    //             const data = await testApi.getAllTests();
    //             let newData = [];
    //             if(data!=null && data!=undefined){
    //                 for(const element of data ){
    //                     if(element && element.questions){
    //                         const questionIdList = element.questions;
    //                         let questionNameList = [];
    //                         if (questionIdList && Array.isArray(questionIdList)) {
    //                             for (const questionId of questionIdList) {
    //                                 try {
    //                                     const questionData = await questionApi.getQuestionById(questionId);                                        
    //                                     if (questionData && questionData.questionText) {
    //                                         questionNameList.push(questionData.questionText);
    //                                     }
    //                                 } catch (err) {
    //                                     if (err.response && err.response.status === 404) {
    //                                         console.warn(`Question with ID ${questionId} not found.`);
    //                                     } else {
    //                                         console.error(`Error fetching question by id ${questionId}:`, err);
    //                                         questionNameList.push(`(Error fetching question ${questionId})`);
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                         newData.push({ ...element, questions: questionNameList });
    //                     } else {
    //                         newData.push(element);
    //                     }
    //                 }
    //             }
    //             setTests(newData);
    //             setTestError(null);
    //         } catch (err) {
    //             console.error("Error fetching test:", err);
    //             setTests([]);
    //             setTestError("Failed to fetch test.");
    //         }
    // }
    // };

    const showTests = async (e) => {
        e.preventDefault();
        setShowTestsList(!showTestsList);
        setShowQuestionsList(false);
        if (!showTestsList) {
            try {
                const data = await testApi.getAllTests();
                // let newData = [];
                // if (data != null && data != undefined) {
                //     for (const element of data) {
                //         if (element && element.questions) {
                //             const questionIdList = element.questions;
                //             let questionNameList = [];
                //             if (questionIdList && Array.isArray(questionIdList)) {
                //                 for (const questionId of questionIdList) {
                //                     try {
                //                         const questionData = await questionApi.getQuestionById(questionId);
                //                         if (questionData && questionData.questionText) {
                //                             questionNameList.push(questionData.questionText);
                //                         }
                //                     } catch (err) {
                //                         if (err.response && err.response.status === 404) {
                //                             console.warn(`Question with ID ${questionId} not found.`);
                //                         } else {
                //                             console.error(`Error fetching question by id ${questionId}:`, err);
                //                             questionNameList.push(`(Error fetching question ${questionId})`);
                //                         }
                //                     }
                //                 }
                //             }
                //             newData.push({ ...element, questions: questionNameList });
                //         } else {
                //             newData.push(element);
                //         }
                //     }
                // }
                setTests(data);
                setTestError(null);
            } catch (err) {
                console.error("Error fetching test:", err);
                setTests([]);
                setTestError("Failed to fetch test.");
            }
        }
    };
    // const showAvailableTests = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const data = await testApi.getTestGist();
    //         setTestGistData(data);
    //     } catch (err) {
    //         console.error("Error fetching test:", err);
    //         setTests([]);
    //         setTestError("Failed to fetch test.");
    //     }

    // }
    const showAvailableTests = async (questionId) => {
        try {
            const data = await testApi.getTestGist();
            setTestGistDataForQuestion(prev => ({ ...prev, [questionId]: data }));
            setTestGistErrorForQuestion(prev => ({ ...prev, [questionId]: null }));
        } catch (err) {
            console.error("Error fetching test gist:", err);
            setTestGistDataForQuestion(prev => ({ ...prev, [questionId]: [] }));
            setTestGistErrorForQuestion(prev => ({ ...prev, [questionId]: "Failed to fetch available tests." }));
        }
    };
    const handleAddToTest = async (questionId, testId, testTitle) => {
        setAddingQuestionToTest(prev => ({ ...prev, [questionId]: true }));
        setTestGistErrorForQuestion(prev => ({ ...prev, [questionId]: null })); // Clear previous error
        setAddQuestionSuccess(null); // Clear any previous success message
        setNotifierMessage(null);
        setNotifierType(null);
        try {
            const response = await testApi.addQuestionToTest(testId, questionId);
            console.log(response);
            
            if (response && response._id) {
                console.log(`Question ${questionId} added to test ${testId} successfully`);
                setNotifierMessage(`Question added to test "${testTitle}"`);
                setNotifierType('success');
                // Optionally remove the test from the list after successful addition
                setTestGistDataForQuestion(prev => {
                    const updatedData = { ...prev };
                    if (updatedData[questionId]) {
                        updatedData[questionId] = updatedData[questionId].filter(test => test._id !== testId);
                    }
                    return updatedData;
                });
            } else {
                console.error("Failed to add question to test:", response && response.error);
                setNotifierMessage(response?.error || "Failed to add question to test.");
                setNotifierType('error');
            }
        } catch (error) {
            console.error("Error adding question to test:", error);
            setNotifierMessage("Error adding question to test.");
            setNotifierType('error');
        } finally {
            setAddingQuestionToTest(prev => ({ ...prev, [questionId]: false })); // Reset loading for this testId
        }
    };
    const handleCloseNotifier = () => {
        setNotifierMessage(null);
        setNotifierType(null);
    };
    const getTestStatus = (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (now < start) {
            return <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">Upcoming</span>;
        } else if (now >= start && now <= end) {
            return <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Active</span>;
        } else {
            return <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Expired</span>;
        }
    };
    return (
        <div className="container mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
            <Notifier
                message={notifierMessage}
                type={notifierType}
                onClose={handleCloseNotifier}
            />
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h1>
            <p className="text-gray-700 mb-4">Welcome back! You are now logged in.</p>
            <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Recent Activity</h2>
                <ul className="list-disc pl-5 text-gray-600">
                    <li>Started a new quiz: "General Knowledge"</li>
                    <li>Completed quiz: "Science Basics" - Score: 8/10</li>
                </ul>
            </div>
            <div className="flex w-1/2 max-w-[30vw] min-w-[50px] flex-wrap gap-2 justify-between">
                <button type="button" className={`px-4 py-2 rounded-2xl bg-slate-300 cursor-pointer hover:bg-slate-400 ${showQuestionsList ? 'bg-slate-400 text-white' : ''}`} onClick={showQuestion}>Show Questions</button>
                <button type="button" className={`px-4 py-2 rounded-2xl bg-slate-300 cursor-pointer hover:bg-slate-400 ${showTestsList ? 'bg-slate-400 text-white' : ''}`} onClick={showTests}>Show Tests</button>
            </div>
        
            {questionError && showQuestionsList && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline">{questionError}</span>
            </div>
        )}
            {showQuestionsList && questions.length > 0 && (
            <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Fetched Questions:</h2>
                <ul>
                    {questions.map((question) => (
                        <li key={question._id} className="mb-4 p-4 border rounded-md">
                            <p className="font-semibold">{question.questionText}</p>
                            <p className="text-sm text-gray-500">Type: {question.questionType}</p>
                            {question.imageLink && (
                                <img
                                    src={question.imageLink}
                                    alt="Question Image"
                                    className="max-w-sm h-auto mt-2 rounded-md"
                                    onError={(e) => {
                                        e.target.onerror = null; // Prevent infinite loop if fallback also fails
                                        e.target.src = ''; // Clear the broken image source
                                        e.target.alt = 'Unable to load image';
                                        e.target.className = 'inline-block w-auto h-auto p-1 bg-red-100 text-red-700 border border-red-400 rounded text-xs align-middle';
                                    }}
                                />
                            )}
                            {question.options && question.options.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm font-semibold">Options:</p>
                                    <ol className="list-decimal pl-5">
                                        {question.options.map((option, index) => (
                                            <li key={index}>{option}</li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                            <p className="text-sm mt-2">Correct Answer: {question.correctAnswer}</p>
                            <p className="text-xs text-gray-400">Created At: {question.createdAt}</p>
                            {/* <button type="button" className="px-3 py-1 text-sm rounded-2xl bg-slate-300 cursor-pointer hover:bg-slate-400" onClick={showAvailableTests}>Add to Test</button>
                            {testGistData.map((test) => (
                                <li key={test._id} className="mb-4 p-4 border rounded-md">
                                    <p className="text-sm text-gray-500">Title: {test.title}</p>
                                    <p className="text-sm text-gray-500">Description: {test.description} minutes</p>
                                </li>
                            ))
                            } */}
                            <div className="mt-4 border-t pt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white cursor-pointer hover:bg-blue-600"
                                    onClick={() => showAvailableTests(question._id)} // Pass question ID
                                >
                                    Add to Test
                                </button>

                                {testGistDataForQuestion[question._id] && testGistDataForQuestion[question._id].length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm font-semibold">Available Tests:</p>
                                        <ul className="list-disc pl-5">
                                            {testGistDataForQuestion[question._id].map((test) => (
                                                <li key={test._id} className="flex items-center justify-between py-1">
                                                    <div>
                                                        <p className="text-sm text-gray-700 font-medium">{test._id}</p>
                                                        <p className="text-sm text-gray-700 font-medium">{test.title}</p>
                                                        <p className="text-xs text-gray-500">{test.description}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className={`px-2 py-1 text-xs rounded-md bg-green-500 text-white cursor-pointer hover:bg-green-600 ${addingQuestionToTest[question._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        onClick={() => handleAddToTest(question._id, test._id, test.title)} // Pass test.title
                                                        disabled={!!addingQuestionToTest[question._id]}
                                                    >
                                                        {console.log(question._id)} {addingQuestionToTest[question._id] ? 'Adding...' : 'Add'}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {testGistErrorForQuestion[question._id] && (
                                    <p className="text-red-500 text-sm mt-2">{testGistErrorForQuestion[question._id]}</p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )}

            {testError && showTestsList && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline">{testError}</span>
                </div>
            )}

            {showTestsList && tests.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Fetched Tests:</h2>
                    <ul>
                        {tests.map((test) => (
                            <li key={test._id} className="mb-4 p-4 border rounded-md">
                                <div className="">
                                <p className="font-semibold">{test.title}</p>
                                <p className="text-sm text-gray-500">Description: {test.description}</p>
                                <p className="text-sm text-gray-500">Duration: {test.duration} minutes</p>
                                <p className="text-sm text-gray-500">Start Date: {new Date(test.startDate).toLocaleDateString()} {new Date(test.startDate).toLocaleTimeString()}</p>
                                <p className="text-sm text-gray-500">End Date: {new Date(test.endDate).toLocaleDateString()} {new Date(test.endDate).toLocaleTimeString()}</p>
                                {test.questions && test.questions.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm font-semibold">Questions IDs:</p>
                                        <ol className="list-decimal pl-5">
                                            {test.questions.map((questionId) => (
                                                <li key={questionId}>{questionId}</li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                                <p className="text-xs text-gray-400">Created At: {new Date(test.createdAt).toLocaleDateString()} {new Date(test.createdAt).toLocaleTimeString()}</p>
                                <div>
                                    {getTestStatus(test.startDate, test.endDate)}
                                </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Dashboard;