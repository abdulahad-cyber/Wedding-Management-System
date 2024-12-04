import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  Typography,
} from "@mui/material";
import api from "@/services/apiService";
import { CateringModel, DishModel } from "@/types"; // Import the appropriate types
import { useQuery } from "react-query";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// Fetch catering data
const fetchCateringsAndDishes = async (): Promise<
  {
    catering: CateringModel;
    dishes: DishModel[];
  }[]
> => {
  const { data } = await api.get("/caterings"); // Replace with your API endpoint
  const cateringPromises = data.map(async (catering: CateringModel) => {
    const dishPromises = catering.catering_menu_items.map(
      async (item) => {
        const { data } = await api.get(`/caterings/dishes/${item.dish_id}`);
        return data;
      }
    );

    const dishes = await Promise.all(dishPromises);
    return { catering, dishes };
  });
  return await Promise.all(cateringPromises);
};

const CateringCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const {
    data: cateringsAndDishes,
    isLoading,
    isError,
  } = useQuery(["caterings"], fetchCateringsAndDishes, {

    onError: (
      error: any // eslint-disable-line @typescript-eslint/no-explicit-any
    ) => {
      console.error("Error fetching caterings", error);
    },
  });

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error fetching data</Typography>;

  return (
    <Box sx={{ mt: 5 }}>
      <Typography
        variant="h4"
        sx={{ my: 2 }}
        color="primary"
        align="center"
        gutterBottom
      >
        Explore Our Catering Plans
      </Typography>
      <Box sx={{ position: "relative" }}>
        {/* Carousel Container */}
        <Box
          sx={{ overflow: "hidden", width: "100%" }}
          className="embla"
          ref={emblaRef}
        >
          <Box sx={{ display: "flex", gap: 2 }} className="embla__container">
            {cateringsAndDishes?.map((cateringAndDishes) => {
              return (
                <Card
                  key={cateringAndDishes.catering.catering_id}
                  sx={{ flex: "0 0 30%", padding: 2, border: "1px solid #ccc" }}
                >
                  <CardHeader title={cateringAndDishes.catering.catering_name} />
                  {cateringAndDishes.catering.catering_image && (
                    <CardMedia
                      component="img"
                      alt={cateringAndDishes.catering.catering_name}
                      height="140"
                      image={cateringAndDishes.catering.catering_image}
                    />
                  )}
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Description:{" "}
                      {cateringAndDishes.catering.catering_description}
                    </Typography>
                    <Box mt={2}>
                      <Typography variant="h6" color="text.primary">
                        Menu Items:
                      </Typography>
                      <ul>
                        {cateringAndDishes.dishes.map((dish, index) => (
                          <li key={index}>
                            <Typography variant="body2" color="text.secondary">
                              {dish.dish_name}: ${dish.dish_cost_per_serving} per
                              serving
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* Left Scroll Button */}
        <IconButton
          onClick={scrollPrev}
          sx={{
            position: "absolute",
            top: "50%",
            left: 0,
            transform: "translateY(-50%)",
            zIndex: 1,
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            borderRadius: "50%",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.8)",
            },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        {/* Right Scroll Button */}
        <IconButton
          onClick={scrollNext}
          sx={{
            position: "absolute",
            top: "50%",
            right: 0,
            transform: "translateY(-50%)",
            zIndex: 1,
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            borderRadius: "50%",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.8)",
            },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CateringCarousel;
