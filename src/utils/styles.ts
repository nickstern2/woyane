export const AccordionStyles = {
  width: "60%",
  margin: "16px auto", // Center the accordion with automatic margin
  borderRadius: "8px", // Rounded corners
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
  backgroundColor: "#f9f9f9", // Light background color
  transition: "all 0.3s ease", // Smooth transition on hover
  "&:hover": {
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)", // Darker shadow on hover
    backgroundColor: "#f1f1f1", // Slightly darker on hover
  },
};

export const summaryStyles = {
  textAlign: "center",
  "& .MuiAccordionSummary-content": {
    display: "flex",
    justifyContent: "center",
  },
};

export const linkStyles = {
  color: "blue",
  cursor: "pointer",
  textDecoration: "underline",
  "&:hover": { color: "darkblue" },
};
