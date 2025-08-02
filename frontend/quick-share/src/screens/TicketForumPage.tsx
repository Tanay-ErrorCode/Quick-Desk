import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Pagination,
  InputGroup,
} from "react-bootstrap";
import Ticket from "../components/Ticket";
import Navigation from "../components/Navigation";

interface TicketData {
  id: number;
  title: string;
  description: string;
  tags: string[];
  postedBy: string;
  status: "Open" | "Closed" | "In Progress";
  conversationCount: number;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  category: string;
}

function TicketForumPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketData[]>([]);
  const [showOpenOnly, setShowOpenOnly] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Most Recent");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const ticketsPerPage = 10;

  useEffect(() => {
    const sampleTickets: TicketData[] = [
      {
        id: 1,
        title: "Is it good to use AI for hackathon?",
        description:
          "I'm wondering about the effectiveness of AI tools in hackathon projects...",
        tags: ["Technical", "AI"],
        postedBy: "TechUser123",
        status: "Open",
        conversationCount: 21,
        upvotes: 15,
        downvotes: 2,
        createdAt: "2025-01-30",
        category: "Technical",
      },
      {
        id: 2,
        title: "How to integrate payment gateway?",
        description:
          "Need help with Stripe integration in React application...",
        tags: ["Development", "Payment"],
        postedBy: "DevExpert",
        status: "In Progress",
        conversationCount: 8,
        upvotes: 12,
        downvotes: 1,
        createdAt: "2025-01-29",
        category: "Development",
      },
      {
        id: 3,
        title: "Database performance optimization tips",
        description: "Looking for best practices to optimize MySQL queries...",
        tags: ["Database", "Performance"],
        postedBy: "DataGuru",
        status: "Closed",
        conversationCount: 45,
        upvotes: 28,
        downvotes: 3,
        createdAt: "2025-01-28",
        category: "Database",
      },
      {
        id: 4,
        title: "React vs Vue.js comparison",
        description: "Which framework is better for enterprise applications?",
        tags: ["React", "Vue", "Frontend"],
        postedBy: "FrontendDev",
        status: "Open",
        conversationCount: 17,
        upvotes: 9,
        downvotes: 4,
        createdAt: "2025-01-27",
        category: "Development",
      },
      {
        id: 5,
        title: "Cloud deployment strategies",
        description: "Best practices for deploying applications to AWS...",
        tags: ["Cloud", "AWS", "DevOps"],
        postedBy: "CloudEngineer",
        status: "Open",
        conversationCount: 12,
        upvotes: 18,
        downvotes: 1,
        createdAt: "2025-01-26",
        category: "DevOps",
      },
    ];

    setTickets(sampleTickets);
    setFilteredTickets(sampleTickets);

    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  useEffect(() => {
    let filtered = [...tickets];

    if (showOpenOnly) {
      filtered = filtered.filter((ticket) => ticket.status === "Open");
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (ticket) => ticket.category === selectedCategory,
      );
    }

    if (selectedStatus !== "All") {
      filtered = filtered.filter((ticket) => ticket.status === selectedStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "Most Comments":
          return b.conversationCount - a.conversationCount;
        case "Most Upvotes":
          return b.upvotes - a.upvotes;
        case "Most Recent":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    setFilteredTickets(filtered);
    setCurrentPage(1);
  }, [
    tickets,
    showOpenOnly,
    selectedCategory,
    selectedStatus,
    sortBy,
    searchTerm,
  ]);

  const handleVote = (ticketId: number, voteType: "up" | "down") => {
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            upvotes: voteType === "up" ? ticket.upvotes + 1 : ticket.upvotes,
            downvotes:
              voteType === "down" ? ticket.downvotes + 1 : ticket.downvotes,
          };
        }
        return ticket;
      }),
    );
  };

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket,
  );
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  return (
    <>
      <Navigation />

      <Container className="py-4">
        {/* Header Section */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="fw-bold text-dark mb-0">Support Forum</h2>
              {isLoggedIn && (
                <Link
                  to="/create-ticket"
                  className="btn btn-primary"
                  style={{ borderRadius: "25px" }}
                >
                  Ask Question
                </Link>
              )}
            </div>
          </Col>
        </Row>

        {/* Filters Section */}
        <Card className="mb-4" style={{ borderRadius: "15px" }}>
          <Card.Body className="p-4">
            <Row className="g-3">
              <Col lg={3} md={6}>
                <Form.Check
                  type="checkbox"
                  label="Show open questions only"
                  checked={showOpenOnly}
                  onChange={(e) => setShowOpenOnly(e.target.checked)}
                  className="fw-medium"
                />
              </Col>
              <Col lg={2} md={6}>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="All">All Categories</option>
                  <option value="Technical">Technical</option>
                  <option value="Development">Development</option>
                  <option value="Database">Database</option>
                  <option value="DevOps">DevOps</option>
                </Form.Select>
              </Col>
              <Col lg={2} md={6}>
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="All">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </Form.Select>
              </Col>
              <Col lg={2} md={6}>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="Most Recent">Most Recent</option>
                  <option value="Most Comments">Most Comments</option>
                  <option value="Most Upvotes">Most Upvotes</option>
                </Form.Select>
              </Col>
              <Col lg={3}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ borderRadius: "10px 0 0 10px" }}
                  />
                  <Button
                    variant="outline-secondary"
                    style={{ borderRadius: "0 10px 10px 0" }}
                  >
                    🔍
                  </Button>
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Tickets List using Ticket Component */}
        <Row>
          {currentTickets.map((ticket) => (
            <Ticket 
              key={ticket.id} 
              ticket={ticket} 
              onVote={handleVote} 
            />
          ))}
        </Row>

        {/* Pagination */}
        {totalPages > 1 && (
          <Row className="mt-4">
            <Col className="d-flex justify-content-center">
              <Pagination>
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                />
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                />
              </Pagination>
            </Col>
          </Row>
        )}

        {/* No Results */}
        {currentTickets.length === 0 && (
          <Row>
            <Col className="text-center py-5">
              <h5 className="text-muted">No questions found</h5>
              <p className="text-muted">
                Try adjusting your filters or search terms
              </p>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
}

export default TicketForumPage;