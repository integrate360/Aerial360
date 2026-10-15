export const getBearerHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    Accept: "application/json",
  },
});

export const getFormDataHeader = () => ({
  headers: {
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  },
});

export const bearerHeader = {
  get headers() {
    return {
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      Accept: "application/json",
    };
  },
};

export const formDataHeader = {
  get headers() {
    return {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    };
  },
};
