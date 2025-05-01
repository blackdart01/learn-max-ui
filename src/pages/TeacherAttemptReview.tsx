import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Alert, List, Space, Badge, Modal, Input, Button, message, Tag, Divider } from 'antd';
import { 
    CheckCircleOutlined, 
    CloseCircleOutlined, 
    EditOutlined, 
    QuestionCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    FileTextOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttemptsByAttemptId } from '../store/slices/attemptSlice';
const { Title, Text } = Typography;
const { TextArea } = Input;

interface Question {
    _id: string;
    questionText: string;
    options: string[];
    correctAnswer: string[];
}

interface Answer {
    _id: string;
    questionId: Question;
    selectedOption?: string;
    isCorrect?: boolean;
    teacherComment?: string;
}

interface Test {
    _id: string;
    title: string;
    questions: Question[];
}

interface Attempt {
    _id: string;
    testId: Test;
    studentId: {
        _id: string;
        username: string;
    };
    score: number;
    startTime: string;
    endTime: string;
    answers: Answer[];
}

const TeacherAttemptReview: React.FC = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingAnswer, setEditingAnswer] = useState<string | null>(null);
    const [comment, setComment] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchAttempt = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await dispatch(getAllAttemptsByAttemptId(attemptId)).unwrap()
                // const response = await axios.get(`http://localhost:5000/api/teachers/attempts/attempt/${attemptId}`, {
                //     headers: { Authorization: `Bearer ${token}` }
                // });
                setAttempt(response.data);
                setLoading(false);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch attempt details');
                setLoading(false);
            }
        };

        fetchAttempt();
    }, [attemptId]);

    const handleUpdateAnswer = async (answerId: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://localhost:5000/api/teachers/attempts/${attemptId}/grade/${answerId}`,
                {
                    isCorrect,
                    teacherComment: comment
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Refresh attempt data
            const response = await axios.get(`http://localhost:5000/api/teachers/attempts/attempt/${attemptId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttempt(response.data);
            setEditingAnswer(null);
            message.success('Answer updated successfully');
        } catch (err: any) {
            console.error('Error updating answer:', err);
            message.error(err.response?.data?.message || 'Failed to update answer');
        }
    };

    const getAnswerForQuestion = (questionId: string) => {
        return attempt?.answers.find(a => a.questionId._id === questionId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (error || !attempt) {
        return (
            <div className="p-6">
                <Alert type="error" message={error || 'Attempt not found'} />
            </div>
        );
    }

    const calculateDuration = () => {
        if (!attempt.startTime || !attempt.endTime) return 'In Progress';
        const start = new Date(attempt.startTime);
        const end = new Date(attempt.endTime);
        const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
        return `${minutes} minutes`;
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <Title level={2} className="!mb-2">{attempt.testId.title}</Title>
                        <Space direction="vertical" size="small">
                            <Text>
                                <UserOutlined className="mr-2" />
                                Student: <Text strong>{attempt.studentId.username}</Text>
                            </Text>
                            <Text>
                                <ClockCircleOutlined className="mr-2" />
                                Duration: <Text strong>{calculateDuration()}</Text>
                            </Text>
                        </Space>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <Badge.Ribbon 
                            text={`Score: ${attempt.score}%`}
                            color={attempt.score >= 70 ? 'green' : attempt.score >= 40 ? 'orange' : 'red'}
                        >
                            <Card className="w-40 text-center">
                                <Text type="secondary">Total Questions: {attempt.testId.questions.length}</Text>
                            </Card>
                        </Badge.Ribbon>
                    </div>
                </div>

                <Divider />

                <div className="flex flex-wrap gap-4 text-sm mb-6">
                    <div className="flex items-center">
                        <ClockCircleOutlined className="mr-2" />
                        Started: {format(new Date(attempt.startTime), 'MMM dd, yyyy HH:mm')}
                    </div>
                    {attempt.endTime && (
                        <div className="flex items-center">
                            <ClockCircleOutlined className="mr-2" />
                            Completed: {format(new Date(attempt.endTime), 'MMM dd, yyyy HH:mm')}
                        </div>
                    )}
                </div>

                <List
                    itemLayout="vertical"
                    dataSource={attempt.testId.questions}
                    renderItem={(question, index) => {
                        const answer = getAnswerForQuestion(question._id);
                        const isUnattempted = !answer;

                        return (
                            <Card className="mb-4" key={question._id}>
                                <div className="flex justify-between items-start mb-4">
                                    <Space direction="vertical" className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge 
                                                count={index + 1} 
                                                style={{ 
                                                    backgroundColor: '#1890ff',
                                                    marginRight: '8px'
                                                }} 
                                            />
                                            <Text strong className="text-lg">{question.questionText}</Text>
                                        </div>
                                    </Space>
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                            setEditingAnswer(question._id);
                                            setComment(answer?.teacherComment || '');
                                            setIsCorrect(answer?.isCorrect || false);
                                        }}
                                    >
                                        Grade
                                    </Button>
                                </div>

                                <div className="ml-8">
                                    {isUnattempted ? (
                                        <Alert
                                            message="Not Attempted"
                                            type="warning"
                                            showIcon
                                            icon={<ExclamationCircleOutlined />}
                                        />
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Text type="secondary">Student's Answer:</Text>
                                                <Tag color={answer.isCorrect ? 'success' : 'error'}>
                                                    {answer.selectedOption}
                                                </Tag>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Text type="secondary">Correct Answer:</Text>
                                                <Tag color="success">{question.correctAnswer.join(' or ')}</Tag>
                                            </div>
                                            {answer.teacherComment && (
                                                <Alert
                                                    message="Teacher's Comment"
                                                    description={answer.teacherComment}
                                                    type="info"
                                                    showIcon
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    }}
                />
            </Card>

            <Modal
                title="Grade Answer"
                open={!!editingAnswer}
                onCancel={() => setEditingAnswer(null)}
                footer={[
                    <Button key="cancel" onClick={() => setEditingAnswer(null)}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => editingAnswer && handleUpdateAnswer(editingAnswer)}
                    >
                        Save Grade
                    </Button>
                ]}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div>
                        <Text strong className="mb-2 block">Mark as:</Text>
                        <Space>
                            <Button
                                type={isCorrect ? "primary" : "default"}
                                icon={<CheckCircleOutlined />}
                                onClick={() => setIsCorrect(true)}
                            >
                                Correct
                            </Button>
                            <Button
                                type={!isCorrect ? "primary" : "default"}
                                icon={<CloseCircleOutlined />}
                                onClick={() => setIsCorrect(false)}
                            >
                                Incorrect
                            </Button>
                        </Space>
                    </div>
                    <div>
                        <Text strong className="mb-2 block">Add Comment:</Text>
                        <TextArea
                            rows={4}
                            placeholder="Add a comment about this answer..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                </Space>
            </Modal>
        </div>
    );
};

export default TeacherAttemptReview; 