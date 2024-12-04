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
import api from "@/services/apiService"; // Ensure this is set up for your decoration API
import { DecorationModel } from "@/types"; // Assuming your types are already imported
import { useQuery } from "react-query";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// Fetch decoration data
const fetchDecorations = async (): Promise<DecorationModel[]> => {
  const { data } = await api.get("/decorations"); // Replace with your API endpoint for decorations
  return data;
};

const DecorationCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const {
    data: decorations,
    isLoading,
    isError,
  } = useQuery(["decorations"], fetchDecorations, {
    onError: () => {
      console.error("Error fetching decorations");
    },
  });

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  if (isLoading) {
    return (
      <Typography variant="h6" color="primary" align="center">
        Loading Decorations...
      </Typography>
    );
  }

  if (isError) {
    return (
      <Typography variant="h6" color="error" align="center">
        Failed to load decorations.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h4" color="primary" align="center" gutterBottom>
        Our Decorations Services Partners
      </Typography>
      <Box sx={{ position: "relative" }}>
        {/* Carousel Container */}
        <Box
          sx={{ overflow: "hidden", width: "100%" }}
          className="embla"
          ref={emblaRef}
        >
          <Box sx={{ display: "flex", gap: 2 }} className="embla__container">
            {decorations?.map((decoration) => {
              return (
                <Card
                  key={decoration.decoration_id}
                  sx={{
                    flex: "0 0 30%",
                    padding: 2,
                    border: "1px solid #ccc",
                  }}
                >
                  <CardHeader title={decoration.decoration_name} />
                  {decoration.decoration_image && (
                    <CardMedia
                      component="img"
                      alt={decoration.decoration_name}
                      height="140"
                      image={decoration.decoration_image}
                    />
                  )}
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Description: {decoration.decoration_description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Price: {decoration.decoration_price} PKR
                    </Typography>
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

export default DecorationCarousel;
