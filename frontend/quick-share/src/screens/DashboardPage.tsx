import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Badge,
  ProgressBar,
} from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import Navigation from "../components/Navigation";

const customStyles = {
  dashboardCard: {
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease",
    height: "100%",
  },
  statCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "15px",
    border: "none",
    height: "100%",
  },
  chartCard: {
    background: "linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)",
    borderRadius: "15px",
    border: "none",
    minHeight: "350px",
  },
  customButton: {
    borderRadius: "25px",
    padding: "8px 20px",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
};

interface UserDashboardData {
  myQuestionsAsked: number;
  myRepliesGiven: number;
  myTicketsOpen: number;
  myTicketsResolved: number;
  myCategoryData: Array<{ name: string; count: number; color: string }>;
  myMonthlyData: Array<{ month: string; questions: number; replies: number }>;
  myRecentActivity: Array<{
    id: number;
    action: string;
    time: string;
    type: string;
  }>;
  reputation: number;
  helpfulVotes: number;
}

function DashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("End User");
  const [userName, setUserName] = useState("User");
  const [dashboardData, setDashboardData] = useState<UserDashboardData>({
    myQuestionsAsked: 0,
    myRepliesGiven: 0,
    myTicketsOpen: 0,
    myTicketsResolved: 0,
    myCategoryData: [],
    myMonthlyData: [],
    myRecentActivity: [],
    reputation: 0,
    helpfulVotes: 0,
  });

  useEffect(() => {
    // Check login status
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("userRole") || "End User";
    const name = localStorage.getItem("userName") || "User";
    setIsLoggedIn(loggedIn);
    setUserRole(role);
    setUserName(name);

    if (loggedIn) {
      // Simulate loading user's personal dashboard data
      const userPersonalData: UserDashboardData = {
        myQuestionsAsked: 12,
        myRepliesGiven: 8,
        myTicketsOpen: 3,
        myTicketsResolved: 9,
        reputation: 245,
        helpfulVotes: 23,
        myCategoryData: [
          { name: "Technical", count: 5, color: "#8884d8" },
          { name: "Development", count: 4, color: "#82ca9d" },
          { name: "Database", count: 2, color: "#ffc658" },
          { name: "UI/UX", count: 1, color: "#8dd1e1" },
        ],
        myMonthlyData: [
          { month: "Jan", questions: 2, replies: 1 },
          { month: "Feb", questions: 1, replies: 2 },
          { month: "Mar", questions: 3, replies: 1 },
          { month: "Apr", questions: 2, replies: 2 },
          { month: "May", questions: 2, replies: 1 },
          { month: "Jun", questions: 2, replies: 1 },
        ],
        myRecentActivity: [
          {
            id: 1,
            action: "You posted a new question in Technical category",
            time: "2 hours ago",
            type: "question",
          },
          {
            id: 2,
            action: 'You replied to "React vs Vue" discussion',
            time: "1 day ago",
            type: "reply",
          },
          {
            id: 3,
            action: "Your question received an upvote",
            time: "2 days ago",
            type: "upvote",
          },
          {
            id: 4,
            action: "You marked a ticket as resolved",
            time: "3 days ago",
            type: "resolved",
          },
          {
            id: 5,
            action: "You submitted an upgrade request",
            time: "1 week ago",
            type: "upgrade",
          },
        ],
      };

      setDashboardData(userPersonalData);
    }
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "question":
        return "❓";
      case "reply":
        return "💬";
      case "upvote":
        return "👍";
      case "resolved":
        return "✅";
      case "upgrade":
        return "⬆️";
      default:
        return "📝";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "question":
        return "primary";
      case "reply":
        return "success";
      case "upvote":
        return "warning";
      case "resolved":
        return "success";
      case "upgrade":
        return "info";
      default:
        return "secondary";
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <Navigation />
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <Card className="text-center shadow">
                <Card.Body className="p-4">
                  <h3 className="mb-3">Please log in to view your dashboard</h3>
                  <Link to="/login" className="btn btn-primary btn-lg">
                    Login
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />

      <Container fluid className="px-3 px-md-4 py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col xs={12}>
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
              <div className="flex-grow-1">
                <h2 className="fw-bold text-dark mb-1">My Dashboard</h2>
                <p className="text-muted mb-0 d-none d-sm-block">
                  Welcome back, {userName}! Here's your personal activity
                  overview
                </p>
                <p className="text-muted mb-0 d-sm-none">
                  Welcome back, {userName}!
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <Badge bg="info" className="fs-6 px-3 py-2">
                  {userRole}
                </Badge>
                <Badge bg="warning" className="fs-6 px-3 py-2">
                  ⭐ {dashboardData.reputation} pts
                </Badge>
                <Link
                  to="/create-ticket"
                  className="btn btn-primary"
                  style={customStyles.customButton}
                >
                  <span className="d-none d-sm-inline">Ask Question</span>
                  <span className="d-sm-none">Ask</span>
                </Link>
              </div>
            </div>
          </Col>
        </Row>

        {/* Personal Statistics Cards */}
        <Row className="mb-4 g-3 g-md-4">
          <Col xs={6} lg={3}>
            <Card style={customStyles.statCard}>
              <Card.Body className="text-center p-3 p-md-4">
                <div className="display-6 display-md-4 mb-2">❓</div>
                <h4 className="h3 h-md-2 fw-bold mb-1">
                  {dashboardData.myQuestionsAsked}
                </h4>
                <p className="mb-0 opacity-75 small">My Questions</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} lg={3}>
            <Card style={customStyles.statCard}>
              <Card.Body className="text-center p-3 p-md-4">
                <div className="display-6 display-md-4 mb-2">💬</div>
                <h4 className="h3 h-md-2 fw-bold mb-1">
                  {dashboardData.myRepliesGiven}
                </h4>
                <p className="mb-0 opacity-75 small">My Replies</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} lg={3}>
            <Card style={customStyles.statCard}>
              <Card.Body className="text-center p-3 p-md-4">
                <div className="display-6 display-md-4 mb-2">🎫</div>
                <h4 className="h3 h-md-2 fw-bold mb-1">
                  {dashboardData.myTicketsOpen}
                </h4>
                <p className="mb-0 opacity-75 small">Open Tickets</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} lg={3}>
            <Card style={customStyles.statCard}>
              <Card.Body className="text-center p-3 p-md-4">
                <div className="display-6 display-md-4 mb-2">✅</div>
                <h4 className="h3 h-md-2 fw-bold mb-1">
                  {dashboardData.myTicketsResolved}
                </h4>
                <p className="mb-0 opacity-75 small">Resolved</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Dashboard Chart */}
        <Row className="mb-4">
          <Col xs={12}>
            <Card style={customStyles.chartCard}>
              <Card.Body className="p-3 p-md-4">
                <h5 className="fw-bold text-white mb-3 mb-md-4">
                  📊 My Activity Over Time
                </h5>
                <div
                  className="bg-white rounded p-2 p-md-3"
                  style={{ minHeight: "250px" }}
                >
                  <h6 className="text-dark mb-3 d-none d-md-block">
                    My Monthly Questions vs Replies
                  </h6>
                  <h6 className="text-dark mb-3 d-md-none small">
                    Monthly Activity
                  </h6>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dashboardData.myMonthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        fontSize={12}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis fontSize={12} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="questions"
                        stroke="#667eea"
                        strokeWidth={2}
                        name="Questions"
                      />
                      <Line
                        type="monotone"
                        dataKey="replies"
                        stroke="#56ab2f"
                        strokeWidth={2}
                        name="Replies"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row className="mb-4 g-3 g-md-4">
          {/* My Category Distribution */}
          <Col xs={12} lg={6}>
            <Card style={customStyles.dashboardCard}>
              <Card.Body className="p-3 p-md-4">
                <h6 className="fw-bold mb-3 mb-md-4">
                  📂 My Questions by Category
                </h6>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={dashboardData.myCategoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {dashboardData.myCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          {/* My Category Bar Chart */}
          <Col xs={12} lg={6}>
            <Card style={customStyles.dashboardCard}>
              <Card.Body className="p-3 p-md-4">
                <h6 className="fw-bold mb-3 mb-md-4">
                  📊 Question Count by Category
                </h6>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dashboardData.myCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis fontSize={12} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity & Personal Stats */}
        <Row className="g-3 g-md-4">
          {/* My Recent Activity */}
          <Col xs={12} xl={8}>
            <Card style={customStyles.dashboardCard}>
              <Card.Body className="p-3 p-md-4">
                <h6 className="fw-bold mb-3 mb-md-4">🔔 My Recent Activity</h6>
                <div className="activity-list">
                  {dashboardData.myRecentActivity.map((activity) => (
                    <Alert
                      key={activity.id}
                      variant="light"
                      className="d-flex align-items-start mb-2 border-start border-4 p-2 p-md-3"
                      style={{
                        borderLeftColor: `var(--bs-${getActivityColor(activity.type)})`,
                      }}
                    >
                      <span className="me-2 me-md-3 fs-6 fs-md-5 flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </span>
                      <div className="flex-grow-1 min-w-0">
                        <div className="fw-medium small text-break">
                          {activity.action}
                        </div>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                      <Badge
                        bg={getActivityColor(activity.type)}
                        className="ms-2 flex-shrink-0"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {activity.type}
                      </Badge>
                    </Alert>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* My Personal Stats */}
          <Col xs={12} xl={4}>
            <Card style={customStyles.dashboardCard}>
              <Card.Body className="p-3 p-md-4">
                <h6 className="fw-bold mb-3 mb-md-4">📈 My Performance</h6>

                <div className="mb-3 mb-md-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small">Questions Answered</span>
                    <span className="fw-bold small">
                      {Math.round(
                        (dashboardData.myTicketsResolved /
                          (dashboardData.myTicketsResolved +
                            dashboardData.myTicketsOpen)) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <ProgressBar
                    variant="success"
                    now={Math.round(
                      (dashboardData.myTicketsResolved /
                        (dashboardData.myTicketsResolved +
                          dashboardData.myTicketsOpen)) *
                        100,
                    )}
                    style={{ height: "8px" }}
                  />
                </div>

                <div className="mb-3 mb-md-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small">Helpful Votes</span>
                    <span className="fw-bold small">
                      {dashboardData.helpfulVotes}
                    </span>
                  </div>
                  <ProgressBar
                    variant="info"
                    now={
                      (dashboardData.helpfulVotes /
                        dashboardData.myRepliesGiven) *
                      10
                    }
                    style={{ height: "8px" }}
                  />
                </div>

                <div className="mb-3 mb-md-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small">Reputation Points</span>
                    <span className="fw-bold small">
                      {dashboardData.reputation}
                    </span>
                  </div>
                  <ProgressBar
                    variant="warning"
                    now={(dashboardData.reputation / 500) * 100}
                    style={{ height: "8px" }}
                  />
                </div>

                <div className="d-grid gap-2">
                  <Link
                    to="/forum"
                    className="btn btn-outline-primary btn-sm"
                    style={customStyles.customButton}
                  >
                    View My Questions
                  </Link>
                  <Link
                    to="/tickets"
                    className="btn btn-outline-secondary btn-sm"
                    style={customStyles.customButton}
                  >
                    My Tickets
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default DashboardPage;
