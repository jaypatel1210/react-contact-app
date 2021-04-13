import React, { useContext } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardSubtitle
} from "reactstrap";
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { ContactContext } from "../context/Context";
import ManImg from '../assets/man.png';

const ViewContact = () => {
  const { state } = useContext(ContactContext);
  // destructuring contact from the state
  // and rendering it in state
  const { contact } = state;
  return (
    <Container>
      <Row className="mt-5 mb-5">
        <Col md="5" className="offset-md-3">
          <Card className="pt-3 pb-5">
            <CardBody className="text-center ">
              <img
                height="150"
                width="150"
                className="cardImg profile border-danger"
                src={
                  contact?.picture ? contact?.picture : ManImg
                }
                alt="img"
              />
              <CardTitle className="text-primary mt-3">
                <h1>{contact?.name}</h1>
              </CardTitle>
              <CardSubtitle>
                <h3>
                  <FaPhone className="mr-2 call__icon" />
                  <a
                    href={`tel:${contact?.phoneNumber}`}
                    className="text-dark"
                    rel="noopener noreferrer"
                  >
                    {contact?.phoneNumber}
                  </a>
                </h3>
              </CardSubtitle>
              <a
                className="btn btn-primary btn-block"
                target="_blank"
                href={`mailto:${contact?.email}`}
                rel="noopener noreferrer"
              >
                <FaEnvelope className="icon mr-2" />
                {contact?.email}
              </a>

              <a
                className="btn btn-primary btn-block"
                target="_blank"
                href={`https://maps.google.com/?q=${contact?.address}`}
                rel="noopener noreferrer"
              >
                <FaMapMarkerAlt className="icon mr-2" />
                {contact?.address}
              </a>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ViewContact;
