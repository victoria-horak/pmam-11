import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import { RiArrowRightSLine, RiArrowLeftSLine } from "@remixicon/react";
import { fetchMeals, fetchCategories } from "../../services/MenuService.jsx";

import "swiper/css";
import "./Catalogue.css";
import "../../styles.css"

import CatalogueItem from "./CatalogueItem.jsx";

const Catalogue = ({ setSelectedCatalogueItem, setMeals }) => {

  const [categoryData, setCategoryData] = useState([]);

  const handleCatalogItemClick = async (itemId) => {
    setSelectedCatalogueItem(itemId);
    const meals= await fetchMeals(itemId);
    setMeals(meals);
  };

    const isMobile = window.innerWidth <= 991;
    const isTablet = window.innerWidth <= 1000;

  useEffect(() => {
    const fetchInitialData = async () => {
      const meals = await fetchMeals(1);
      setMeals(meals);
      const categories = await fetchCategories(); 
      setCategoryData(categories);
    };
    fetchInitialData();
  }, []);
  

  return (
    <Container>
      <Row className="my-4">
        <Col
          xs="2"
          md="1"
          className="d-flex justify-content-center text-center "
        >
          <button className="swiper-button-prev transparent_button">
            <RiArrowLeftSLine />
          </button>
        </Col>
        <Col
          xs="8"
          md="10"
          className="d-flex justify-content-center text-center pt-4"
        >
          <Swiper
            modules={[Pagination, Navigation]}
            loop
            slidesPerView={isMobile ? 3 : isTablet ? 4 : 5}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
          >
            {categoryData.map((item) => (
              <SwiperSlide key={item.id}>
                <CatalogueItem
                  id={item.id}
                  name={item.name}
                  imageUrl={item.imageUrl}
                  onClick={handleCatalogItemClick}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </Col>
        <Col
          xs="2"
          md="1"
          className="d-flex justify-content-center text-center "
        >
          <button className="swiper-button-next transparent_button">
            <RiArrowRightSLine />
          </button>
        </Col>
      </Row>
    </Container>
  );
};

export default Catalogue;
