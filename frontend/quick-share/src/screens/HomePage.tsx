import React, { lazy, Suspense, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  Card,
  Button,
  Spinner,
} from "react-bootstrap";

const FeatureCard = lazy(() =>
  Promise.resolve({ default: FeatureCardComponent }),
);
const TestimonialCard = lazy(() =>
  Promise.resolve({ default: TestimonialCardComponent }),
);

const customStyles = {
  heroGradient: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    color: "white",
  },
  headerGradient: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  fadeIn: {
    animation: "fadeIn 0.6s ease-in",
  },
  testimonialBg: {
    backgroundColor: "#f8fafc",
  },
  footerBg: {
    backgroundColor: "#2d3748",
    color: "white",
  },
  featureIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  roundedCard: {
    borderRadius: "20px",
    border: "none",
  },
  customButton: {
    borderRadius: "50px",
    padding: "12px 30px",
    fontWeight: "600",
  },
};

function FeatureCardComponent({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={`h-100 text-center border-0 shadow-sm ${isHovered ? "shadow-lg" : ""}`}
      style={{
        ...customStyles.roundedCard,
        transform: isHovered ? "translateY(-5px)" : "translateY(0)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card.Body className="p-4">
        <div style={customStyles.featureIcon}>{icon}</div>
        <Card.Title className="h4 mb-3 text-dark">{title}</Card.Title>
        <Card.Text className="text-muted">{description}</Card.Text>
      </Card.Body>
    </Card>
  );
}

function TestimonialCardComponent({
  text,
  author,
  role,
}: {
  text: string;
  author: string;
  role: string;
}) {
  return (
    <Card className="h-100 border-0 shadow-sm" style={customStyles.roundedCard}>
      <Card.Body className="p-4">
        <Card.Text className="fst-italic text-muted mb-3 fs-6">
          "{text}"
        </Card.Text>
        <div>
          <div className="fw-bold text-dark">{author}</div>
          <small className="text-muted">{role}</small>
        </div>
      </Card.Body>
    </Card>
  );
}

function LoadingSpinner() {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "200px" }}
    >
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}

function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .nav-link:hover { 
        opacity: 0.8 !important; 
      }
      
      .btn-custom-primary:hover { 
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      }
      
      .btn-custom-secondary:hover { 
        transform: translateY(-2px);
        background: #f0f0f0 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const features = [
    {
      icon: "🎫",
      title: "Easy Ticket Creation",
      description:
        "Users can quickly create support tickets with a simple and intuitive interface.",
    },
    {
      icon: "📋",
      title: "Ticket Tracking",
      description:
        "Track the status of your tickets from submission to resolution with clear updates.",
    },
    {
      icon: "👥",
      title: "Staff Management",
      description:
        "Support staff can efficiently view, assign, and manage tickets in one central location.",
    },
    {
      icon: "🔔",
      title: "Simple Notifications",
      description:
        "Get notified when tickets are updated, assigned, or resolved without spam.",
    },
    {
      icon: "🏷️",
      title: "Priority & Categories",
      description:
        "Organize tickets by priority levels and categories for better management.",
    },
    {
      icon: "💬",
      title: "Clear Communication",
      description:
        "Streamlined communication between users and support staff with ticket comments.",
    },
  ];

  const testimonials = [
    {
      text: "QuickDesk made our help desk so much simpler. Our team can focus on solving issues instead of fighting with complicated software.",
      author: "Mike Thompson",
      role: "IT Manager, LocalBusiness",
    },
    {
      text: "Finally, a help desk solution that doesn't require a manual to use. Our users love how easy it is to submit tickets.",
      author: "Lisa Chen",
      role: "Office Administrator, SmallCorp",
    },
    {
      text: "No more lost emails or forgotten requests. QuickDesk keeps everything organized and nothing falls through the cracks.",
      author: "David Rodriguez",
      role: "Support Lead, Community Center",
    },
  ];

  return (
    <>
      <Navbar
        expand="lg"
        sticky="top"
        className="shadow-sm"
        style={customStyles.headerGradient}
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="text-white fw-bold fs-3">
            🎧 QuickDesk
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/" className="text-white mx-2">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/tickets" className="text-white mx-2">
                My Tickets
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/create-ticket"
                className="text-white mx-2"
              >
                Create Ticket
              </Nav.Link>
              <Nav.Link as={Link} to="/dashboard" className="text-white mx-2">
                Dashboard
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <section style={customStyles.heroGradient}>
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8} md={10}>
              <div
                className={isVisible ? "animate__animated animate__fadeIn" : ""}
              >
                <h1 className="display-3 fw-bold mb-4">
                  Simple Help Desk Solution
                </h1>
                <p className="lead mb-5 fs-4">
                  QuickDesk provides an easy-to-use help desk where users can
                  raise support tickets and support staff can manage and resolve
                  them efficiently. Streamline communication between users and
                  support teams without unnecessary complexity.
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Button
                    as="a"
                    href="/create-ticket"
                    size="lg"
                    className="btn-custom-primary"
                    style={{
                      ...customStyles.customButton,
                      background: "rgba(255,255,255,0.2)",
                      border: "2px solid white",
                      color: "white",
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Create Your First Ticket
                  </Button>
                  <Button
                    as="a"
                    href="/tickets"
                    variant="light"
                    size="lg"
                    className="btn-custom-secondary"
                    style={{
                      ...customStyles.customButton,
                      color: "#667eea",
                      transition: "all 0.3s ease",
                    }}
                  >
                    View All Tickets
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <Row>
            <Col>
              <h2 className="display-4 text-center mb-5 fw-bold text-dark">
                Why Choose QuickDesk?
              </h2>
            </Col>
          </Row>
          <Row className="g-4">
            <Suspense fallback={<LoadingSpinner />}>
              {features.map((feature, index) => (
                <Col key={index} lg={4} md={6} sm={12}>
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                </Col>
              ))}
            </Suspense>
          </Row>
        </Container>
      </section>

      <section className="py-5" style={customStyles.testimonialBg}>
        <Container>
          <Row>
            <Col>
              <h2 className="display-4 text-center mb-5 fw-bold text-dark">
                What Our Customers Say
              </h2>
            </Col>
          </Row>
          <Row className="g-4">
            <Suspense fallback={<LoadingSpinner />}>
              {testimonials.map((testimonial, index) => (
                <Col key={index} lg={4} md={6} sm={12}>
                  <TestimonialCard
                    text={testimonial.text}
                    author={testimonial.author}
                    role={testimonial.role}
                  />
                </Col>
              ))}
            </Suspense>
          </Row>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h2 className="display-4 mb-4 fw-bold text-dark">
                Ready to Get Started?
              </h2>
              <p className="lead text-muted mb-4">
                Join teams already using QuickDesk to deliver simple and
                efficient support solutions.
              </p>
              <Button
                as="a"
                href="/create-ticket"
                size="lg"
                style={{
                  ...customStyles.customButton,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  color: "white",
                  transition: "all 0.3s ease",
                }}
                className="btn-custom-primary"
              >
                Get Started Now
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      <footer className="py-4 text-center" style={customStyles.footerBg}>
        <Container>
          <p className="mb-2">&copy; 2025 QuickDesk. All rights reserved.</p>
          <p className="mb-0 opacity-75">
            Built with ❤️ for simple and efficient support
          </p>
        </Container>
      </footer>
    </>
  );
}

export default HomePage;
