import React from "react";
import { Row, Col, Card, Badge } from "react-bootstrap";

const customStyles = {
  forumCard: {
    borderRadius: "15px",
    border: "1px solid #e9ecef",
    transition: "all 0.3s ease",
  },
  voteButton: {
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    padding: "5px 10px",
    borderRadius: "50%",
    transition: "all 0.3s ease",
  },
  statusBadge: {
    borderRadius: "20px",
    padding: "8px 16px",
    fontWeight: "500",
  },
  conversationCount: {
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
  },
};

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

interface TicketProps {
  ticket: TicketData;
  onVote: (ticketId: number, voteType: "up" | "down") => void;
}

function Ticket({ ticket, onVote }: TicketProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "success";
      case "Closed":
        return "secondary";
      case "In Progress":
        return "warning";
      default:
        return "primary";
    }
  };

  return (
    <Col xs={12} className="mb-3">
      <Card
        style={customStyles.forumCard}
        className="h-100 shadow-sm hover-shadow"
      >
        <Card.Body className="p-4">
          <Row>
            {/* Vote Section */}
            <Col xs={1} className="d-flex flex-column align-items-center">
              <button
                style={customStyles.voteButton}
                onClick={() => onVote(ticket.id, "up")}
                className="text-muted hover-primary"
                aria-label="Upvote"
              >
                ▲
              </button>
              <span className="fw-bold text-dark">
                {ticket.upvotes - ticket.downvotes}
              </span>
              <button
                style={customStyles.voteButton}
                onClick={() => onVote(ticket.id, "down")}
                className="text-muted hover-danger"
                aria-label="Downvote"
              >
                ▼
              </button>
            </Col>

            {/* Content Section */}
            <Col xs={9}>
              <h5 className="fw-bold text-dark mb-2">{ticket.title}</h5>
              <p className="text-muted mb-3">{ticket.description}</p>

              {/* Tags */}
              <div className="mb-3">
                {ticket.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    bg="light"
                    text="dark"
                    className="me-2 mb-1"
                    style={{ borderRadius: "15px" }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <small className="text-muted">
                Posted by {ticket.postedBy} • {ticket.createdAt}
              </small>
            </Col>

            {/* Status & Comments */}
            <Col
              xs={2}
              className="d-flex flex-column align-items-end justify-content-between"
            >
              <Badge
                bg={getStatusColor(ticket.status)}
                style={customStyles.statusBadge}
              >
                {ticket.status}
              </Badge>

              <div className="d-flex align-items-center">
                <div style={customStyles.conversationCount}>
                  {ticket.conversationCount}
                </div>
                <span className="ms-2 small text-muted">replies</span>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default Ticket;
