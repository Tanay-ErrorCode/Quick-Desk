import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  Alert,
  Spinner,
  InputGroup,
  Dropdown,
} from "react-bootstrap";
import Navigation from "../components/Navigation";
import { apiService, Ticket, Category } from "../services/api";

const customStyles = {
  headerCard: {
    borderRadius: "20px",
    border: "none",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  ticketCard: {
    borderRadius: "15px",
    border: "1px solid #e9ecef",
    transition: "all 0.3s ease",
    marginBottom: "20px",
  },
  filterCard: {
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
  },
  urgentBadge: {
    animation: "pulse 2s infinite",
  },
};

function TicketForumPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("End User");
  const [userName, setUserName] = useState("User");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "danger" | "info">("success");
  const navigate = useNavigate();

  useEffect(() => {
    // Check login status
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("userRole") || "End User";
    const name = localStorage.getItem("userName") || "User";
    
    setIsLoggedIn(loggedIn);
    setUserRole(role);
    setUserName(name);

    loadTickets();
    loadCategories();
  }, [statusFilter, priorityFilter, categoryFilter, searchTerm, sortBy, sortOrder, page]);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      
      const queryParams: any = {
        page,
        limit: 12,
      };

      if (statusFilter !== "all") {
        queryParams.status = statusFilter;
      }

      if (priorityFilter !== "all") {
        queryParams.priority = priorityFilter;
      }

      if (categoryFilter !== "all") {
        queryParams.category = categoryFilter;
      }

      if (searchTerm.trim()) {
        queryParams.search = searchTerm.trim();
      }

      if (sortBy !== "created_at") {
        queryParams.sort_by = sortBy;
      }

      if (sortOrder !== "desc") {
        queryParams.sort_order = sortOrder;
      }

      // Force refresh by adding timestamp to bypass cache
      queryParams._t = Date.now();

      const response = await apiService.getTickets(queryParams);

      if (response.success && response.data) {
        if (page === 1) {
          setTickets(response.data);
        } else {
          setTickets(prev => [...prev, ...(response.data ?? []) ]);
        }

        const extendedResponse = response as any;
        setTotalCount(extendedResponse.total || response.data.length);
        setHasMore(response.data.length === 12);
      } else {
        // Show fallback message
        setAlertMessage("No tickets found or unable to load tickets.");
        setAlertType("info");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
      }

    } catch (error: any) {
      console.error("Error loading tickets:", error);
      setAlertMessage("Failed to load tickets. Please try again.");
      setAlertType("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data.filter(cat => cat.is_active));
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const refreshTickets = () => {
    setPage(1);
    setTickets([]);
    loadTickets();
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setCategoryFilter("all");
    setSearchTerm("");
    setSortBy("created_at");
    setSortOrder("desc");
    setPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "success";
      case "closed":
        return "secondary";
      case "in_progress":
        return "warning";
      case "resolved":
        return "info";
      default:
        return "primary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <Navigation />

      <Container className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <Card style={customStyles.headerCard}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="fw-bold mb-2">🎫 Support Tickets</h2>
                    <p className="mb-0 opacity-75">Browse and manage support tickets</p>
                  </div>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-light" 
                      onClick={refreshTickets}
                      disabled={isLoading}
                    >
                      🔄 Refresh
                    </Button>
                    {isLoggedIn && (
                      <Link to="/create-ticket" className="btn btn-light">
                        ➕ Create Ticket
                      </Link>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Alert */}
        {showAlert && (
          <Alert variant={alertType} className="mb-4">
            {alertMessage}
          </Alert>
        )}

        <Row>
          {/* Filters Sidebar */}
          <Col lg={3}>
            <Card style={customStyles.filterCard} className="mb-4">
              <Card.Header className="bg-light">
                <h6 className="mb-0 fw-bold">🔍 Filters</h6>
              </Card.Header>
              <Card.Body className="p-3">
                {/* Search */}
                <div className="mb-3">
                  <Form.Label className="small fw-bold">Search</Form.Label>
                  <InputGroup size="sm">
                    <Form.Control
                      type="text"
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline-secondary">🔍</Button>
                  </InputGroup>
                </div>

                {/* Status Filter */}
                <div className="mb-3">
                  <Form.Label className="small fw-bold">Status</Form.Label>
                  <Form.Select
                    size="sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </Form.Select>
                </div>

                {/* Priority Filter */}
                <div className="mb-3">
                  <Form.Label className="small fw-bold">Priority</Form.Label>
                  <Form.Select
                    size="sm"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Form.Select>
                </div>

                {/* Category Filter */}
                <div className="mb-3">
                  <Form.Label className="small fw-bold">Category</Form.Label>
                  <Form.Select
                    size="sm"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                {/* Sort Options */}
                <div className="mb-3">
                  <Form.Label className="small fw-bold">Sort By</Form.Label>
                  <Form.Select
                    size="sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="created_at">Date Created</option>
                    <option value="updated_at">Last Updated</option>
                    <option value="priority">Priority</option>
                    <option value="status">Status</option>
                    <option value="reply_count">Reply Count</option>
                  </Form.Select>
                </div>

                <div className="mb-3">
                  <Form.Label className="small fw-bold">Order</Form.Label>
                  <Form.Select
                    size="sm"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </Form.Select>
                </div>

                {/* Clear Filters */}
                <div className="d-grid">
                  <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>

                {/* Stats */}
                <div className="mt-4 pt-3 border-top">
                  <h6 className="small fw-bold mb-2">Results</h6>
                  <div className="small text-muted">
                    <div className="d-flex justify-content-between">
                      <span>Total:</span>
                      <span>{totalCount}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Showing:</span>
                      <span>{tickets.length}</span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Tickets List */}
          <Col lg={9}>
            {isLoading && page === 1 ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status" className="mb-3">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p>Loading tickets...</p>
              </div>
            ) : tickets.length > 0 ? (
              <>
                {/* Tickets Grid */}
                <Row>
                  {tickets.map((ticket) => (
                    <Col xs={12} key={ticket.id} className="mb-3">
                      <Card style={customStyles.ticketCard} className="h-100">
                        <Card.Body className="p-4">
                          <Row>
                            <Col xs={9}>
                              <div className="d-flex align-items-center mb-2">
                                {ticket.is_urgent && (
                                  <Badge bg="danger" className="me-2 small" style={customStyles.urgentBadge}>
                                    🚨 URGENT
                                  </Badge>
                                )}
                                <h5 className="fw-bold text-dark mb-0">
                                  <Link
                                    to={`/ticket/${ticket.id}`}
                                    className="text-decoration-none text-dark"
                                  >
                                    #{ticket.id} {ticket.title}
                                  </Link>
                                </h5>
                              </div>
                              
                              <p className="text-muted mb-3">
                                {ticket.description.length > 150 
                                  ? ticket.description.substring(0, 150) + '...' 
                                  : ticket.description}
                              </p>

                              {/* Tags */}
                              <div className="mb-3">
                                <Badge bg="secondary" className="me-2 mb-1">
                                  {ticket.category?.name || 'General'}
                                </Badge>
                                <Badge
                                  bg={getPriorityColor(ticket.priority)}
                                  className="me-2 mb-1"
                                >
                                  {ticket.priority.toUpperCase()} Priority
                                </Badge>
                                {ticket.tags?.map((tag: any, index: number) => (
                                  <Badge
                                    key={index}
                                    bg="light"
                                    text="dark"
                                    className="me-2 mb-1"
                                    style={{ borderRadius: "15px" }}
                                  >
                                    {tag.name}
                                  </Badge>
                                ))}
                              </div>

                              <small className="text-muted">
                                Created by {ticket.author.name} • {formatDate(ticket.created_at)}
                                {ticket.assigned_to && (
                                  <> • Assigned to {ticket.assigned_to.name}</>
                                )}
                              </small>
                            </Col>

                            {/* Status & Comments */}
                            <Col xs={3} className="d-flex flex-column align-items-end justify-content-between">
                              <Badge
                                bg={getStatusColor(ticket.status)}
                                style={{ borderRadius: "20px", padding: "8px 16px", fontWeight: "500" }}
                              >
                                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                              </Badge>

                              <div className="d-flex align-items-center">
                                <div
                                  style={{
                                    background: "#28a745",
                                    color: "white",
                                    borderRadius: "50%",
                                    width: "30px",
                                    height: "30px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.9rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {ticket.reply_count || 0}
                                </div>
                                <span className="ms-2 small text-muted">replies</span>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-4">
                    <Button
                      variant="outline-primary"
                      onClick={() => setPage(prev => prev + 1)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Loading..." : "Load More Tickets"}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="text-center py-5">
                <Card.Body>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎫</div>
                  <h4>No Tickets Found</h4>
                  <p className="text-muted">
                    {statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all" || searchTerm
                      ? "No tickets match your current filters."
                      : "No tickets have been created yet."}
                  </p>
                  {(statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all" || searchTerm) && (
                    <Button variant="outline-primary" onClick={clearFilters} className="me-2">
                      Clear Filters
                    </Button>
                  )}
                  {isLoggedIn && (
                    <Link to="/create-ticket" className="btn btn-primary">
                      Create Your First Ticket
                    </Link>
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default TicketForumPage;