import React from 'react'
import { Row } from 'react-bootstrap';
import UserMeal from './UserMeal';

const UserOrder = ({order}) => {
  const  meals  = order.orderRows; 
    return (
        <Row>
          {meals.map((meal) => (
            <div key={meal.id}>
              <UserMeal
                id={meal.id}
                name={meal.mealName}
                imageUrl={meal.imageUrl}
                amount={meal.amount}
                weight={meal.weight}
              />
            </div>
          ))}
        </Row>
      );
}

export default UserOrder