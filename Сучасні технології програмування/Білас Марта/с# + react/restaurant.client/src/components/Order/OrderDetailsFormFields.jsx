import { Row,Col } from "react-bootstrap";
import { Form } from "react-bootstrap";

export const OrderDetailsFormFields = ({ handleChange, values }) => (
    <Row className="pt-4">
      <Col>
        <Form.Label className="fs-6 ps-1">
          Here you can add some comments to your order if you like to:
        </Form.Label>
        <Form.Control
          as="textarea"
          placeholder="Comment to your order"
          name="additionInfo"
          value={values.additionInfo}
          onChange={handleChange}
          rows={5}
        />
      </Col>
    </Row>
  );