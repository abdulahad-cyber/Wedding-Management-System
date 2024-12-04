import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Box, Typography, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import api from "@/services/apiService";
import { Venue } from "@/types";
import { useQuery } from "react-query";
import VenueCard from "./VenueCard";

// Fetch venues
const fetchVenues = async (): Promise<Venue[]> => {
  const { data } = await api.get("/venues");
  return data;
};

const VenueCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const { data: venues } = useQuery(["venues"], fetchVenues, {
    onError: () => {
      console.error("Error fetching venues");
    },
  });

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  return (
    <Box>
      <Typography variant="h4" color="primary" align="center" gutterBottom>
        Explore Our Venues
      </Typography>
      <Box sx={{ position: "relative" }}>
        {/* Carousel Container */}
        <Box
          sx={{ overflow: "hidden", width: "100%" }}
          className="embla"
          ref={emblaRef}
        >
          <Box sx={{ display: "flex", gap: 2 }} className="embla__container">
            {venues?.map((venue) => {
              // Calculate average rating
              const totalRatings = venue.venue_reviews.reduce(
                (acc, review) => acc + review.venue_rating,
                0
              );
              const averageRating = venue.venue_reviews.length
                ? Math.round(totalRatings / venue.venue_reviews.length)
                : 0;
              return (
                <VenueCard
                  key={venue.venue_id}
                  venue={venue}
                  averageRating={averageRating}
                />
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

export default VenueCarousel;
