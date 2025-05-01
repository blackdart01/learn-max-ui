import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Badge, Spin, Alert, Typography } from 'antd';
import { EyeOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { getAllAttempts } from '../store/slices/attemptSlice';

const { Title } = Typography;

interface Attempt {
    _id: string;
    testId: {
        _id: string;
        title: string;
    };
    studentId: {
        _id: string;
        username: string;
    };
    score: number;
    startTime: string;
    endTime: string;
    answers: Array<{
        questionId: string;
        selectedOption: string;
    }>;
}

const TeacherAttempts: React.FC = () => {
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await dispatch(getAllAttempts()).unwrap()
                // const response = await axios.get('http://localhost:5000/api/teachers/attempts', {
                //     headers: { Authorization: `Bearer ${token}` }
                // });
                setAttempts(response.data);
                setLoading(false);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch attempts');
                setLoading(false);
            }
        };

        fetchAttempts();
    }, []);

    const columns = [
        {
            title: 'Test Title',
            dataIndex: ['testId', 'title'],
            key: 'testTitle',
            sorter: (a: Attempt, b: Attempt) => a.testId.title.localeCompare(b.testId.title)
        },
        {
            title: 'Student',
            dataIndex: ['studentId', 'username'],
            key: 'student',
            sorter: (a: Attempt, b: Attempt) => a.studentId.username.localeCompare(b.studentId.username)
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
            render: (score: number) => (
                <Badge 
                    count={`${score}%`} 
                    style={{ 
                        backgroundColor: score >= 70 ? '#52c41a' : score >= 40 ? '#faad14' : '#f5222d',
                        fontSize: '14px',
                        padding: '0 8px'
                    }} 
                />
            ),
            sorter: (a: Attempt, b: Attempt) => a.score - b.score
        },
        {
            title: 'Status',
            key: 'status',
            render: (record: Attempt) => (
                <Badge
                    status={record.endTime ? "success" : "processing"}
                    text={record.endTime ? "Completed" : "In Progress"}
                    icon={record.endTime ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                />
            )
        },
        {
            title: 'Start Time',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (date: string) => format(new Date(date), 'MMM dd, yyyy HH:mm'),
            sorter: (a: Attempt, b: Attempt) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        },
        {
            title: 'End Time',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (date: string) => date ? format(new Date(date), 'MMM dd, yyyy HH:mm') : '-',
            sorter: (a: Attempt, b: Attempt) => {
                if (!a.endTime) return 1;
                if (!b.endTime) return -1;
                return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: Attempt) => (
                <Button 
                    type="primary" 
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/teacher-attempts/${record._id}`)}
                >
                    Review
                </Button>
            )
        }
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <Alert type="error" message={error} />
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <Card>
                <Title level={2}>Test Attempts</Title>
                <Table
                    columns={columns}
                    dataSource={attempts}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default TeacherAttempts; 