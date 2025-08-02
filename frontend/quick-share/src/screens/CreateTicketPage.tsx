import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert,
  Badge
} from 'react-bootstrap';
import Navigation from '../components/Navigation';

const customStyles = {
  formCard: {
    borderRadius: '20px',
    border: 'none',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  customButton: {
    borderRadius: '25px',
    padding: '12px 30px',
    fontWeight: '600',
  },
  headerGradient: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '15px 15px 0 0',
  },
};

interface TicketFormData {
  question: string;
  description: string;
  tags: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
}

function CreateTicketPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState<TicketFormData>({
    question: '',
    description: '',
    tags: '',
    category: 'Technical',
    priority: 'Medium'
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'danger'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check login status
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.question.trim()) {
      setAlertMessage('Please enter your question');
      setAlertType('danger');
      setShowAlert(true);
      setIsSubmitting(false);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    if (!formData.description.trim()) {
      setAlertMessage('Please provide a description');
      setAlertType('danger');
      setShowAlert(true);
      setIsSubmitting(false);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    if (formData.description.length < 20) {
      setAlertMessage('Description should be at least 20 characters long');
      setAlertType('danger');
      setShowAlert(true);
      setIsSubmitting(false);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setAlertMessage('Your question has been posted successfully!');
      setAlertType('success');
      setShowAlert(true);
      setIsSubmitting(false);

      // Reset form
      setFormData({
        question: '',
        description: '',
        tags: '',
        category: 'Technical',
        priority: 'Medium'
      });

      // Redirect after success
      setTimeout(() => {
        navigate('/forum');
      }, 2000);
    }, 1000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'secondary';
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <Navigation />
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={6}>
              <Card className="text-center">
                <Card.Body>
                  <h3>Please log in to create a ticket</h3>
                  <Link to="/login" className="btn btn-primary mt-3">Login</Link>
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

      <Container className="py-5">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="fw-bold text-dark mb-1">Ask Your Question</h2>
                <p className="text-muted mb-0">Get help from the community by posting your question</p>
              </div>
              <div className="d-flex gap-2">
                <Link to="/dashboard" className="btn btn-outline-primary" style={customStyles.customButton}>
                  Dashboard
                </Link>
                <Link to="/forum" className="btn btn-outline-secondary" style={customStyles.customButton}>
                  View Forum
                </Link>
              </div>
            </div>
          </Col>
        </Row>

        {/* Alert */}
        {showAlert && (
          <Alert variant={alertType} className="mb-4">
            {alertMessage}
          </Alert>
        )}

        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            <Card style={customStyles.formCard}>
              {/* Card Header */}
              <div style={customStyles.headerGradient} className="p-4">
                <h4 className="mb-0 fw-bold">Create New Support Ticket</h4>
                <small className="opacity-75">Fill out the form below to get help from our community</small>
              </div>

              <Card.Body className="p-5">
                <Form onSubmit={handleSubmit}>
                  {/* Question Title */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      Question <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="question"
                      value={formData.question}
                      onChange={handleInputChange}
                      placeholder="Enter your question title (e.g., How to integrate payment gateway?)"
                      size="lg"
                      style={{ borderRadius: '10px' }}
                      maxLength={200}
                    />
                    <Form.Text className="text-muted">
                      Be specific and descriptive. This helps others understand your question quickly.
                    </Form.Text>
                  </Form.Group>

                  {/* Description */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      Description <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Provide detailed information about your question. Include what you've tried, error messages, code snippets, etc."
                      style={{ borderRadius: '10px' }}
                    />
                    <Form.Text className="text-muted">
                      {formData.description.length}/500 characters. Minimum 20 characters required.
                    </Form.Text>
                  </Form.Group>

                  <Row>
                    {/* Category */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Category</Form.Label>
                        <Form.Select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          size="lg"
                          style={{ borderRadius: '10px' }}
                        >
                          <option value="Technical">Technical</option>
                          <option value="Development">Development</option>
                          <option value="Database">Database</option>
                          <option value="DevOps">DevOps</option>
                          <option value="UI/UX">UI/UX</option>
                          <option value="Security">Security</option>
                          <option value="General">General</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {/* Priority */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Priority</Form.Label>
                        <Form.Select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          size="lg"
                          style={{ borderRadius: '10px' }}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </Form.Select>
                        <div className="mt-2">
                          <Badge bg={getPriorityColor(formData.priority)}>
                            {formData.priority} Priority
                          </Badge>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Tags */}
                  <Form.Group className="mb-5">
                    <Form.Label className="fw-bold">Tags</Form.Label>
                    <Form.Control
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Enter tags separated by commas (e.g., react, javascript, api)"
                      size="lg"
                      style={{ borderRadius: '10px' }}
                    />
                    <Form.Text className="text-muted">
                      Add relevant tags to help others find and answer your question. Separate multiple tags with commas.
                    </Form.Text>
                  </Form.Group>

                  {/* Submit Button */}
                  <div className="text-center">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      style={{
                        ...customStyles.customButton,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        minWidth: '150px'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Posting...
                        </>
                      ) : (
                        'Post Question'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Help Section */}
        <Row className="mt-5">
          <Col>
            <Card className="bg-light border-0">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">💡 Tips for Getting Better Answers</h5>
                <Row>
                  <Col md={6}>
                    <ul className="list-unstyled">
                      <li className="mb-2">✅ <strong>Be specific</strong> - Include exact error messages</li>
                      <li className="mb-2">✅ <strong>Show your work</strong> - What have you already tried?</li>
                      <li className="mb-2">✅ <strong>Add context</strong> - What are you trying to achieve?</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <ul className="list-unstyled">
                      <li className="mb-2">✅ <strong>Use relevant tags</strong> - Help others find your question</li>
                      <li className="mb-2">✅ <strong>Format code</strong> - Use code blocks for better readability</li>
                      <li className="mb-2">✅ <strong>Check spelling</strong> - Clear questions get better answers</li>
                    </ul>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default CreateTicketPage;